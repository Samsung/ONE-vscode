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

import {PackageInfo, ToolchainInfo} from '../../Backend/Toolchain';
import {DebianToolchain} from '../../Backend/ToolchainImpl/DebianToolchain';
import {Version} from '../../Backend/Version';
import {gToolchainEnvMap, ToolchainEnv} from '../../Toolchain/ToolchainEnv';
import {BackendNode, BaseNode, NodeBuilder, ToolchainNode, ToolchainProvider} from '../../Toolchain/ToolchainProvider';
import {MockCompiler} from '../MockCompiler';

suite('Toolchain', function() {
  const compiler = new MockCompiler();
  const toolchainEnv = new ToolchainEnv(compiler);
  const backendName = 'dummy_backend';

  setup(function() {
    gToolchainEnvMap[backendName] = toolchainEnv;
  });

  teardown(function() {
    if (gToolchainEnvMap[backendName] !== undefined) {
      delete gToolchainEnvMap[backendName];
    }
  });

  suite('BaseNode', function() {
    suite('#constructor()', function() {
      test('is constructed with params using base_node', function() {
        const label = 'base_node';
        const collapsibleState = vscode.TreeItemCollapsibleState.None;
        let node = new BaseNode(label, collapsibleState);
        assert.strictEqual(node.label, label);
        assert.strictEqual(node.collapsibleState, collapsibleState);
      });
    });
  });

  suite('BackendNode', function() {
    suite('#constructor()', function() {
      test('is constructed with params using backend_node', function() {
        const label = 'backend_node';
        const collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        let node = new BackendNode(label);
        assert.strictEqual(node.label, label);
        assert.strictEqual(node.collapsibleState, collapsibleState);
      });
    });
  });

  suite('ToolchainNode', function() {
    suite('#constructor()', function() {
      test('is constructed with params using toolchian_node', function() {
        const label = 'backend_node';
        const toolchain =
            new DebianToolchain(new ToolchainInfo('npm', 'package manager for Node.js'));
        const collapsibleState = vscode.TreeItemCollapsibleState.None;
        let node = new ToolchainNode(label, backendName, toolchain);
        assert.strictEqual(node.label, label);
        assert.strictEqual(node.collapsibleState, collapsibleState);
        assert.strictEqual(node.backendName, backendName);
      });
    });

    suite('#constructor()', function() {
      test('is constructed with params using toolchian_node with dependencies', function() {
        const label = 'backend_node';
        const dependencyInfo = new PackageInfo('nodejs', new Version(8, 10, 0, '~dfsg-2'));
        const toolchain = new DebianToolchain(new ToolchainInfo(
            'npm', 'package manager for Node.js', new Version(3, 5, 2, '-0ubuntu4'),
            [dependencyInfo]));
        const collapsibleState = vscode.TreeItemCollapsibleState.None;
        let node = new ToolchainNode(label, backendName, toolchain);
        assert.strictEqual(node.label, label);
        assert.strictEqual(node.collapsibleState, collapsibleState);
        assert.strictEqual(node.backendName, backendName);
      });
    });
  });

  suite('NodeBuilder', function() {
    suite('#createBackendNodes()', function() {
      test('creates BackendNode list', function() {
        let bnodes: BackendNode[] = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 1);
        assert.strictEqual(bnodes[0].label, backendName);
      });
    });
    suite('#createToolchainNodes()', function() {
      test('creates ToolchainNode list', function() {
        let bnodes: BackendNode[] = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 1);
        assert.strictEqual(bnodes[0].label, backendName);
        let bnode: BackendNode = bnodes[0];
        let tnodes = NodeBuilder.createToolchainNodes(bnode);
        assert.strictEqual(tnodes.length, 1);
        tnodes.forEach((tnode) => {
          assert.strictEqual(tnode.backendName, backendName);
        });
      });
    });
    suite('#createToolchainNodes()', function() {
      test('NEG: creates ToolchainNode list using invalid backend node', function() {
        const bnodes: BackendNode[] = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 1);
        assert.strictEqual(bnodes[0].label, backendName);
        const tnodes1 = NodeBuilder.createToolchainNodes(bnodes[0]);
        assert.strictEqual(tnodes1.length, 1);
        tnodes1.forEach((tnode) => {
          assert.strictEqual(tnode.backendName, backendName);
        });
        let tnodes2 = NodeBuilder.createToolchainNodes(tnodes1[0]);
        assert.strictEqual(tnodes2.length, 0);
      });
    });
    suite('#createToolchainNodes()', function() {
      test('NEG: creates ToolchainNode list using invalid backend', function() {
        const invalidBackendName = 'abcde';
        const bnode = new BackendNode(invalidBackendName);
        const tnodes = NodeBuilder.createToolchainNodes(bnode);
        assert.strictEqual(tnodes.length, 0);
      });
    });
  });

  suite('ToolchainProvider', function() {
    suite('#constructor()', function() {
      test('is constructed', function() {
        let provider = new ToolchainProvider();
        assert.instanceOf(provider, ToolchainProvider);
      });
    });

    suite('#getTreeItem()', function() {
      test('gets TreeItem with BackendNode', function() {
        const label = 'backend_node';
        const collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        let node = new BackendNode(label);
        let provider = new ToolchainProvider();
        let treeItem = provider.getTreeItem(node);
        assert.strictEqual(treeItem.collapsibleState, collapsibleState);
      });
      test('gets TreeItem with ToolchainNode', function() {
        const label = 'backend_node';
        const backend = 'dummy_backend';
        const toolchain =
            new DebianToolchain(new ToolchainInfo('npm', 'package manager for Node.js'));
        const collapsibleState = vscode.TreeItemCollapsibleState.None;
        let node = new ToolchainNode(label, backend, toolchain);
        let provider = new ToolchainProvider();
        let treeItem = provider.getTreeItem(node);
        assert.strictEqual(treeItem.collapsibleState, collapsibleState);
      });
    });

    suite('#getChildren', function() {
      test('gets Children with undefined', function(done) {
        let provider = new ToolchainProvider();
        provider.getChildren(undefined).then((bnodes) => {
          assert.strictEqual(bnodes.length, 1);
          assert.strictEqual(bnodes[0].label, backendName);
          done();
        });
      });
      test('gets Children with BackendNode', function(done) {
        let provider = new ToolchainProvider();
        let bnodes: BackendNode[] = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 1);
        assert.strictEqual(bnodes[0].label, backendName);
        let bnode: BackendNode = bnodes[0];
        provider.getChildren(bnode).then((tnodes) => {
          assert.strictEqual(tnodes.length, 1);
          tnodes.forEach((tnode) => {
            assert.instanceOf(tnode, ToolchainNode);
          });
          done();
        });
      });
    });

    // TODO: install(), uninstall() and run()
    // suite('#install', function() {
    //   test('')
    // });

    suite('#uninstall', function() {
      const provider = new ToolchainProvider();
      let bnodes: BackendNode[];
      let tnodes: ToolchainNode[];

      setup(function() {
        bnodes = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 1);
        assert.strictEqual(bnodes[0].label, backendName);
        tnodes = NodeBuilder.createToolchainNodes(bnodes[0]);
        assert.isAbove(tnodes.length, 0);
      });
      test('requests uninstall', function() {
        provider.uninstall(tnodes[0]);
      });
      test('NEG: requests uninstall with undefined node', function() {

      });
    });

    // suite('#run', function() {
    //   test('')
    // });
  });
});
