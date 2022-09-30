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
import { MetadataViewerProvider } from '../MetadataViewer/MetadataViewerProvider';
import { getNonce } from '../Utils/external/Nonce';
import { getUri } from '../Utils/external/Uri';
import { obtainWorkspaceRoot } from '../Utils/Helpers';
import { getRelationData} from './RelationViewerProvider';

/* istanbul ignore next */
export class RelationViewer{
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
  //웹뷰의 옵션과 이벤트 등록
  public initRelationViewer() {
    this._webview.options = this.getWebviewOptions();

    //웹뷰로부터 메세지 받을때 이벤트 등록
    this.registerEventHandlers(this._panel);

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

  //웹뷰에 relation 정보를 그린다.
  public loadContent() {
    this._getHtmlForWebview(this._extensionUri,this._panel);
  }

  private async _getHtmlForWebview(extensionUri:vscode.Uri, panel:vscode.WebviewPanel){
    panel.webview.options = {
      enableScripts: true,
    };

    const nonce = getNonce();
    const scriptUri =
        getUri(panel.webview, extensionUri, ['media', 'RelationViewer', 'index.js']);
    const styleUri =
        getUri(panel.webview, extensionUri, ['media', 'RelationViewer', 'style.css']);
    
    const toolkitUri = getUri(panel.webview, extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ]);

    const codiconUri = getUri(panel.webview, extensionUri, [
      'node_modules',
      '@vscode',
      'codicons',
      'dist',
      'codicon.css',
    ]);

    const htmlUri = vscode.Uri.joinPath(extensionUri, "media", "RelationViewer", "index.html");
    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${panel.webview.cspSource}`);
    html = html.replace(/\${toolkitUri}/g, `${toolkitUri}`);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    html = html.replace(/\${scriptUri}/g, `${scriptUri}`);
    html = html.replace(/\${styleUri}/g, `${styleUri}`);
    panel.webview.html = html;
    
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }

  private registerEventHandlers(panel:vscode.WebviewPanel) {
    // Handle messages from the webview
    this._webview.onDidReceiveMessage(message => {
      let payload;
      let fileUri:vscode.Uri;
      let viewType:string = 'default';
      switch (message.type) {
        case "update":
          //fileUri = vscode.Uri.file(obtainWorkspaceRoot() + '/' + message.path);
          payload = getRelationData(message.path);
          panel.webview.postMessage(
            {type:'update', payload: payload, historyList:message.historyList}
          );
          break;
        case "history":
          //fileUri = vscode.Uri.file(obtainWorkspaceRoot() + '/' + message.path);
          payload = getRelationData(message.path);
          panel.webview.postMessage(
            {type:'history', payload: payload, historyList:message.historyList}
          );
          break;
        case "showMetadata":
          fileUri = vscode.Uri.file(obtainWorkspaceRoot() + '/' + message.path);
          vscode.commands.executeCommand('vscode.openWith', fileUri, MetadataViewerProvider.viewType);
          break;
        case "openFile":
          if(message.path.split('.').slice(-1)[0] === 'circle'){
            viewType = `one.viewer.circle`;
          }
          fileUri = vscode.Uri.file(obtainWorkspaceRoot() + '/' + message.path);
          vscode.commands.executeCommand('vscode.openWith', fileUri, viewType);
          break;
        default:
          break;
      }
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

