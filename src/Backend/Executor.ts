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

import {Command} from './Command';
import {DeviceSpec} from './Spec';
import {Toolchains} from './Toolchain';

interface Executor {
  // Executor unique name
  name(): string;

  // exetensions of executable files
  getExecutableExt(): string[];

  // defined/available toolchains
  toolchains(): Toolchains;

  // TODO: use cfg path to run onecc after one-infer landed
  runInference(_modelPath: string, _options?: string[]): Command;

  // return deviceSpec required for this Executor to run
  require(): DeviceSpec;
}

// General excutor uses onecc so default jobs can be used
class ExecutorBase implements Executor {
  name(): string {
    throw new Error('Name is not determined.');
  }

  // exetensions of executable files
  getExecutableExt(): string[] {
    throw Error('Invalid toolchains call');
  }

  toolchains(): Toolchains {
    throw Error('Invalid toolchains call');
  }

  runInference(_modelPath: string, _options?: string[]): Command {
    throw Error('Invalid inference call');
  }

  require(): DeviceSpec {
    throw new Error('NYI: need to define DeviceSpec for Executor.');
  }
};

export {Executor, ExecutorBase};
