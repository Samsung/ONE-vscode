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

import {Command} from '../../Backend/Command';

import {ExecutionEnvBase} from '../ExecutionEnv';

class TizenEnv extends ExecutionEnvBase {
  deviceName: string;
  constructor(deviceName: string) {
    super();
    this.deviceName = deviceName;
  }
  name(): string {
    return this.deviceName;
  }
  // envInfo will used to check thos env could use certain Executor.
  envInfo(): string {
    // This is just a example. this will be specified later
    return 'Tizen';
  }
  makeCommand(command: Command): Command {
    return new Command('sdb shell', command.strs());
  }
}

function getConnectableEnvs(): Command {
  let command = new Command('sdb devices | grep -v devices | grep device | awk \'{print $1}\'');
  return command;
}

function getEnv(name: string): TizenEnv {
  return new TizenEnv(name);
}

export {TizenEnv, getEnv, getConnectableEnvs};
