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

import {Command} from '../Backend/Command';

// Specify with 'name' on `getEnableEnvList()` and `ExecutionEnv`.
interface ExecutionEnv {
  name(): string;
  host(): string;
  getConnectableEnv(): string[];
  isAvailable(execEnvName: string): boolean;
  getListExecutableExt(): string[];
}

class ExecutionEnvBase implements ExecutionEnv {
  name(): string {
    throw new Error('Define Env name.');
  }

  host(): string {
    throw new Error('Define host information that model will run');
  }

  getConnectableEnv(): string[] {
    throw new Error('Define List of Device that could be connected');
  }

  isAvailable(execEnvName: string): boolean {
    throw new Error('Check specific ExecutionEnv available to use');
  }

  getListExecutableExt(): string[] {
    throw new Error('Define string array that contain model ext name ');
  }
}

export {ExecutionEnv, ExecutionEnvBase};
