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

import {assert} from 'chai';
import {Command} from '../Backend/Command';

import {CompilerBase} from '../Backend/Compiler';
import {ToolchainInfo, Toolchains} from '../Backend/Toolchain';
import {DebianToolchain} from '../Backend/ToolchainImpl/DebianToolchain';
import {Version} from '../Backend/Version';

const mocCompilerType1: string = 'test';
const mocCompilerType2: string = 'test2';

class MockCompiler extends CompilerBase {
  // TODO: What toolchain is necessary as tests?
  installedToolchain: DebianToolchain;
  availableToolchain: DebianToolchain;

  constructor() {
    super();
    this.installedToolchain = new DebianToolchain(
        new ToolchainInfo('npm', 'package manager for Node.js', new Version(1, 0, 0)));
    this.availableToolchain = new DebianToolchain(
        new ToolchainInfo('nodejs', 'Node.js event-based server-side javascript engine'));
  }
  getToolchainTypes(): string[] {
    return [mocCompilerType1, mocCompilerType2];
  }
  getToolchains(toolchainType: string, start: number, count: number): Toolchains {
    if (toolchainType !== mocCompilerType1 && toolchainType !== mocCompilerType2) {
      throw Error(`Unknown toolchain type: ${toolchainType}`);
    }
    if (start < 0) {
      throw Error(`wrong start number: ${start}`);
    }
    if (count < 0) {
      throw Error(`wrong count number: ${count}`);
    }
    if (count === 0) {
      return [];
    }
    assert(count === 1, 'Count must be 1');
    if (toolchainType === mocCompilerType1) {
      return [this.availableToolchain];
    }
    return [];
  }
  getInstalledToolchains(toolchainType: string): Toolchains {
    if (toolchainType !== mocCompilerType1 && toolchainType !== mocCompilerType2) {
      throw Error(`Unknown toolchain type: ${toolchainType}`);
    }
    if (toolchainType === mocCompilerType1) {
      return [this.installedToolchain];
    }
    return [];
  }
  prerequisitesForGetToolchains(): Command {
    return new Command('/bin/bash', ['echo', 'prerequisites']);
  }
}

export {MockCompiler};
