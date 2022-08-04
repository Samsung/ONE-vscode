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

import {getNonce} from './Utils/external/Nonce';


/**
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class ChromeTraceViewerProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new ChromeTraceViewerProvider(context);
    const providerRegistration =
        vscode.window.registerCustomEditorProvider(ChromeTraceViewerProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'one.view.chromeTrace';

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Called when our custom editor is opened.
   *
   *
   */
  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    console.log('HI');
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
    	webviewPanel.webview.postMessage({
    		type: 'update',
    		text: document.getText(),
    	});
    }

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    //
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    // const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
    // 	if (e.document.uri.toString() === document.uri.toString()) {
    // 		updateWebview();
    // 	}
    // });

    // Make sure we get rid of the listener when our editor is closed.
    // webviewPanel.onDidDispose(() => {
    // 	changeDocumentSubscription.dispose();
    // });

    // Receive message from the webview.
    // 		webviewPanel.webview.onDidReceiveMessage(e => {
    // 			switch (e.type) {
    // 				case 'add':
    // //					this.addNewScratch(document);
    // 					return;

    // 				case 'delete':
    // //					this.deleteScratch(document, e.id);
    // 					return;
    // 			}
    // 		});

    //updateWebview();
  }

    private _getMediaPath(file: string) {
      return vscode.Uri.joinPath(this.context.extensionUri, 'media/Jsontracer', file);
    }

  	/**
  	 * Get the static html used for the editor webviews.
  	 */
  	private getHtmlForWebview(webview: vscode.Webview): string {
      // Use a nonce to whitelist which scripts can be run
      const nonce = getNonce();
      console.log("RUN: getHtmlForWebview");
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
      html = html.replace(/\${styleUri}/g, `${styleUri}`);
      html = html.replace(/\${scriptUri}/g, `${scriptUri}`);
      html = html.replace(/\${nonce}/g, `${nonce}`);
      html = html.replace(/\${webview.cspSource}/g, `${webview.cspSource}`);

      return html;
  	}
  }
}