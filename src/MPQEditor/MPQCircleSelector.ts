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

export class MPQSelectionPanel
  extends CircleGraphCtrl
  implements CircleGraphEvent
{
  public static readonly viewType = "one.viewer.mpq";

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

  public static register(_context: vscode.ExtensionContext): void {}

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
}
