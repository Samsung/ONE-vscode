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

// What to expose on this.
interface DeviceType {
  name: string;
  getConnectableList(registerType: RegisterType): string[];
  runInference(
      deviceName: string, registerType: RegisterType, model_path: string, input_path: string,
      output_path: string): void;
  runProfile(
      deviceName: string, registerType: RegisterType, model_path: string, input_path: string,
      output_path: string): void;
}

interface DeviceTypeMap {
  [key: string]: DeviceType;
}

let globalDeviceTypeMap: DeviceTypeMap = {};

enum RegisterT {
  local,
  remote
}

interface RegisterType {
  type: RegisterT;
  runCommand(command: string, sync: boolean): string[];
  checkConnect(passwd: string): boolean;
}

class LocalRegister implements RegisterType {
  type = RegisterT.local;

  runCommand(command: string, sync: boolean): string[] {
    // Need to use 'sudo' on this?
    throw new Error('Method not implemented.');
  }
  checkConnect(passwd: string): boolean {
    return true;
  }
}

class RemoteRegister implements RegisterType {
  // Need to define this?
  type = RegisterT.remote;
  ip = '';
  id = '';
  port = '';
  keyFilePath = '';

  setIp(ip: string): void {
    this.ip = ip;
  }

  setId(id: string): void {
    this.id = id;
  }

  setport(port: string): void {
    this.port = port;
  }

  runCommand(command: string, sync: boolean): string[] {
    // Need to use 'sudo' on this?
    // sync execute or async execute
    throw new Error('Method not implemented.');
  }
  checkConnect(passwd: string): boolean {
    // check ssh connection and create keyFile and update keyFilePath.
    throw new Error('Method not implemented.');
  }
}

class Device {
  name: string;
  type: DeviceType;
  connectType: RegisterType;
  constructor(name: string, type: DeviceType, connectType: RegisterType) {
    this.name = name;
    this.type = type;
    this.connectType = connectType;
  }
  /*
  How to run command on certain device?
  Device will be specified with 3 components on above.
  DeviceType will user-define type that will explain how to run infer, profile and show connectable
  Device list.
  */
}

let globalDevice: Device[];
let defaultDevice: number;

function getDefaultDevice(): Device {
  if (defaultDevice < 0 || globalDevice.length <= defaultDevice) {
    throw Error('invalid Default Device setting');
  }
  return globalDevice[defaultDevice];
}

function setDefaultDevice(index: number) {
  defaultDevice = index;
}

export {
  DeviceType,
  globalDeviceTypeMap,
  RegisterType,
  LocalRegister,
  RemoteRegister,
  Device,
  globalDevice,
  getDefaultDevice,
  setDefaultDevice
};