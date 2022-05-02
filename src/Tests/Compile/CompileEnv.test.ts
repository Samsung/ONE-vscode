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

import {strict as assert} from 'assert';

import {CompilerBase} from '../../Backend/Compiler';
import {Toolchains} from '../../Backend/Toolchain';
import {ToolchainInfo} from '../../Backend/Toolchain';
import {DebianToolchain} from '../../Backend/ToolchainImpl/DebianToolchain';
import {CompileEnv} from '../../Compile/CompileEnv';
import {Logger} from '../../Utils/Logger';

class MockCompiler extends CompilerBase {
  // TODO: What toolchain is necessary as tests?
  installedToolchain: DebianToolchain;
  availableToolchain: DebianToolchain;
  ts: Toolchains;

  constructor() {
    super();
    this.installedToolchain =
        new DebianToolchain(new ToolchainInfo('npm', 'package manager for Node.js'));
    this.availableToolchain = new DebianToolchain(
        new ToolchainInfo('nodejs', 'Node.js event-based server-side javascript engine'));
    this.ts = new Toolchains();
    this.ts.push(this.installedToolchain);
    this.ts.push(this.availableToolchain);
  }
  toolchains(): Toolchains {
    return this.ts;
  }
};

suite('Compile', function() {
  suite('CompileEnv', function() {
    const K_CLEANUP: string = 'cleanup';
    const logger = new Logger();
    const compiler = new MockCompiler();

    suite('#constructor()', function() {
      test('is constructed with params', function() {
        let env = new CompileEnv(logger, compiler);
        assert.equal(env.installed, undefined);
        assert.strictEqual(env.compiler, compiler);
      });
    });

    suite('#listAvailable()', function() {
      test('lists available toolchains', function() {
        let env = new CompileEnv(logger, compiler);
        let toolchains = env.listAvailable();
        assert.strictEqual(toolchains, compiler.toolchains());
      });
    });

    // NOTE: use K_CLEANUP event in JobRunner because of the timing when building jobs are done.
    suite('@Use-onecc', function() {
      suite('#confirmInstalled()', function() {
        test('confirms the toolchain is installed', function(done) {
          let env = new CompileEnv(logger, compiler);
          assert.equal(env.installed, undefined);
          env.confirmInstalled();
          env.workFlow.jobRunner.on(K_CLEANUP, function() {
            assert.notEqual(env.installed, undefined);
            done();
          });
        });
      });

      suite('#listInstalled()', function() {
        test('lists installed toolchain', function(done) {
          let env = new CompileEnv(logger, compiler);
          env.confirmInstalled();
          env.workFlow.jobRunner.on(K_CLEANUP, function() {
            assert.notEqual(env.installed, undefined);
            let toolchain = env.listInstalled();
            assert.strictEqual(toolchain, compiler.installedToolchain);
            done();
          });
        });
      });

      // TODO(jyoung): Enable to install and uninstall package test case
      // NOTE: It is necessary to consider about how to solve the operation
      // that needs root permission like install and uninstall.
      // suite('#install()', function() {
      //   test('installes the toolchain', function(done) {
      //     let env = new CompileEnv(logger, compiler);
      //     env.install(compiler.availableToolchain);
      //     env.workFlow.jobRunner.on(K_CLEANUP, function() {
      //       assert.notEqual(env.installed, undefined);
      //       let toolchain = env.listInstalled();
      //       assert.strictEqual(toolchain, compiler.installedToolchain);
      //       done();
      //     });
      //   });
      // });
      //
      // suite('#uninstall()', function() {
      //   test('uninstalles the toolchain', function(done) {
      //     let env = new CompileEnv(logger, compiler);
      //     env.uninstall(compiler.installedToolchain);
      //     env.workFlow.jobRunner.on(K_CLEANUP, function() {
      //       assert.equal(env.installed, undefined);
      //       done();
      //     });
      //   });
      // });

      // TODO(jyoung): Enable to compile test case
      // suite('#compile()', function() {
      //   test('compiles model file with cfg file', function(done) {
      //     // TODO
      //     // 1. Install toolchain
      //     // 2. After installing,
      //     // 3. Does compile
      //   });
      // });
    });
  });
});
