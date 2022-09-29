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
/*
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*
Some part of this code refers to
https://github.com/microsoft/vscode-extension-samples/blob/2556c82cb333cf65d372bd01ac30c35ea1898a0e/custom-editor-sample/src/catScratchEditor.ts
*/

import * as vscode from 'vscode';
import {getNonce} from '../Utils/external/Nonce';
import {getUri} from '../Utils/external/Uri';


/* istanbul ignore next */
export class JsonTracerViewerPanel implements vscode.CustomTextEditorProvider {
  private _disposables: vscode.Disposable[] = [];

  public static readonly viewType = 'one.editor.jsonTracer';

  public static register(context: vscode.ExtensionContext): void {
    const provider = new JsonTracerViewerPanel(context);
    const registrations = [
      vscode.window.registerCustomEditorProvider(JsonTracerViewerPanel.viewType, provider, {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      })
      // Add command registration here
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    await this.initWebview(document, webviewPanel.webview);
    this.initWebviewPanel(document, webviewPanel);
    this.updateWebview(document, webviewPanel.webview);
  }

  private async initWebview(document: vscode.TextDocument, webview: vscode.Webview): Promise<void> {
    webview.options = {
      enableScripts: true,
    };

    const nonce = getNonce();
    const scriptUri =
        getUri(webview, this.context.extensionUri, ['media', 'Jsontracer', 'index.js']);
    const styleUri =
        getUri(webview, this.context.extensionUri, ['media', 'Jsontracer', 'style.css']);
    const htmlUri = vscode.Uri.joinPath(this.context.extensionUri, 'media/Jsontracer/index.html');
    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${webview.cspSource}`);
    html = html.replace(/\${scriptUri}/g, `${scriptUri}`);
    html = html.replace(/\${styleUri}/g, `${styleUri}`);
    webview.html = html;

    // Receive message from the webview.
    webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case 'requestDisplayJson':
          this.updateWebview(document, webview);
          break;
        default:
          break;
      }
    });
  }

  private initWebviewPanel(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel): void {
    vscode.commands.executeCommand('setContext', JsonTracerViewerPanel.viewType, true);

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.contentChanges.length > 0 && e.document.uri.toString() === document.uri.toString()) {
        this.updateWebview(document, webviewPanel.webview);
      }
    });

    webviewPanel.onDidChangeViewState(() => {
      vscode.commands.executeCommand(
          'setContext', JsonTracerViewerPanel.viewType, webviewPanel.visible);
    }, null, this._disposables);

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      while (this._disposables.length) {
        const x = this._disposables.pop();
        if (x) {
          x.dispose();
        }
      }
      vscode.commands.executeCommand('setContext', JsonTracerViewerPanel.viewType, false);
    });
  }

  private updateWebview(document: vscode.TextDocument, webview: vscode.Webview): void {
    const content = JSON.parse(document.getText()).traceEvents;
    const displayTimeUnit = JSON.parse(document.getText()).displayTimeUnit;
    if (content !== undefined) {
      webview.postMessage({type: 'load', content: content, displayTimeUnit: displayTimeUnit});
    }
  }
}
