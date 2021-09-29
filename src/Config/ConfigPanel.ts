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

import {exportConfig} from './Dialog/ExportConfigDialog';
import {importConfig} from './Dialog/ImportConfigDialog';
import {getInputPath} from './Dialog/InputFileDialog';
import {getNonce} from './GetNonce';

export class ConfigPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
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
        ConfigPanel.viewType, 'ConfigurationSettings',
        column || vscode.ViewColumn.One, {
          // Enable javascript in the webview
          enableScripts: true,

          // And restrict the webview to only loading content from our
          // extension"s `media` directory.
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'media/Config'),
            vscode.Uri.joinPath(context.extensionUri, 'out/compiled'),
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

    // Set the webview"s initial html content
    this._update(context);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case 'inputPath':
          getInputPath(this._panel.webview, data.payload);
          break;
        case 'exportConfig':
          exportConfig(data.payload);
          break;
        case 'importConfig':
          const newWebview = this._panel.webview;
          newWebview.html = this._getHtmlForWebview(newWebview, context);
          importConfig(newWebview);
          break;
        case 'alert':
          vscode.window.showErrorMessage(data.payload);
          break;
      }
    });
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
    // And the uri we use to load this script in the webview
    const toolsScriptUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'tools.js'));

    const DOMScriptUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'DOM.js'));

    const indexScriptUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'index.js'));

    const pathAutoCommpleteScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'pathAutoComplete.js'));

    const sendToPanelScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'sendToPanel.js'));

    const configValidationScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'configValidation.js'));

    const importConfigScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'importConfig.js'));

    const exportConfigScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'exportConfig.js'));

    const receiveFromPanelScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'receiveFromPanel.js'));

    // Uri to load styles into webview
    const stylesResetUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'reset.css'));
    const stylesMainUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/Config', 'vscode.css'));

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    // Get html file for webview
    const filePath: vscode.Uri =
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'Config', 'Config.html'));
    let html = fs.readFileSync(filePath.fsPath, 'utf8');
    let re = /\${stylesResetUri}/gi;
    html = html.replace(re, `${stylesResetUri}`);
    re = /\${webview.cspSource}/gi;
    html = html.replace(re, `${webview.cspSource}`);
    re = /\${stylesMainUri}/gi;
    html = html.replace(re, `${stylesMainUri}`);
    re = /\${nonce}/gi;
    html = html.replace(re, `${nonce}`);
    re = /\${indexScriptUri}/gi;
    html = html.replace(re, `${indexScriptUri}`);
    re = /\${toolsScriptUri}/gi;
    html = html.replace(re, `${toolsScriptUri}`);
    re = /\${pathAutoCompleteScriptUri}/gi;
    html = html.replace(re, `${pathAutoCommpleteScriptUri}`);
    re = /\${importConfigScriptUri}/gi;
    html = html.replace(re, `${importConfigScriptUri}`);
    re = /\${exportConfigScriptUri}/gi;
    html = html.replace(re, `${exportConfigScriptUri}`);
    re = /\${sendToPanelScriptUri}/gi;
    html = html.replace(re, `${sendToPanelScriptUri}`);
    re = /\${configValidationScriptUri}/gi;
    html = html.replace(re, `${configValidationScriptUri}`);
    re = /\${DOMScriptUri}/gi;
    html = html.replace(re, `${DOMScriptUri}`);
    re = /\${receiveFromPanelScriptUri}/gi;
    html = html.replace(re, `${receiveFromPanelScriptUri}`);
    return html;
  }
}
