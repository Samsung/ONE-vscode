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

import {exec} from 'child_process';
import {appendFileSync} from 'fs';
import * as vscode from 'vscode';

import {Backend} from '../Backend/API';
import {globalBackendMap} from '../Backend/Backend';
import {MultiStepInput} from '../Utils/MultiStepInput';

export async function runInferenceQuickInput(context: vscode.ExtensionContext) {
  interface State {
    backend: Backend;
    modelPath: vscode.Uri;
    inputSpec: string;
    selectedItem: vscode.QuickPickItem;
    error: string|undefined;
  }

  async function collectInputs() {
    const state = {error: undefined} as Partial<State>;
    await MultiStepInput.run(input => pickBackend(input, state));
    return state as State;
  }

  async function pickBackend(input: MultiStepInput, state: Partial<State>) {
    const backends: vscode.QuickPickItem[] = Object.keys(globalBackendMap).map(label => ({label}));
    state.selectedItem = await input.showQuickPick({
      title: 'Choose Executor Toolchain',
      step: 1,
      totalSteps: 3,
      placeholder: 'Select a Backend',
      items: backends,
      shouldResume: shouldResume
    });
    state.backend = globalBackendMap[state.selectedItem.label];
    return (input: MultiStepInput) => selectInputModel(input, state);
  }

  // TODO: Use quickPick window with fast grep child process
  async function selectInputModel(input: MultiStepInput, state: Partial<State>) {
    if (state.backend === undefined) {
      state.error = 'Backend to infer is not chosen. Please check once again.';
      return;
    }
    if (state.backend.executor() === undefined) {
      state.error = 'Backend executor is not set yet. Please check once again.';
      return;
    }

    let backendName: string = state.backend.name();
    const executor = state.backend.executor();
    let filter: {[name: string]: string[]} = {};
    // List files which are filtered with executable extensions
    if (executor) {
      filter = {backendName: executor.getExecutableExt()};
    }

    const fileUri = await vscode.window.showOpenDialog({
      title: `Select Model to Infer (2/3)`,
      canSelectMany: false,
      openLabel: 'Select Model to Infer',
      filters: filter
    });
    if (fileUri && fileUri[0]) {
      state.modelPath = fileUri[0];
    } else {
      console.log('No model has been selected');
      state.error = 'No model has been selected. Please check once again.';
      state.modelPath = undefined;
      return;
    }

    return (input: MultiStepInput) => selectInputSpec(input, state);
  }

  // TODO: enable the backend-driven option steps by backend extension
  async function selectInputSpec(input: MultiStepInput, state: Partial<State>) {
    const inputSpecKeys: vscode.QuickPickItem[] =
        ['any', 'non-zero', 'positive'].map(label => ({label}));

    state.selectedItem = await input.showQuickPick({
      title: 'Enter Backend Specific Options',
      step: 3,
      totalSteps: 3,
      placeholder: 'Select Random Input Spec',
      items: inputSpecKeys,
      shouldResume: shouldResume
    });
    state.inputSpec = state.selectedItem.label;
  }

  async function runInference(state: State) {
    if (state.error !== undefined) {
      vscode.window.showErrorMessage(state.error);
      return;
    }
    let cmd =
        state.backend.executor() ?.runInference(
                                      state.modelPath.path, ['--input-spec', state.inputSpec]);
    let outFileName: string = `${state.modelPath.path}.infer.log`;

    await vscode.window
        .withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: 'Inference Running!',
              cancellable: true
            },
            (progress, token) => {
              token.onCancellationRequested(() => {
                console.log('User canceled the log running operation');
              });
              const p = new Promise((resolve, reject) => {
        exec(cmd?.str() + ' > ' + outFileName, (error, stdout, stderr) => {
          if (error) {
            return reject(error.message);
          }
          // Some of warnings are treated as error.
          // TODO: handle the stderr
          // if (stderr) return reject(stderr);
          else {
            return resolve(stdout);
          }
        });
              });
              return p;
            })
        .then(
            () => {
              vscode.window.showInformationMessage(
                  `Inference succeeded! You can find the log at ${outFileName}`, {title: 'OK'});
            },
            (error: string) => {
              appendFileSync(outFileName, error);
              // TODO: Find if the message includes new line character.
              vscode.window.showErrorMessage(
                  'Exception Occurred! You can find the log at ' + outFileName, {title: 'Close'});
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
  await runInference(state);
}
