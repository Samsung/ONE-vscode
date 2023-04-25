/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as path from "path";
import * as vscode from "vscode";

import {
  CircleGraphCtrl,
  CircleGraphEvent,
} from "../CircleGraph/CircleGraphCtrl";

export interface MPQSelectionEvent {
  onSelection(names: string[], document: vscode.TextDocument): void;
  onClosed(panel: vscode.WebviewPanel): void;
  onOpened(panel: vscode.WebviewPanel): void;
}

export type MPQSelectionCmdOpenArgs = {
  modelPath: string;
  document: vscode.TextDocument;
  names: any;
  panel: vscode.WebviewPanel;
};

export type MPQSelectionCmdCloseArgs = {
  modelPath: string;
  document: vscode.TextDocument;
};

export type MPQSelectionCmdLayersChangedArgs = {
  modelPath: string;
  document: vscode.TextDocument;
  names: any;
};

export class MPQSelectionPanel
  extends CircleGraphCtrl
  implements CircleGraphEvent
{
  public static readonly viewType = "one.viewer.mpq";
  public static readonly cmdOpen = "one.viewer.mpq.openGraphSelector";
  public static readonly cmdClose = "one.viewer.mpq.closeGraphSelector";
  public static readonly cmdChanged = "one.viewer.mpq.layersChangedByOwner";

  public static panels: MPQSelectionPanel[] = [];

  private _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _document: vscode.TextDocument;
  private _ownerPanel: vscode.WebviewPanel;
  private _ownerId: string; // stringified uri of the owner document
  private _modelPath: string; // circle file path
  private _mpqEventHandler?: MPQSelectionEvent;
  private _lastSelected: string[];
  private _closedByOwner: boolean = false;

  public static register(context: vscode.ExtensionContext): void {
    const registrations = [
      vscode.commands.registerCommand(
        MPQSelectionPanel.cmdOpen,
        (args: MPQSelectionCmdOpenArgs, handler: MPQSelectionEvent) => {
          MPQSelectionPanel.createOrShow(context.extensionUri, args, handler);
        }
      ),
      vscode.commands.registerCommand(
        MPQSelectionPanel.cmdClose,
        (args: MPQSelectionCmdCloseArgs) => {
          MPQSelectionPanel.closeByOwner(context.extensionUri, args);
        }
      ),
      vscode.commands.registerCommand(
        MPQSelectionPanel.cmdChanged,
        (args: MPQSelectionCmdLayersChangedArgs) => {
          MPQSelectionPanel.forwardSelectionByOwner(context.extensionUri, args);
        }
      ),
      // TODO add more commands
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  public static createOrShow(
    extensionUri: vscode.Uri,
    args: MPQSelectionCmdOpenArgs,
    handler: MPQSelectionEvent | undefined
  ) {
    let column = args.panel.viewColumn;
    if (column) {
      if (column >= vscode.ViewColumn.One) {
        column = column + 1;
      }
    }

    // search for existing panel
    const oldPanel = MPQSelectionPanel.findSelPanel(
      args.modelPath,
      args.document.uri.toString()
    );
    if (oldPanel) {
      oldPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const lastSlash = args.modelPath.lastIndexOf(path.sep) + 1;
    const fileNameExt = args.modelPath.substring(lastSlash);
    const panel = vscode.window.createWebviewPanel(
      MPQSelectionPanel.viewType,
      fileNameExt,
      column || vscode.ViewColumn.Two,
      { retainContextWhenHidden: true }
    );

    const graphSelPanel = new MPQSelectionPanel(
      panel,
      extensionUri,
      args,
      handler
    );

    MPQSelectionPanel.panels.push(graphSelPanel);
    graphSelPanel.loadContent();
    graphSelPanel.onForwardSelection(args.names);
  }

  private static findSelPanel(
    docPath: string,
    id: string
  ): MPQSelectionPanel | undefined {
    let result = undefined;
    MPQSelectionPanel.panels.forEach((selpan) => {
      if (docPath === selpan._modelPath && id === selpan._ownerId) {
        result = selpan;
      }
    });
    return result;
  }

  /**
   * @brief called when owner is closing
   */
  public static closeByOwner(
    extensionUri: vscode.Uri,
    args: MPQSelectionCmdCloseArgs
  ) {
    let selPanel = MPQSelectionPanel.findSelPanel(
      args.modelPath,
      args.document.uri.toString()
    );
    if (selPanel) {
      selPanel._closedByOwner = true;
      selPanel.dispose();
    }
  }

  /**
   * @brief called when owner selection state of nodes has changed
   */
  public static forwardSelectionByOwner(
    extensionUri: vscode.Uri,
    args: MPQSelectionCmdLayersChangedArgs
  ) {
    let selPanel = MPQSelectionPanel.findSelPanel(
      args.modelPath,
      args.document.uri.toString()
    );
    if (selPanel) {
      selPanel.onForwardSelection(args.names);
    }
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    args: MPQSelectionCmdOpenArgs,
    handler: MPQSelectionEvent | undefined
  ) {
    super(extensionUri, panel.webview);

    this._panel = panel;
    this._ownerId = args.document.uri.toString();
    this._document = args.document;
    this._ownerPanel = args.panel;
    this._modelPath = args.modelPath;
    this._mpqEventHandler = handler;
    this._lastSelected = args.names;

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this.initGraphCtrl(this._modelPath, this);
    this.setMode("selector");
    if (this._mpqEventHandler) {
      this._mpqEventHandler.onOpened(this._ownerPanel);
    }
  }

  public dispose() {
    //TODO
  }

  /**
   * CircleGraphEvent interface implementations
   */
  public onViewMessage(_message: any) {
    // TODO
  }

  public onForwardSelection(selection: any) {
    let selections: string[] = [];
    let items = selection as Array<string>;
    for (let i = 0; i < items.length; i++) {
      if (items[i].length > 0) {
        selections.push(items[i]);
      }
    }
    this.setSelection(selections);
  }
}
