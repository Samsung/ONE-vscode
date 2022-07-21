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

import {Command} from './Command';

const extensionId = 'Samsung.one-vscode';
const ext = vscode.extensions.getExtension(extensionId) as vscode.Extension<any>;
/**
 * Spec is a bundle of information that could be used for checking whether something to require is
 * satisfied with a certain objective.
 */

// TODO: Split DeviceSpec and BridgeSpec.

/**
 * DeviceSpec is a Spec to specify a device.
 * Each instance for each device should have a matching DeviceSpec.
 */
class DeviceSpec {
  // TODO: make this properties more specific or new prorperty can be added.
  // Currently `hw` comes from 'uname -m', but this could be updated
  hw: string;
  // Currently `sw` comes from 'cat /etc/os-release' with $(NAME), but this could be updated
  sw: string;
  bridge: BridgeSpec|undefined;  // this will be used to access on this spec.

  constructor(hw: string, sw: string, bridge: BridgeSpec|undefined) {
    this.hw = hw;
    this.sw = sw;
    this.bridge = bridge;
  }

  // This will be used on check Executor Spec could cover.
  satisfied(spec: DeviceSpec): boolean {
    // TODO Specify how to check spec satisfied.
    if (spec.hw.includes(this.hw) && spec.sw.includes(this.sw)) {
      return true;
    }
    return false;
  }
  // TODO Add more Oprator to check it could cover some other spec.
}

/**
 * BridgeSpec is a Spec that is used for access on a device.
 */
class BridgeSpec {
  name: string;
  // This will return Command to get TargetDevice List.
  deviceListCmd: Command;
  // This will return Command to run on TargetDevice.
  shellCmd: Command;
  // TODO add more command for this.
  constructor(name: string, listCommand: string, shellCommand: string) {
    this.name = name;
    this.deviceListCmd = new Command(listCommand);
    this.shellCmd = new Command(shellCommand);
  }
}

// TODO add more BridgeSpec like docker or ADB......
const sdbSpec = new BridgeSpec('sdb', vscode.Uri.joinPath(ext?.extensionUri, 'res', 'script', 'sdbSpecList.sh').fsPath, 'sdb shell');

class HostPCSpec extends DeviceSpec {
  constructor(hw: string, sw: string) {
    super(hw, sw, undefined);
  }
}

class TizenDeviceSpec extends DeviceSpec {
  constructor(hw: string, sw: string) {
    super(hw, sw, sdbSpec);
  }
}

const supportedSpecs = new Array<DeviceSpec>(
    new HostPCSpec('x86_64', 'Ubuntu 18') /* spec where simulator can run */,
    new TizenDeviceSpec('armv7l', 'Tizen 7.0.0') /* spec for Tizen TV */);

export {DeviceSpec, BridgeSpec, HostPCSpec, TizenDeviceSpec, sdbSpec, supportedSpecs};
