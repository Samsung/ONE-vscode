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

import {platform} from 'os';
import {Command} from '../Backend/Command';
import {Executor} from '../Backend/Executor';
import {gToolchainEnvMap} from '../Toolchain/ToolchainEnv';

// Specify Device with 'name' on `getEnableEnvList()` and `ExecutionEnv`.
interface ExecutionEnv {
  name(): string;
  host(): string;
  getEnableEnvList(): string[];
  isAvailable(name: string): boolean;
  getListExecutableExt(): string[];
  getInferenceCmd(model_path: string, _options?: string[]): Command;
}

class ToolchainExecutorEnv implements ExecutionEnv {
  envName: string;  // Specified name for Each Env
  simulator: Executor;
  constructor(backendName: string, sim: Executor) {
    this.envName = backendName;
    this.simulator = sim;
  }
  name(): string {
    return this.envName;
  }
  host(): string {
    return platform();
  }
  isAvailable(name: string): boolean {
    if (gToolchainEnvMap[this.envName].listInstalled()) {
      return this.getEnableEnvList().includes(name);
    }
    return false;
  }
  getEnableEnvList(): string[] {
    // TODO: if multiple Toolchain installed on
    // we need to fix this to show all installed Executors
    if (gToolchainEnvMap[this.envName].listInstalled()) {
      return ['Simulator'];
    }
    return [];
  }
  getListExecutableExt(): string[] {
    return this.simulator.getExecutableExt();
  }
  getInferenceCmd(modelPath: string, _options?: string[]): Command {
    return this.simulator.runInference(modelPath);
  }
}

class TizenEnv implements ExecutionEnv {
  envName: string;

  constructor(envName: string) {
    this.envName = envName;
  }
  name(): string {
    return this.envName;
  }
  host(): string {
    return 'tizen';
  }
  isAvailable(name: string): boolean {
    throw new Error('Method not implemented.');
  }
  getEnableEnvList(): string[] {
    throw new Error('Method not implemented.');
  }
  getListExecutableExt(): string[] {
    throw new Error('Method not implemented.');
  }
  getInferenceCmd(modelPath: string, _options?: string[]): Command {
    throw new Error('Method not implemented.');
  }
}

export {ExecutionEnv, ToolchainExecutorEnv, TizenEnv};
