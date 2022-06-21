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

import {RealDeviceInstance} from './RealDeviceInstance';
import {Executor} from '../Backend/Executor';

interface DeviceToExecutorMap {
  [key: string]: Executor;
}

// What is ExecutionManager?
// This class acts as a role between ui classes and ExecutionEnv so
// manages and use RealDeviceInstance
class ExecutionManager {
  allDevices: RealDeviceInstance[];
  availableDevices: RealDeviceInstance[];
  deviceToExecutor: DeviceToExecutorMap;

  constructor(devices: RealDeviceInstance[], executors: Executor[]) {
    this.allDevices = devices;
    this.availableDevices = new Array<RealDeviceInstance>();
    this.deviceToExecutor = {};

    this.allDevices.forEach(device => {
      executors.forEach(executor => {
        const execSpec = executor.require();
        if (execSpec.satisfied(device.spec)) {
          // TODO: Enable this
          // A device can run with each multiple Executor(ExecutionCommandProvider)'s commands
          // but NYI now. So here avoid this
          if (this.availableDevices.find(ad => ad === device)) {
            return;
          }

          this.availableDevices.push(device);
          // TODO: Verify deviceToExecutor whether it overrites or not
          this.deviceToExecutor[device.name] = executor;
        }
      });
    });
  }

  add(device: RealDeviceInstance): void {
    // NYI
  }

  remove(device: RealDeviceInstance): void {
    // NYI
  }

  runInference(device: RealDeviceInstance, modelPath: string, options?: string[]): boolean {
    let found = this.availableDevices.find(ad => ad === device);
    if (found === undefined) {
      return false;
    }

    // actually pass params to ExecutionEnv and ExecutionEnv creates job and run it
    // but, this is a POC so explains here
    const exec = this.deviceToExecutor[found.name];
    const cmd = exec.runInference(modelPath, options);
    let cmdStr = cmd.str();
    if (found.spec.bridge !== undefined) {
      cmdStr += found.spec.bridge.shell.str();
    }
    // Anyway, cmdStr is made like above.

    return false;
  }

  // TODO: In the future, runValuetest, runProfile should be enabled
};

export {ExecutionManager};
