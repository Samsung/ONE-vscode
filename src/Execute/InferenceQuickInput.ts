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

import {Backend} from '../Backend/API';
import {globalBackendMap} from '../Backend/Backend';
import {Logger} from '../Utils/Logger';
import {MultiStepInput} from '../Utils/MultiStepInput';

const logTag = 'InferenceQuickInput';

interface State {
  backend: Backend;
  modelPath: vscode.Uri;
  inputSpec: string;
  selectedItem: vscode.QuickPickItem;
  error: string|undefined;
}

async function shouldResume(): Promise<boolean> {
  // Could show a notification with the option to resume.
  return new Promise<boolean>(
      (resolve, reject) => {
          // noop
      });
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
  if (state.backend === undefined) {
    state.error = 'Backend to infer is not chosen. Please check once again.';
    return undefined;
  }
  if (state.backend.executor() === undefined) {
    state.error = 'Backend executor is not set yet. Please check once again.';
    return undefined;
  }
}

// TODO: Use quickPick window with fast grep child process
async function selectInputModel(input: MultiStepInput, state: Partial<State>) {
  const backend: Backend = state.backend as Backend;
  let backendName: string = backend.name();
  const executor = backend.executor();
  let filter: {[name: string]: string[]} = {};
  // List files which are filtered with executable extensions
  if (executor) {
    filter = {backendName: executor.getExecutableExt()};
  }

  const fileUri = await vscode.window.showOpenDialog({
    title: `Select Model to Infer`,
    canSelectMany: false,
    openLabel: 'Select Model to Infer',
    filters: filter
  });

  state.modelPath = undefined;
  if (fileUri && fileUri[0]) {
    state.modelPath = fileUri[0];
    return;
  }

  Logger.warn(logTag, 'No model has been selected');
  state.error = 'No model has been selected. Please check once again.';
  return undefined;
}

// TODO: enable the backend-driven option steps by backend extension
async function selectInputSpec(input: MultiStepInput, state: Partial<State>): Promise<void> {
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

async function collectInputs(): Promise<State> {
  const state = {error: undefined} as Partial<State>;
  await MultiStepInput.run(input => pickBackend(input, state));
  await MultiStepInput.run(input => selectInputModel(input, state));
  await MultiStepInput.run(input => selectInputSpec(input, state));
  return state as State;
}

export {State, collectInputs};
