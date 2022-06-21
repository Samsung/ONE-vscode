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

// TODO: Move to 'utils/'
function newCommand(str: string, separator: string = ' ') : Command {
  let strs = str.split(separator);
  let first = strs.shift(); // string|undefined
  return new Command(first!, strs);
}

// TODO: Separate this to BridgeSpec and DeviceSpec

// Why not `interface`?
// These below classes' usage is to compare or be compared
// To do it, some comparing methods should be implemented

// BridgeSpec class describes commands for own bridge tool like adb/sdb
class BridgeSpec {
  name: string; // adb or sdb
  deviceList: Command; // `adb devices` or `sdb devices`
  shell: Command; // `adb shell` or `sdb shell`
  // TODO: Add necessary things

  constructor(name: string, deviceList: string, shell: string) {
    this.name = name;
    this.deviceList = newCommand(deviceList);
    this.shell = newCommand(shell);
  }

  satisfied(spec: BridgeSpec): boolean {
    // NYI
    return false;
  }

  equals(spec: BridgeSpec): boolean {
    // NYI
    return false;
  }

  // TODO: Add operator <, <=, >, >=
  // TODO: Add operator and/or
};

// We have some options to implement specs
// Option 1: class extension
// class SdbSpec extends BridgeSpec {
//   constructor() {
//     super('sdb', 'sdb devices', 'sdb shell');
//   }
// }
// Option 2: Create it
// I prefer this
const sdbSpec = new BridgeSpec('sdb', 'sdb devices', 'sdb shell');

// DeviceSpec class describes demanding points
// Executor(==ExecutionCommandProvider) requires DeviceSpec to execute on a device
// Example0) Simulator: DeviceSpec(hw = 'x86_64', sw = 'ubuntu_18.04')
// Example1) DTV: DeviceSpec(hw = 'arm32', sw = 'tizen_6.0')
class DeviceSpec {
  hw: string; // TODO: This can be a class itself
  sw: string; // TODO: This can be a class itself
  bridge: BridgeSpec | undefined;

  constructor(hw: string, sw: string, bridge: BridgeSpec | undefined) {
    this.hw = hw;
    this.sw = sw;
    this.bridge = bridge;
  }

  satisfied(spec: DeviceSpec): boolean {
    // NYI
    return false;
  }

  equals(spec: DeviceSpec): boolean {
    // NYI
    return false;
  }

  // TODO: Add operator <, <=, >, >=
  // TODO: Add operator and/or
};

// Why impl these as class inheritance?
// own hw and sw properties are assigned with variables
class HostPcSpec extends DeviceSpec { // Or SimulatorSpec
  constructor(hw: string, sw: string) {
    // TODO: test validated hw spec
    // TODO: test validated sw spec
    super(hw, sw, undefined);
  }
};

// camelCase formatting makes this name ridiculous
// this is an example. the hw/sw strings can be changed
const x8664Simulator = new HostPcSpec('x86_64', 'ubuntu_18.04');

class TizenDeviceSpec extends DeviceSpec {
  constructor(hw: string, sw: string) {
    // TODO: test validated hw spec
    // TODO: test validated sw spec
    super(hw, sw, sdbSpec);
  }
}

// this is an example. the hw/sw strings can be changed
const dtv = new TizenDeviceSpec('arm32', 'tizen_6.0');

// TODO: this global var can be moved to an another place
// ONE-vscode declares a list to support some specs
const supportedSpecs = new Array<DeviceSpec>(x8664Simulator, dtv);

// TODO: Minimize
export {BridgeSpec, DeviceSpec, HostPcSpec, sdbSpec, x8664Simulator, dtv, supportedSpecs};
