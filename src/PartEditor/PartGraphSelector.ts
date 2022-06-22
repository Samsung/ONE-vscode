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

export interface PartGraphEvent {
  onSelection(names: string[], tensors: string[]): void;
}

export class PartGraphSelPanel extends CircleGraphCtrl implements CircleGraphEvent {
  public static readonly viewType = 'PartGraphSelector';
  public static readonly cmdOpen = 'one.part.openGraphSelector';
  public static readonly cmdUpdate = 'one.part.updateGraphSelector';
  public static readonly cmdClose = 'one.part.closeGraphSelector';
  public static readonly folderMediaCircleGraph = 'media/CircleGraph';

  public static currentPanel: PartGraphSelPanel|undefined = undefined;

  private _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _documentPath: string;     // part file path
  private _documentText: string;     // part document
  private _modelPath: string;        // circle file path
  private _backendFromEdit: string;  // current backend for editing
  private _partEventHandler: PartGraphEvent|undefined;

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    // TODO add more commands
    let disposableCmdUpdate = vscode.commands.registerCommand(
        PartGraphSelPanel.cmdUpdate, (filePath: string, docText: string, backend: string) => {
          PartGraphSelPanel.updateByOwner(context.extensionUri, filePath, docText, backend);
        });
    context.subscriptions.push(disposableCmdUpdate);

    let disposableCmdClose =
        vscode.commands.registerCommand(PartGraphSelPanel.cmdClose, (filePath: string) => {
          PartGraphSelPanel.closeByOwner(context.extensionUri, filePath);
        });
    context.subscriptions.push(disposableCmdClose);

    let disposableGraphPenel = vscode.commands.registerCommand(
        PartGraphSelPanel.cmdOpen,
        (filePath: string, docText: string, backend: string, handler: PartGraphEvent) => {
          PartGraphSelPanel.createOrShow(context.extensionUri, filePath, docText, backend, handler);
        });

    return disposableGraphPenel;
  };

  public static createOrShow(
      extensionUri: vscode.Uri, docPath: string, docText: string, backend: string,
      handler: PartGraphEvent|undefined) {
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
      PartGraphSelPanel.currentPanel._partEventHandler = handler;

      // TODO reflect modelPath and backend
      return;
    }

    // Otherwise, create a new panel.
    // TODO revise 'vscode.ViewColumn.Three' to appropriate value
    const panel = vscode.window.createWebviewPanel(
        PartGraphSelPanel.viewType, 'Graph select nodes', column || vscode.ViewColumn.Three,
        {retainContextWhenHidden: true});

    const circleGraph =
        new PartGraphSelPanel(panel, extensionUri, docPath, docText, backend, handler);
    circleGraph.loadContent();
    PartGraphSelPanel.currentPanel = circleGraph;
  }

  /**
   * @brief called when owner has changed the document or received document has changed
   */
  public static updateByOwner(
      extensionUri: vscode.Uri, docPath: string, docText: string, backend: string) {
    if (PartGraphSelPanel.currentPanel) {
      if (docPath === PartGraphSelPanel.currentPanel._documentPath) {
        PartGraphSelPanel.currentPanel._documentText = docText;
        PartGraphSelPanel.currentPanel._backendFromEdit = backend;

        if (PartGraphSelPanel.currentPanel.isReady()) {
          PartGraphSelPanel.currentPanel.onFinishLoadModel();
        }
      }
    }
  }

  /**
   * @brief called when owner is closing
   */
  public static closeByOwner(extensionUri: vscode.Uri, docPath: string) {
    if (PartGraphSelPanel.currentPanel) {
      if (docPath === PartGraphSelPanel.currentPanel._documentPath) {
        PartGraphSelPanel.currentPanel.dispose();
      }
    }
  }

  private constructor(
      panel: vscode.WebviewPanel, extensionUri: vscode.Uri, docPath: string, docText: string,
      backend: string, handler: PartGraphEvent|undefined) {
    super(extensionUri, panel.webview);

    let parsedPath = path.parse(docPath);
    let fileBase = path.join(parsedPath.dir, parsedPath.name);

    this._panel = panel;
    this._documentPath = docPath;
    this._documentText = docText;
    this._modelPath = fileBase + '.circle';
    this._backendFromEdit = backend;
    this._partEventHandler = handler;

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
    this.setMode('selector');
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

  /**
   * CircleGraphEvent interface implementations
   */
  public onSelection(names: string[], tensors: string[]) {
    // we need to update the document, but not save to file.
    // pass to owner to handle this.
    if (this._partEventHandler) {
      this._partEventHandler.onSelection(names, tensors);
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
