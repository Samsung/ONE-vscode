import * as fs from 'fs';
import * as path from 'path'
import * as vscode from 'vscode';

import {getNonce} from '../getNonce';

import {exportConfig} from './Dialog/ExportConfigDialog';
import {importConfig} from './Dialog/ImportConfigDialog';
import {getInputPath} from './Dialog/InputFileDialog';

export class ConfigurationSettingsPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ConfigurationSettingsPanel|undefined;

  public static readonly viewType = 'one-vscode';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    if (ConfigurationSettingsPanel.currentPanel) {
      ConfigurationSettingsPanel.currentPanel._panel.reveal(column);
      ConfigurationSettingsPanel.currentPanel._update(context);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
        ConfigurationSettingsPanel.viewType, 'ConfigurationSettings',
        column || vscode.ViewColumn.One, {
          // Enable javascript in the webview
          enableScripts: true,

          // And restrict the webview to only loading content from our
          // extension"s `media` directory.
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'media/configuration-settings'),
            vscode.Uri.joinPath(context.extensionUri, 'out/compiled'),
          ],
        });

    ConfigurationSettingsPanel.currentPanel = new ConfigurationSettingsPanel(panel, context);
  }

  public static kill() {
    ConfigurationSettingsPanel.currentPanel ?.dispose();
    ConfigurationSettingsPanel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    ConfigurationSettingsPanel.currentPanel = new ConfigurationSettingsPanel(panel, context);
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
    ConfigurationSettingsPanel.currentPanel = undefined;

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
    const toolsScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'tools.js'));

    const DOMScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'DOM.js'));

    const indexScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'index.js'));

    const pathAutoCommpleteScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
        this._extensionUri, 'media/configuration-settings', 'pathAutoComplete.js'));

    const sendToPanelScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'sendToPanel.js'));

    const configValidationScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'configValidation.js'));

    const importConfigScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'importConfig.js'));

    const exportConfigScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'exportConfig.js'));

    const receiveFromPanelScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
        this._extensionUri, 'media/configuration-settings', 'receiveFromPanel.js'));

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'reset.css'));
    const stylesMainUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'vscode.css'));

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    // Get html file for webview
    const filePath: vscode.Uri = vscode.Uri.file(
        path.join(context.extensionPath, 'media', 'configuration-settings', 'Config.html'));
    let html = fs.readFileSync(filePath.fsPath, 'utf8')
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
    return html
  }
}
