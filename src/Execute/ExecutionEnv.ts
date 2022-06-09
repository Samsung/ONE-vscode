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

// ExecutionEnv is a class for each Device.
// It contains information about how to run action on this Device.
// name() will return a unique identifier for Device.
// wrapCommand() update command to run on certain Device.
// TODO: Rename this with right meaning.
interface ExecutionEnv {
  name(): string;
  // TODO: Rename this.
  wrapCommand(command: Command): Command;
}

// This is a base class for ExeuctionEnv.
// To write a class that inherits ExecutionEnvBase, the following needs to be added
// 1. ExecutionEnv class itself
// 2. ExecutionEnv Creation function : named `function createExecutionEnv(name: string):
// ExecutionEnv`
//    This will return class for Env that extends ExecutionEnvBase
// 3. ExecutionEnv list get function : named `function getDeviceListCommand(): Command`
//    This will return Command that is executed on host and returns DeviceList string.
class ExecutionEnvBase implements ExecutionEnv {
  name(): string {
    throw new Error('Method not implemented.');
  }
  wrapCommand(command: Command): Command {
    throw new Error('Method not implemented.');
  }
}

export {ExecutionEnv, ExecutionEnvBase};
