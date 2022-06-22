/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';

import {Toolchain} from '../Backend/Toolchain';
import {DebianToolchain} from '../Backend/ToolchainImpl/DebianToolchain';
import {Job, JobCallback} from '../Project/Job';
import {JobInstall} from '../Project/JobInstall';
import {JobUninstall} from '../Project/JobUninstall';
import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {Balloon} from '../Utils/Balloon';
import {Logger} from '../Utils/Logger';
import {MultiStepInput} from '../Utils/MultiStepInput';

export async function showInstallQuickInput() {
  const logtag = showInstallQuickInput.name;

  interface State {
    title: string;
    step: number;
    totalSteps: number;
    backend: vscode.QuickPickItem;
    version: vscode.QuickPickItem;
    toolchainEnv: ToolchainEnv;
    toolchainType: string;
    toolchain: Toolchain;
  }

  async function collectInputs() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => pickBackend(input, state));
    return state as State;
  }

  const title = 'Choose Compiler Toolchain';

  class InnerButton implements vscode.QuickInputButton {
    constructor(public iconPath: vscode.ThemeIcon, public tooltip: string) {}
  }

  const updateButton = new InnerButton(new vscode.ThemeIcon('refresh'), 'Update version list');

  async function pickBackend(input: MultiStepInput, state: Partial<State>) {
    const backendGroups: vscode.QuickPickItem[] =
        Object.keys(gToolchainEnvMap).map((label) => ({label}));
    state.backend = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 3,
      placeholder: 'Pick toolchain backend',
      items: backendGroups,
      shouldResume: shouldResume
    });
    state.toolchainEnv = gToolchainEnvMap[state.backend.label];
    return (input: MultiStepInput) => pickType(input, state);
  }

  async function pickType(input: MultiStepInput, state: Partial<State>) {
    if (state.toolchainEnv === undefined) {
      throw Error('Backend is undefined');
    }
    const types = state.toolchainEnv.getToolchainTypes();
    if (types.length === 1) {
      state.toolchainType = types[0];
    } else {
      const typeGroups: vscode.QuickPickItem[] = types.map((label) => ({label}));
      const type = await input.showQuickPick({
        title,
        step: 2,
        totalSteps: 3,
        placeholder: 'Pick toolchain type',
        items: typeGroups,
        shouldResume: shouldResume
      });
      state.toolchainType = type.label;
    }
    return (input: MultiStepInput) => pickVersion(input, state);
  }

  async function requestPrerequisites(toolchainEnv: ToolchainEnv) {
    const result = await toolchainEnv.prerequisitesAsync();
    if (result === true) {
      Balloon.info('Backend toolchain list has been successfully updated.');
    } else {
      Balloon.error('Failed to update Backend toolchain list.');
    }
  }

  async function pickVersion(input: MultiStepInput, state: Partial<State>) {
    if (state.toolchainEnv === undefined || state.toolchainType === undefined) {
      throw Error('toolchainenv  is undefined.');
    }
    // TODO(jyoung): Support page UI
    let toolchains: Toolchain[];
    try {
      toolchains = state.toolchainEnv.listAvailable(state.toolchainType, 0, 10);
    } catch (err) {
      const answer = await vscode.window.showWarningMessage(
          'Prerequisites has not been set yet. Do you want to set it up now?', 'Yes', 'No');
      if (answer === 'Yes') {
        requestPrerequisites(state.toolchainEnv);
      } else {
        Balloon.info('Installation is canceled.');
      }
      return undefined;
    }
    const versions =
        toolchains.map((value) => value.info.version !== undefined ? value.info.version.str() : '');
    const versionGroups: vscode.QuickPickItem[] = versions.map((label) => ({label}));
    const version = await input.showQuickPick({
      title,
      step: 3,
      totalSteps: 3,
      placeholder: 'Pick toolchain version',
      items: versionGroups,
      buttons: [updateButton],
      shouldResume: shouldResume
    });
    if (version instanceof InnerButton) {
      Logger.info(logtag, 'press the refresh button');
      return (input: MultiStepInput) => updateBackend(input, state);
    }
    state.version = version;
    state.toolchain = toolchains[versions.indexOf(state.version.label)];
    return undefined;
  }

  async function updateBackend(input: MultiStepInput, state: Partial<State>) {
    if (state.toolchainEnv === undefined || state.toolchainType === undefined) {
      throw Error('toolchainenv is undefined.');
    }

    requestPrerequisites(state.toolchainEnv);

    // NOTE(jyoung)
    // Prerequisites request shows the password quick input and this input is
    // automatically added to MultiStepInput's steps. If the user clicks
    // 'back' button on quick input, the previous step is shown, and the password
    // input is show at this time, so it must be removed directly from the steps.
    input.steps.pop();
    return pickVersion(input, state);
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(
        (resolve, reject) => {
            // noop
        });
  }

  function requestInstall(
      toolchainEnv: ToolchainEnv, toolchain: Toolchain): Promise<Toolchain|undefined> {
    return new Promise(async (resolve, reject) => {
      const success: JobCallback = function() {
        resolve(toolchain);
      };
      const failed: JobCallback = function() {
        reject();
      };

      const installed =
          toolchainEnv.listInstalled().filter(value => value instanceof DebianToolchain);
      if (installed.length === 0) {
        toolchainEnv.install(toolchain, success, failed);
      } else if (installed.length === 1) {
        const answer = await vscode.window.showInformationMessage(
            'Do you want to remove the existing and re-install? Backend toolchain can be installed only once.',
            'Yes', 'No');
        if (answer === 'Yes') {
          const jobs: Array<Job> = [];
          const uninstallJob = new JobUninstall(installed[0].uninstall());
          uninstallJob.failureCallback = failed;
          jobs.push(uninstallJob);
          const installJob = new JobInstall(toolchain.install());
          installJob.successCallback = success;
          installJob.failureCallback = failed;
          jobs.push(installJob);
          toolchainEnv.request(jobs);
        } else {
          Balloon.info('Installation is canceled.');
          reject();
        }
      } else {
        throw Error('Installed debian toolchain must be unique.');
      }
    });
  }

  const state = await collectInputs();
  if (state.toolchainEnv && state.toolchain) {
    Logger.info(
        logtag,
        `Selected backend: ${state.backend.label}-${state.toolchainType}-${state.version.label}`);
    return requestInstall(state.toolchainEnv, state.toolchain);
  } else {
    return Promise.reject();
  }
}
