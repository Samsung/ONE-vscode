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

import { Backend } from '../Backend';
import { Command } from '../Command';
import { Compiler } from '../Compiler';
import { Executor } from '../Executor';
import { Toolchains } from '../Toolchain';

class ToolchainCompiler implements Compiler {
  private readonly toolchainTypes: string[];
  private availableToolchains: Toolchains;
  private installedToolchains: Toolchains;
    
  constructor() {
    // For now, we support only latest version.
    this.toolchainTypes = ['latest'];
    this.availableToolchains = new Toolchains();
    this.installedToolchains = new Toolchains();
  }
    
  getToolchainTypes(): string[] {
    return this.toolchainTypes;
  }
    
  getToolchains(toolchainType: string, start?: number, count?: number): Toolchains {
    if(!this.toolchainTypes.includes(toolchainType)) {
      throw Error(`Unknown toolchain type: ${toolchainType}`);
    }
    return this.availableToolchains;
  }

  getInstalledToolchains(toolchainType: string): Toolchains {
    if(!this.toolchainTypes.includes(toolchainType)) {
      throw Error(`Unknown toolchain type: ${toolchainType}`);
    }
    return this.installedToolchains;
  }

  prerequisitesForGetToolchains(): Command {
    return new Command('/bin/echo', ['prerequisites'])
  }
}

class ONEToolchain implements Backend {
  private readonly backendName: string;
  private readonly toolchainCompiler: Compiler | undefined;

  constructor() {
    this.backendName = 'ONE';
    this.toolchainCompiler = new ToolchainCompiler();
  }

  name(): string {
    return this.backendName;
  };

  compiler(): Compiler|undefined {
    return this.toolchainCompiler;
  };
  
  executor(): Executor|undefined {
    return undefined;
  }
  
  executors(): Executor[] {
    return [];
  };

}

export { ONEToolchain };
