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

import {Command} from '../Project/Command';

import {Toolchains} from './Toolchain';

// This Backend API assumes that backend supporter's backend has ONE-compiler as default.
//
// as-is
// 1. command palette `import-cfg` -> make jobs
// 2. command palette `build` -> run jobs by Builder
//
// to-be (Compiler -> CompilerEnv -> ONE-vscode)
// (0. CompilerEnv uses Compiler to install toolchains)
// 1. CompilerEnv uses Compiler to make jobs with cmds
// 2. CompilerEnv runs the job with workflow
interface Compiler {
  // defined/available toolchains by backend supporter
  toolchains(): Toolchains;

  // compiler jobs
  compile(cfg: string): Command;
}

// General compiler uses onecc so default jobs can be used
class CompilerBase implements Compiler {
  toolchains(): Toolchains {
    throw Error('Invalid toolchains call');
  }

  compile(cfg: string): Command {
    let cmd = new Command('onecc');
    cmd.push('--config');
    cmd.push(cfg);
    return cmd;
  }
};

export {Compiler, CompilerBase};
