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

import * as cp from 'child_process';
import * as vscode from 'vscode';

import {globalExecutorArray} from '../Backend/Backend';
import {Command} from '../Backend/Command';
import {DeviceSpec, supportedSpecs} from '../Backend/Spec';

import {Device} from './Device';
import {ExecutionManager} from './ExecutionManager';

type DeviceTreeView = DeviceViewNode|undefined|void;

// This ExecutionManagerMap will be used on Provider.
interface ExecutionManagerMap {
  [key: string]: ExecutionManager;
}

class DeviceViewNode extends vscode.TreeItem {
  type: NodeType;
  managerName: string;
  constructor(
      public readonly labal: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly nodetype: NodeType, public readonly manager: string) {
    super(labal, collapsibleState);
    this.type = nodetype;
    this.managerName = manager;
    switch (this.type) {
      case NodeType.executionManager:
        this.iconPath = new vscode.ThemeIcon('list-tree');  // select best icon for this
        this.contextValue = 'executionManager';
        break;
      case NodeType.device:
        this.iconPath = new vscode.ThemeIcon('device-desktop');  // select best icon for this
        this.contextValue = 'device';
        break;
      case NodeType.executor:
        this.iconPath =
            new vscode.ThemeIcon('debug-stackframe-focused');  // select best icon for this
        this.contextValue = 'executor';
        break;
      default:
        break;
    }
  }
}

// This will be updated from config if remote case updeted.
// If other connection created.
const executionManagerList = ['local'];

enum NodeType {
  /**
   * A Execution system that contains multiple Devices.
   */
  executionManager,
  /**
   * A single device dedicated to certain device.
   */
  device,
  /**
   * A Executor that run on certain device.
   */
  executor,
  /**
   * Node for empty item.
   * No icon for this.
   */
  none,
}

export class DeviceViewProvider implements vscode.TreeDataProvider<DeviceViewNode> {
  executionManagerMap: ExecutionManagerMap = {};
  private _onDidChangeTreeData: vscode.EventEmitter<DeviceTreeView> =
      new vscode.EventEmitter<DeviceViewNode>();
  readonly onDidChangeTreeData: vscode.Event<DeviceTreeView> = this._onDidChangeTreeData.event;
  getTreeItem(_element: DeviceViewNode): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return _element;
  }
  getChildren(_element?: DeviceViewNode|undefined): vscode.ProviderResult<DeviceViewNode[]> {
    return this.getNodes(_element);
  }

  getNodes(_element: DeviceViewNode|undefined): DeviceViewNode[] {
    const rtnList: DeviceViewNode[] = [];
    if (!_element) {
      for (const managerName of executionManagerList) {
        rtnList.push(new DeviceViewNode(
            managerName, vscode.TreeItemCollapsibleState.Expanded, NodeType.executionManager,
            managerName));
      }
    } else if (_element.type === NodeType.executionManager) {
      const deviceList = this.executionManagerMap[_element.managerName].allDevices;
      for (const device of deviceList) {
        rtnList.push(new DeviceViewNode(
            device.name, vscode.TreeItemCollapsibleState.Collapsed, NodeType.device,
            _element.managerName));
      }
    } else if (_element.type === NodeType.device) {
      const device = this.executionManagerMap[_element.managerName].findDevice(_element.labal);
      const executorList = device ?.availableExecutors;
      if (executorList) {
        for (const executor of executorList) {
          // Currently, No Executor name for this, so need to update Executor name first.
          rtnList.push(new DeviceViewNode(
              executor.name(), vscode.TreeItemCollapsibleState.None, NodeType.executor,
              _element.managerName));
        }
      }
    }
    if (rtnList.length === 0) {
      rtnList.push(new DeviceViewNode(
          'No subtree available', vscode.TreeItemCollapsibleState.None, NodeType.none, ''));
    }
    return rtnList;
  }

  getDevicesPromise(cmd: Command, deviceSpec: DeviceSpec): Promise<Device[]> {
    return new Promise<Device[]>((resolve, _reject) => {
      cp.exec(cmd.str(), (err, stdout, _stderr) => {
        if (err) {
          return;
        }
        const devices: Device[] = [];
        const deviceNames = String(stdout).split('\n').filter(element => element);
        for (const deviceName of deviceNames) {
          devices.push(new Device(deviceName, deviceSpec));
        }
        resolve(devices);
      });
    });
  }

  reloadExecutionManager(executionMan: string, callback: Function): void {
    const listCmds: Promise<Device[]>[] = [];
    const deviceList: Device[] = [];
    for (const deviceSpec of supportedSpecs) {
      if (deviceSpec.bridge) {
        const deviceGetCmd = deviceSpec.bridge.deviceListCmd;
        listCmds.push(this.getDevicesPromise(deviceGetCmd, deviceSpec));
      } else {
        deviceList.push(new Device('HostPC', deviceSpec));
      }
    }
    Promise.all(listCmds).then((results) => {
      for (const result of results) {
        deviceList.push(...result);
      }
      this.executionManagerMap[executionMan] =
          new ExecutionManager(deviceList, globalExecutorArray);
      callback(this);
    });
  }

  constructor(context: vscode.ExtensionContext, viewId: string) {
    // Before Device list get, set as a loading state.
    // Currently, only local ExecutionManager supported.
    for (const executionMan of executionManagerList) {
      this.reloadExecutionManager(executionMan, function(provider: DeviceViewProvider) {
        context.subscriptions.push(vscode.window.registerTreeDataProvider(viewId, provider));
      });
    }
  }

  refresh(baseNode?: DeviceViewNode): void {
    // in case, update executionManagerMap with selected baseNode
    if (!baseNode) {
      // in this case, refresh all manager case.
      this.executionManagerMap = {};
      // This for cluse should become method that get Connected Device unique name form
      // `supportedSpecs`
      for (const executionMan of executionManagerList) {
        this.reloadExecutionManager(executionMan, function(provider: DeviceViewProvider) {
          provider._onDidChangeTreeData.fire(baseNode);
        });
      }
    } else if (baseNode.type === NodeType.executionManager) {
      this.reloadExecutionManager(baseNode.labal, function(provider: DeviceViewProvider) {
        provider._onDidChangeTreeData.fire(baseNode);
      });
    } else if (baseNode.type === NodeType.device) {
      // In this Case, it will update Executors.
      const device = this.executionManagerMap[baseNode.managerName].findDevice(baseNode.labal);
      if (device) {
        // clear Device Executor.
        device.availableExecutors.clear();
        device.registerExecutor(globalExecutorArray);
      }
      this._onDidChangeTreeData.fire(baseNode);
    }
  }
}
