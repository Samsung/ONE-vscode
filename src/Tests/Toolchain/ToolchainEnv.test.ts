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

import {assert, expect} from 'chai';
import {execPath} from 'process';
import {Job} from '../../Job/Job';

import {ToolchainEnv} from '../../Toolchain/ToolchainEnv';
import {MockCompiler} from '../MockCompiler';
import {MockFailedJob, MockJob} from '../MockJob';

suite('Toolchain', function() {
  suite('ToolchainEnv', function() {
    const K_CLEANUP: string = 'cleanup';
    const compiler = new MockCompiler();

    suite('#constructor()', function() {
      test('is constructed with params', function() {
        let env = new ToolchainEnv(compiler);
        assert.strictEqual(env.compiler, compiler);
      });
    });

    suite('#getToolchainType()', function() {
      test('get toolchain types', function() {
        let env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        assert.deepEqual(types, compiler.getToolchainTypes());
      });
    });

    suite('#listAvailable()', function() {
      test('lists available toolchains', function() {
        let env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        let toolchains = env.listAvailable(types[0], 0, 1);
        assert.deepEqual(toolchains, [compiler.availableToolchain]);
      });
    });

    suite('#listAvailable()', function() {
      test('check list count', function() {
        let env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const count = 1;
        let toolchains = env.listAvailable(types[0], 0, count);
        assert.equal(toolchains.length, count);
      });
    });

    suite('#listAvailable()', function() {
      test('NEG: lists available toolchains with wrong type', function() {
        const env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const wrongType: string = 'abcde';
        assert.equal(types.includes(wrongType), false);
        expect(function() {
          env.listAvailable(wrongType, 0, 10);
        }).to.throw(`Unknown toolchain type: ${wrongType}`);
      });
    });

    suite('#listAvailable()', function() {
      test('NEG: lists available toolchains with wrong start number', function() {
        const env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const wrongStart = -1;
        expect(function() {
          env.listAvailable(types[0], wrongStart, 10);
        }).to.throw(`wrong start number: ${wrongStart}`);
      });
    });

    suite('#listAvailable()', function() {
      test('NEG: lists available toolchains with wrong count number', function() {
        const env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const wrongCount = -1;
        expect(function() {
          env.listAvailable(types[0], 0, wrongCount);
        }).to.throw(`wrong count number: ${wrongCount}`);
      });
    });

    suite('#listInstalled()', function() {
      test('lists installed toolchain', function() {
        let env = new ToolchainEnv(compiler);
        let toolchains = env.listInstalled();
        assert.deepEqual(toolchains, [compiler.installedToolchain]);
      });
    });

    suite('#request()', function() {
      test('request jobs', function() {
        let env = new ToolchainEnv(compiler);
        const job0 = new MockJob('job0');
        const job1 = new MockJob('job1');
        const jobs: Array<Job> = [job0, job1];
        env.request(jobs).then((value) => {
          assert.equal(value, true);
        });
      });
    });

    suite('#request()', function() {
      test('NEG: request failed job (length:1)', function() {
        let env = new ToolchainEnv(compiler);
        const job0 = new MockFailedJob('job0');
        const jobs: Array<Job> = [job0];
        env.request(jobs).then(
            (_value) => {
              assert.fail();
            },
            (_reason) => {
              assert.isTrue(true);
            });
      });
    });

    suite('#request()', function() {
      test('NEG: request failed job (length:2)', function() {
        let env = new ToolchainEnv(compiler);
        const job0 = new MockJob('job0');
        const job1 = new MockFailedJob('job1');
        const jobs: Array<Job> = [job0, job1];
        env.request(jobs).then(
            (_value) => {
              assert.fail();
            },
            (_reason) => {
              assert.isTrue(true);
            });
      });
    });

    suite('#prerequisites()', function() {
      test('request prerequisites', function() {
        let env = new ToolchainEnv(compiler);
        env.prerequisites().then((_value) => { assert.fail(); }, (_reason) => {
          assert.isTrue(true);
        });
      });
    });
    // TODO(jyoung): Enable to install and uninstall package test case
    // NOTE: It is necessary to consider about how to solve the operation
    // that needs root permission like install and uninstall.
    // suite('@Use-onecc', function() {
    //   suite('#install()', function() {
    //     test('installes the toolchain', function(done) {
    //       let env = new ToolchainEnv(compiler);
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
    //       let env = new ToolchainEnv(compiler);
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
