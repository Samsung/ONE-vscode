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
  public static readonly cmdFwdSelection = 'one.part.fwdSelection';
  public static readonly folderMediaCircleGraph = 'media/CircleGraph';

  public static panels: PartGraphSelPanel[] = [];

  private _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _documentPath: string;  // part file path
  private _ownerId: number;       // id of owner
  private _documentText: string;  // part document
  private _modelPath: string;     // circle file path
  private _partEventHandler: PartGraphEvent|undefined;

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    // TODO add more commands
    let disposableCmdUpdate = vscode.commands.registerCommand(
        PartGraphSelPanel.cmdUpdate, (filePath: string, id: number, docText: string) => {
          PartGraphSelPanel.updateByOwner(context.extensionUri, filePath, id, docText);
        });
    context.subscriptions.push(disposableCmdUpdate);

    let disposableCmdClose = vscode.commands.registerCommand(
        PartGraphSelPanel.cmdClose, (filePath: string, id: number) => {
          PartGraphSelPanel.closeByOwner(context.extensionUri, filePath, id);
        });
    context.subscriptions.push(disposableCmdClose);

    let disposableCmdFwdSelection = vscode.commands.registerCommand(
        PartGraphSelPanel.cmdFwdSelection, (filePath: string, id: number, selection: string) => {
          PartGraphSelPanel.forwardSelectionByOwner(context.extensionUri, filePath, id, selection);
        });
    context.subscriptions.push(disposableCmdFwdSelection);

    let disposableGraphPenel = vscode.commands.registerCommand(
        PartGraphSelPanel.cmdOpen,
        (filePath: string, id: number, docText: string, names: string, handler: PartGraphEvent) => {
          PartGraphSelPanel.createOrShow(
              context.extensionUri, filePath, id, docText, names, handler);
        });

    return disposableGraphPenel;
  };

  public static createOrShow(
      extensionUri: vscode.Uri, docPath: string, id: number, docText: string, names: string,
      handler: PartGraphEvent|undefined) {
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // search for existing panel
    const oldPanel = PartGraphSelPanel.findSelPanel(docPath, id);
    if (oldPanel) {
      oldPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    // TODO revise 'vscode.ViewColumn.Three' to appropriate value
    const lastSlash = docPath.lastIndexOf(path.sep) + 1;
    const fileNameExt = docPath.substring(lastSlash);
    const panel = vscode.window.createWebviewPanel(
        PartGraphSelPanel.viewType, fileNameExt, column || vscode.ViewColumn.Three,
        {retainContextWhenHidden: true});

    const graphSelPanel = new PartGraphSelPanel(panel, extensionUri, docPath, id, docText, handler);

    PartGraphSelPanel.panels.push(graphSelPanel);
    graphSelPanel.loadContent();
    graphSelPanel.onForwardSelection(names);
  }

  private static findSelPanel(docPath: string, id: number): PartGraphSelPanel|undefined {
    let result = undefined;
    PartGraphSelPanel.panels.forEach((selpan) => {
      if (docPath === selpan._documentPath && id === selpan._ownerId) {
        result = selpan;
        return true;  // break forEach
      }
    });
    return result;
  }

  /**
   * @brief called when owner has changed the document or received document has changed
   */
  public static updateByOwner(
      extensionUri: vscode.Uri, docPath: string, id: number, docText: string) {
    let selPanel = PartGraphSelPanel.findSelPanel(docPath, id);
    if (selPanel) {
      selPanel._documentText = docText;
      if (selPanel.isReady()) {
        selPanel.applyDocumentToGraph();
      }
    }
  }

  /**
   * @brief called when owner is closing
   */
  public static closeByOwner(extensionUri: vscode.Uri, docPath: string, id: number) {
    let selPanel = PartGraphSelPanel.findSelPanel(docPath, id);
    if (selPanel) {
      selPanel.dispose();
    }
  }

  /**
   * @brief called when owner selection state of nodes has changed
   */
  public static forwardSelectionByOwner(
      extensionUri: vscode.Uri, docPath: string, id: number, selection: string) {
    let selPanel = PartGraphSelPanel.findSelPanel(docPath, id);
    if (selPanel) {
      selPanel.onForwardSelection(selection);
    }
  }

  private constructor(
      panel: vscode.WebviewPanel, extensionUri: vscode.Uri, docPath: string, id: number,
      docText: string, handler: PartGraphEvent|undefined) {
    super(extensionUri, panel.webview);

    let parsedPath = path.parse(docPath);
    let fileBase = path.join(parsedPath.dir, parsedPath.name);

    this._panel = panel;
    this._documentPath = docPath;
    this._ownerId = id;
    this._documentText = docText;
    this._modelPath = fileBase + '.circle';
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

    PartGraphSelPanel.panels.forEach((selPan, index) => {
      if (this._documentPath === selPan._documentPath && this._ownerId === selPan._ownerId) {
        PartGraphSelPanel.panels.splice(index, 1);
        return true;  // break forEach
      }
    });

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
    // TODO implement
  }

  public onForwardSelection(selection: string) {
    let selections: string[] = [];
    let items = selection.split(/\r?\n/);
    for (let idx = 0; idx < items.length; idx++) {
      if (items[idx].length > 0) {
        selections.push(items[idx]);
      }
    }
    this.setSelection(selections);
  }

  public setTitle(title: string) {
    this._panel.title = title;
  }

  private loadContent() {
    this._panel.webview.html = this.getHtmlForWebview(this._panel.webview);
  }

  private applyDocumentToGraph() {
    let content = ini.parse(this._documentText);
    this.setPartition(content);
  }
};
