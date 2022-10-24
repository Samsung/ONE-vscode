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
import {Balloon} from '../Utils/Balloon';


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
      case MessageDefs.export:
        this.exportToFile(message);
        break;
    }
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }

  private exportToFile(message: any) {
    if (!Object.prototype.hasOwnProperty.call(message, 'file')) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(message, 'data')) {
      return;
    }
    // NOTE message.file is absolute path
    let uri = vscode.Uri.file(message.file);
    let content = Uint8Array.from(message.data);

    vscode.workspace.fs.writeFile(uri, content)
        .then(
            () => {
              Balloon.info('Export done: ' + path.basename(message.file));
            },
            (err) => {
              Balloon.info('Export error: ' + err);
            });
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
  private _reloadTimer: NodeJS.Timer|undefined;

  static async create(uri: vscode.Uri):
      Promise<VisqViewerDocument|PromiseLike<VisqViewerDocument>> {
    return new VisqViewerDocument(uri);
  }

  private constructor(uri: vscode.Uri) {
    this._uri = uri;
    this._visqViewer = undefined;
    this._reloadTimer = undefined;
  }

  public get uri() {
    return this._uri;
  }

  public get visq() {
    return this._visqJson;
  }

  private makeModelPath() {
    this._modelPath = this._visqJson.meta.model;
    if (!path.isAbsolute(this._modelPath)) {
      // model is relative, make it relative to .visq.json file
      let visqPath = path.parse(this.uri.fsPath);
      this._modelPath = path.join(visqPath.dir, this._visqJson.meta.model);
    }
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

    this.makeModelPath();
  }

  private reloadVisqText(text: string) {
    let visqjson = JSON.parse(text);
    // TODO find better compare for updated file and current data
    if (this._visqJson && JSON.stringify(this._visqJson) === JSON.stringify(visqjson)) {
      return false;
    }
    this._visqJson = visqjson;
    // model path can be changed
    this.makeModelPath();
    return true;
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

  public reload(text: string) {
    // NOTE using timer here is to avoid rapid reloads and wait for some
    // short time. 500msec here can be adjusted for better user experience.
    if (this._reloadTimer) {
      clearTimeout(this._reloadTimer);
    }
    this._reloadTimer = setTimeout(() => {
      if (this.reloadVisqText(text)) {
        if (this._visqViewer) {
          this._visqViewer.setModel(this._modelPath);
          this._visqViewer.loadContent();
        }
      }
    }, 500);
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

    // TODO handle backup

    return document;
  }

  // CustomReadonlyEditorProvider implements
  async resolveCustomEditor(
      document: VisqViewerDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    document.openView(webviewPanel, this._context.extensionUri);

    const onChangeTextDoc = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        document.reload(e.document.getText());
      }
    });
    webviewPanel.onDidDispose(() => {
      onChangeTextDoc.dispose();
    });
  }
}
