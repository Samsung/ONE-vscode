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
import { getNonce } from '../Config/GetNonce';

export class MondrianEditorProvider implements vscode.CustomTextEditorProvider {

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new MondrianEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(MondrianEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'onevscode.mondrianViewer';

  constructor(
    private readonly context: vscode.ExtensionContext
  ) {}

  /**
   * Called when custom editor is opened.
   */
  public async resolveCustomTextEditor(
      document: vscode.TextDocument,
      webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken
    ): Promise<void>
  {
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

    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri, prefix, 'mondrianViewer.js'));

    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri, prefix, 'style.css'));

    return /* html */`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource};
          style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="${styleUri}" rel="stylesheet" />
        <title>Mondrian Viewer</title>
      </head>
      <body>
        <div class="mondrian-layout">
          <div class="mondrian-scrollbar"></div>
          <div class="mondrian-viewer-area">
            <div class="mondrian-viewer-bounds"></div>
          </div>
          <div class="mondrian-statusbar">
            <div class="mondrian-statusline"></div>
            <div class="mondrian-info">
              Memory: <span class="mondrian-info-memory-size">0</span> |
              Cycles: <span class="mondrian-info-cycle-count">0</span> |
              Segment: <select class="mondrian-segment-picker"></select>
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
