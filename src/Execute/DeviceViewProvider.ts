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

import {globalExecutorArray} from '../Backend/API';
import {Command} from '../Backend/Command';
import {DeviceSpec, supportedSpecs} from '../Backend/Spec';
import {Balloon} from '../Utils/Balloon';
import {Logger} from '../Utils/Logger';

import {Device} from './Device';
import {DeviceManager} from './DeviceManager';

type DeviceTreeView = DeviceViewNode|undefined|void;

interface DevicesManagerMap {
  [key: string]: DeviceManager;
}

// TODO: Make this as a config.
// This variable will save host type
const deviceManagerList = ['local'];

enum NodeType {
  /**
   * A Execution system that contains multiple Devices.
   */
  deviceManager,
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
   */
  none,
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
      case NodeType.deviceManager:
        this.iconPath = new vscode.ThemeIcon('list-tree');  // select best icon for this
        this.contextValue = 'deviceManager';
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

export class DeviceViewProvider implements vscode.TreeDataProvider<DeviceViewNode> {
  deviceManagerMap: DevicesManagerMap = {};

  private _onDidChangeTreeData: vscode.EventEmitter<DeviceTreeView> =
      new vscode.EventEmitter<DeviceViewNode>();
  readonly onDidChangeTreeData: vscode.Event<DeviceTreeView> = this._onDidChangeTreeData.event;
  getTreeItem(element: DeviceViewNode): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(element?: DeviceViewNode|undefined): vscode.ProviderResult<DeviceViewNode[]> {
    return this.getNodes(element);
  }

  getNodes(element: DeviceViewNode|undefined): DeviceViewNode[] {
    const rtnList: DeviceViewNode[] = [];
    if (!element) {
      for (const managerName of deviceManagerList) {
        rtnList.push(new DeviceViewNode(
            managerName, vscode.TreeItemCollapsibleState.Expanded, NodeType.deviceManager,
            managerName));
      }
    } else if (element.type === NodeType.deviceManager) {
      const deviceList = this.deviceManagerMap[element.managerName].allDevices;
      for (const device of deviceList) {
        rtnList.push(new DeviceViewNode(
            device.name, vscode.TreeItemCollapsibleState.Collapsed, NodeType.device,
            element.managerName));
      }
    } else if (element.type === NodeType.device) {
      const device = this.deviceManagerMap[element.managerName].findDevice(element.labal);
      const executorList = device ?.availableExecutors;
      if (executorList) {
        for (const executor of executorList) {
          // Currently, No Executor name for this, so need to update Executor name first.
          rtnList.push(new DeviceViewNode(
              executor.name(), vscode.TreeItemCollapsibleState.None, NodeType.executor,
              element.managerName));
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
    return new Promise<Device[]>((resolve, reject) => {
      let result: string = '';
      let error: string = '';
      let cmdSpawn = cp.spawn(cmd.str(), {shell: false});
      cmdSpawn.stdout.on('data', (data: any) => {
        let str = data.toString();
        if (str.length > 0) {
          result = result + str;
        }
      });
      cmdSpawn.stderr.on('data', (data: any) => {
        error = result + data.toString();
        Logger.error('DeviceList', error);
      });
      cmdSpawn.on('exit', (code: any) => {
        let codestr = code.toString();
        if (codestr === '0') {
          const devices: Device[] = [];
          const deviceNames = String(result).split('\n').filter(element => element);
          for (const deviceName of deviceNames) {
            devices.push(new Device(deviceName, deviceSpec));
          }
          resolve(devices);
        } else {
          Balloon.error('Device list commnand failed!');
          reject('Device list commnand failed!');
        }
      });
      cmdSpawn.on('error', (_err: any) => {
        Balloon.error('Device list commnand failed!');
        reject('Device list commnand failed!');
      });
    });
  }

  reloadDeviceManager(deviceMan: string, callback: Function): void {
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
      this.deviceManagerMap[deviceMan] = new DeviceManager(deviceList, globalExecutorArray);
      callback(this);
    });
  }

  constructor(context: vscode.ExtensionContext, viewId: string) {
    // Before Device list get, set as a loading state.
    // Currently, only local DeviceManager supported.
    for (const deviceMan of deviceManagerList) {
      this.reloadDeviceManager(deviceMan, function(provider: DeviceViewProvider) {
        context.subscriptions.push(vscode.window.registerTreeDataProvider(viewId, provider));
      });
    }
  }

  refresh(): void {
    this.deviceManagerMap = {};
    // This for cluse should become method that get Connected Device unique name form
    // `supportedSpecs`
    for (const deviceMan of deviceManagerList) {
      this.reloadDeviceManager(deviceMan, function(provider: DeviceViewProvider) {
        provider._onDidChangeTreeData.fire();
      });
    }
  }
}
