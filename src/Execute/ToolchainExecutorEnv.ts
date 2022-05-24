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

import {arch} from 'os';
import {Command} from '../Backend/Command';
import {Executor} from '../Backend/Executor';
import {gToolchainEnvMap} from '../Toolchain/ToolchainEnv';
import {ExecutionEnvBase} from './ExecutionEnv';

class ToolchainExecutorEnv extends ExecutionEnvBase {
  envName: string;  // Specified name for Each Env
  executor: Executor;
  constructor(backendName: string, exec: Executor) {
    super();
    this.envName = backendName;
    this.executor = exec;
  }

  // This function will return a name of SWExcutorEnv based on backend name.
  name(): string {
    return this.envName;
  }

  // This function will return execution host infomation.
  // on SWExecutionEnv, it will return current host information.
  host(): string {
    return arch();
  }

  // This function will check certain SWExecutor installed.
  // `name` will be unique name for certain Env.
  isAvailable(name: string): boolean {
    if (gToolchainEnvMap[this.envName].listInstalled()) {
      return this.getConnectableEnv().includes(name);
    }
    return false;
  }

  // this function will return list of Env that can connect on one-vscode
  // if this comes from toolchain, currently only one executorEnv for each toolchain
  getConnectableEnv(): string[] {
    // TODO: if multiple Toolchain installed on
    // we need to fix this to show all installed Executors
    if (gToolchainEnvMap[this.envName].listInstalled()) {
      return ['Simulator'];
    }
    return [];
  }

  // This function will return ext list that executor could run.
  getListExecutableExt(): string[] {
    return this.executor.getExecutableExt();
  }
}

export {ToolchainExecutorEnv};