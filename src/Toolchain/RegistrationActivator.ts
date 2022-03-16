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

import {strict as assert} from 'assert';
import {exec} from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';

export function activate(command: string, context: vscode.ExtensionContext) {
  // let's check if running /usr/bin/onecc succeeds
  //
  // OK The following runs OK
  //
  // exec('ls -la', (error, stdout, stderr) => {
  //   if (error) {
  //     const msg = `error: ${error.message}`;
  //     vscode.window.showErrorMessage(msg);
  //     console.log(msg);
  //     return;
  //   }
  //   if (stderr) {
  //     const msg = `stderr: ${stderr}`;
  //     vscode.window.showErrorMessage(msg);
  //     console.log(msg);
  //     return;
  //   }
  //   const msg = `stout: ${stdout}`;
  //   vscode.window.showInformationMessage(msg);
  //   console.log(msg);
  // });
}
