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
import {Executor} from '../Backend/Executor';
import {Logger} from '../Utils/Logger';
import {MultiStepInput} from '../Utils/MultiStepInput';

const logTag = 'InferenceQuickInput';

interface State {
  selectedItem: vscode.QuickPickItem;
}

class InferenceQuickInput {
  backend: Backend|undefined = undefined;
  modelPath: vscode.Uri|undefined = undefined;
  inputSpec: string|undefined = undefined;
  error: string|undefined = undefined;

  constructor() {}

  getBackend(): Backend {
    if (this.error !== undefined || this.backend === undefined) {
      throw new Error('wrong calling');
    }
    return this.backend as Backend;
  }

  getModelPath(): vscode.Uri {
    if (this.error !== undefined || this.modelPath === undefined) {
      throw new Error('wrong calling');
    }
    return this.modelPath as vscode.Uri;
  }

  getInputSpec(): string {
    if (this.error !== undefined || this.inputSpec === undefined) {
      throw new Error('wrong calling');
    }
    return this.inputSpec as string;
  }

  getError(): string|undefined {
    return this.error;
  }

  async shouldResume(): Promise<boolean> {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(
        (resolve, reject) => {
            // noop
        });
  }

  getAllBackendNames(): string[] {
    return Object.keys(globalBackendMap);
  }

  getQuickPickItems(items: string[]): vscode.QuickPickItem[] {
    return items.map(label => ({label}));
  }

  getBackendFromGlobal(key: string): Backend {
    return globalBackendMap[key];
  }

  async pickBackend(input: MultiStepInput, state: Partial<State>) {
    const items = this.getQuickPickItems(this.getAllBackendNames());
    state.selectedItem = await input.showQuickPick({
      title: 'Choose Executor Toolchain',
      step: 1,
      totalSteps: 3,
      placeholder: 'Select a Backend',
      items: items,
      shouldResume: this.shouldResume
    });

    this.backend = this.getBackendFromGlobal(state.selectedItem.label);

    if (this.backend === undefined) {
      this.error = 'Backend to infer is not chosen. Please check once again.';
      return;
    }
    if (this.backend.executor() === undefined) {
      this.error = 'Backend executor is not set yet. Please check once again.';
      return;
    }
  }

  getFilter(): {[name: string]: string[]} {
    const backend: Backend = this.backend as Backend;
    const executor = backend.executor() as Executor;
    // List files which are filtered with executable extensions
    return {backendName: executor.getExecutableExt()};
  }

  // TODO: Use quickPick window with fast grep child process
  async selectInputModel(input: MultiStepInput, state: Partial<State>) {
    const filter = this.getFilter();

    const fileUri = await vscode.window.showOpenDialog({
      title: 'Select Model to Infer',
      canSelectMany: false,
      openLabel: 'Select Model to Infer',
      filters: filter
    });

    if (fileUri && fileUri[0]) {
      this.modelPath = fileUri[0];
      return;
    }

    Logger.warn(logTag, 'No model has been selected');
    this.error = 'No model has been selected. Please check once again.';
  }

  getInputSpecKeys(): string[] {
    return ['any', 'non-zero', 'positive'];
  }

  // TODO: enable the backend-driven option steps by backend extension
  async selectInputSpec(input: MultiStepInput, state: Partial<State>): Promise<void> {
    const items = this.getQuickPickItems(this.getInputSpecKeys());
    state.selectedItem = await input.showQuickPick({
      title: 'Enter Backend Specific Options',
      step: 3,
      totalSteps: 3,
      placeholder: 'Select Random Input Spec',
      items: items,
      shouldResume: this.shouldResume
    });
    this.inputSpec = state.selectedItem.label;
  }

  async collectInputs(): Promise<void> {
    const state = {selectedItem: undefined} as Partial<State>;
    await MultiStepInput.run(input => this.pickBackend(input, state));
    await MultiStepInput.run(input => this.selectInputModel(input, state));
    await MultiStepInput.run(input => this.selectInputSpec(input, state));
  }
}

export {State, InferenceQuickInput};
