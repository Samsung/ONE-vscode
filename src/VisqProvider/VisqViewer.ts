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

import {CircleGraphCtrl} from '../CircleGraph/CircleGraphCtrl';


/**
 * @brief VisqViewer with CircleGraphCtrl
 */
/* istanbul ignore next */
class VisqViewer extends CircleGraphCtrl {
  private readonly _panel: vscode.WebviewPanel;
  private readonly _document: VisqViewerDocument;

  constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, document: VisqViewerDocument) {
    super(extensionUri, panel.webview);
    this._panel = panel;
    this._document = document;
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }
}

/**
 * @brief Read only document for visq.json file
 */
/* istanbul ignore next */
export class VisqViewerDocument implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
  private _visqViewer: VisqViewer|undefined;

  static async create(uri: vscode.Uri):
      Promise<VisqViewerDocument|PromiseLike<VisqViewerDocument>> {
    return new VisqViewerDocument(uri);
  }

  private constructor(uri: vscode.Uri) {
    this._uri = uri;
    this._visqViewer = undefined;
  }

  public get uri() {
    return this._uri;
  }

  // CustomDocument implements
  dispose(): void {
    if (this._visqViewer) {
      this._visqViewer.disposeGraphCtrl();
      this._visqViewer = undefined;
    }
  }

  public openView(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    // TODO load model
    let view = new VisqViewer(panel, extensionUri, this);
    // TODO initialize view

    this._visqViewer = view;

    panel.onDidDispose(() => {
      if (this._visqViewer) {
        if (this._visqViewer.owner(panel)) {
          this._visqViewer.disposeGraphCtrl();
          this._visqViewer = undefined;
        }
      }
    });

    return view;
  }
}

/**
 * @brief Visq viewer readonly Provider
 */
/* istanbul ignore next */
export class VisqViewerProvider implements vscode.CustomReadonlyEditorProvider<VisqViewerDocument> {
  public static readonly viewType = 'one.viewer.visq';

  private _context: vscode.ExtensionContext;

  public static register(context: vscode.ExtensionContext): void {
    const provider = new VisqViewerProvider(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(VisqViewerProvider.viewType, provider, {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      })
      // Add command registration here
    ];
    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(private readonly context: vscode.ExtensionContext) {
    this._context = context;
  }

  // CustomReadonlyEditorProvider implements
  async openCustomDocument(
      uri: vscode.Uri, _openContext: {backupId?: string},
      _token: vscode.CancellationToken): Promise<VisqViewerDocument> {
    const document: VisqViewerDocument = await VisqViewerDocument.create(uri);
    // NOTE as a readonly viewer, there is not much to do

    // TODO handle file change events
    // TODO handle backup

    return document;
  }

  // CustomReadonlyEditorProvider implements
  async resolveCustomEditor(
      document: VisqViewerDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    document.openView(webviewPanel, this._context.extensionUri);
  }
}
