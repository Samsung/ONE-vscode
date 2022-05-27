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

interface ExecutionEnv {
  name(): string;
  envInfo(): string;
  getExecutors(): Executor[];
  getExecutor(name: string): Executor|undefined;
  setExecutor(name: string, executor: Executor): boolean;
}

// This is a base ExeuctionEnv.
// on New ExecutionEnv implements, need to add 3things
// 1. ExecutionEnv itself
// 2. ExecutionEnv Creation function
//    This will return class for Env that extends ExecutionEnvBase
// 3. ExecutionEnv list get function
//    This will return Commend that execute on host and return string array of device list,
//    could split with '\n'.
class ExecutionEnvBase implements ExecutionEnv {
  executors: Map<string, Executor>;
  constructor() {
    this.executors = new Map<string, Executor>();
  }
  name(): string {
    throw new Error('Method not implemented.');
  }
  envInfo(): string {
    throw new Error('Method not implemented.');
  }
  getExecutors(): Executor[] {
    return Array.from(this.executors.values());
  }
  getExecutor(name: string): Executor|undefined {
    return this.executors.get(name);
  }
  setExecutor(name: string, executor: Executor): boolean {
    throw new Error(
        'Check certain Executor installed and could use on this Env.\n If it could, return true and add Executor on ExecutorList.');
  }
}

export {ExecutionEnv, ExecutionEnvBase};
