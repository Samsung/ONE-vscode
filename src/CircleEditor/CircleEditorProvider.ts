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

import {disposeAll} from '../Utils/external/Dispose';
import {getNonce} from '../Utils/external/Nonce';
import {getUri} from '../Utils/external/Uri';

import {CircleEditorDocument} from './CircleEditorDocument';

/**
 * Custom Editor Provider necessary for vscode extension API
 */
export class CircleEditorProvider implements vscode.CustomEditorProvider<CircleEditorDocument> {
  public static readonly viewType = 'one.editor.circle';
  private readonly folderMediaCircleEditor = 'media/CircleEditor';

  constructor(private readonly _context: vscode.ExtensionContext) {}

  private readonly _onDidChangeCustomDocument =
      new vscode.EventEmitter<vscode.CustomDocumentEditEvent<CircleEditorDocument>>();
  public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  private readonly webviews = new WebviewCollection();

  public static register(context: vscode.ExtensionContext): void {
    const provider = new CircleEditorProvider(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(CircleEditorProvider.viewType, provider, {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: true,
      }),
      // TODO: Add command registrations
    ];
    registrations.forEach((disposable) => context.subscriptions.push(disposable));
  }

  async openCustomDocument(
      uri: vscode.Uri, _openContext: {backupId?: string},
      _token: vscode.CancellationToken): Promise<CircleEditorDocument> {
    const document: CircleEditorDocument = await CircleEditorDocument.create(uri);

    const listeners: vscode.Disposable[] = [];

    listeners.push(document.onDidChangeDocument((e) => {
      // Tell VS Code that the document has been edited by the use.
      this._onDidChangeCustomDocument.fire({
        document,
        ...e,
      });
    }));

    listeners.push(document.onDidChangeContent((e) => {
      // Update all webviews when the document changes
      for (const webviewPanel of this.webviews.get(document.uri)) {
        this.postMessage(webviewPanel, e);
      }
    }));

    document.onDidDispose(() => disposeAll(listeners));
    return document;
  }

  public async resolveCustomEditor(
      document: CircleEditorDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    this.webviews.add(document.uri, webviewPanel);

    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel.webview);

    webviewPanel.webview.onDidReceiveMessage((e) => this.onMessage(document, e));
  }

  public saveCustomDocument(document: CircleEditorDocument, cancellation: vscode.CancellationToken):
      Thenable<void> {
    return document.save(cancellation);
  }
  public saveCustomDocumentAs(
      document: CircleEditorDocument, destination: vscode.Uri,
      cancellation: vscode.CancellationToken): Thenable<void> {
    return document.saveAs(destination, cancellation);
  }
  public revertCustomDocument(document: CircleEditorDocument, cancellation: vscode.CancellationToken):
      Thenable<void> {
    return document.revert(cancellation);
  }
  public backupCustomDocument(
      document: CircleEditorDocument, context: vscode.CustomDocumentBackupContext,
      cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
    return document.backup(context.destination, cancellation);
  }

  private postMessage(panel: vscode.WebviewPanel, body: any): void {
    panel.webview.postMessage(body);
  }

  private onMessage(document: CircleEditorDocument, message: any) {
    switch (message.command) {
      case 'alert':
        Balloon.error(message.text, false);
        break;
      case 'request':
        this.handleRequest(document, message.url, message.encoding);
        break;
      case 'loadmodel':
        document.sendModel(parseInt(message.offset));
        break;
      case 'edit':
        document.makeEdit(message);
        break;
      case 'loadJson':
        document.loadJson();
        break;
      case 'updateJson':
        document.editJsonModel(message.data);
        break;
      case 'getCustomOpAttrT':
        document.setCustomOpAttrT(message);
        break;
      case 'requestEncodingData':
        document.sendEncodingData(message);
        break;
      default:
        break;
    }
  }

  protected handleRequest(document: CircleEditorDocument, url: string, encoding: string) {
    // TODO check scheme
    const reqUrl = new URL(url);
    let filePath = vscode.Uri.joinPath(
        this._context.extensionUri, this.folderMediaCircleEditor, reqUrl.pathname);
    if (!fs.existsSync(filePath.fsPath)) {
      filePath = vscode.Uri.joinPath(
          this._context.extensionUri, `${this.folderMediaCircleEditor}/external`, reqUrl.pathname);
    }

    try {
      const fileData = fs.readFileSync(filePath.fsPath, {encoding: encoding, flag: 'r'});
      document._onDidChangeContent.fire({command: 'response', response: fileData});
    } catch (err) {
      document._onDidChangeContent.fire({command: 'error', response: ''});
    }
  }

  private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    const codiconUri = getUri(
        webview, this._context.extensionUri,
        ['node_modules', '@vscode', 'codicons', 'dist', 'codicon.css']);

    const nonce = getNonce();

    const htmlUri = vscode.Uri.joinPath(this._context.extensionUri, 'media', 'CircleEditor', 'index.html');
    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/%nonce%/gi, nonce);
    html = html.replace('%webview.cspSource%', webview.cspSource);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    // necessary files from netron to work
    html = this.updateUri(html, webview, '%view-grapher.css%', 'view-grapher.css');
    html = this.updateUri(html, webview, '%view-sidebar.css%', 'view-sidebar.css');
    html = this.updateUri(html, webview, '%view-json-editor.css%', 'view-json-editor.css');
    html = this.updateUri(html, webview, '%type.js%', 'type.js');
    html = this.updateExternalUri(html, webview, '%view-sidebar.js%', 'view-sidebar.js');
    html = this.updateExternalUri(html, webview, '%view-grapher.js%', 'view-grapher.js');
    html = this.updateUri(html, webview, '%view-json-editor.js%', 'view-json-editor.js');
    html = this.updateExternalUri(html, webview, '%index.js%', 'index.js');
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
    html = this.updateExternalUri(html, webview, '%view.js%', 'view.js');
    // for circle format
    html = this.updateExternalUri(html, webview, '%circle.js%', 'circle.js');
    html = this.updateExternalUri(html, webview, '%circle-schema.js%', 'circle-schema.js');
    // modified for one-vscode
    html = this.updateUri(html, webview, '%modified.index.js%', 'index.js');
    html = this.updateUri(html, webview, '%modified.view.js%', 'view.js');
    html = this.updateUri(html, webview, '%modified.view-sidebar.js%', 'view-sidebar.js');

    return html;
  }

  private updateExternalUri(
      html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = getUri(webview, this._context.extensionUri, ['media', 'external', 'netron', replace]);
    return html.replace(search, `${replaceUri}`);
  }

  private updateUri(html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = getUri(webview, this._context.extensionUri, ['media', 'CircleEditor', replace]);
    return html.replace(search, `${replaceUri}`);
  }
}

/**
 * class for retaining webviews opened
 */
class WebviewCollection {
  private readonly _webviews =
      new Set<{readonly resource: string; readonly webviewPanel: vscode.WebviewPanel;}>();

  /**
   * Get all known webviews for a given uri.
   */
  public * get(uri: vscode.Uri): Iterable<vscode.WebviewPanel> {
    const key = uri.toString();

    for (const entry of this._webviews) {
      if (entry.resource === key) {
        yield entry.webviewPanel;
      }
    }
  }

  /**
   * Add a new webview to the collection.
   */
  public add(uri: vscode.Uri, webviewPanel: vscode.WebviewPanel) {
    const entry = {resource: uri.toString(), webviewPanel};
    this._webviews.add(entry);

    webviewPanel.onDidDispose(() => {
      this._webviews.delete(entry);
    });
  }
}
