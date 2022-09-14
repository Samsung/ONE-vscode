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
  /**
   * Function to get the type of toolchain. E.g., ['official', 'nightly']
   */
  getToolchainTypes(): string[];

  /**
   * Function to get the list of installable Toolchains.
   * Assume that there are, say, 100 installable toolchain versions and UI needs to show
   * 20 'nightly' toolchains first, and then next 30 'nightly' toolchains, sorted by version (recent
   * first)
   * in such case, we can call those two.
   *    const first20 = getToolchains('nightly', 0, 20);
   *    const next30 = getToolchains('nightly', 20, 30);
   *
   * @param toolchainType One of value returned from toolchainTypes()
   * @param start starting index of whole installable toolchains sorted by version,
   *              recent version first. 0-based index.
   * @param count number of Toolchain returned. When count > n where
   *              n = number of toonchains available, n number of toolchains will be returned.
   *
   * @throw Error when toolchainTypes are not supported
   */
  getToolchains(toolchainType: string, start: number, count: number): Toolchains;

  /**
   * @brief Function to return the list of already-installed toolchains
   * @param toolchainType One of the values returned from toolchainTypes()
   */
  getInstalledToolchains(toolchainType: string): Toolchains;

  /**
   * @brief Method to get command that prepares environment before calling getToolchains()
   * @detail If multiple commands are needed, Command with shell script containing multiple commands
   *         will be returned
   *
   * ```ts
   * // prepare a script that runs multiple commands here
   * return new Command('/bin/bash', ['-c', `"${scriptPath} ${scriptArg}"`])
   * ```
   */
  prerequisitesForGetToolchains(): Command;
}

// General compiler uses onecc so default jobs can be used
class CompilerBase implements Compiler {
  getToolchainTypes(): string[] {
    throw Error('Invalid getToolchainTypes call');
  }

  getToolchains(_toolchainType: string, _start: number, _count: number): Toolchains {
    throw Error('Invalid getToolchains call');
  }

  getInstalledToolchains(_toolchainType: string): Toolchains {
    throw Error('Invalid getInstalledToolchains call');
  }

  prerequisitesForGetToolchains(): Command {
    throw Error('Invalid prerequisitesForGetToolchains call');
  }
}

export {Compiler, CompilerBase};
