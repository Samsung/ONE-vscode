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

  public initWebView() {
    this._webview.options = this.getWebviewOptions();

    //Register for an event when you receive a message from a web view
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
    const cssIndex = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "MetadataViewer", "style.css"));
    const codiconsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

    const htmlUri = vscode.Uri.joinPath(extensionUri, "media", "MetadataViewer", "index.html");

    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${panel.webview.cspSource}`);
    html = html.replace(/\${index.css}/g, `${cssIndex}`);
    html = html.replace(/\${index.js}/g, `${jsIndex}`);
    html = html.replace(/\${codicon.css}/g, `${codiconsUri}`);
    panel.webview.html = html;
    
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }

  private registerEventHandlers() {
    // Handle messages from the webview
    this._webview.onDidReceiveMessage(message => {
      
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
