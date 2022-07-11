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
import {CfgData} from './CfgData';
import {CfgHtmlBuilder} from './CfgHtmlBuilder';


export class CfgEditorPanel implements vscode.CustomTextEditorProvider {
  private _disposables: vscode.Disposable[] = [];
  private _oneConfig: CfgData = new CfgData();

  public static readonly viewType = 'cfg.editor';

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new CfgEditorPanel(context);
    const providerRegistration =
        vscode.window.registerCustomEditorProvider(CfgEditorPanel.viewType, provider, {
          webviewOptions: {
            retainContextWhenHidden: true,
          },
        });
    return providerRegistration;
  };

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    await this.initWebview(document, webviewPanel.webview);
    this.initWebviewPanel(document, webviewPanel);
    this.updateWebview(document, webviewPanel.webview);
  };

  private async initWebview(document: vscode.TextDocument, webview: vscode.Webview): Promise<void> {
    webview.options = {
      enableScripts: true,
    };

    {
      let htmlBuilder = new CfgHtmlBuilder(webview, this.context.extensionUri);
      webview.html = await htmlBuilder.build();
    }

    // Receive message from the webview.
    webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case 'requestDisplayCfg':
          this.updateWebview(document, webview);
          break;
        case 'setParam':
          this._oneConfig.setParam(e.section, e.param, e.value);
          break;
        case 'setSection':
          this._oneConfig.setSection(e.section, e.param);
          break;
        case 'updateDocument':
          if (this._oneConfig.isSame(document.getText()) === false) {
            this._oneConfig.sort();

            // TODO Optimize this to modify only changed lines
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                document.uri, new vscode.Range(0, 0, document.lineCount, 0),
                this._oneConfig.getStringfied());
            vscode.workspace.applyEdit(edit);
          }
          break;
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

    webviewPanel.onDidChangeViewState(e => {
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
    this._oneConfig.updateWithStringifiedText(document.getText());
    webview.postMessage({type: 'displayCfgToEditor', text: this._oneConfig.getOneConfig()});
  };
}
