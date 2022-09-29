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
const assert = require('assert');
import {Backend} from './Backend';
import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {Logger} from '../Utils/Logger';
import {Executor} from './Executor';
import {OneToolchain} from './One/OneToolchain';

/**
 * Interface of backend map
 * - Use Object class to use the only string key
 */
interface BackendMap {
  [key: string]: Backend;
}

// List of backend extensions registered
let globalBackendMap: BackendMap = {};
// List of Executor extensions registered
let globalExecutorArray: Executor[] = [];

function backendRegistrationApi() {
  const logTag = 'backendRegistrationApi';
  let registrationAPI = {
    registerBackend(backend: Backend) {
      const backendName = backend.name();
      assert(backendName.length > 0);
      globalBackendMap[backendName] = backend;
      const compiler = backend.compiler();
      if (compiler) {
        gToolchainEnvMap[backend.name()] = new ToolchainEnv(compiler);
      }
      const executor = backend.executor();
      if (executor) {
        globalExecutorArray.push(executor);
      }
      Logger.info(logTag, 'Backend', backendName, 'was registered into ONE-vscode.');
      // NOTE: This might not 100% guaratee the activating extension has been done.
      //   - link: https://github.com/Samsung/ONE-vscode/pull/1101#issuecomment-1195099002
      // TODO: Consider better way to refresh toolchainView after backend's registration.
      vscode.commands.executeCommand('one.toolchain.refresh');
      vscode.commands.executeCommand('one.device.refresh');
    },
    registerExecutor(executor: Executor) {
      globalExecutorArray.push(executor);
      Logger.info(logTag, 'Executor', executor.name(), 'was registered into ONE-vscode.');
    }
  };

  registrationAPI.registerBackend(new OneToolchain());

  return registrationAPI;
}

export {globalBackendMap, globalExecutorArray, backendRegistrationApi};
