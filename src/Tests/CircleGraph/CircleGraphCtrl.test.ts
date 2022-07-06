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

import {CircleGraphCtrl, CircleGraphEvent, MessageDefs} from '../../CircleGraph/CircleGraphCtrl';


suite('CircleGraphCtrl', function() {
  // NOTE this assumes vscode is invoked to run the test
  //      with opening ONE-vscode folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    throw new Error('Need workspace');
  }
  const workspaceRoot = workspaceFolders[0].uri.path;
  const extensionUri: vscode.Uri = vscode.Uri.parse(workspaceRoot);
  const modelToLoad = './res/samples/circle/test_onnx.circle';

  class TestCircleGraph extends CircleGraphCtrl implements CircleGraphEvent {
    public static readonly viewType = 'TestCircleGraph';

    private readonly _panel: vscode.WebviewPanel;

    public static create(extensionUri: vscode.Uri, modelToLoad: string) {
      // Otherwise, create a new panel.
      const panel = vscode.window.createWebviewPanel(
          TestCircleGraph.viewType, 'TestCircleGraph', vscode.ViewColumn.One);

      const circleGraph = new TestCircleGraph(panel, extensionUri);
      circleGraph.initGraphCtrl(modelToLoad, circleGraph);
      circleGraph.loadContent();
      return circleGraph;
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
      super(extensionUri, panel.webview);
      this._panel = panel;
    }

    public loadContent() {
      this._panel.webview.html = this.getHtmlForWebview(this._panel.webview);
    }

    public callHandleChangeConfiguration() {
      class TestConfigurationChangeEvent implements vscode.ConfigurationChangeEvent {
        affectsConfiguration(section: string, scope?: vscode.ConfigurationScope|undefined):
            boolean {
          return true;
        }
      }
      const event = new TestConfigurationChangeEvent();
      this.handleFinishLoad();  // make state ready
      this.handleChangeConfiguration(event);
      return true;
    }

    public callMessageAlert(text: string) {
      this.handleReceiveMessage({command: MessageDefs.alert, text: text});
      return true;
    }

    public callHandleRequest(url: string, encoding: string) {
      this.handleReceiveMessage({command: MessageDefs.request, url: url, encoding: encoding});
      return true;
    }

    public callHandlePageLoaded() {
      this.handleReceiveMessage({command: MessageDefs.pageloaded});
      return true;
    }

    public callHandleLoadModel(offset: number) {
      this.handleReceiveMessage({command: MessageDefs.loadmodel, offset: offset});
      return true;
    }

    public callHandleFinishLoad() {
      this.handleReceiveMessage({command: MessageDefs.finishload});
      return true;
    }

    public callHandleSelection() {
      const names: string[] = [];
      const tensors: string[] = [];
      this.handleFinishLoad();  // make state ready
      this.handleReceiveMessage({command: MessageDefs.selection, names: names, tensors: tensors});
      return true;
    }

    // CircleGraphEvent dummy implements
    public onPageLoaded(): void {}
    public onSelection(names: string[], tensors: string[]): void {}
    public onStartLoadModel(): void {}
    public onFinishLoadModel(): void {}
  }

  suite('#setSelection', function() {
    test('setSelection check', function() {
      const circleGraph = TestCircleGraph.create(extensionUri, modelToLoad);
      assert(circleGraph);
      const selection: string[] = [];
      circleGraph.callHandleFinishLoad();  // make state ready
      assert(circleGraph.isReady());
      circleGraph.setSelection(selection);
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#handleChangeConfiguration', function() {
    test('handleChangeConfiguration check', function() {
      const circleGraph = TestCircleGraph.create(extensionUri, modelToLoad);
      assert(circleGraph);
      const res = circleGraph.callHandleChangeConfiguration();
      assert(res);
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#handleMessageAlert', function() {
    test('handleMessageAlert check', function() {
      const circleGraph = TestCircleGraph.create(extensionUri, modelToLoad);
      assert(circleGraph);
      const res = circleGraph.callMessageAlert('AlertMessage');
      assert(res);
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#handleRequest', function() {
    test('handleRequest check', function() {
      const circleGraph = TestCircleGraph.create(extensionUri, modelToLoad);
      assert(circleGraph);
      const res = circleGraph.callHandleRequest('vscode-webview://circle-metadata.json', 'utf8');
      assert(res);
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#callHandlePageLoaded', function() {
    test('callHandlePageLoaded check', function() {
      const circleGraph = TestCircleGraph.create(extensionUri, modelToLoad);
      assert(circleGraph);
      const res = circleGraph.callHandlePageLoaded();
      assert(res);
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#handleLoadModel', function() {
    test('handleLoadModel check', function() {
      const circleGraph = TestCircleGraph.create(extensionUri, modelToLoad);
      assert(circleGraph);
      const res = circleGraph.callHandleLoadModel(0);
      assert(res);
      const res2 = circleGraph.callHandleLoadModel(16);
      assert(res2);
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#handleFinishLoad', function() {
    test('handleFinishLoad check', function() {
      const circleGraph = TestCircleGraph.create(extensionUri, modelToLoad);
      assert(circleGraph);
      const res = circleGraph.callHandleFinishLoad();
      assert(circleGraph.isReady());
      assert(res);
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#handleSelection', function() {
    test('handleSelection check', function() {
      const circleGraph = TestCircleGraph.create(extensionUri, modelToLoad);
      assert(circleGraph);
      const res = circleGraph.callHandleSelection();
      assert(circleGraph.isReady());
      assert(res);
      assert.ok(true);
    });
    // TODO add NEG: test
  });
});
