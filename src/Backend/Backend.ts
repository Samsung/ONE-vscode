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
import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {Logger} from '../Utils/Logger';
import {ExecutionEnv, ToolchainExecutorEnv} from '../Execute/ExecutionEnv';

/**
 * Interface of backend map
 * - Use Object class to use the only string key
 */
interface BackendMap {
  [key: string]: Backend;
}

interface ExecutionEnvMap {
  [key: string]: ExecutionEnv;
}

// List of backend extensions registered
let globalBackendMap: BackendMap = {};

// As Execution Env will Contains components below
// 1. ExecutionEnv with Backend Executor
// 2. ExecutionEnv with specific HW and specific SW
let globalExecutionEnvMap: ExecutionEnvMap = {};

function backendRegistrationApi() {
  let registrationAPI = {
    registerBackend(backend: Backend) {
      const backendName = backend.name();
      assert(backendName.length > 0);
      globalBackendMap[backendName] = backend;
      const compiler = backend.compiler();
      if (compiler) {
        gToolchainEnvMap[backend.name()] = new ToolchainEnv(compiler);
      }
      // This will register case 1, ExecutionEnv with Backend Executor
      // Executor will handled as a Simulator.
      const executor = backend.executor();
      if (executor) {
        globalExecutionEnvMap[backend.name()] = new ToolchainExecutorEnv(backend.name(), executor);
      }
      console.log(`Backend ${backendName} was registered into ONE-vscode.`);
    },
    // This will register case 2, ExecutionEnv with specific HW and specific SW(Device)
    registerExecutionEnv(execEnv: ExecutionEnv) {
      const execEnvName = execEnv.name();
      assert(execEnvName.length > 0);
      globalExecutionEnvMap[execEnvName] = execEnv;
    }
  };

  return registrationAPI;
}

export {globalBackendMap, globalExecutionEnvMap, backendRegistrationApi};
