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

import * as cp from "child_process";
import * as vscode from "vscode";

import { globalBackendMap } from "../Backend/API";
import { Command } from "../Backend/Command";
import { Executor } from "../Backend/Executor";
import { DeviceSpec, supportedSpecs } from "../Backend/Spec";
import { Logger } from "../Utils/Logger";

import { Device, SimulatorDevice, TargetDevice } from "./Device";
import { DeviceManager } from "./DeviceManager";
import { DefaultToolchain } from "../Toolchain/DefaultToolchain";

type DeviceTreeView = DeviceViewNode | undefined | void;

interface DevicesManagerMap {
  [key: string]: DeviceManager;
}

// TODO: Make this as a config.
// This variable will save host type
export const deviceManagerList = ["local"];

export enum NodeType {
  /**
   * A Execution system that contains multiple Devices.
   * 1. local
   * 2. TODO remote
   */
  deviceManager,
  /**
   * A single device dedicated to certain device.
   * // TODO Remove device node type
   */
  device,
  /**
   * A Executor that run on certain device.
   * 1. the actual target connected to the bridge
   * 2. simulator on host machine
   * 3. TODO simulator on docker image
   */
  executor,
  /**
   * Node for empty item.
   */
  none,
}

export class DeviceViewNode extends vscode.TreeItem {
  type: NodeType;
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly nodetype: NodeType
  ) {
    super(label, collapsibleState);
    this.type = nodetype;
  }
}

export class DeviceManagerNode extends DeviceViewNode {
  managerName: string;
  constructor(public readonly label: string) {
    super(
      label,
      vscode.TreeItemCollapsibleState.Expanded,
      NodeType.deviceManager
    );
    this.managerName = label;
    this.iconPath = new vscode.ThemeIcon("list-tree"); // select best icon for this
    this.contextValue = "deviceManager";
  }
}

export class DeviceExecutorNode extends DeviceViewNode {
  constructor(public readonly label: string, public readonly device: Device) {
    super(label, vscode.TreeItemCollapsibleState.None, NodeType.executor);
    if (device instanceof SimulatorDevice) {
      if (DefaultToolchain.getInstance().isEqual(device.toolchain)) {
        this.iconPath = new vscode.ThemeIcon(
          "server-environment",
          new vscode.ThemeColor("debugIcon.startForeground")
        ); // select best icon for this
      } else {
        this.iconPath = new vscode.ThemeIcon(
          "server-environment",
          new vscode.ThemeColor("disabledForeground")
        ); // select best icon for this
      }
    } else if (device instanceof TargetDevice) {
      this.iconPath = new vscode.ThemeIcon("device-mobile"); // select best icon for this
    } else {
      this.iconPath = new vscode.ThemeIcon("debug-stackframe-focused"); // select best icon for this
    }
    this.contextValue = "executor";
  }
}

export class DeviceViewProvider
  implements vscode.TreeDataProvider<DeviceViewNode>
{
  deviceManagerMap: DevicesManagerMap = {};

  private _onDidChangeTreeData: vscode.EventEmitter<DeviceTreeView> =
    new vscode.EventEmitter<DeviceViewNode>();
  readonly onDidChangeTreeData: vscode.Event<DeviceTreeView> =
    this._onDidChangeTreeData.event;

  public static register(context: vscode.ExtensionContext): void {
    const provider = new DeviceViewProvider();

    const registrations = [
      vscode.window.registerTreeDataProvider("TargetDeviceView", provider),
      vscode.commands.registerCommand("one.device.refresh", () => {
        provider.refresh();
      }),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  getTreeItem(element: DeviceViewNode): vscode.TreeItem {
    return element;
  }
  getChildren(element?: DeviceViewNode | undefined): DeviceViewNode[] {
    return this.getNodes(element);
  }

  private getNodes(element: DeviceViewNode | undefined): DeviceViewNode[] {
    const rtnList: DeviceViewNode[] = [];
    if (!element) {
      for (const managerName of deviceManagerList) {
        rtnList.push(new DeviceManagerNode(managerName));
      }
    } else if (element instanceof DeviceManagerNode) {
      const deviceList = this.deviceManagerMap[element.managerName].allDevices;
      for (const device of deviceList) {
        rtnList.push(new DeviceExecutorNode(device.name, device));
      }
    }
    if (rtnList.length === 0) {
      rtnList.push(
        new DeviceViewNode(
          "No subtree available",
          vscode.TreeItemCollapsibleState.None,
          NodeType.none
        )
      );
    }
    return rtnList;
  }

  private getDevicesPromise(
    cmd: Command,
    deviceSpec: DeviceSpec
  ): Promise<Device[]> {
    return new Promise<Device[]>((resolve) => {
      let result: string = "";
      let error: string = "";
      let cmdSpawn = cp.spawn(cmd.str(), { shell: false });
      cmdSpawn.stdout.on("data", (data: any) => {
        let str = data.toString();
        if (str.length > 0) {
          result = result + str;
        }
      });
      cmdSpawn.stderr.on("data", (data: any) => {
        error = result + data.toString();
        Logger.warn("DeviceList", error);
      });
      cmdSpawn.on("exit", (code: any) => {
        let codestr = code.toString();
        if (codestr === "0") {
          const devices: Device[] = [];
          const deviceNames = String(result)
            .split("\n")
            .filter((element) => element);
          for (const deviceName of deviceNames) {
            devices.push(new Device(deviceName, deviceSpec));
          }
          resolve(devices);
        } else {
          Logger.warn("DeviceList", result);
          resolve([]);
        }
      });
      cmdSpawn.on("error", (err: any) => {
        Logger.warn(
          "DeviceList",
          "Device List Get script make some error. please check below error: " +
            err
        );
        resolve([]);
      });
    });
  }

  loadDeviceManager(deviceMan: string, callback: Function): void {
    const deviceList: Device[] = [];
    // load executor environment
    // 1. the actual target connected to the bridge
    // 2. simulator on host machine
    // 3. TODO simulator on docker image
    for (const deviceSpec of supportedSpecs) {
      if (deviceSpec.bridge) {
        const deviceGetCmd = deviceSpec.bridge.deviceListCmd;
        const listCmds: Promise<Device[]>[] = [];
        listCmds.push(this.getDevicesPromise(deviceGetCmd, deviceSpec));
        Promise.all(listCmds).then((results) => {
          for (const result of results) {
            deviceList.push(...result);
          }
        });
      } else {
        Object.entries(globalBackendMap).forEach(([_, backend]) => {
          if (backend.executor()) {
            const compiler = backend.compiler();
            if (compiler) {
              compiler
                .getToolchainTypes()
                .map((type) => compiler.getInstalledToolchains(type))
                .forEach((toolchains) => {
                  for (const toolchain of toolchains) {
                    deviceList.push(
                      new SimulatorDevice(
                        toolchain.info.name,
                        deviceSpec,
                        toolchain
                      )
                    );
                  }
                });
            }
          }
        });
      }
    }

    // TODO Remove executorList
    let executorList: Executor[] = [];
    this.deviceManagerMap[deviceMan] = new DeviceManager(
      deviceList,
      executorList
    );
    callback(this);
  }

  constructor() {
    // load VSCode environment
    // 1. local
    // 2. TODO remote
    for (const deviceMan of deviceManagerList) {
      this.loadDeviceManager(
        deviceMan,
        function (provider: DeviceViewProvider) {
          provider._onDidChangeTreeData.fire();
        }
      );
    }
  }

  refresh(): void {
    this.deviceManagerMap = {};
    // This for cluse should become method that get Connected Device unique name form
    // `supportedSpecs`
    for (const deviceMan of deviceManagerList) {
      this.loadDeviceManager(
        deviceMan,
        function (provider: DeviceViewProvider) {
          provider._onDidChangeTreeData.fire();
        }
      );
    }
  }
}
