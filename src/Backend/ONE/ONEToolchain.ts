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

import {execSync} from 'child_process';
import {Backend} from '../Backend';
import {Command} from '../Command';
import {Compiler} from '../Compiler';
import {Executor} from '../Executor';
import {Toolchain, ToolchainInfo, Toolchains} from '../Toolchain';
import {DebianToolchain} from '../ToolchainImpl/DebianToolchain';
import {Version} from '../Version';

// nodejs will be changed to onecc-docker-compiler
const latestVersion = new DebianToolchain(
    new ToolchainInfo('nodejs', 'Test package', new Version(8, 10, 0, '~dfsg-2ubuntu0.4')));

class ToolchainCompiler implements Compiler {
  private readonly toolchainTypes: string[];

  constructor() {
    // For now, we support only latest version.
    this.toolchainTypes = ['latest'];
  }

  getToolchainTypes(): string[] {
    return this.toolchainTypes;
  }

  getToolchains(toolchainType: string, start?: number, count?: number): Toolchains {
    let availableToolchains: Toolchains = new Toolchains();
    if (!this.toolchainTypes.includes(toolchainType)) {
      throw Error(`Unknown toolchain type: ${toolchainType}`);
    }
    // prerequisites must be installed before getting available toolchains.
    // if('prerequisites are not met') {
    //   throw Error(`the prerequisites are not met`);
    // }
    if (toolchainType === 'latest') {
      availableToolchains = [latestVersion];
    }
    return availableToolchains;
  }

  getInstalledToolchains(toolchainType: string): Toolchains {
    let installedToolchains: Toolchains = new Toolchains();
    if (!this.toolchainTypes.includes(toolchainType)) {
      throw Error(`Unknown toolchain type: ${toolchainType}`);
    }
    // Check if the toolchain is installed in the available toolchains, and returns installed
    // toolchain.
    installedToolchains = this.getToolchains(toolchainType).filter((toolchain) => {
      return parseInt(execSync(`dpkg-query --show ${toolchain.info.name} > /dev/null 2>&1; echo $?`)
                          .toString()
                          .trim()) === 0;
    });
    return installedToolchains;
  }

  prerequisitesForGetToolchains(): Command {
    return new Command('/bin/echo', ['prerequisites']);
  }
}

class ONEToolchain implements Backend {
  private readonly backendName: string;
  private readonly toolchainCompiler: Compiler|undefined;

  constructor() {
    this.backendName = 'ONE';
    this.toolchainCompiler = new ToolchainCompiler();
  }

  name(): string {
    return this.backendName;
  }

  compiler(): Compiler|undefined {
    return this.toolchainCompiler;
  }

  executor(): Executor|undefined {
    return undefined;
  }

  executors(): Executor[] {
    return [];
  }
}

export {ONEToolchain};
