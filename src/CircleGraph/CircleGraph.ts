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
  public static currentPanel: CircleGraphPanel|undefined;
  public static readonly viewType = 'CircleGraphPanel';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _modelToLoad: string;

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
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // TODO we may have show two or more graphs at the same time depending
    //      on the usage if this control.
    //      for now, let's limit to only one CircleGraphPanel

    // If we already have a panel, show it.
    if (CircleGraphPanel.currentPanel) {
      CircleGraphPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
        CircleGraphPanel.viewType,
        'CircleGraphPanel',
        column || vscode.ViewColumn.One,
        getWebviewOptions(extensionUri),
    );

    CircleGraphPanel.currentPanel = new CircleGraphPanel(panel, extensionUri, modelToLoad);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, modelToLoad: string) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._modelToLoad = modelToLoad;

    // TODO implement
  }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,
    // And restrict the webview to only loading content from our extension's
    // 'media/CircleGraph' directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media/CircleGraph')]
  };
}
