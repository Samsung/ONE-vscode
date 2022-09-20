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
import {DefaultToolchain} from '../../Toolchain/DefaultToolchain';
import {gToolchainEnvMap, ToolchainEnv} from '../../Toolchain/ToolchainEnv';
import {BackendNode, BaseNode, NodeBuilder, ToolchainNode, ToolchainProvider} from '../../Toolchain/ToolchainProvider';
import {MockCompiler, MockCompilerWithMultipleInstalledToolchains, MockCompilerWithNoInstalledToolchain} from '../MockCompiler';

suite('Toolchain', function() {
  const oneBackendName = 'ONE';
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
        assert.strictEqual(bnodes.length, 2);
        assert.strictEqual(bnodes[0].label, oneBackendName);
        assert.strictEqual(bnodes[1].label, backendName);
      });
    });
    suite('#createToolchainNodes()', function() {
      test('creates ToolchainNode list', function() {
        let bnodes: BackendNode[] = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 2);
        assert.strictEqual(bnodes[0].label, oneBackendName);
        assert.strictEqual(bnodes[1].label, backendName);

        // Ignore bnodes[0] because it is ONE Toolchain backend.
        let bnode2: BackendNode = bnodes[1];
        let tnodes2 = NodeBuilder.createToolchainNodes(bnode2);
        assert.strictEqual(tnodes2.length, 1);
        tnodes2.forEach((tnode) => {
          assert.strictEqual(tnode.backendName, backendName);
        });
      });
    });
    suite('#createToolchainNodes()', function() {
      test('NEG: creates ToolchainNode list using invalid backend node', function() {
        const bnodes: BackendNode[] = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 2);
        assert.strictEqual(bnodes[0].label, oneBackendName);
        assert.strictEqual(bnodes[1].label, backendName);
        const tnodes1 = NodeBuilder.createToolchainNodes(bnodes[1]);
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
          assert.strictEqual(bnodes.length, 2);
          assert.strictEqual(bnodes[0].label, oneBackendName);
          assert.strictEqual(bnodes[1].label, backendName);
          done();
        });
      });
      test('gets Children with BackendNode', function(done) {
        let provider = new ToolchainProvider();
        let bnodes: BackendNode[] = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 2);
        assert.strictEqual(bnodes[0].label, oneBackendName);
        assert.strictEqual(bnodes[1].label, backendName);
        // Ignore bnodes[0] because it is ONE Toolchain backend.
        let bnode: BackendNode = bnodes[1];
        provider.getChildren(bnode).then((tnodes) => {
          assert.strictEqual(tnodes.length, 1);
          tnodes.forEach((tnode) => {
            assert.instanceOf(tnode, ToolchainNode);
          });
          done();
        });
      });
    });

    suite('#_install', function() {
      test('requests _install', function() {
        const provider = new ToolchainProvider();
        const types = toolchainEnv.getToolchainTypes();
        const toolchains = toolchainEnv.listAvailable(types[0], 0, 1);
        assert.isAbove(toolchains.length, 0);
        provider._install(toolchainEnv, toolchains[0]);
        assert.isTrue(true);
      });
      test('requests _install with no installed toolchain', function() {
        const provider = new ToolchainProvider();
        const tcompiler = new MockCompilerWithNoInstalledToolchain();
        const invalidToolchainEnv = new ToolchainEnv(tcompiler);
        const types = invalidToolchainEnv.getToolchainTypes();
        const toolchains = invalidToolchainEnv.listAvailable(types[0], 0, 1);
        assert.isAbove(toolchains.length, 0);
        provider._install(invalidToolchainEnv, toolchains[0]);
        assert.isTrue(true);
      });
      test('NEG: requests _install with multiple installed toolchains', function() {
        const provider = new ToolchainProvider();
        const tcompiler = new MockCompilerWithMultipleInstalledToolchains();
        const invalidToolchainEnv = new ToolchainEnv(tcompiler);
        const types = invalidToolchainEnv.getToolchainTypes();
        const toolchains = invalidToolchainEnv.listAvailable(types[0], 0, 1);
        assert.isAbove(toolchains.length, 0);
        const ret = provider._install(invalidToolchainEnv, toolchains[0]);
        assert.isFalse(ret);
      });
    });

    suite('#uninstall', function() {
      test('requests uninstall', function() {
        const provider = new ToolchainProvider();
        const bnodes = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 2);
        assert.strictEqual(bnodes[0].label, oneBackendName);
        assert.strictEqual(bnodes[1].label, backendName);
        // Ignore bnodes[0] because it is ONE Toolchain backend.
        const tnodes = NodeBuilder.createToolchainNodes(bnodes[1]);
        assert.isAbove(tnodes.length, 0);
        provider.uninstall(tnodes[0]);
        assert.isTrue(true);
      });
      test('NEG: requests uninstall with invalid toolchain node', function() {
        const provider = new ToolchainProvider();
        const invalidToolchainNode = 'invalid toolchain node';
        const invalidBackendName = 'abcde';
        const toolchains = toolchainEnv.listInstalled();
        assert.isAbove(toolchains.length, 0);
        const tnode = new ToolchainNode(invalidToolchainNode, invalidBackendName, toolchains[0]);
        assert.strictEqual(tnode.label, invalidToolchainNode);
        assert.strictEqual(tnode.backendName, invalidBackendName);
        assert.strictEqual(tnode.toolchain, toolchains[0]);
        const ret = provider.uninstall(tnode);
        assert.isFalse(ret);
      });
    });

    suite('#run', function() {
      test('requests run', function() {
        const provider = new ToolchainProvider();
        const modelCfg = 'model.cfg';
        const toolchains = toolchainEnv.listInstalled();
        assert.isAbove(toolchains.length, 0);
        DefaultToolchain.getInstance().set(toolchainEnv, toolchains[0]);
        provider._run(modelCfg);
        assert.isTrue(true);
      });
      test('NEG: requests run with uninitialized default toolchain', function() {
        const provider = new ToolchainProvider();
        const modelCfg = 'model.cfg';
        DefaultToolchain.getInstance().unset();
        const ret = provider._run(modelCfg);
        assert.isFalse(ret);
      });
    });

    suite('#setDefaultToolchain', function() {
      test('request setDefaultToolchain', function() {
        const provider = new ToolchainProvider();
        const bnodes = NodeBuilder.createBackendNodes();
        assert.strictEqual(bnodes.length, 2);
        assert.strictEqual(bnodes[0].label, oneBackendName);
        assert.strictEqual(bnodes[1].label, backendName);
        // Ignore bnodes[0] because it is ONE Toolchain backend.
        const tnodes = NodeBuilder.createToolchainNodes(bnodes[1]);
        assert.isAbove(tnodes.length, 0);
        provider.setDefaultToolchain(tnodes[0]);
        assert.isTrue(DefaultToolchain.getInstance().isEqual(tnodes[0].toolchain));
      });
      test('NEG: requests setDefaultToolchain with invalid node', function() {
        const provider = new ToolchainProvider();
        const invalidToolchainNode = 'invalid toolchain node';
        const invalidBackendName = 'abcde';
        const toolchains = toolchainEnv.listInstalled();
        assert.isAbove(toolchains.length, 0);
        const tnode = new ToolchainNode(invalidToolchainNode, invalidBackendName, toolchains[0]);
        assert.strictEqual(tnode.label, invalidToolchainNode);
        assert.strictEqual(tnode.backendName, invalidBackendName);
        assert.strictEqual(tnode.toolchain, toolchains[0]);
        const ret = provider.setDefaultToolchain(tnode);
        assert.isFalse(ret);
      });
    });
  });
});
