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
import {deviceManagerList, DeviceViewNode, DeviceViewProvider, NodeType} from '../../Execute/DeviceViewProvider';


suite('DeviceViewNode', function() {
  suite('#constructor()', function() {
    suite('NodeType:deviceManager', function() {
      test('is constructed with params', function() {
        const label = 'local';
        const collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        const managerName = 'local';
        let node = new DeviceViewNode(label, collapsibleState, NodeType.deviceManager, managerName);
        assert.strictEqual(node.labal, label);
        assert.strictEqual(node.collapsibleState, collapsibleState);
        assert.strictEqual(node.nodetype, NodeType.deviceManager);
        assert.strictEqual(node.managerName, managerName);
        assert.strictEqual(node.contextValue, 'deviceManager');
        assert.deepStrictEqual(node.iconPath, new vscode.ThemeIcon('list-tree'));
      });
    });
    suite('NodeType:device', function() {
      test('is constructed with params', function() {
        const label = 'hostPC';
        const collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        const managerName = 'local';
        let node = new DeviceViewNode(label, collapsibleState, NodeType.device, managerName);
        assert.strictEqual(node.labal, label);
        assert.strictEqual(node.collapsibleState, collapsibleState);
        assert.strictEqual(node.nodetype, NodeType.device);
        assert.strictEqual(node.managerName, managerName);
        assert.strictEqual(node.contextValue, 'device');
        assert.deepStrictEqual(node.iconPath, new vscode.ThemeIcon('device-desktop'));
      });
    });
    suite('NodeType:executor', function() {
      test('is constructed with params', function() {
        const label = 'MockupSimulator';
        const collapsibleState = vscode.TreeItemCollapsibleState.None;
        const managerName = 'local';
        let node = new DeviceViewNode(label, collapsibleState, NodeType.executor, managerName);
        assert.strictEqual(node.labal, label);
        assert.strictEqual(node.collapsibleState, collapsibleState);
        assert.strictEqual(node.nodetype, NodeType.executor);
        assert.strictEqual(node.managerName, managerName);
        assert.strictEqual(node.contextValue, 'executor');
        assert.deepStrictEqual(node.iconPath, new vscode.ThemeIcon('debug-stackframe-focused'));
      });
    });
    suite('NodeType:none', function() {
      test('is constructed with params', function() {
        const label = 'None';
        const collapsibleState = vscode.TreeItemCollapsibleState.None;
        const managerName = '';
        let node = new DeviceViewNode(label, collapsibleState, NodeType.none, managerName);
        assert.strictEqual(node.labal, label);
        assert.strictEqual(node.collapsibleState, collapsibleState);
        assert.strictEqual(node.nodetype, NodeType.none);
        assert.strictEqual(node.managerName, managerName);
      });
    });
  });
});

suite('DeviceViewProvider', function() {
  suite('#constructor()', function() {
    test('is constructed with params', function() {
      let provider = new DeviceViewProvider();
      assert.instanceOf(provider, DeviceViewProvider);
    });
  });
  suite('#getTreeItem()', function() {
    test('getTreeItem', function() {
      let provider = new DeviceViewProvider();
      const label = 'local';
      const collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
      const managerName = 'local';
      let node = new DeviceViewNode(label, collapsibleState, NodeType.deviceManager, managerName);
      let treeItem = provider.getTreeItem(node);
      assert.strictEqual(treeItem.collapsibleState, collapsibleState);
    });
  });
  suite('#getChildren', function() {
    test('get Children under undfined', function() {
      let provider = new DeviceViewProvider();
      let deviceManagers = provider.getChildren();
      assert.strictEqual(deviceManagers.length, deviceManagerList.length);
      for (let index = 0; index < deviceManagers.length; index++) {
        assert.strictEqual(deviceManagers[index].labal, deviceManagerList[index]);
      }
    });
    test('get Children under deviceManager Node', function() {
      let provider = new DeviceViewProvider();
      for (const key in provider.deviceManagerMap) {
        if (Object.prototype.hasOwnProperty.call(provider.deviceManagerMap, key)) {
          const element = provider.deviceManagerMap[key];
          const label = key;
          const collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
          const managerName = key;
          let node =
              new DeviceViewNode(label, collapsibleState, NodeType.deviceManager, managerName);
          let result = provider.getChildren(node);
          assert.strictEqual(result.length, element.allDevices.length);
        }
      }
    });
    test('get Children under Device Node', function() {
      let provider = new DeviceViewProvider();
      for (const key in provider.deviceManagerMap) {
        if (Object.prototype.hasOwnProperty.call(provider.deviceManagerMap, key)) {
          const element = provider.deviceManagerMap[key];
          for (const device of element.allDevices) {
            const label = device.name;
            const collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            const managerName = key;
            let node = new DeviceViewNode(label, collapsibleState, NodeType.device, managerName);
            let result = provider.getChildren(node);
                    assert.strictEqual(result.length, element.findDevice(label)?.availableExecutors.size);
          }
        }
      }
    });
  });
});
