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
import { getNonce } from '../Utils/external/Nonce';

/* istanbul ignore next */
export class MetadataViewer{
  private readonly _panel: vscode.WebviewPanel;
  private _disposable:vscode.Disposable[];
  protected readonly _webview: vscode.Webview;
  protected readonly _extensionUri: vscode.Uri;

  public constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._disposable = [];
    this._webview = panel.webview;
    this._panel = panel;
    this._extensionUri = extensionUri;
  }

  public initMetadataInfo() {
    this._webview.options = this.getWebviewOptions();

    //웹뷰로부터 메세지 받을때 이벤트 등록
    this.registerEventHandlers();

  }

  private getWebviewOptions(): vscode.WebviewOptions
      &vscode.WebviewPanelOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,
      // to prevent view to reload after loosing focus
      retainContextWhenHidden: true
    };
  }


  public loadContent() {
    this._getHtmlForWebview(this._extensionUri,this._panel);
  }

  private async _getHtmlForWebview(extensionUri:vscode.Uri, panel:vscode.WebviewPanel){
    panel.webview.options = {
      enableScripts: true,
    };

    const nonce = getNonce();
    const jsIndex = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "MetadataViewer", "index.js"));
    const cssIndex = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "MetadataViewer", "index.css"));

    const htmlUri = vscode.Uri.joinPath(extensionUri, "media", "MetadataViewer", "index.html");

    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${index.css}/g, `${cssIndex}`);
    html = html.replace(/\${index.js}/g, `${jsIndex}`);
    panel.webview.html = html;
    
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }

  private registerEventHandlers() {
    // Handle messages from the webview
    this._webview.onDidReceiveMessage(message => {
      // this.handleReceiveMessage(message);
    }, null, this._disposable);
  }

  public disposeMetadataView(){
    while (this._disposable.length) {
      const x = this._disposable.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

