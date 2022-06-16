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

import * as ini from 'ini';
import * as path from 'path';
import * as vscode from 'vscode';

import {CircleGraphCtrl, CircleGraphEvent} from '../CircleGraph/CircleGraphCtrl';

export class PartGraphSelPanel extends CircleGraphCtrl implements CircleGraphEvent {
  public static readonly viewType = 'PartGraphSelector';
  public static readonly cmdOpen = 'one.part.openGraphSelector';
  public static readonly folderMediaCircleGraph = 'media/CircleGraph';

  public static currentPanel: PartGraphSelPanel|undefined = undefined;

  private _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _documentPath: string;     // part file path
  private _documentText: string;     // part document
  private _modelPath: string;        // circle file path
  private _backendFromEdit: string;  // current backend for editing

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    // TODO add more commands
    let disposableGraphPenel = vscode.commands.registerCommand(
        PartGraphSelPanel.cmdOpen, (filePath: string, docText: string, backend: string) => {
          PartGraphSelPanel.createOrShow(context.extensionUri, filePath, docText, backend);
        });

    return disposableGraphPenel;
  };

  public static createOrShow(
      extensionUri: vscode.Uri, docPath: string, docText: string, backend: string) {
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    // TODO handle multiple ?
    if (PartGraphSelPanel.currentPanel) {
      PartGraphSelPanel.currentPanel._panel.reveal(column);

      let parsedPath = path.parse(docPath);
      let fileBase = path.join(parsedPath.dir, parsedPath.name);

      PartGraphSelPanel.currentPanel._documentPath = docPath;
      PartGraphSelPanel.currentPanel._documentText = docText;
      PartGraphSelPanel.currentPanel._backendFromEdit = backend;
      PartGraphSelPanel.currentPanel._modelPath = fileBase + '.circle';

      // TODO reflect modelPath and backend
      return;
    }

    // Otherwise, create a new panel.
    // TODO revise 'vscode.ViewColumn.Three' to appropriate value
    const panel = vscode.window.createWebviewPanel(
        PartGraphSelPanel.viewType, 'Graph select nodes', column || vscode.ViewColumn.Three,
        {retainContextWhenHidden: true});

    const circleGraph = new PartGraphSelPanel(panel, extensionUri, docPath, docText, backend);
    circleGraph.loadContent();
    PartGraphSelPanel.currentPanel = circleGraph;
  }

  private constructor(
      panel: vscode.WebviewPanel, extensionUri: vscode.Uri, docPath: string, docText: string,
      backend: string) {
    super(extensionUri, panel.webview);

    let parsedPath = path.parse(docPath);
    let fileBase = path.join(parsedPath.dir, parsedPath.name);

    this._panel = panel;
    this._documentPath = docPath;
    this._documentText = docText;
    this._modelPath = fileBase + '.circle';
    this._backendFromEdit = backend;

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

    this.initGraphCtrl(this._modelPath, this);
  }

  public dispose() {
    this.disposeGraphCtrl();

    PartGraphSelPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  public onStartLoadModel() {
    // TODO implement
  }

  public onFinishLoadModel() {
    // this is good time to set selection state of the graph
    let selections: string[] = [];
    let content = ini.parse(this._documentText);
    for (let name in content.OPNAME) {
      if (content.OPNAME[name] === this._backendFromEdit) {
        selections.push(name);
      }
    }

    // call CircleGraphCtrl method to refect selection state for all nodes
    this.setSelection(selections);
  }

  public setTitle(title: string) {
    this._panel.title = title;
  }

  private loadContent() {
    this._panel.webview.html = this.getHtmlForWebview(this._panel.webview);
  }
};
