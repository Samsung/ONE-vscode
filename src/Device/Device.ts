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

import {execSync} from 'child_process';
import {DeviceType} from './DeviceType';

enum ConnectType {
  local,
  remote
}

interface Connection {
  type(): ConnectType;
  checkConnection(): boolean;
  execSync(cmd: string): string;
  // also need async execution on this.
}

class LocalConnect implements Connection {
  checkConnection(): boolean {
    return true;
  }
  type(): ConnectType {
    return ConnectType.local;
  }
  execSync(cmd: string): string {
    try {
      return execSync(cmd).toString();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

class RemoteConnect implements Connection {
  execSync(cmd: string): string {
    throw new Error('Method not implemented.');
  }
  checkConnection(): boolean {
    throw new Error('Method not implemented.');
  }
  type(): ConnectType {
    return ConnectType.remote;
  }
}

class Device {
  name: string;
  deviceType: DeviceType;
  connect: Connection;

  constructor(name: string, deviceType: DeviceType, connect: Connection) {
    this.name = name;
    this.deviceType = deviceType;
    this.connect = connect;
  }

  checkConnected(): boolean {
    return this.connect.checkConnection() &&
        this.deviceType.checkConnected(this.connect, this.name);
  }

  // Add Device execution functions for each.
}

export {Device, Connection, LocalConnect};
