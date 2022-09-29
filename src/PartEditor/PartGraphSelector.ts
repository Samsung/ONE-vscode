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

import {BackendColor} from '../CircleGraph/BackendColor';
import {CircleGraphCtrl, CircleGraphEvent} from '../CircleGraph/CircleGraphCtrl';

export interface PartGraphEvent {
  onSelection(names: string[], tensors: string[]): void;
}

export type PartGraphCmdOpenArgs = {
  docPath: string; id: number; docText: string; names: string; backends: BackendColor[];
  viewColumn: vscode.ViewColumn | undefined;
};

export type PartGraphCmdUpdateArgs = {
  docPath: string, id: number, docText: string;
};

export type PartGraphCmdReloadArgs = {
  docPath: string, id: number, docText: string;
};

export type PartGraphCmdFwdSelArgs = {
  docPath: string, id: number, selection: string;
};

export type PartGraphCmdCloseArgs = {
  docPath: string, id: number;
};

/* istanbul ignore next */
export class PartGraphSelPanel extends CircleGraphCtrl implements CircleGraphEvent {
  public static readonly viewType = 'PartGraphSelector';
  public static readonly cmdOpen = 'one.part.openGraphSelector';
  public static readonly cmdUpdate = 'one.part.updateGraphSelector';
  public static readonly cmdReload = 'one.part.reloadGraphSelector';
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
  private _backendColors: BackendColor[];
  private _partEventHandler: PartGraphEvent|undefined;

  public static register(context: vscode.ExtensionContext): void {
    const registrations = [
      vscode.commands.registerCommand(
          PartGraphSelPanel.cmdReload,
          (args: PartGraphCmdReloadArgs) => {
            PartGraphSelPanel.reloadByOwner(context.extensionUri, args);
          }),
      vscode.commands.registerCommand(
          PartGraphSelPanel.cmdUpdate,
          (args: PartGraphCmdUpdateArgs) => {
            PartGraphSelPanel.updateByOwner(context.extensionUri, args);
          }),
      vscode.commands.registerCommand(
          PartGraphSelPanel.cmdClose,
          (args: PartGraphCmdCloseArgs) => {
            PartGraphSelPanel.closeByOwner(context.extensionUri, args);
          }),
      vscode.commands.registerCommand(
          PartGraphSelPanel.cmdFwdSelection,
          (args: PartGraphCmdFwdSelArgs) => {
            PartGraphSelPanel.forwardSelectionByOwner(context.extensionUri, args);
          }),
      vscode.commands.registerCommand(
          PartGraphSelPanel.cmdOpen,
          (args: PartGraphCmdOpenArgs, handler: PartGraphEvent) => {
            PartGraphSelPanel.createOrShow(context.extensionUri, args, handler);
          })
      // TODO add more commands
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  public static createOrShow(
      extensionUri: vscode.Uri, args: PartGraphCmdOpenArgs, handler: PartGraphEvent|undefined) {
    let column = args.viewColumn;
    if (column) {
      if (column >= vscode.ViewColumn.One) {
        column = column + 1;
      }
    }

    // search for existing panel
    const oldPanel = PartGraphSelPanel.findSelPanel(args.docPath, args.id);
    if (oldPanel) {
      oldPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const lastSlash = args.docPath.lastIndexOf(path.sep) + 1;
    const fileNameExt = args.docPath.substring(lastSlash);
    const panel = vscode.window.createWebviewPanel(
        PartGraphSelPanel.viewType, fileNameExt, column || vscode.ViewColumn.Two,
        {retainContextWhenHidden: true});

    const graphSelPanel = new PartGraphSelPanel(panel, extensionUri, args, handler);

    PartGraphSelPanel.panels.push(graphSelPanel);
    graphSelPanel.loadContent();
    graphSelPanel.onForwardSelection(args.names);
  }

  private static findSelPanel(docPath: string, id: number): PartGraphSelPanel|undefined {
    let result = undefined;
    PartGraphSelPanel.panels.forEach((selpan) => {
      if (docPath === selpan._documentPath && id === selpan._ownerId) {
        result = selpan;
      }
    });
    return result;
  }

  /**
   * @brief called when owner has changed the document or received document has changed
   */
  public static updateByOwner(extensionUri: vscode.Uri, args: PartGraphCmdUpdateArgs) {
    let selPanel = PartGraphSelPanel.findSelPanel(args.docPath, args.id);
    if (selPanel) {
      selPanel._documentText = args.docText;
      if (selPanel.isReady()) {
        selPanel.applyDocumentToGraph();
      }
    }
  }

  /**
   * @brief called when circle file has changed
   */
  public static reloadByOwner(extensionUri: vscode.Uri, args: PartGraphCmdReloadArgs) {
    let selPanel = PartGraphSelPanel.findSelPanel(args.docPath, args.id);
    if (selPanel) {
      selPanel._documentText = args.docText;
      selPanel.reloadModel();
    }
  }

  /**
   * @brief called when owner is closing
   */
  public static closeByOwner(extensionUri: vscode.Uri, args: PartGraphCmdCloseArgs) {
    let selPanel = PartGraphSelPanel.findSelPanel(args.docPath, args.id);
    if (selPanel) {
      selPanel.dispose();
    }
  }

  /**
   * @brief called when owner selection state of nodes has changed
   */
  public static forwardSelectionByOwner(extensionUri: vscode.Uri, args: PartGraphCmdFwdSelArgs) {
    let selPanel = PartGraphSelPanel.findSelPanel(args.docPath, args.id);
    if (selPanel) {
      selPanel.onForwardSelection(args.selection);
    }
  }

  private constructor(
      panel: vscode.WebviewPanel, extensionUri: vscode.Uri, args: PartGraphCmdOpenArgs,
      handler: PartGraphEvent|undefined) {
    super(extensionUri, panel.webview);

    let parsedPath = path.parse(args.docPath);
    let fileBase = path.join(parsedPath.dir, parsedPath.name);

    this._panel = panel;
    this._documentPath = args.docPath;
    this._ownerId = args.id;
    this._documentText = args.docText;
    this._modelPath = fileBase + '.circle';
    this._backendColors = args.backends;
    this._partEventHandler = handler;

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

    this.initGraphCtrl(this._modelPath, this);
    this.setMode('selector');
  }

  public dispose() {
    this.disposeGraphCtrl();

    PartGraphSelPanel.panels.forEach((selPan, index) => {
      if (this._documentPath === selPan._documentPath && this._ownerId === selPan._ownerId) {
        PartGraphSelPanel.panels.splice(index, 1);
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
  public onPageLoaded() {
    this.sendBackendColor(this._backendColors);
  }

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
    // TODO set selection here?

    // set node backend assignment
    this.applyDocumentToGraph();
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
}
