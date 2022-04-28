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
import {globalBackendMap} from '../Backend/Backend';
import { Backend } from '../Backend/API';
import {Balloon} from '../Utils/Balloon';
import {execSync} from 'child_process';


interface inferenceCommand {
  backend: Backend;
  modelPath: vscode.Uri;
  step: number;
  totalSteps: number;
}

// NOTE: This is temporal function to show its successful implementation
// TODO: Remove this after execution has landed.
function print_command(cmd: Partial<inferenceCommand>) {
  let _backend = cmd.backend;
  let _modelPath = cmd.modelPath;

  if(_backend == undefined || _modelPath == undefined) {
    return;
  }
  
  let executor = _backend.executor();
  if(executor == undefined) {
    return;
  }

  let command = executor.runInference(_modelPath.path, ["--input-spec", "any"]);
  Balloon.info(command.str())

  let stdout: string|null = null;
  try{
    stdout = execSync(command.str()).toString();
  } catch (err) {
    console.log(err);
    throw err;
  };

  console.log("INFER DONE");
  console.log(stdout);
}

export async function selectBackendExecutor(context: vscode.ExtensionContext) {
  const cmd = {} as Partial<inferenceCommand>;

  const quickPick = vscode.window.createQuickPick();
  quickPick.items = Object.keys(globalBackendMap).map(label => ({ label }));
  quickPick.onDidChangeSelection(selection => {
    if(selection[0]) {
      cmd.backend = globalBackendMap[selection[0].label];
      console.log(cmd);
      quickPick.dispose();
      selectModel(context, cmd).then(c => {
        if(c == undefined) {
          return;
        }
        console.log(c);
        print_command(c);
      });
    }
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

// This is mostly copied from getImportCfgFilepath in `Utils/Helpers.ts`
// TODO: Change to better implementation
const selectModel = async (context: vscode.ExtensionContext, cmd: Partial<inferenceCommand>) => {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select Model to Infer',
    filters: {
      /* eslint-disable-next-line @typescript-eslint/naming-convention */
      '.tvn Files': ['tvn']
    }
  };

  const fileUri = await vscode.window.showOpenDialog(options);
  if(fileUri && fileUri[0]) {
    cmd.modelPath = fileUri[0];
  }
  else {
    console.log("No model has been selected");
    cmd.modelPath = undefined;
  }

  return cmd;
  
}
