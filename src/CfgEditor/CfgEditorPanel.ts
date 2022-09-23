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

import {CfgData} from './CfgData';

/* istanbul ignore next */
export class CfgEditorPanel implements vscode.CustomTextEditorProvider {
  private _disposables: vscode.Disposable[] = [];
  private _oneConfigMap: any = {};

  public static readonly viewType = 'one.editor.cfg';

  public static register(context: vscode.ExtensionContext): void {
    const provider = new CfgEditorPanel(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(CfgEditorPanel.viewType, provider, {
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
    this._oneConfigMap[document.uri.toString()] = new CfgData();
    await this.initWebview(document, webviewPanel.webview);
    this.initWebviewPanel(document, webviewPanel);
    this.updateWebview(document, webviewPanel.webview);
  }

  private async initWebview(document: vscode.TextDocument, webview: vscode.Webview): Promise<void> {
    webview.options = {
      enableScripts: true,
    };

    const nonce = getNonce();
    const toolkitUri = getUri(webview, this.context.extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ]);

    const codiconUri = getUri(webview, this.context.extensionUri, [
      'node_modules',
      '@vscode',
      'codicons',
      'dist',
      'codicon.css',
    ]);

    const jsUri = getUri(webview, this.context.extensionUri, ['media', 'CfgEditor', 'index.js']);
    const cssUri =
        getUri(webview, this.context.extensionUri, ['media', 'CfgEditor', 'cfgeditor.css']);
    const htmlUri =
        vscode.Uri.joinPath(this.context.extensionUri, 'media/CfgEditor/cfgeditor.html');

    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${webview.cspSource}`);
    html = html.replace(/\${toolkitUri}/g, `${toolkitUri}`);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    html = html.replace(/\${jsUri}/g, `${jsUri}`);
    html = html.replace(/\${cssUri}/g, `${cssUri}`);
    webview.html = html;

    // Receive message from the webview.
    webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case 'requestDisplayCfg':
          this.updateWebview(document, webview);
          break;
        case 'setParam':
          this._oneConfigMap[document.uri.toString()].updateSectionWithKeyValue(
              e.section, e.param, e.value);
          break;
        case 'setSection':
          this._oneConfigMap[document.uri.toString()].updateSectionWithValue(e.section, e.param);
          break;
        case 'updateDocument':
          if (this._oneConfigMap[document.uri.toString()].isSame(document.getText()) === false) {
            this._oneConfigMap[document.uri.toString()].sort();

            // TODO Optimize this to modify only changed lines
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                document.uri, new vscode.Range(0, 0, document.lineCount, 0),
                this._oneConfigMap[document.uri.toString()].getAsString());
            vscode.workspace.applyEdit(edit);
          }
          break;
        case 'getPathByDialog': {
          const dialogOptions = {
            canSelectMany: false,
            canSelectFolders: e.isFolder,
            openLabel: 'Open',
            filters: {'target files': e.ext, 'all files': ['*']}
          };
          let newPath = e.oldPath;
          vscode.window.showOpenDialog(dialogOptions).then(fileUri => {
            if (fileUri && fileUri[0]) {
              newPath = fileUri[0].fsPath.toString();
              webview.postMessage(
                  {type: 'applyDialogPath', step: e.postStep, elemID: e.postElemID, path: newPath});
            }
          });
          break;
        }
        default:
          break;
      }
    });
  }

  private initWebviewPanel(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel): void {
    vscode.commands.executeCommand('setContext', CfgEditorPanel.viewType, true);

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.contentChanges.length > 0 && e.document.uri.toString() === document.uri.toString()) {
        this.updateWebview(document, webviewPanel.webview);
      }
    });

    webviewPanel.onDidChangeViewState(() => {
      if (webviewPanel.visible) {
        vscode.commands.executeCommand('one.explorer.revealInOneExplorer', document.fileName);
      }
      vscode.commands.executeCommand('setContext', CfgEditorPanel.viewType, webviewPanel.visible);
    }, null, this._disposables);

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      while (this._disposables.length) {
        const x = this._disposables.pop();
        if (x) {
          x.dispose();
        }
      }
      vscode.commands.executeCommand('setContext', CfgEditorPanel.viewType, false);
    });
  }

  private updateWebview(document: vscode.TextDocument, webview: vscode.Webview): void {
    this._oneConfigMap[document.uri.toString()].setWithString(document.getText());
    webview.postMessage({
      type: 'displayCfgToEditor',
      text: this._oneConfigMap[document.uri.toString()].getAsConfig()
    });
  }
}
