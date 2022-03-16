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
import * as fs from 'fs';
import * as vscode from 'vscode';

import * as FileTreeView from './FileTreeView';

export function activate(command: string, context: vscode.ExtensionContext) {
  // get project root dir from setting
  const projectRootDir =
      vscode.workspace.getConfiguration().get<string>('one-vscode.projectRootDirectory');

  assert(projectRootDir !== undefined, 'projectRootDir should NOT be undefined');

  vscode.commands.registerCommand(command, async () => {
    const options: vscode
        .OpenDialogOptions = {canSelectMany: false, canSelectFiles: false, canSelectFolders: true};

    const result = await vscode.window.showOpenDialog(options);

    if (result === undefined) {
      vscode.window.showErrorMessage('Problem with path. Please check.');
    } else {
      const projectRootDir = result[0].fsPath;

      // update setting value
      await vscode.workspace.getConfiguration().update(
          'one-vscode.projectRootDirectory', projectRootDir, vscode.ConfigurationTarget.Global);

      // Let's show files.
      new FileTreeView.FileExplorer(context);
    }
  });

  // Directory was previously set (e.g., previous run). Let's show files.
  if (fs.existsSync(projectRootDir)) {
    new FileTreeView.FileExplorer(context);
  }
}
