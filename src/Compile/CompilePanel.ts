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
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/blob/b807107df40271e83ea6d36828357fdb10d71f12/default/hello-world/src/panels/HelloWorldPanel.ts
*/
import * as vscode from 'vscode';
import {getUri} from '../Utils/Uri';

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    // localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
  };
}

export class CompilePanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: CompilePanel|undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static readonly viewType = 'Compile';

  public static render(extensionUri: vscode.Uri) {
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (CompilePanel.currentPanel) {
      // If the webview panel already exists reveal it
      CompilePanel.currentPanel._panel.reveal(column);
    } else {
      const title = 'Compile';

      // If a webview panel does not already exist create and show a new one
      const panel = vscode.window.createWebviewPanel(
          // Panel view type
          this.viewType,
          // Panel title
          title,
          // The editor column the panel should be displayed in
          column || vscode.ViewColumn.One,
          // Extra panel configurations
          getWebviewOptions(extensionUri),
      );

      CompilePanel.currentPanel = new CompilePanel(panel, extensionUri);
    }
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(e => {
      if (this._panel.visible) {
        this._update();
      }
    }, null, this._disposables);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener();
  }

  public dispose() {
    CompilePanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;

    this._panel.title = 'Compile';
    this._panel.webview.html = this._getHtmlForWebview();
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener() {
    const webview = this._panel.webview;
    webview.onDidReceiveMessage((message: any) => {
      const command = message.command;
      const text = message.text;

      switch (command) {
        case 'compile-completed':
          // Code that should run in response to the hello message command
          vscode.window.showInformationMessage(text);
          return;
          // Add more switch case statements here as more webview message commands
          // are created within the webview context (i.e. inside media/main.js)
        case 'set-output-dir':
          const options = {canSelectMany: false, canSelectFiles: false, canSelectFolders: true};

          vscode.window.showOpenDialog(options).then((val: vscode.Uri[]|undefined) => {
            // TODO handle directory user entered
            if (val !== undefined) {
              this._panel.webview.postMessage({command: 'set-output-dir', data: val[0].fsPath});
            }
          });
          return;
      }
    }, undefined, this._disposables);
  }

  private _getHtmlForWebview() {
    const toolkitUri = getUri(this._panel.webview, this._extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ]);
    const jsUri =
        getUri(this._panel.webview, this._extensionUri, ['media', 'Compile', 'compile.js']);

    const cssUri =
        getUri(this._panel.webview, this._extensionUri, ['media', 'Compile', 'compile.css']);

    // TODO Extract html file into a separate file

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <script type="module" src="${jsUri}"></script>
        <link rel="stylesheet" href="${cssUri}">
        <title>Compile</title>
      </head>
      <body>
        <h1>Compile</h1>
        <div class='left-margin-24'>
          <div class='compile-selections-container'>
            <div class='text-row'>
              <span class='two-column-text-left'>
                    <span>&#8226;</span> Target Code:
              </span>
              <span class='two-column-text-right'>
                <vscode-dropdown id='target-code'>
                  <vscode-option>NPU2</vscode-option>
                  <vscode-option>ONERT (TBD)</vscode-option>
                </vscode-dropdown>
              </span>
            </div> <!-- text-row -->

            <div class='text-row'>
              <span class='two-column-text-left'>
                <span>&#8226;</span> Output Directory:
              </span>
              <span class='two-column-text-right'>
                <vscode-link id='output-dir' href="#">Not set yet</vscode-link>
              </span>
            </div> <!-- text-row -->

            <div class='text-row'>
              <span class='two-column-text-left'>
                <span>&#8226;</span> Compiling Env version
              </span>
              <span class='two-column-text-right'>
                <vscode-dropdown id='compiling-env-ver'>
                  <vscode-option>Official 1.1.0</vscode-option>
                  <vscode-option>Nightly 220321</vscode-option>
                </vscode-dropdown>
              </span>
            </div> <!-- text-row -->

            <div class='text-row'>
              <span class='two-column-text-left'>
                <span>&#8226;</span> Options
              </span>
              <span class='two-column-text-right'>
                <vscode-link id="show-detailed-options" href="#">Set to default</vscode-link>
              </span>
            </div> <!-- text-row -->

          </div>  <!-- compile-selections -->
        </div> <!-- left-margin-24 -->

          <!-- detailed options. Initially this is not visible. -->
          <div id="detailed-options" class="left-margin-24" style="display:none">
            <h2>Detailed options</h2>
            <div class='sub-panel'>
              <h3>circle_optimizer</h3>
              <div class="left-margin-24">
                <div class='text-row'>
                  <span class='two-column-text-long-left'>
                    --fold_add_v2
                  </span>
                  <span class='two-column-text-right'>
                    <vscode-radio-group id='fold_add_v2'>
                      <vscode-radio value='on' checked>on</vscode-radio>
                      <vscode-radio value='off'>off</vscode-radio>
                    </vscode-radio-group>
                  </span>
                </div> <!-- text-row -->

                <div class='text-row'>
                  <span class='two-column-text-long-left'>
                    --fuse_activation_function
                  </span>
                  <span class='two-column-text-right'>
                    <vscode-radio-group id='fuse_activation_function'>
                    <vscode-radio value='on' checked>on</vscode-radio>
                    <vscode-radio value='off'>off</vscode-radio>
                  </vscode-radio-group>
                  </span>
                </div> <!-- text-row -->
              </div> <!-- left-margin-24 -->
            </div> <!-- sub-panel -->

            <div class='sub-panel'>
              <h3>circle_quantizer</h3>
              <div class="left-margin-24">
                <div class='text-row'>
                  <span class='two-column-text-long-left'>
                    --quantize_dequantize_weights
                  </span>
                  <span class='two-column-text-right'>
                    <vscode-radio-group id='quantize_dequantize_weights'>
                      <vscode-radio value='on' checked>on</vscode-radio>
                      <vscode-radio value='off'>off</vscode-radio>
                    </vscode-radio-group>
                  </span>
                </div> <!-- text-row -->
              </div> <!-- left-margin-24 -->
            </div> <!-- sub-panel -->
          </div>  <!-- detailedOptions -->

        </div>
        <div style="margin-left:24px; margin-top:24px">
          <vscode-button id="compile-button">Compile</vscode-button>
        </div>
      </body>
    </html>
      `;
  }
}
