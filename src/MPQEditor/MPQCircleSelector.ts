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
  MessageDefs,
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

export type MPQVisqData = {
  visqJsonData: string[];
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

/* istanbul ignore next */
export class MPQSelectionPanel
  extends CircleGraphCtrl
  implements CircleGraphEvent
{
  public static readonly viewType = "one.viewer.mpq";
  public static readonly cmdOpen = "one.viewer.mpq.openGraphSelector";
  public static readonly cmdClose = "one.viewer.mpq.closeGraphSelector";
  public static readonly cmdChanged = "one.viewer.mpq.layersChangedByOwner";
  public static readonly cmdOpenVisq = "one.viewer.mpq.loadVisq";

  public static panels: MPQSelectionPanel[] = [];

  private _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _document: vscode.TextDocument;
  private _ownerPanel: vscode.WebviewPanel;
  private _ownerId: string; // stringified uri of the owner document
  private _modelPath: string; // circle file path
  private _mpqEventHandler?: MPQSelectionEvent;
  private _lastSelected: string[];
  private _visqData: string[];
  private _closedByOwner: boolean = false;

  public static register(context: vscode.ExtensionContext): void {
    const registrations = [
      vscode.commands.registerCommand(
        MPQSelectionPanel.cmdOpen,
        (args: MPQSelectionCmdOpenArgs, handler: MPQSelectionEvent) => {
          MPQSelectionPanel.createOrShow(
            context.extensionUri,
            args,
            [],
            handler
          );
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
      vscode.commands.registerCommand(
        MPQSelectionPanel.cmdOpenVisq,
        (
          args: MPQSelectionCmdOpenArgs,
          visqData: MPQVisqData,
          handler: MPQSelectionEvent
        ) => {
          MPQSelectionPanel.createOrShow(
            context.extensionUri,
            args,
            visqData.visqJsonData,
            handler
          );
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
    visqJsonData: string[],
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
      visqJsonData,
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
    visqData: string[],
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
    this._visqData = visqData;

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this.initGraphCtrl(this._modelPath, this);
    if (this._visqData.length < 1) {
      this.setMode("selector");
    } else {
      this.setMode("visqselector");
    }
    if (this._mpqEventHandler) {
      this._mpqEventHandler.onOpened(this._ownerPanel);
    }
  }

  public dispose() {
    if (!this._closedByOwner && this._mpqEventHandler) {
      this._mpqEventHandler.onClosed(this._ownerPanel);
    }

    this.disposeGraphCtrl();

    MPQSelectionPanel.panels.forEach((selPan, index) => {
      if (
        this._ownerId === selPan._ownerId &&
        this._modelPath === selPan._modelPath
      ) {
        MPQSelectionPanel.panels.splice(index, 1);
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
   * @brief called to prevent the view from scrolling after every user selection
   */
  public cancelScrollToSelected() {
    this._webview.postMessage({
      command: MessageDefs.scrollToSelected,
      value: false,
    });
  }

  /**
   * CircleGraphEvent interface implementations
   */
  public onViewMessage(message: any) {
    switch (message.command) {
      case MessageDefs.selection:
        this._lastSelected = message.names;
        // we need to update the document, but not save to file.
        // pass to owner to handle this.
        if (this._mpqEventHandler) {
          this._mpqEventHandler.onSelection(message.names, this._document);
        }
        break;
      case MessageDefs.finishload:
        this.cancelScrollToSelected();
        this.onForwardSelection(this._lastSelected);
        break;
      case MessageDefs.visq:
        this.cancelScrollToSelected();
        this.sendVisq(this._visqData);
        break;
    }
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
