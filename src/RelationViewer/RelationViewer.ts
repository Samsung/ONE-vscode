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
import { Relation } from '../MetadataManager/Relation';
import { MetadataViewerProvider } from '../MetadataViewer/MetadataViewerProvider';
import {Balloon} from '../Utils/Balloon';
import {getNonce} from '../Utils/external/Nonce';
import {getUri} from '../Utils/external/Uri';
import {obtainWorkspaceRoot} from '../Utils/Helpers';
import {getRelationData} from './example/RelationExample';

/* istanbul ignore next */
export class RelationViewer {
  private readonly _panel: vscode.WebviewPanel;
  private _disposable: vscode.Disposable[];
  protected readonly _webview: vscode.Webview;
  protected readonly _extensionUri: vscode.Uri;

  public constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._disposable = [];
    this._webview = panel.webview;
    this._panel = panel;
    this._extensionUri = extensionUri;
  }

  public initWebview() {
    this._webview.options = this.getWebviewOptions();

    // Register for an event when you receive a message from a web view
    this.registerEventHandlers(this._panel);
  }

  private getWebviewOptions(): vscode.WebviewOptions&vscode.WebviewPanelOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,
      // to prevent view to reload after loosing focus
      retainContextWhenHidden: true
    };
  }

  public loadContent() {
    this._getHtmlForWebview(this._extensionUri, this._panel);
  }

  private async _getHtmlForWebview(extensionUri: vscode.Uri, panel: vscode.WebviewPanel) {
    panel.webview.options = {
      enableScripts: true,
    };

    const nonce = getNonce();
    const scriptUri = getUri(panel.webview, extensionUri, ['media', 'RelationViewer', 'index.js']);
    const styleUri = getUri(panel.webview, extensionUri, ['media', 'RelationViewer', 'style.css']);

    const codiconsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(
        extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));


    const htmlUri = vscode.Uri.joinPath(extensionUri, 'media', 'RelationViewer', 'index.html');
    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${panel.webview.cspSource}`);
    html = html.replace(/\${codicon.css}/g, `${codiconsUri}`);
    html = html.replace(/\${scriptUri}/g, `${scriptUri}`);
    html = html.replace(/\${styleUri}/g, `${styleUri}`);
    panel.webview.html = html;
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }

  private registerEventHandlers(panel: vscode.WebviewPanel) {
    // Handle messages from the webview
    this._webview.onDidReceiveMessage(message => {
      let payload;
      let fileUri: vscode.Uri;
      let viewType: string = 'default';
      switch (message.type) {
        case 'update':
          fileUri = vscode.Uri.file(obtainWorkspaceRoot() + '/' + message.path);
          payload = Relation.getRelationInfo(fileUri);
          if (!payload) {
            return Balloon.error('Invalid File Path, please check if file exists.', false);
          }
          panel.webview.postMessage({
            type: 'update',
            payload: payload,
            historyList: message.historyList,
            isOpenHistoryBox: message.isOpenHistoryBox
          });
          break;
        case 'history':
          fileUri = vscode.Uri.file(obtainWorkspaceRoot() + '/' + message.path);
          payload = Relation.getRelationInfo(fileUri);
          if (!payload) {
            return Balloon.error('Invalid File Path, please check if file exists.', false);
          }
          panel.webview.postMessage(
              {type: 'history', payload: payload, historyList: message.historyList});
          break;
        case 'showMetadata':
          fileUri = vscode.Uri.file(obtainWorkspaceRoot() + '/' + message.path);
          // This code opens the metadata viewer directly.
          // It is necessary if the code of the metadata viewer is added.
          vscode.commands.executeCommand('vscode.openWith', fileUri, MetadataViewerProvider.viewType);
          break;
        case 'openFile':
          if (message.path.split('.').slice(-1)[0] === 'circle') {
            viewType = `one.viewer.circle`;
          }
          fileUri = vscode.Uri.file(obtainWorkspaceRoot() + '/' + message.path);
          vscode.commands.executeCommand('vscode.openWith', fileUri, viewType);
          break;
        default:
          break;
      }
    }, null, this._disposable);
  }

  public disposeMetadataView() {
    while (this._disposable.length) {
      const x = this._disposable.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
