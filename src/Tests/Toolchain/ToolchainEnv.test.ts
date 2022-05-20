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

import {CompilerBase} from '../../Backend/Compiler';
import {ToolchainInfo, Toolchains} from '../../Backend/Toolchain';
import {DebianToolchain} from '../../Backend/ToolchainImpl/DebianToolchain';
import {ToolchainEnv} from '../../Toolchain/ToolchainEnv';
import {Logger} from '../../Utils/Logger';

const mocCompilerType: string = 'test';

class MockCompiler extends CompilerBase {
  // TODO: What toolchain is necessary as tests?
  installedToolchain: DebianToolchain;
  availableToolchain: DebianToolchain;

  constructor() {
    super();
    this.installedToolchain =
        new DebianToolchain(new ToolchainInfo('npm', 'package manager for Node.js'));
    this.availableToolchain = new DebianToolchain(
        new ToolchainInfo('nodejs', 'Node.js event-based server-side javascript engine'));
  }
  // NOTE: Deprecated API
  toolchains(): Toolchains {
    throw Error('Deprecated API: toolchains()');
  }
  getToolchainTypes(): string[] {
    return [mocCompilerType];
  }
  getToolchains(toolchainType: string, start: number, count: number): Toolchains {
    // TODO(jyoung): Support start and count parameters
    if (toolchainType === mocCompilerType) {
      assert(count === 1, 'Count must be 1');
      return [this.availableToolchain];
    }
    return [];
  }
  getInstalledToolchains(toolchainType: string): Toolchains {
    if (toolchainType === mocCompilerType) {
      return [this.installedToolchain];
    }
    return [];
  }
};

suite('Toolchain', function() {
  suite('ToolchainEnv', function() {
    const K_CLEANUP: string = 'cleanup';
    const logger = Logger.getInstance();
    const compiler = new MockCompiler();

    suite('#constructor()', function() {
      test('is constructed with params', function() {
        let env = new ToolchainEnv(logger, compiler);
        assert.equal(env.installed, undefined);
        assert.strictEqual(env.compiler, compiler);
      });
    });

    suite('#getToolchainType()', function() {
      test('get toolchain types', function() {
        let env = new ToolchainEnv(logger, compiler);
        const types = env.getToolchainTypes();
        assert.deepEqual(types, compiler.getToolchainTypes());
      });
    });

    suite('#listAvailable()', function() {
      test('lists available toolchains', function() {
        let env = new ToolchainEnv(logger, compiler);
        const types = env.getToolchainTypes();
        let toolchains = env.listAvailable(types[0], 0, 1);
        assert.deepEqual(toolchains, [compiler.availableToolchain]);
      });
    });

    suite('#listInstalled()', function() {
      test('lists installed toolchain', function() {
        let env = new ToolchainEnv(logger, compiler);
        let toolchains = env.listInstalled();
        assert.deepEqual(toolchains, [compiler.installedToolchain]);
      });
    });

    // TODO(jyoung): Enable to install and uninstall package test case
    // NOTE: It is necessary to consider about how to solve the operation
    // that needs root permission like install and uninstall.
    // suite('@Use-onecc', function() {
    //   suite('#install()', function() {
    //     test('installes the toolchain', function(done) {
    //       let env = new ToolchainEnv(logger, compiler);
    //       env.install(compiler.availableToolchain);
    //       env.workFlow.jobRunner.on(K_CLEANUP, function() {
    //         assert.notEqual(env.installed, undefined);
    //         let toolchain = env.listInstalled();
    //         assert.strictEqual(toolchain, compiler.installedToolchain);
    //         done();
    //       });
    //     });
    //   });

    //   suite('#uninstall()', function() {
    //     test('uninstalles the toolchain', function(done) {
    //       let env = new ToolchainEnv(logger, compiler);
    //       env.uninstall(compiler.installedToolchain);
    //       env.workFlow.jobRunner.on(K_CLEANUP, function() {
    //         assert.equal(env.installed, undefined);
    //         done();
    //       });
    //     });
    //   });

    //   // TODO(jyoung): Enable to compile test case
    //   suite('#compile()', function() {
    //     test('compiles model file with cfg file', function(done) {
    //       // TODO
    //       // 1. Install toolchain
    //       // 2. After installing,
    //       // 3. Does compile
    //     });
    //   });
    // });
  });
});
