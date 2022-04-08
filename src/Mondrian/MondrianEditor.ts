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

export class MondrianEditorProvider implements vscode.CustomTextEditorProvider {

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new MondrianEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(MondrianEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'onevscode.mondrianViewer';

  constructor(
    private readonly context: vscode.ExtensionContext
  ) {}

  /**
   * Called when custom editor is opened.
   */
  public async resolveCustomTextEditor(
      document: vscode.TextDocument,
      webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken
    ): Promise<void>
  {
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
  }
  
  /**
  * Get the static html used for the editor webviews.
  */
  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'mondrianViewer.js'));
    
	  return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<title>Mondrian Viewer</title>
			</head>
			<body>
        <h1>Mondrian Viewer</h1>
        <script src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
