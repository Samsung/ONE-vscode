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

const assert = require('assert');
import {Backend} from './API';
import {DeviceType} from '../Device/DeviceType';
import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {Logger} from '../Utils/Logger';

/**
 * Interface of backend map
 * - Use Object class to use the only string key
 */
interface BackendMap {
  [key: string]: Backend;
}

interface DeviceTypeMap {
  [key: string]: DeviceType;
}

// List of backend extensions registered
let globalBackendMap: BackendMap = {};
let globalDeviceTypeMap: DeviceTypeMap = {};

function backendRegistrationApi() {
  let registrationAPI = {
    registerBackend(backend: Backend) {
      const backendName = backend.name();
      assert(backendName.length > 0);
      globalBackendMap[backendName] = backend;
      const compiler = backend.compiler();
      if (compiler) {
        gToolchainEnvMap[backend.name()] = new ToolchainEnv(new Logger(), compiler);
      }
      console.log(`Backend ${backendName} was registered into ONE-vscode.`);
    },
    registerDeviceType(deviceType: DeviceType) {
      const deviceTypeName = deviceType.name();
      assert(deviceTypeName.length > 0);
      globalDeviceTypeMap[deviceTypeName] = deviceType;
    }
  };

  return registrationAPI;
}

export {globalBackendMap, globalDeviceTypeMap, backendRegistrationApi};
