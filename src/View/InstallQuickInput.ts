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
import {JobCallback} from '../Project/Job';
import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {MultiStepInput} from '../Utils/MultiStepInput';

export async function showInstallQuickInput() {
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
      throw Error('toolchainenv  is undefined.');
    }
    // TODO(jyoung): Support page UI
    const toolchains = state.toolchainEnv.listAvailable(state.toolchainType, 0, 10);
    const versions =
        toolchains.map((value) => value.info.version !== undefined ? value.info.version.str() : '');
    const versionGroups: vscode.QuickPickItem[] = versions.map((label) => ({label}));
    state.version = await input.showQuickPick({
      title,
      step: 3,
      totalSteps: 3,
      placeholder: 'Pick toolchain version',
      items: versionGroups,
      shouldResume: shouldResume
    });
    state.toolchain = toolchains[versions.indexOf(state.version.label)];
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(
        (resolve, reject) => {
            // noop
        });
  }

  const state = await collectInputs();
  console.log(
      `Selected backend: ${state.backend.label}-${state.toolchainType}-${state.version.label}`);

  return new Promise((resolve, reject) => {
    const success: JobCallback = function() {
      resolve(state.toolchain);
    };
    const failed: JobCallback = function() {
      reject();
    };
    state.toolchainEnv.install(state.toolchain, success, failed);
  });
}
