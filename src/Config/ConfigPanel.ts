/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

export class ConfigPanel {
  /**
   * Track the current panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ConfigPanel|undefined;

  public static readonly viewType = 'one-vscode';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    if (ConfigPanel.currentPanel) {
      ConfigPanel.currentPanel._panel.reveal(column);
      ConfigPanel.currentPanel._update(context);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
        ConfigPanel.viewType, 'ConfigurationSettings', column || vscode.ViewColumn.One, {
          // Enable javascript in the webview
          enableScripts: true,
          localResourceRoots: [],
        });

    ConfigPanel.currentPanel = new ConfigPanel(panel, context);
  }

  public static kill() {
    ConfigPanel.currentPanel ?.dispose();
    ConfigPanel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    ConfigPanel.currentPanel = new ConfigPanel(panel, context);
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._extensionUri = context.extensionUri;

    // Set the webview's initial html content
    this._update(context);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public dispose() {
    ConfigPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update(context: vscode.ExtensionContext) {
    const webview = this._panel.webview;
    webview.html = this._getHtmlForWebview(webview, context);
  }

  private _getHtmlForWebview(webview: vscode.Webview, context: vscode.ExtensionContext) {
    // TODO Use a nonce to only allow specific scripts to be run
    // TDOO fill with logics related to html
    // TODO import html and change html source to fit webview format

    return '';
  }
}
