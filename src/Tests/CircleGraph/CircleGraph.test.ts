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

import {BackendColor} from '../../CircleGraph/BackendColor';
import {CircleGraphPanel} from '../../CircleGraph/CircleGraph';


suite('CircleGraphPanel', function() {
  // NOTE this assumes vscode is invoked to run the test
  //      with opening ONE-vscode folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    throw new Error('Need workspace');
  }
  const workspaceRoot = workspaceFolders[0].uri.path;
  const extensionUri: vscode.Uri = vscode.Uri.parse(workspaceRoot);
  const modelToLoad = './res/samples/circle/test_onnx.circle';

  suite('#createOrShow', function() {
    test('createOrShow model with no error ', function() {
      // NOTE createOrShow(extensionUri, undefined) will show file open dialog
      // which test doesn't execute as expected
      const panel = CircleGraphPanel.createOrShow(extensionUri, modelToLoad);
      assert.notStrictEqual(panel, undefined);
      const panel2 = CircleGraphPanel.createOrShow(extensionUri, modelToLoad);
      assert.notStrictEqual(panel2, undefined);
      panel ?.dispose();
      panel2 ?.dispose();
      assert.ok(true);
    });
    // TODO add NEG: test
  });

  suite('#isReady', function() {
    test('isReady check', function() {
      const panel = CircleGraphPanel.createOrShow(extensionUri, modelToLoad);
      assert.notStrictEqual(panel, undefined);
      assert.strictEqual(panel?.isReady(), false);
      panel ?.dispose();
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#setMode', function() {
    test('setMode check', function() {
      const panel = CircleGraphPanel.createOrShow(extensionUri, modelToLoad);
      assert.notStrictEqual(panel, undefined);
      panel ?.setMode('viewer');
      panel ?.dispose();
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#setPartition', function() {
    test('setPartition check', function() {
      const panel = CircleGraphPanel.createOrShow(extensionUri, modelToLoad);
      assert.notStrictEqual(panel, undefined);
      panel ?.setPartition({a: 'B'});
      panel ?.dispose();
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#sendBackendColor', function() {
    test('sendBackendColor check', function() {
      const panel = CircleGraphPanel.createOrShow(extensionUri, modelToLoad);
      assert.notStrictEqual(panel, undefined);
      const bc: BackendColor[] = [];
      panel ?.sendBackendColor(bc);
      panel ?.dispose();
      assert.ok(true);
    });
    // TODO add NEG: test
  });
  suite('#reloadModel', function() {
    test('reloadModel check', function() {
      const panel = CircleGraphPanel.createOrShow(extensionUri, modelToLoad);
      assert.notStrictEqual(panel, undefined);
      panel ?.reloadModel();
      panel ?.dispose();
      assert.ok(true);
    });
    // TODO add NEG: test
  });
});
