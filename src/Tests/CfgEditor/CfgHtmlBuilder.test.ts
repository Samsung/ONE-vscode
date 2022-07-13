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

    suite('#getToolkitUri()', function() {
      test('gets Toolkit uri', function() {
        const htmlBuilder = new CfgHtmlBuilder(webview, extensionUri);
        const expected = uri + 'node_modules/%40vscode/webview-ui-toolkit/dist/toolkit.js';
        assert.strictEqual(htmlBuilder.getToolkitUri().toString(), expected);
      });
    });

    suite('#getCodiconUri()', function() {
      test('gets Codicon uri', function() {
        const htmlBuilder = new CfgHtmlBuilder(webview, extensionUri);
        const expected = uri + 'node_modules/%40vscode/codicons/dist/codicon.css';
        assert.strictEqual(htmlBuilder.getCodiconUri().toString(), expected);
      });
    });

    suite('#getJsUri()', function() {
      test('gets JS uri', function() {
        const htmlBuilder = new CfgHtmlBuilder(webview, extensionUri);
        const expected = uri + 'media/CfgEditor/index.js';
        assert.strictEqual(htmlBuilder.getJsUri().toString(), expected);
      });
    });

    suite('#getCssUri()', function() {
      test('gets CSS uri', function() {
        const htmlBuilder = new CfgHtmlBuilder(webview, extensionUri);
        const expected = uri + 'media/CfgEditor/cfgeditor.css';
        assert.strictEqual(htmlBuilder.getCssUri().toString(), expected);
      });
    });

    suite('#getHtmlUri()', function() {
      test('gets HTML uri', function() {
        const htmlBuilder = new CfgHtmlBuilder(webview, extensionUri);
        const expected = uri + 'media/CfgEditor/cfgeditor.html';
        assert.strictEqual(htmlBuilder.getHtmlUri().toString(), expected);
      });
    });

    // TODO: Enable this
    // suite('#getHtml()', function() {
    //   test('gets HTML', function() {
    //   });
    // });

    // TODO: Enable this
    // suite('#build()', function() {
    //   test('', function() {
    //   });
    // });
  });
});
