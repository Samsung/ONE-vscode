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
import {executeManagerQuickInput} from './executeManagerQuickInput';
import {globalManagerMap} from './ExecutionEnvManager';



enum NodeType {
  // This will be either local or remote
  // TODO: Implement remote type.
  hostType,
  executionEnv,
}

export class DeviceNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly type: NodeType,
  ) {
    super(label, collapsibleState);
    if (type === NodeType.hostType) {
      this.iconPath = new vscode.ThemeIcon('device-desktop');
    } else if (type === NodeType.executionEnv) {
      this.iconPath = new vscode.ThemeIcon('circuit-board');
    }
    this.contextValue = NodeType[type];
  }
}

export class DeviceProvider implements vscode.TreeDataProvider<DeviceNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<DeviceNode|undefined|void> =
      new vscode.EventEmitter<DeviceNode|undefined|void>();
  readonly onDidChangeTreeData?: vscode.Event<DeviceNode|undefined|void> =
      this._onDidChangeTreeData.event;

  constructor() {}

  getTreeItem(element: DeviceNode): vscode.TreeItem {
    return element;
  }
  getChildren(element?: DeviceNode): Thenable<DeviceNode[]> {
    return Promise.resolve(this.getNode(element));
  }

  private getNode(node: DeviceNode|undefined): DeviceNode[] {
    if (node === undefined) {
      return Object.keys(globalManagerMap)
          .map(
              (host) => new DeviceNode(
                  host, vscode.TreeItemCollapsibleState.Expanded, NodeType.hostType));
    } else {
      if (node.type === NodeType.hostType) {
        const nodeList: DeviceNode[] = [];
        for (const iterator of globalManagerMap[node.label].executionEnvs.entries()) {
          nodeList.push(new DeviceNode(
              iterator[0], vscode.TreeItemCollapsibleState.None, NodeType.executionEnv));
        }
        return nodeList;
      }
    }
    return [];
  }

  refreshEnv(node: DeviceNode) {
    if (node.type === NodeType.hostType) {
      globalManagerMap[node.label].refreshExecutionEnv();
      this._onDidChangeTreeData.fire();
    }
  }

  connectEnv() {
    executeManagerQuickInput().then(() => {
      this._onDidChangeTreeData.fire();
    });
  }
}
