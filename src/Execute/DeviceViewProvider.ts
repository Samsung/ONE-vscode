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

import {globalBackendMap} from '../Backend/API';
import {Command} from '../Backend/Command';
import {Executor} from '../Backend/Executor';
import {DeviceSpec, supportedSpecs} from '../Backend/Spec';
import {Logger} from '../Utils/Logger';

import {Device} from './Device';
import {DeviceManager} from './DeviceManager';

type DeviceTreeView = DeviceViewNode|undefined|void;

interface DevicesManagerMap {
  [key: string]: DeviceManager;
}

// TODO: Make this as a config.
// This variable will save host type
export const deviceManagerList = ['local'];

export enum NodeType {
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

export class DeviceViewNode extends vscode.TreeItem {
  type: NodeType;
  managerName: string;
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly nodetype: NodeType, public readonly manager: string) {
    super(label, collapsibleState);
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

  public static register(context: vscode.ExtensionContext): void {
    const provider = new DeviceViewProvider();

    const registrations = [
      vscode.window.registerTreeDataProvider('TargetDeviceView', provider),
      vscode.commands.registerCommand(
          'one.device.refresh',
          () => {
            provider.refresh();
          })
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  getTreeItem(element: DeviceViewNode): vscode.TreeItem {
    return element;
  }
  getChildren(element?: DeviceViewNode|undefined): DeviceViewNode[] {
    return this.getNodes(element);
  }

  private getNodes(element: DeviceViewNode|undefined): DeviceViewNode[] {
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
      const device = this.deviceManagerMap[element.managerName].findDevice(element.label);
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

  private getDevicesPromise(cmd: Command, deviceSpec: DeviceSpec): Promise<Device[]> {
    return new Promise<Device[]>((resolve) => {
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
        Logger.warn('DeviceList', error);
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
          Logger.warn('DeviceList', result);
          resolve([]);
        }
      });
      cmdSpawn.on('error', (err: any) => {
        Logger.warn(
            'DeviceList',
            'Device List Get script make some error. please check below error: ' + err);
        resolve([]);
      });
    });
  }

  loadDeviceManager(deviceMan: string, callback: Function): void {
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
      let executorList: Executor[] = [];
      const entries = Object.entries(globalBackendMap);
      for (const entry of entries) {
        const compiler = entry[1].compiler();
        if (compiler) {
          for (const toolchainType of compiler.getToolchainTypes()) {
            if (compiler.getInstalledToolchains(toolchainType).length > 0) {
              executorList.push(...entry[1].executors());
              break;
            }
          }
        }
      }
      this.deviceManagerMap[deviceMan] = new DeviceManager(deviceList, executorList);
      callback(this);
    });
  }

  constructor() {
    for (const deviceMan of deviceManagerList) {
      this.loadDeviceManager(deviceMan, function(provider: DeviceViewProvider) {
        provider._onDidChangeTreeData.fire();
      });
    }
  }

  refresh(): void {
    this.deviceManagerMap = {};
    // This for cluse should become method that get Connected Device unique name form
    // `supportedSpecs`
    for (const deviceMan of deviceManagerList) {
      this.loadDeviceManager(deviceMan, function(provider: DeviceViewProvider) {
        provider._onDidChangeTreeData.fire();
      });
    }
  }
}
