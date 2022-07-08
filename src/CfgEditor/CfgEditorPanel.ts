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

import * as ini from 'ini';
import * as vscode from 'vscode';
import {getNonce} from '../Utils/external/Nonce';
import {getUri} from '../Utils/external/Uri';

export class CfgEditorPanel implements vscode.CustomTextEditorProvider {
  private _disposables: vscode.Disposable[] = [];
  private _oneConfig: any = undefined;

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

  private updateWebview(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel) {
    this._oneConfig = ini.parse(document.getText());

    // TODO Separate handling deprecated elements
    // NOTE 'one-build' will be deprecated.
    //      Therefore, when only 'one-build' is used, it will be replaced to 'onecc'.
    if (this._oneConfig['onecc'] === undefined && this._oneConfig['one-build'] !== undefined) {
      this._oneConfig['onecc'] = ini.parse(ini.stringify(this._oneConfig['one-build']));
      delete this._oneConfig['one-build'];
    }
    // NOTE 'input_dtype' is deprecated.
    //      Therefore, when only 'input_dtype' is used, it will be replaced to 'onecc'.
    if (this._oneConfig['one-quantize']?.['input_dtype'] !== undefined) {
      if (this._oneConfig['one-quantize']['input_model_dtype'] === undefined) {
        this._oneConfig['one-quantize']['input_model_dtype'] =
            this._oneConfig['one-quantize']['input_dtype'];
      }
      delete this._oneConfig['one-quantize']['input_dtype'];
    }

    webviewPanel.webview.postMessage({type: 'displayCfgToEditor', text: this._oneConfig});
  };

  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    vscode.commands.executeCommand('setContext', CfgEditorPanel.viewType, true);

    webviewPanel.webview.html = await this._getHtmlForWebview(webviewPanel.webview);

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.contentChanges.length > 0 && e.document.uri.toString() === document.uri.toString()) {
        this.updateWebview(document, webviewPanel);
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

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case 'requestDisplayCfg':
          this.updateWebview(document, webviewPanel);
          break;
        case 'setParam':
          if (this._oneConfig[e.section] === undefined) {
            this._oneConfig[e.section] = {};
          }
          if (this._oneConfig[e.section][e.param] === undefined) {
            this._oneConfig[e.section][e.param] = '';
          }
          this._oneConfig[e.section][e.param] = e.value;
          break;
        case 'setSection':
          this._oneConfig[e.section] = ini.parse(e.param);
          break;
        case 'updateDocument':
          let isSame = true;
          const iniDocument = ini.parse(document.getText());
          for (const [sectionName, section] of Object.entries(this._oneConfig)) {
            for (const [paramName, param] of Object.entries(section as any)) {
              if (iniDocument[sectionName] !== undefined &&
                  iniDocument[sectionName][paramName] === param) {
                continue;
              }
              isSame = false;
              break;
            }
          }
          for (const [sectionName, section] of Object.entries(iniDocument)) {
            for (const [paramName, param] of Object.entries(section as any)) {
              if (this._oneConfig[sectionName] !== undefined &&
                  this._oneConfig[sectionName][paramName] === param) {
                continue;
              }
              isSame = false;
              break;
            }
          }

          if (isSame === false) {
            // cfg file is written along with the order of array elements
            let sortedCfg: any = {};
            const sections = [
              'onecc', 'one-import-tf', 'one-import-tflite', 'one-import-bcq', 'one-import-onnx',
              'one-optimize', 'one-quantize', 'one-codegen', 'one-profile'
            ];
            sections.forEach((section) => {
              if (this._oneConfig[section] !== undefined) {
                sortedCfg[section] = this._oneConfig[section];
              }
            });

            // TODO Optimize this to modify only changed lines
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                document.uri, new vscode.Range(0, 0, document.lineCount, 0),
                ini.stringify(sortedCfg));
            vscode.workspace.applyEdit(edit);
          }
          break;
        default:
          break;
      }
    });
  };

  private async _getHtmlForWebview(webview: vscode.Webview) {
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

    const htmlPath =
        vscode.Uri.joinPath(this.context.extensionUri, 'media/CfgEditor/cfgeditor.html');
    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlPath)).toString();

    // Apply js and cs to html
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${webview.cspSource}`);
    html = html.replace(/\${toolkitUri}/g, `${toolkitUri}`);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    html = html.replace(/\${jsUri}/g, `${jsUri}`);
    html = html.replace(/\${cssUri}/g, `${cssUri}`);

    return html;
  };
}
