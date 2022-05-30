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
import * as vscode from 'vscode';

import {getNonce} from '../Utils/external/Nonce';

export class PartEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'onevscode.part-editor';
  public static readonly folderMediaPartEditor = 'media/PartEditor';

  private readonly _extensionUri: vscode.Uri;

  private _disposables: vscode.Disposable[] = [];
  private _document: vscode.TextDocument|undefined;

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
  }

  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      token: vscode.CancellationToken): Promise<void> {
    console.log('document=', document);

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

    this._document = document;

    webviewPanel.webview.options = this.getWebviewOptions(this._extensionUri),
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    this.updateWebview();
  }

  private updateWebview() {
    // TODO update webView with document
    if (this._document) {
      console.log('updateWebview document.uri=', this._document.uri);
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

    // TODO update model name
    html = this.updateText(html, webview, '%MODEL_NAME%', '');

    return html;
  }

  private getMediaPath(file: string) {
    return vscode.Uri.joinPath(this._extensionUri, PartEditorProvider.folderMediaPartEditor, file);
  }

  private updateUri(html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, replace);
    return html.replace(search, `${replaceUri}`);
  }

  private getUriFromPath(webview: vscode.Webview, file: string) {
    const mediaPath = this.getMediaPath(file);
    const uriView = webview.asWebviewUri(mediaPath);
    return uriView;
  }

  private updateText(html: string, webview: vscode.Webview, search: string, replace: string) {
    return html.replace(search, `${replace}`);
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
