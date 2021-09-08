import * as vscode from 'vscode';
import {getNonce} from '../getNonce';

export class ConfigurationSettingsPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ConfigurationSettingsPanel|undefined;

  public static readonly viewType = 'one-vscode';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    if (ConfigurationSettingsPanel.currentPanel) {
      ConfigurationSettingsPanel.currentPanel._panel.reveal(column);
      ConfigurationSettingsPanel.currentPanel._update();
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
        ConfigurationSettingsPanel.viewType, 'ConfigurationSettings', column || vscode.ViewColumn.One, {
          // Enable javascript in the webview
          enableScripts: true,

          // And restrict the webview to only loading content from our
          // extension's `media` directory.
          localResourceRoots: [
            vscode.Uri.joinPath(extensionUri, 'media/configuration-settings'),
            vscode.Uri.joinPath(extensionUri, 'out/compiled'),
          ],
        });

    ConfigurationSettingsPanel.currentPanel = new ConfigurationSettingsPanel(panel, extensionUri);
  }

  public static kill() {
    ConfigurationSettingsPanel.currentPanel ?.dispose();
    ConfigurationSettingsPanel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    ConfigurationSettingsPanel.currentPanel = new ConfigurationSettingsPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed
    // programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // // Handle messages from the webview
    // this._panel.webview.onDidReceiveMessage(
    //   (message) => {
    //     switch (message.command) {
    //       case "alert":
    //         vscode.window.showErrorMessage(message.text);
    //         return;
    //     }
    //   },
    //   null,
    //   this._disposables
    // );
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

  private async _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);
    webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'onInfo': {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case 'onError': {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
          // case 'tokens': {
          //   await Util.globalState.update(accessTokenKey, data.accessToken);
          //   await Util.globalState.update(refreshTokenKey,
          //   data.refreshToken); break;
          // }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // And the uri we use to load this script in the webview
    const scriptUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'main.js'));

    // Uri to load styles into webview
    const stylesResetUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'reset.css'));
    const stylesMainUri =
        webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/configuration-settings', 'vscode.css'));
    // const cssUri = webview.asWebviewUri(
    //     vscode.Uri.joinPath(this._extensionUri, 'out',
    //     'compiled/swiper.css'));

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${
        webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesResetUri}" rel="stylesheet">
                <link href="${stylesMainUri}" rel="stylesheet">
                <script nonce="${nonce}"></script>
			</head>
      <body>
        <div class="container">
          <div class="header">
            <div class="heading">
              <h2>Configuration Settings</h2>
            </div>
            <div class="importBtn">
              <button>Import Configuration</button>
            </div>
          </div>
          <fieldset class="main">
            <div class="mainL">
              <h2>Tools</h2>
              <div class="tools">
                  <button id="import">>one-import</button>
                  <button id="optimize">>one-optimize</button>
                  <button id="quantize">>one-quantize</button>
                  <button id="pack">>one-pack</button>
                  <button id="codegen">>one-codegen</button>
                  <button id="profile">>one-profile</button>
              </div>
            </div>
            <div class="mainR">
              <h2 id="toolName">Options for</h2>
              <label class="switch">
                  <input id="useBtn"type="checkbox">
                  <span class="slider round"></span>
              </label>
              <fieldset id="options" class="options">
                  <div id="optionsName" class="optionsName">
                      nameTest
                  </div>
                  <div id="optionsValue" class="optionsValue">
                      valueTest
                  </div>
              </fieldset>
            </div>
          </fieldset>
          <div class="footer">
              <button>Run</button>
              <button>Export Configuration</button>
          </div>
        </div>
        <script src="${scriptUri}" nonce="${nonce}">
			</body>
			</html>`;
  }
}