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

import * as fs from 'fs';
import * as vscode from 'vscode';

export class CircleGraphPanel {
  public static currentPanel: CircleGraphPanel|undefined;
  public static readonly viewType = 'CircleGraphPanel';
  public static readonly folderMediaCircleGraph = 'media/CircleGraph';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _modelToLoad: string;

  private _disposables: vscode.Disposable[] = [];

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

    // Set the webview's initial html content
    this.update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(e => {
      if (this._panel.visible) {
        // NOTE if we call this.update(), it'll reload the model which may take time.
        // TODO call conditional this.update() when necessary.
        // this.update();
      }
    }, null, this._disposables);
  }

  public dispose() {
    CircleGraphPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private update() {
    this._panel.title = 'circle graph';
    this._panel.webview.html = this.getHtmlForWebview(this._panel.webview);
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const htmlPath = this.getMediaPath('index.html');
    let html = fs.readFileSync(htmlPath.fsPath, {encoding: 'utf-8'});

    // TODO fix file loadings inside html

    return html;
  }

  private getMediaPath(file: string) {
    return vscode.Uri.joinPath(this._extensionUri, CircleGraphPanel.folderMediaCircleGraph, file);
  }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions&
    vscode.WebviewPanelOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,
    // And restrict the webview to only loading content from our extension's
    // 'media/CircleGraph' directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media/CircleGraph')],

    // to prevent view to reload after loosing focus
    retainContextWhenHidden: true
  };
}
