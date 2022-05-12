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

import * as fs from 'fs';
import * as vscode from 'vscode';

import {Balloon} from '../Utils/Balloon';

class MessageDefs {
  // message command
  public static readonly alert = 'alert';
  public static readonly request = 'request';
  public static readonly response = 'response';
  public static readonly loadmodel = 'loadmodel';
  public static readonly error = 'error';
  // loadmodel type
  public static readonly modelpath = 'modelpath';
  public static readonly uint8array = 'uint8array';
};

export class CircleGraphPanel {
  public static currentPanel: CircleGraphPanel|undefined;
  public static readonly viewType = 'CircleGraphPanel';
  public static readonly folderMediaCircleGraph = 'media/CircleGraph';
  private static readonly folderMediaCircleGraphExt = 'media/CircleGraph/external';
  private static readonly folderExternal = 'external/';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _modelToLoad: string;
  private _modelLength: number;

  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, modelPath: string|undefined) {
    // if modelPath is undefined, let's show file open dialog and get the model path from the user
    if (modelPath === undefined) {
      const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Open',
        filters: {'circle files': ['circle']}
      };
      vscode.window.showOpenDialog(options).then(fileUri => {
        if (fileUri && fileUri[0]) {
          CircleGraphPanel.createOrShowContinue(extensionUri, fileUri[0].fsPath);
        }
      });
    } else {
      CircleGraphPanel.createOrShowContinue(extensionUri, modelPath);
    }
  }

  private static createOrShowContinue(extensionUri: vscode.Uri, modelToLoad: string) {
    const column =
        vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // TODO we may have show two or more graphs at the same time depending
    //      on the usage if this control.
    //      for now, let's limit to only one CircleGraphPanel

    // If we already have a panel, show it.
    if (CircleGraphPanel.currentPanel) {
      CircleGraphPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
        CircleGraphPanel.viewType,
        'CircleGraphPanel',
        column || vscode.ViewColumn.One,
        getWebviewOptions(extensionUri),
    );

    CircleGraphPanel.currentPanel = new CircleGraphPanel(panel, extensionUri, modelToLoad);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, modelToLoad: string) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._modelToLoad = modelToLoad;
    this._modelLength = 0;

    // Set the webview's initial html content
    this.update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(e => {
      if (this._panel.visible) {
        // NOTE if we call this.update(), it'll reload the model which may take time.
        // TODO call conditional this.update() when necessary.
        // this.update();
      }
    }, null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case MessageDefs.alert:
          Balloon.error(message.text);
          return;
        case MessageDefs.request:
          this.handleRequest(message.url, message.encoding);
          return;
        case MessageDefs.loadmodel:
          this.handleLoadModel(parseInt(message.offset));  // to number
          return;
      }
    }, null, this._disposables);
  }

  public dispose() {
    CircleGraphPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private update() {
    this._panel.title = 'circle graph';
    this._panel.webview.html = this.getHtmlForWebview(this._panel.webview);
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const htmlPath = this.getMediaPath('index.html');
    let html = fs.readFileSync(htmlPath.fsPath, {encoding: 'utf-8'});

    const nonce = getNonce();
    html = html.replace(/\%nonce%/gi, nonce);
    html = html.replace('%webview.cspSource%', webview.cspSource);
    // necessary files from netron to work
    html = this.updateExternalUri(html, webview, '%view-grapher.css%', 'view-grapher.css');
    html = this.updateExternalUri(html, webview, '%view-sidebar.css%', 'view-sidebar.css');
    html = this.updateExternalUri(html, webview, '%view-sidebar.js%', 'view-sidebar.js');
    html = this.updateExternalUri(html, webview, '%view-grapher.js%', 'view-grapher.js');
    html = this.updateExternalUri(html, webview, '%dagre.js%', 'dagre.js');
    html = this.updateExternalUri(html, webview, '%base.js%', 'base.js');
    html = this.updateExternalUri(html, webview, '%text.js%', 'text.js');
    html = this.updateExternalUri(html, webview, '%json.js%', 'json.js');
    html = this.updateExternalUri(html, webview, '%xml.js%', 'xml.js');
    html = this.updateExternalUri(html, webview, '%python.js%', 'python.js');
    html = this.updateExternalUri(html, webview, '%protobuf.js%', 'protobuf.js');
    html = this.updateExternalUri(html, webview, '%flatbuffers.js%', 'flatbuffers.js');
    html = this.updateExternalUri(html, webview, '%flexbuffers.js%', 'flexbuffers.js');
    html = this.updateExternalUri(html, webview, '%zip.js%', 'zip.js');
    html = this.updateExternalUri(html, webview, '%gzip.js%', 'gzip.js');
    html = this.updateExternalUri(html, webview, '%tar.js%', 'tar.js');
    // for circle format
    html = this.updateExternalUri(html, webview, '%circle.js%', 'circle.js');
    html = this.updateExternalUri(html, webview, '%circle-schema.js%', 'circle-schema.js');
    // modified for one-vscode
    html = this.updateUri(html, webview, '%index.js%', 'index.js');
    html = this.updateUri(html, webview, '%view.js%', 'view.js');

    return html;
  }

  private getMediaPath(file: string) {
    return vscode.Uri.joinPath(this._extensionUri, CircleGraphPanel.folderMediaCircleGraph, file);
  }

  private updateExternalUri(
      html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, CircleGraphPanel.folderExternal + replace);
    return html.replace(search, `${replaceUri}`);
  }

  private updateUri(html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, replace);
    return html.replace(search, `${replaceUri}`);
  }

  private getUriFromPath(webview: vscode.Webview, file: string) {
    const mediaPath = this.getMediaPath(file);
    const uriView = webview.asWebviewUri(mediaPath);
    return uriView;
  }

  /**
   * @brief handleRequest will handle 'request()' from webview for local resource
   *        through message channel
   * @param url URL of the local resource file
   * @param encoding encoding of load local resource file
   */
  private handleRequest(url: string, encoding: string) {
    // TODO check scheme
    const reqUrl = new URL(url);
    let filePath = vscode.Uri.joinPath(
        this._extensionUri, CircleGraphPanel.folderMediaCircleGraph, reqUrl.pathname);
    if (!fs.existsSync(filePath.fsPath)) {
      filePath = vscode.Uri.joinPath(
          this._extensionUri, CircleGraphPanel.folderMediaCircleGraphExt, reqUrl.pathname);
    }

    try {
      const fileData = fs.readFileSync(filePath.fsPath, {encoding: encoding, flag: 'r'});
      this._panel.webview.postMessage({command: MessageDefs.response, response: fileData});
    } catch (err) {
      this._panel.webview.postMessage({command: MessageDefs.error, response: ''});
    }
  }

  /**
   * @brief handleLoadModel will respond with 'loadmodel' message from WebView
   * @param offset offset of file WebView requested
   * @note  'offset' will start with 0 and then with offset of the model file
   */
  private handleLoadModel(offset: number) {
    // TODO make this faster
    const sendPacketSize = 1024 * 1024 * 10;  // 10MB

    if (offset === 0) {
      // TODO add request for model path with separate command
      this.sendModelPath();

      try {
        console.log('Load model...');
        const stats = fs.statSync(this._modelToLoad);
        this._modelLength = stats.size;

        if (this._modelLength <= sendPacketSize) {
          this.sendModelSingle();
        } else {
          // TODO impelment multi packet
        }
      } catch (err: unknown) {
        // TODO handle error
      }
    } else {
      // TODO impelment multi packet
    }
  }

  private sendModelPath() {
    this._panel.webview.postMessage(
        {command: MessageDefs.loadmodel, type: MessageDefs.modelpath, value: this._modelToLoad});
  }

  /**
   * @brief sendModelSingle will send model to WebView with single postMessage
   */
  private sendModelSingle() {
    const buffer = fs.readFileSync(this._modelToLoad);
    const modelData = new Uint8Array(buffer);
    this._panel.webview.postMessage({
      command: MessageDefs.loadmodel,
      type: MessageDefs.uint8array,
      offset: 0,
      length: this._modelLength,
      total: this._modelLength,
      responseArray: modelData
    });
  }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions&
    vscode.WebviewPanelOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,
    // And restrict the webview to only loading content from our extension's
    // 'media/CircleGraph' directory.
    localResourceRoots:
        [vscode.Uri.joinPath(extensionUri, CircleGraphPanel.folderMediaCircleGraph)],

    // to prevent view to reload after loosing focus
    retainContextWhenHidden: true
  };
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
