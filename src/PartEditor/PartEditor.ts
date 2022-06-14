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

import * as cp from 'child_process';
import * as fs from 'fs';
import * as ini from 'ini';
import * as path from 'path';
import * as vscode from 'vscode';

import {Balloon} from '../Utils/Balloon';
import {getNonce} from '../Utils/external/Nonce';
import {Logger} from '../Utils/Logger';

type Partition = {
  backends?: {};
  default?: {};
  comply?: {};
};

export class PartEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'onevscode.part-editor';
  public static readonly folderMediaPartEditor = 'media/PartEditor';

  private readonly _extensionUri: vscode.Uri;

  private _webview: vscode.Webview|undefined;
  private _disposables: vscode.Disposable[] = [];
  private _document: vscode.TextDocument|undefined;
  private _modelFilePath: string;
  private _modelFileName: string;
  private _modelFolderPath: string;
  private _backEndNames: string[] = [];

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new PartEditorProvider(context);
    const providerRegistration =
        vscode.window.registerCustomEditorProvider(PartEditorProvider.viewType, provider, {
          // NOTE: retainContextWhenHidden does not apply when provided to 'webview.options'
          webviewOptions: {retainContextWhenHidden: true},
        });
    return providerRegistration;
  };

  constructor(private readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
    this._document = undefined;
    this._webview = undefined;
    this._modelFilePath = '';
    this._modelFileName = '';
    this._modelFolderPath = '';
  }

  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      token: vscode.CancellationToken): Promise<void> {
    console.log('document=', document);

    this._webview = webviewPanel.webview;

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        this.updateWebview();
      }
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.onDidChangeViewState(
        e => {
            // TODO implement
        },
        null, this._disposables);

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'requestBackends':
          this.handleRequestBackends();
          return;

        case 'requestOpNames':
          this.handleRequestOpNames();
          return;

        case 'requestPartition':
          this.handleRequestPartition();
          return;
      }
    });

    this._document = document;

    if (this._document) {
      const lastSlash = this._document.fileName.lastIndexOf(path.sep) + 1;
      const fileNameExt = this._document.fileName.substring(lastSlash);
      const fileExt = path.extname(fileNameExt);

      this._modelFileName = path.basename(fileNameExt, fileExt) + '.circle';
      this._modelFolderPath = this._document.fileName.substring(0, lastSlash);
      this._modelFilePath = this._modelFolderPath + this._modelFileName;
    }

    // TODO revise to get from backend
    // item 0 is initial default backend
    this._backEndNames = ['CPU', 'CPU', 'ACL_CL', 'NPU'];

    webviewPanel.webview.options = this.getWebviewOptions(this._extensionUri),
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    this.updateWebview();
  }

  private updateWebview() {
    if (this._document && this._webview) {
      console.log('updateWebview document.uri=', this._document.uri);

      let content = ini.parse(this._document.getText());
      this._webview.postMessage({command: 'updatePartition', part: content});
    }
  }

  private makeDefaultPartiton() {
    let partition: Partition = {};

    partition.backends = this._backEndNames.slice(1, this._backEndNames.length).join(',');
    partition.default = this._backEndNames[0];
    partition.comply = 'opname';
    return partition;
  }

  private handleRequestBackends() {
    let backends = '';
    this._backEndNames.forEach((item) => {
      backends = backends + item + '\n';
    });
    if (this._webview) {
      this._webview.postMessage({command: 'resultBackends', backends: backends});
    }
  }

  private handleRequestOpNames() {
    const K_DATA: string = 'data';
    const K_EXIT: string = 'exit';
    const K_ERROR: string = 'error';
    // TODO integrate with Toolchain
    const tool = '/usr/share/one/bin/circle-operator';
    const toolargs = ['--name', this._modelFilePath];
    let result: string = '';
    let error: string = '';

    let runPromise = new Promise<string>((resolve, reject) => {
      let cmd = cp.spawn(tool, toolargs, {cwd: this._modelFolderPath});

      cmd.stdout.on(K_DATA, (data: any) => {
        let str = data.toString();
        if (str.length > 0) {
          result = result + str;
        }
      });

      cmd.stderr.on(K_DATA, (data: any) => {
        error = result + data.toString();
        Logger.error('Partition', error);
      });

      cmd.on(K_EXIT, (code: any) => {
        let codestr = code.toString();
        if (codestr === '0') {
          resolve(result);
        } else {
          let msg = 'Failed to load model: ' + this._modelFileName;
          Balloon.error(msg);
          reject(msg);
        }
      });

      cmd.on(K_ERROR, (err) => {
        let msg = 'Failed to run circle-operator: ' + this._modelFileName;
        Balloon.error(msg);
        reject(msg);
      });
    });

    runPromise
        .then((result) => {
          if (this._webview) {
            this._webview.postMessage({command: 'resultOpNames', names: result});
          }
        })
        .catch((error) => {
          Logger.error('Partition', error);
        });
  }

  private handleRequestPartition() {
    if (this._document && this._webview) {
      let content = ini.parse(this._document.getText());
      this._webview.postMessage({command: 'resultPartition', part: content});
    }
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const htmlPath = this.getMediaPath('index.html');
    let html = fs.readFileSync(htmlPath.fsPath, {encoding: 'utf-8'});

    const nonce = getNonce();
    html = html.replace(/\%nonce%/gi, nonce);
    html = html.replace('%webview.cspSource%', webview.cspSource);

    html = this.updateUri(html, webview, '%index.css%', 'index.css');
    html = this.updateUri(html, webview, '%index.js%', 'index.js');

    html = this.updateText(html, webview, '%MODEL_NAME%', this._modelFileName);

    return html;
  }

  private getMediaPath(file: string) {
    return vscode.Uri.joinPath(this._extensionUri, PartEditorProvider.folderMediaPartEditor, file);
  }

  private updateUri(html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, replace);
    return html.replace(search, replaceUri.toString());
  }

  private getUriFromPath(webview: vscode.Webview, file: string) {
    const mediaPath = this.getMediaPath(file);
    const uriView = webview.asWebviewUri(mediaPath);
    return uriView;
  }

  private updateText(html: string, webview: vscode.Webview, search: string, replace: string) {
    return html.replace(search, replace);
  }

  private getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,
      // And restrict the webview to only loading content from our extension's
      // 'media/PartEditor' directory.
      localResourceRoots:
          [vscode.Uri.joinPath(extensionUri, PartEditorProvider.folderMediaPartEditor)]
    };
  }
};
