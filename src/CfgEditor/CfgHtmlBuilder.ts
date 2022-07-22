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
import {getNonce} from '../Utils/external/Nonce';
import {getUri} from '../Utils/external/Uri';


export class CfgHtmlBuilder {
  webview: vscode.Webview;
  extensionUri: vscode.Uri;

  constructor(webview: vscode.Webview, extensionUri: vscode.Uri) {
    this.webview = webview;
    this.extensionUri = extensionUri;
  }

  async build(): Promise<string> {
    const nonce = getNonce();
    const toolkitUri = getUri(this.webview, this.extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ]);

    const codiconUri = getUri(this.webview, this.extensionUri, [
      'node_modules',
      '@vscode',
      'codicons',
      'dist',
      'codicon.css',
    ]);

    const jsUri = getUri(this.webview, this.extensionUri, ['media', 'CfgEditor', 'index.js']);
    const cssUri = getUri(this.webview, this.extensionUri, ['media', 'CfgEditor', 'cfgeditor.css']);
    const htmlUri = vscode.Uri.joinPath(this.extensionUri, 'media/CfgEditor/cfgeditor.html');

    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();

    // TODO: extract this to replaceHtml() function
    // Apply js and cs to html
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${this.webview.cspSource}`);
    html = html.replace(/\${toolkitUri}/g, `${toolkitUri}`);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    html = html.replace(/\${jsUri}/g, `${jsUri}`);
    html = html.replace(/\${cssUri}/g, `${cssUri}`);

    return html;
  };
}
