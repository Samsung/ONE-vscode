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

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {getNonce} from './GetNonce';

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
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'media/Config'),
          ],
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

  private getPathToFile(webview: vscode.Webview, fileName: string) {
    return webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/Config', fileName));
  }

  private replaceWord(html: string, re: RegExp, replaceWord: any) {
    return html.replace(re, `${replaceWord}`);
  }

  private _getHtmlForWebview(webview: vscode.Webview, context: vscode.ExtensionContext) {
    const toolsScriptUri = this.getPathToFile(webview, 'tools.js');
    const stylesResetUri = this.getPathToFile(webview, 'reset.css');
    const stylesMainUri = this.getPathToFile(webview, 'vscode.css');

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    // Get html file for webview
    const filePath: vscode.Uri =
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'Config', 'index.html'));
    let html = fs.readFileSync(filePath.fsPath, 'utf8');
    html = this.replaceWord(html, /\${webview.cspSource}/gi, webview.cspSource);
    html = this.replaceWord(html, /\${stylesResetUri}/gi, stylesResetUri);
    html = this.replaceWord(html, /\${stylesMainUri}/gi, stylesMainUri);
    html = this.replaceWord(html, /\${toolsScriptUri}/gi, toolsScriptUri);
    html = this.replaceWord(html, /\${nonce}/gi, nonce);
    return html;
  }
}
