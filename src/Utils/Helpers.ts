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
import {Balloon} from './Balloon';

/**
 * @brief Get Workspace root folder as string
 * @note  will throw if not working in workspace mode.
 */
export function obtainWorkspaceRoot(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    console.log('obtainWorkspaceRoot: NO workspaceFolders');
    // TODO revise message
    throw new Error('Need workspace');
  }

  // TODO support active workspace from multiple workspace
  if (workspaceFolders.length > 1) {
    Balloon.info('Warning: only first Workspace is supported');
  }
  const workspaceRoot = workspaceFolders[0].uri.path;
  if (!workspaceRoot) {
    console.log('obtainWorkspaceRoot: NO workspaceRoot');
    // TODO revise message
    throw new Error('Need workspace');
  }
  console.log('obtainWorkspaceRoot:', workspaceRoot);

  return workspaceRoot;
}

export interface FileSelector {
  onFileSelected(uri: vscode.Uri|undefined): void;
}

/**
 * @brief Get import cfg file path using file open dialog
 */
export function getImportCfgFilepath(selector: FileSelector): void {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Import',
    filters: {
      /* eslint-disable-next-line @typescript-eslint/naming-convention */
      'ONE .cfg Files': ['cfg']
    }
  };

  vscode.window.showOpenDialog(options).then(fileUri => {
    if (fileUri && fileUri[0]) {
      selector.onFileSelected(fileUri[0]);
    } else {
      selector.onFileSelected(undefined);
    }
  });
}
