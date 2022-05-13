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
import {gToolchainEnvMap} from '../Toolchain/ToolchainEnv';
import {MultiStepInput} from '../Utils/external/MultiStepInput';

export async function showInstallQuickInput(context: vscode.ExtensionContext) {
  interface State {
    title: string;
    step: number;
    totalSteps: number;
    backend: vscode.QuickPickItem;
    version: vscode.QuickPickItem;
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
      totalSteps: 2,
      placeholder: 'Pick toolchain backend',
      items: backendGroups,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => pickVersion(input, state);
  }

  async function pickVersion(input: MultiStepInput, state: Partial<State>) {
    if (state.backend === undefined) {
      throw Error('Backend is undefined.');
    }
    const toolchains = gToolchainEnvMap[state.backend.label].listAvailable();
    const versions =
        toolchains.map((value) => value.info.version !== undefined ? value.info.version.str() : '');
    const versionGroups: vscode.QuickPickItem[] = versions.map((label) => ({label}));
    state.version = await input.showQuickPick({
      title,
      step: 2,
      totalSteps: 2,
      placeholder: 'Pick toolchain version',
      items: versionGroups,
      shouldResume: shouldResume
    });
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(
        (resolve, reject) => {
            // noop
        });
  }

  const state = await collectInputs();
  console.log(`Selected backend: ${state.backend.label}-${state.version.label}`);
  // TODO(jyoung): Request to install selected toolchain
}
