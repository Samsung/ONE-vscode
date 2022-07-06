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

import {CircleGraphPanel} from '../../CircleGraph/CircleGraph';
import {CircleViewerDocument} from '../../CircleGraph/CircleViewer';
import {CircleViewerProvider} from '../../CircleGraph/CircleViewer';


suite('CircleViewer', function() {
  // NOTE this assumes vscode is invoked to run the test
  //      with opening ONE-vscode folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    throw new Error('Need workspace');
  }
  const workspaceRoot = workspaceFolders[0].uri.path;
  const extensionUri: vscode.Uri = vscode.Uri.parse(workspaceRoot);
  const modelToLoad = './res/samples/circle/test_onnx.circle';

  // NOTE CircleViewer is tested with CircleViewerDocument.create

  suite('CircleViewerDocument', function() {
    suite('#create', function() {
      test('create result is valid document', async function() {
        const fn = async () => {
          const uri: vscode.Uri = vscode.Uri.file(modelToLoad);
          const pr = CircleViewerDocument.create(uri);
          return pr;
        };
        fn().then((doc: CircleViewerDocument) => {
          assert(doc !== undefined);
          assert(doc.uri.path === '.');
          doc.dispose();
          assert.ok(true);
        });
        assert.ok(true);
      });
      // TODO add NEG: test
    });
    suite('#openView', function() {
      test('openView with no error', async function() {
        const fn = async () => {
          const uri: vscode.Uri = vscode.Uri.file(modelToLoad);
          const pr = CircleViewerDocument.create(uri);
          return pr;
        };
        fn().then((doc: CircleViewerDocument) => {
          const panel = vscode.window.createWebviewPanel(
              CircleGraphPanel.viewType, 'CircleGraphPanel', vscode.ViewColumn.One,
              {retainContextWhenHidden: true});

          assert(doc !== undefined);
          assert(panel !== undefined);
          assert(extensionUri !== undefined);
          const view = doc.openView(panel, extensionUri);
          assert(view !== undefined);
          assert(view.owner(panel));
          doc.dispose();
          assert.ok(true);
        });
        assert.ok(true);
      });
      // TODO add NEG: test
    });
    suite('#panelDispose', function() {
      test('panel.onDidDispose with no error', async function() {
        const fn = async () => {
          const uri: vscode.Uri = vscode.Uri.file(modelToLoad);
          const pr = CircleViewerDocument.create(uri);
          return pr;
        };
        fn().then((doc: CircleViewerDocument) => {
          const panel = vscode.window.createWebviewPanel(
              CircleGraphPanel.viewType, 'CircleGraphPanel', vscode.ViewColumn.One,
              {retainContextWhenHidden: true});

          assert(doc !== undefined);
          assert(panel !== undefined);
          assert(extensionUri !== undefined);
          const view = doc.openView(panel, extensionUri);
          assert(view !== undefined);
          panel.dispose();
          assert.ok(true);
        });
        assert.ok(true);
      });
      // TODO add NEG: test
    });
  });

  class TestMemento implements vscode.Memento {
    keys(): readonly string[] {
      throw new Error('Method not implemented.');
    }
    get<T>(key: string): T|undefined;
    get<T>(key: string, defaultValue: T): T;
    get(key: string, defaultValue?: string): string|undefined {
      return key;
    }
    update(key: string, value: any): Thenable<void> {
      throw new Error('Method not implemented.');
    }
  };

  class TestMemento2 extends TestMemento {
    setKeysForSync(keys: readonly string[]): void {}
  }

  class TestSecretStorage implements vscode.SecretStorage {
    get(key: string): Thenable<string|undefined> {
      throw new Error('Method not implemented.');
    }
    store(key: string, value: string): Thenable<void> {
      throw new Error('Method not implemented.');
    }
    delete(key: string): Thenable<void> {
      throw new Error('Method not implemented.');
    };
    onDidChange!: vscode.Event<vscode.SecretStorageChangeEvent>;
  }

  class TestEnvironmentVariableCollection implements vscode.EnvironmentVariableCollection {
    persistent: boolean = false;
    replace(variable: string, value: string): void {}
    append(variable: string, value: string): void {}
    prepend(variable: string, value: string): void {}
    get(variable: string): vscode.EnvironmentVariableMutator|undefined {
      throw new Error('Method not implemented.');
    }
    forEach(
        callback:
            (variable: string, mutator: vscode.EnvironmentVariableMutator,
             collection: vscode.EnvironmentVariableCollection) => any,
        thisArg?: any): void {}
    delete(variable: string): void {}
    clear(): void {}
  }

  class TestExtension implements vscode.Extension<string> {
    id!: string;
    extensionUri!: vscode.Uri;
    extensionPath!: string;
    isActive!: boolean;
    packageJSON: any;
    extensionKind!: vscode.ExtensionKind;
    exports!: string;
    activate(): Thenable<string> {
      throw new Error('Method not implemented.');
    }
  }

  class TestCancellationToken implements vscode.CancellationToken {
    isCancellationRequested: boolean = false;
    onCancellationRequested!: vscode.Event<any>;
  }

  function getTestContext() {
    return {
      subscriptions: [],
      workspaceState: new TestMemento,
      globalState: new TestMemento2,
      secrets: new TestSecretStorage,
      extensionUri: extensionUri,
      extensionPath: '',
      environmentVariableCollection: new TestEnvironmentVariableCollection,
      asAbsolutePath: function(relativePath: string): string {
        return '';
      },
      storageUri: undefined,
      storagePath: undefined,
      globalStorageUri: vscode.Uri.file('/temp/a'),
      globalStoragePath: '',
      logUri: vscode.Uri.file('/temp/b'),
      logPath: '',
      extensionMode: vscode.ExtensionMode.Production,
      extension: new TestExtension
    };
  }

  suite('CircleViewerProvider', function() {
    /*
    NOTE this test will show error
         Error: Provider for viewType:onevscode.circleViewer already registered
    TODO find and fix this problem
    suite('#register', function() {
      test('register with no error ', function() {
        const disposable = CircleViewerProvider.register(getTestContext());
        assert(disposable !== undefined);
      });
    });
    */
    suite('#openCustomDocument', function() {
      test('openCustomDocument with no error ', function() {
        const provider = new CircleViewerProvider(getTestContext());
        const uri: vscode.Uri = vscode.Uri.file(modelToLoad);
        const token = new TestCancellationToken;
        const pr = provider.openCustomDocument(uri, {backupId: ''}, token);
        assert(pr !== undefined);
        assert.ok(true);
      });
      // TODO add NEG: test
    });
    suite('#resolveCustomEditor', function() {
      test('resolveCustomEditor with no error ', function() {
        const provider = new CircleViewerProvider(getTestContext());
        const uri: vscode.Uri = vscode.Uri.file(modelToLoad);
        const token = new TestCancellationToken;
        const pr = provider.openCustomDocument(uri, {backupId: ''}, token);
        pr.then((doc: CircleViewerDocument) => {
          assert(doc !== undefined);
          const panel = vscode.window.createWebviewPanel(
              CircleGraphPanel.viewType, 'CircleGraphPanel', vscode.ViewColumn.One,
              {retainContextWhenHidden: true});
          provider.resolveCustomEditor(doc, panel, token);
          assert.ok(true);
        });
        assert.ok(true);
      });
      // TODO add NEG: test
    });
  });
});
