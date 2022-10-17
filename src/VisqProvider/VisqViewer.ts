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
import * as path from 'path';
import * as vscode from 'vscode';

import {CircleGraphCtrl, CircleGraphEvent, MessageDefs} from '../CircleGraph/CircleGraphCtrl';


/**
 * @brief VisqViewer with CircleGraphCtrl
 */
/* istanbul ignore next */
class VisqViewer extends CircleGraphCtrl implements CircleGraphEvent {
  private readonly _panel: vscode.WebviewPanel;
  private readonly _document: VisqViewerDocument;

  constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, document: VisqViewerDocument) {
    super(extensionUri, panel.webview);
    this._panel = panel;
    this._document = document;
  }

  /**
   * CircleGraphEvent interface implementations
   */
  public onViewMessage(message: any) {
    switch (message.command) {
      case MessageDefs.visq:
        this.sendVisq(this._document.visq);
        break;
    }
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }
}

// *.visq.json format example
/*
{
  "meta" : {
    "title" : "Test of VISQ"
    "model" : "test_error.circle",
    "metric": "MPEIR",
    "colorscheme" : [
      { "b": "0.0020", "e": "0.0929", "c": "#ffeda0" },
      { "b": "0.0929", "e": "0.1838", "c": "#feb24c" },
      { "b": "0.1838", "e": "0.2747", "c": "#fc4e2a" }
    ]
  },
  "error": [
    {
      "ofm_conv": "0.01",
      "ofm_mul": "0.1",
      "ofm_add": "0.2"
    }
  ]
}
*/

/**
 * @brief Read only document for visq.json file
 */
/* istanbul ignore next */
export class VisqViewerDocument implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
  private _visqViewer: VisqViewer|undefined;
  private _visqJson: any = undefined;
  private _modelPath = '';

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

  public get visq() {
    return this._visqJson;
  }

  // CustomDocument implements
  dispose(): void {
    if (this._visqViewer) {
      this._visqViewer.disposeGraphCtrl();
      this._visqViewer = undefined;
    }
  }

  private loadVisqFile(visqPath: string) {
    const fileData = fs.readFileSync(visqPath, {encoding: 'utf8', flag: 'r'});
    this._visqJson = JSON.parse(fileData);

    this._modelPath = this._visqJson.meta.model;
    if (!path.isAbsolute(this._modelPath)) {
      // model is relative, make it relative to .visq.json file
      let visqPath = path.parse(this.uri.fsPath);
      // TODO check with using path.resolve(), path.join()
      this._modelPath = path.normalize(visqPath.dir + '/' + this._visqJson.meta.model);
    }
  }

  public openView(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.loadVisqFile(this.uri.fsPath);

    let view = new VisqViewer(panel, extensionUri, this);
    view.initGraphCtrl(this._modelPath, view);
    view.setMode('visq');
    view.loadContent();

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
