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

export class CircleGraphPanel {
  public static createOrShow(extensionUri: vscode.Uri, modelPath: string|undefined) {
    // if modelPath is undefined, let's show file open dialog and get the model path from the user
    if (modelPath === undefined) {
      const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Open',
        filters: {'circle files': ['circle']}
      };
      vscode.window.showOpenDialog(options).then(fileUri => {
        if (fileUri && fileUri[0]) {
          CircleGraphPanel.createOrShowContinue(extensionUri, fileUri[0].fsPath);
        }
      });
    } else {
      CircleGraphPanel.createOrShowContinue(extensionUri, modelPath);
    }
  }

  private static createOrShowContinue(extensionUri: vscode.Uri, modelToLoad: string) {
    // TODO implement
    console.log('NYI CircleGraph.createOrShowContinue()');
  }
}
