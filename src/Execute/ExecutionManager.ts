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
import {globalExecutorArray} from '../Backend/Backend';
import {Executor} from '../Backend/Executor';
import {Device} from './Device';

interface DeviceExecutorSet {
  [key: string]: Set<Executor>;
}

class ExecutionManager {
  allDevices: Device[];
  availableDevices: DeviceExecutorSet;

  constructor(devices: Device[]) {
    this.allDevices = devices;
    this.availableDevices = {};
    for (let device of this.allDevices) {
      this.availableDevices[device.name] = new Set<Executor>();
      this.checkAvailDevices(device);
    }
  }

  findDevice(name: string): Device|undefined {
    for (const device of this.allDevices) {
      if (device.name === name) {
        return device;
      }
    }
    return undefined;
  }

  checkAvailDevices(device: Device): void {
    for (let executor of globalExecutorArray) {
      if (executor.require().satisfied(device.spec)) {
        this.availableDevices[device.name].add(executor);
      }
    }
  }
}

// This ExecutionManagerMap will be used on Provider.
interface ExecutionManagerMap {
  [key: string]: ExecutionManager;
}

export {ExecutionManager, ExecutionManagerMap};
