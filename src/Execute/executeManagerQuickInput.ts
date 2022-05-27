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
import {MultiStepInput} from '../Utils/MultiStepInput';
import {addExecutionEnvManager} from './ExecutionEnvManager';

export async function executeManagerQuickInput() {
  const logTag = 'executeMangerQuickInput';

  interface State {
    envType: string;
    selectedItem: vscode.QuickPickItem;
    inputText: string;
  }

  async function collectInputs() {
    const state = {error: undefined} as Partial<State>;
    await MultiStepInput.run(input => getManagerType(input, state));
    return state as State;
  }

  const title = 'Execution Manager Connect';

  async function getManagerType(input: MultiStepInput, state: Partial<State>) {
    const managerType: vscode.QuickPickItem[] = ['local', 'remote'].map(label => ({label}));
    state.selectedItem = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 2,
      placeholder: 'Select Position of Env',
      items: managerType,
      shouldResume: shouldResume
    });
    if (state.selectedItem.label === 'local') {
      state.envType = state.selectedItem.label;
    } else if (state.selectedItem.label === 'remote') {
      throw new Error('NYI as currently only local type works.');
    } else {
      return;
    }
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(
        (resolve, reject) => {
            // noop
        });
  }
  const state = await collectInputs();
  addExecutionEnvManager(state.envType);
}
