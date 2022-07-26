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

import {assert} from 'chai';
import * as vscode from 'vscode';

import {CfgHtmlBuilder} from '../../CfgEditor/CfgHtmlBuilder';

class MockWebView implements vscode.Webview {
  options: vscode.WebviewOptions;
  html: string;
  cspSource: string;
  onDidReceiveMessage: vscode.Event<any>;

  constructor() {
    this.options = {};
    this.html = '';
    this.cspSource = '';
    this.onDidReceiveMessage = function(
                                   listener: (e: any) => any, thisArgs?: any,
                                   disposables?: vscode.Disposable[]|undefined): vscode.Disposable {
      // MOCK EVENT: DO NOTHING
      return new vscode.Disposable(() => {});
    };
  }

  postMessage(message: any): Thenable<boolean> {
    throw new Error('Method not implemented.');
  }
  asWebviewUri(localResource: vscode.Uri): vscode.Uri {
    return localResource;
  }
};

// NOTE: There is the limitation of resolving the actual file path
suite('CfgEditor', function() {
  suite('CfgHtmlBuilder', function() {
    const uri: string = 'file:///';
    const webview: vscode.Webview = new MockWebView();
    const extensionUri: vscode.Uri = vscode.Uri.parse(uri);

    suite('#constructor()', function() {
      test('is constructed with params', function() {
        const htmlBuilder = new CfgHtmlBuilder(webview, extensionUri);
        assert.instanceOf(htmlBuilder, CfgHtmlBuilder);
        assert.strictEqual(htmlBuilder.webview, webview);
        assert.strictEqual(htmlBuilder.extensionUri, extensionUri);
      });
    });

    suite('#build()', function() {
      test('NEG: getHTML cannot find HTML Uri', async function() {
        const htmlBuilder = new CfgHtmlBuilder(webview, extensionUri);
        try {
          await htmlBuilder.build();
        } catch (err: any) {
          assert.strictEqual(err.name, 'EntryNotFound (FileSystemError)');
        }
      });
    });
  });
});
