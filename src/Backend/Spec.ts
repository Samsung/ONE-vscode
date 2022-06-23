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

import {Command} from './Command';

/**
 * Spec is a concept to describe HW, SW or some information to check matching.
 */

/**
 * DeviceSpec is a information of cetain Device to specify each Device instance.
 */
class DeviceSpec {
  // TODO: make this properties more specific or new prorperty can be added.
  hw: string;  // Currently this name comes from 'uname -m', but this could be updated
  sw: string;  // Currently this name comes from 'cat /etc/os-release' with $(NAME), but this could be updated
  bridge: BridgeSpec|undefined;

  constructor(hw: string, sw: string, bridge: BridgeSpec|undefined) {
    this.hw = hw;
    this.sw = sw;
    this.bridge = bridge;
  }

  satisfied(spec: DeviceSpec): boolean {
    // TODO Specify how to check spec satisfied.
    // This will be used on check Executor Spec could cover.
    if (spec.hw.includes(this.hw) && spec.sw.includes(this.sw)) {
      return true;
    }
    return false;
  }
  // TODO Add more Oprator to check it could cover some other spec.
}

/**
 * BridgeSpec : This Spec will be used on DeviceSpec. this will be used to access on those
 *              DeviceSpec with Device unique Key.
 */
class BridgeSpec {
  // TODO: Add Spec check command to match with given DeviceSpec
  name: string;
  deviceList: Command;
  shell: Command;
  // TODO add more command for this.
  constructor(name: string, listCommand: string, shellCommand: string) {
    this.name = name;
    this.deviceList = new Command(listCommand);
    this.shell = new Command(shellCommand);
  }
}

// TODO add more BridgeSpec like docker or ADB......
const sdbSpec = new BridgeSpec(
    'sdb', 'sdb devices | grep -v devices | grep device | awk \'{print $1}\'', 'sdb shell');

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
    new HostPCSpec('x86_64', 'Ubuntu') /* SimulatorSpec */,
    new TizenDeviceSpec('armv7l', 'Tizen') /* TizenTVSpec */);

export {DeviceSpec, BridgeSpec, supportedSpecs};
