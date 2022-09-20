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

import {CircleGraphCtrl} from './CircleGraphCtrl';

/* istanbul ignore next */
export class CircleGraphPanel extends CircleGraphCtrl {
  public static currentPanel: CircleGraphPanel|undefined;
  public static readonly viewType = 'CircleGraphPanel';

  private readonly _panel: vscode.WebviewPanel;

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
          return CircleGraphPanel.createOrShowContinue(extensionUri, fileUri[0].fsPath);
        }
        return undefined;
      });
      return undefined;
    } else {
      return CircleGraphPanel.createOrShowContinue(extensionUri, modelPath);
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
      return CircleGraphPanel.currentPanel;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
        CircleGraphPanel.viewType, 'CircleGraphPanel', column || vscode.ViewColumn.One,
        {retainContextWhenHidden: true});

    const circleGraph = new CircleGraphPanel(panel, extensionUri, modelToLoad);
    circleGraph.setTitle('circle graph');
    circleGraph.loadContent();
    CircleGraphPanel.currentPanel = circleGraph;

    return circleGraph;
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, modelToLoad: string) {
    super(extensionUri, panel.webview);

    this._panel = panel;

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(() => {
      if (this._panel.visible) {
        // NOTE if we call this.update(), it'll reload the model which may take time.
        // TODO call conditional this.update() when necessary.
        // this.update();
      }
    }, null, this._disposables);

    this.initGraphCtrl(modelToLoad, undefined);
  }

  public dispose() {
    this.disposeGraphCtrl();

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

  public setTitle(title: string) {
    this._panel.title = title;
  }

  public loadContent() {
    this._panel.webview.html = this.getHtmlForWebview(this._panel.webview);
  }
}
