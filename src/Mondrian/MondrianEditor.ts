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
import {getNonce} from '../Utils/external/Nonce';
import {getUri} from '../Utils/external/Uri';

/* istanbul ignore next */
export class MondrianEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new MondrianEditorProvider(context);
    const providerRegistration =
        vscode.window.registerCustomEditorProvider(MondrianEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'one.viewer.mondrian';

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Called when custom editor is opened.
   */
  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    webviewPanel.webview.postMessage({
      type: 'update',
      text: document.getText(),
    });
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    const prefix = 'media/Mondrian';
    const nonce = getNonce();

    const toolkitUri = getUri(webview, this.context.extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ]);

    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, prefix, 'mondrianViewer.js'));

    const styleUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, prefix, 'style.css'));

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${
        webview.cspSource} data:;
          style-src 'self' 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script nonce="${nonce}" type="module" src="${toolkitUri}"></script>
        <link href="${styleUri}" rel="stylesheet" />
        <title>Mondrian Viewer</title>
      </head>
      <body>
        <div class="mondrian-layout">
          <div class="mondrian-scrollbar">
            <div class="mondrian-scrollbar-btn">
              <button class="mondrian-scrollbar-btn-left">||</button>
              <button class="mondrian-scrollbar-btn-center"></button>
              <button class="mondrian-scrollbar-btn-right">||</button>
            </div>
          </div>
          <div class="mondrian-viewer-area">
            <div class="mondrian-viewer-bounds"></div>
          </div>
          <div class="mondrian-sidepanel">
            <vscode-text-area resize="vertical" rows="5" class="mondrian-sidepanel-origin" readonly>
              Origin
            </vscode-text-area>
            <vscode-text-field class="mondrian-sidepanel-size" readonly>Size</vscode-text-field>
            <vscode-text-field class="mondrian-sidepanel-offset" readonly>Offset</vscode-text-field>
            <vscode-text-field class="mondrian-sidepanel-allocated" readonly>Allocated</vscode-text-field>
            <vscode-text-field class="mondrian-sidepanel-freed" readonly>Freed</vscode-text-field>
            <vscode-text-field class="mondrian-sidepanel-lifetime" readonly>Lifetime</vscode-text-field>
          </div>
          <div class="mondrian-statusbar">
            <div class="mondrian-statusline"></div>
            <div class="mondrian-info">
              <b>Total memory:</b> <span class="mondrian-info-memory-size">0</span> |
              <b>Cycles:</b> <span class="mondrian-info-cycle-count">0</span> |
              <b>Segment:</b> <vscode-dropdown class="mondrian-segment-picker"></vscode-dropdown>
            </div>
          </div>
        </div>

        <div class="mondrian-viewer-controls mondrian-viewer-v-scale">
          <button>+</button>
          <input type="range" min="-5" max="15" value="5" />
          <button>-</button>
        </div>
        <div class="mondrian-viewer-controls mondrian-viewer-h-scale">
          <button>-</button>
          <input type="range" min="-5" max="15" value="5" />
          <button>+</button>
        </div>

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
