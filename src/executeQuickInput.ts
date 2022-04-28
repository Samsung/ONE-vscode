/*
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
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

/*
 * This file comes from `extension.ts` and `multiStepInput.ts` in
 * https://github.com/microsoft/vscode-extension-samples/tree/600385187314772ff063f1c66ece837bda40e222/quickinput-sample/src
 */

import * as vscode from 'vscode';
import {globalBackendMap} from './Backend/Backend';
import { Backend } from './Backend/API';
import { MultiStepInput } from './Utils/MultiStepInput';
import { exec, execSync } from 'child_process';
import { Balloon } from './Utils/Balloon';
import * as fs from 'fs';

interface inferenceCommand {
  backend: Backend;
  modelPath: vscode.Uri;
  options: {};
};

export async function runInferenceQuickInput(context: vscode.ExtensionContext) {
  interface State {
    backend: Backend;
    modelPath: vscode.Uri;
    inputSpec: string;
    infer: vscode.QuickPickItem;
  }

  async function collectInputs() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => pickBackend(input, state));
    return state as State;
  }

  const title = 'Choose Executor Toolchain';

  async function pickBackend(input: MultiStepInput, state: Partial<State>) {
    const backends: vscode.QuickPickItem[] = Object.keys(globalBackendMap).map(label => ({ label }));
    state.infer = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 3,
      placeholder: 'Pick Executor',
      items: backends,
      shouldResume: shouldResume
    });
    state.backend = globalBackendMap[state.infer.label];
    return (input: MultiStepInput) => selectInputModel(input, state);
  }

  // TODO: Use quickPick window with fast grep child process
  //       It can be found in reference/src/quickOpen.ts
  async function selectInputModel(input: MultiStepInput, state: Partial<State>) {
    if (state.backend === undefined) {
      throw Error('Backend is undefined');
    }

    let backendName: string = state.backend.name();
    const executor = state.backend.executor();
    let filter: { [name: string]: string[]} = {};
    // List files which are filtered with executable extensions
    if (executor) {
      filter = {
        backendName: executor.getExecutableExt()
      };
    }

    const fileUri = await vscode.window.showOpenDialog({
      title: `${title} (2/3)`,
      canSelectMany: false,
      openLabel: 'Select Model to Infer',
      filters: filter
    });
    if(fileUri && fileUri[0]) {
      state.modelPath = fileUri[0];
    }
    else {
      console.log("No model has been selected");
      state.modelPath = undefined;
    }

    return (input: MultiStepInput) => selectInputSpec(input, state);
  }

  // TODO: enable the backend-driven option steps by backend extension
  async function selectInputSpec(input: MultiStepInput, state: Partial<State>) {
    const inputSpecKeys: vscode.QuickPickItem[] = ["any", "non-zero", "positive"].map(label => ({ label }));

    state.infer = await input.showQuickPick({
      title,
      step: 3,
      totalSteps: 3,
      placeholder: 'Select Random Input Spec',
      items: inputSpecKeys,
      shouldResume: shouldResume
    });
    state.inputSpec = state.infer.label;
  }

  async function RunInference (state: State){
    let cmd = state.backend.executor()?.runInference(state.modelPath.path, ["--input-spec", state.inputSpec]);
    const ws = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.map(f => f.uri.fsPath) : process.cwd();
    const q = process.platform === 'win32' ? '\\' : '/';
    let outFileName: string = ws[0].concat(`${q}${state.modelPath.path.split(q).slice(-1)[0]}.infer.log`);

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Inference Running!",
      cancellable: true
    }, (progress, token) => {
      token.onCancellationRequested(() => {
        console.log("User canceled the log running operation");
      });
      const p = new Promise((resolve, reject) => {
        exec(cmd?.str() + ' > ' + outFileName, (error, stdout, stderr) => {
          if (error) return reject(error.message);
          // Following warning are treated as error, and it blocks the workflow. 
          // [WARN ][N71/Model] (ne-model.cc:392) output[0] is raw data. skip layout conversion
          // TODO: handle the stderr
          // if (stderr) return reject(stderr);
          resolve(stdout);
        });
      });
      return p;
    }).then(() => {
      // On resolve
      vscode.window.showInformationMessage(
        "Inference succeed!"
      );
    }, (error: string) => {
      // On reject
      fs.appendFileSync(outFileName, error);
      vscode.window.showErrorMessage(
        "Exception Occurred!\n" + error,
        {title: "Close"}
      )
    });
  }


  function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

  const state = await collectInputs();
  await RunInference(state);
}
