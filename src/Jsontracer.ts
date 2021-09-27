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
import * as vscode from 'vscode';
import {getNonce} from './Config/GetNonce';
import {getWebviewOptions} from './Jsontracer/GetWebviewOptions';

export class Jsontracer {
  /**
   * Track the current panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: Jsontracer|undefined;

  private static readonly viewType = 'Jsontracer';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    if (Jsontracer.currentPanel) {
      Jsontracer.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
        Jsontracer.viewType,
        'Jsontracer',
        column || vscode.ViewColumn.One,
        getWebviewOptions(extensionUri),
    );

    Jsontracer.currentPanel = new Jsontracer(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    Jsontracer.currentPanel = new Jsontracer(panel, extensionUri);
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

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'alert':
          vscode.window.showErrorMessage(message.text);
          return;
      }
    }, null, this._disposables);
  }

  public doRefactor() {
    // Send a message to the webview.
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({command: 'refactor'});
  }

  public dispose() {
    Jsontracer.currentPanel = undefined;

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
    this._panel.title = 'json tracer';
    this._panel.webview.html = this._getHtmlForWebview(webview);
    return;
  }

  private _getMediaPath(file: string) {
    return vscode.Uri.joinPath(this._extensionUri, 'media/Jsontracer', file);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    // import js
    const scriptPathOnDisk = this._getMediaPath('index.js');
    const scriptUri = scriptPathOnDisk.with({scheme: 'vscode-resource'});

    // import css
    const stylePathOnDisk = this._getMediaPath('style.css');
    const styleUri = stylePathOnDisk.with({scheme: 'vscode-resource'});

    // import html
    const htmlPath = this._getMediaPath('index.html');
    let html = fs.readFileSync(htmlPath.fsPath, {encoding: 'utf-8'});

    // Apply js and cs to html
    html = html.replace(/styleUri/g, `${styleUri}`);
    html = html.replace(/scriptUri/g, `${scriptUri}`);
    html = html.replace(/nonce/g, `${nonce}`);
    html = html.replace(/webview.cspSource/g, `${webview.cspSource}`);

    return html;
  }
}
