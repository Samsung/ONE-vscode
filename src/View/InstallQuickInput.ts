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
import { DebianToolchain } from '../Backend/ToolchainImpl/DebianToolchain';
import { DockerToolchain } from '../Backend/ToolchainImpl/DockerToolchain';
import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {Balloon} from '../Utils/Balloon';
import {Logger} from '../Utils/Logger';
import {MultiStepInput} from '../Utils/MultiStepInput';

export async function showInstallQuickInput(): Promise<[ToolchainEnv, Toolchain]> {
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

  async function pickVersion(input: MultiStepInput, state: Partial<State>) {
    if (state.toolchainEnv === undefined || state.toolchainType === undefined) {
      throw Error('toolchainenv is undefined.');
    }
    // TODO(jyoung): Support page UI
    let toolchains: Toolchain[];
    try {
      toolchains = state.toolchainEnv.listAvailable(state.toolchainType, 0, 10);
    } catch (err) {
      const answer = await vscode.window.showWarningMessage(
          'Prerequisites has not been set yet. Do you want to set it up now?', 'Yes', 'No');
      if (answer === 'Yes') {
        await state.toolchainEnv.prerequisites();
      }
      return;
    }
    const versionGroups: vscode.QuickPickItem[] = toolchains.map((toolchain) => {
      if (toolchain instanceof DebianToolchain) {
        return {label: `$(terminal-debian) ${toolchain.info.version?.str()}`};
      } else if (toolchain instanceof DockerToolchain) {
        return {label: `$(cloud) ${toolchain.info.version?.str()}`};
      } else {
        return {label: ''};
      }
    });
    // const versionGroups: vscode.QuickPickItem[] = versions.map((label) => ({label}));
    // let toolchains: {[key: string]: Toolchain[]} = {};
    // try {
    //   toolchains['debian'] = state.toolchainEnv.listAvailable(state.toolchainType, 0, 1);
    // } catch (err) {
    //   const answer = await vscode.window.showWarningMessage(
    //       'Prerequisites has not been set yet. Do you want to set it up now?', 'Yes', 'No');
    //   if (answer === 'Yes') {
    //     await state.toolchainEnv.prerequisites();
    //   }
    //   return;
    // }

    // // TODO(jyoung): Get docker image list
    // toolchains['docker'] = state.toolchainEnv.listAvailable(state.toolchainType, 1, 10);
    // const versionGroups: vscode.QuickPickItem[] = [];
    // Object.entries(toolchains).map(([type, toolchains], index) => {
    //   const icon = type === 'debian' ? `$(terminal-debian)` : `$(cloud)`;
    //   toolchains.map((value) => value.info.version !== undefined ? value.info.version.str() : '')
    //       .forEach((label) => {
    //         versionGroups.push({label: `${icon} ${label}`});
    //       });
    // });
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
    state.toolchain = toolchains.filter((toolchain) => version.label.includes(toolchain.info.version!.str()))[0];
  }

  async function updateBackend(input: MultiStepInput, state: Partial<State>) {
    if (state.toolchainEnv === undefined || state.toolchainType === undefined) {
      throw Error('toolchainenv is undefined.');
    }

    await state.toolchainEnv.prerequisites();

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

  const state = await collectInputs();
  return new Promise<[ToolchainEnv, Toolchain]>((resolve, reject) => {
    if (state.toolchainEnv && state.toolchain) {
      resolve([state.toolchainEnv, state.toolchain]);
    } else {
      reject();
    }
  });
}
