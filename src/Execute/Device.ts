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

import {Executor} from '../Backend/Executor';
import {DeviceSpec} from '../Backend/Spec';

/**
 * `Device` class
 * a class to handle and access Device.
 * Each Device has single `DeviceSpec`, which could be same with other device.
 * Each Device has a name to specify with other device with same `DeviceSpec`.
 *
 * for example, Device A, B, C connected on, and A and B are TizenTV and C is HostPC.
 * then we could access this as below
 *
 * const deviceA = new Device("A", TizenDeviceSpec);
 * const deviceB = new Device("B", TizenDeviceSpec);
 * const deviceC = new Device("C", HostPCSpec);
 */
class Device {
  name: string;
  spec: DeviceSpec;
  availableExecutors: Set<Executor>;
  constructor(name: string, spec: DeviceSpec) {
    if (name === '') {
      throw Error('empty name device cannot be created.');
    }
    this.name = name;
    this.spec = spec;
    this.availableExecutors = new Set<Executor>();
  }

  // Register only available executor.
  registerExecutor(executorList: Executor[]): void {
    for (const executor of executorList) {
      if (executor.require().satisfied(this.spec)) {
        this.availableExecutors.add(executor);
      }
    }
  }
}

export {Device};
