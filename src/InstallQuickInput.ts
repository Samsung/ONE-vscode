/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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
import { gCompileEnvMap } from './Compile/CompileEnv';

export function installQuickInput(context: vscode.ExtensionContext) {

  const quickPick = vscode.window.createQuickPick();
  quickPick.title = 'Choose Compiler Toolchain';
  quickPick.items = Object.keys(gCompileEnvMap).map((label) => ({label}));
  quickPick.onDidChangeSelection(selection => {
    console.log(selection);
    if (selection[0]) {
      vscode.window.showInformationMessage(`Focus ${selection[0].label}`);
      try {
      const toolchains = gCompileEnvMap[selection[0].label].listAvailable();
      } catch (e) {
        console.log(e);
      }
    }

  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}