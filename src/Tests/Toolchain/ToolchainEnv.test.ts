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
import {ToolchainInfo} from '../../Backend/Toolchain';
import {DebianToolchain} from '../../Backend/ToolchainImpl/DebianToolchain';
import {Job} from '../../Job/Job';

import {Env, ToolchainEnv} from '../../Toolchain/ToolchainEnv';
import {MockCompiler} from '../MockCompiler';
import {MockFailedJob, MockJob} from '../MockJob';

suite('Toolchain', function() {
  suite('Env', function() {
    suite('#build()', function() {
      test('NEG: checks preparation of Env', function() {
        const env = new Env();
        env.clearJobs();
        expect(function() {
          env.build();
        }).to.throw(`Env is not yet prepared`);
      });
    });
  });

  suite('ToolchainEnv', function() {
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

      test('checks list count', function() {
        let env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const count = 1;
        let toolchains = env.listAvailable(types[0], 0, count);
        assert.equal(toolchains.length, count);
      });

      test('NEG: lists available toolchains with wrong type', function() {
        const env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const wrongType: string = 'abcde';
        assert.equal(types.includes(wrongType), false);
        expect(function() {
          env.listAvailable(wrongType, 0, 10);
        }).to.throw(`Unknown toolchain type: ${wrongType}`);
      });

      test('NEG: lists available toolchains with wrong start number', function() {
        const env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const wrongStart = -1;
        expect(function() {
          env.listAvailable(types[0], wrongStart, 10);
        }).to.throw(`wrong start number: ${wrongStart}`);
      });

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

      test('NEG: lists installed toolchains with wrong type', function() {
        const env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const wrongType: string = 'abcde';
        assert.equal(types.includes(wrongType), false);
        expect(function() {
          env.listAvailable(wrongType, 0, 10);
        }).to.throw(`Unknown toolchain type: ${wrongType}`);
      });
    });

    suite('#request()', function() {
      test('requests jobs', function() {
        let env = new ToolchainEnv(compiler);
        const job0 = new MockJob('job0');
        const job1 = new MockJob('job1');
        const jobs: Array<Job> = [job0, job1];
        env.request(jobs).then(
            (value) => {
              assert.equal(value, true);
            },
            () => {
              assert.fail();
            });
      });

      test('NEG: requests failed job (length:1)', function() {
        let env = new ToolchainEnv(compiler);
        const job0 = new MockFailedJob('job0');
        const jobs: Array<Job> = [job0];
        env.request(jobs).then(() => {
          assert.fail();
        });
      });
    });

    test('NEG: requests failed job (length:2)', function() {
      let env = new ToolchainEnv(compiler);
      const job0 = new MockJob('job0');
      const job1 = new MockFailedJob('job1');
      const jobs: Array<Job> = [job0, job1];
      env.request(jobs).then(
          () => {
            assert.fail();
          },
          () => {
            assert.isTrue(true);
          });
    });

    suite('#prerequisites()', function() {
      test('requests prerequisites', function() {
        let env = new ToolchainEnv(compiler);
        env.prerequisites().then(
            () => {
              assert.isTrue(true);
            },
            () => {
              assert.fail();
            });
      });
    });

    suite('#install()', function() {
      test('requests install', function() {
        let env = new ToolchainEnv(compiler);
        const types = env.getToolchainTypes();
        const availableToolchains = env.listAvailable(types[0], 0, 1);
        assert.isAbove(availableToolchains.length, 0);
        env.install(availableToolchains[0])
            .then(
                () => {
                  assert.isTrue(true);
                },
                () => {
                  assert.fail();
                });
      });

      test('NEG: requests install with invalid toolchain', function() {
        let env = new ToolchainEnv(compiler);
        const invalidToolchain = new DebianToolchain(new ToolchainInfo('abcde', 'Invalid package'));
        env.install(invalidToolchain)
            .then(
                () => {
                  assert.fail();
                },
                () => {
                  assert.isTrue(true);
                });
      });
    });

    suite('#uninstall()', function() {
      test('requests uninstall', function() {
        let env = new ToolchainEnv(compiler);
        const installedToolchains = env.listInstalled();
        assert.isAbove(installedToolchains.length, 0);
        env.uninstall(installedToolchains[0])
            .then(
                () => {
                  assert.isTrue(true);
                },
                () => {
                  assert.fail();
                });
      });

      test('NEG: requests uninstall with invalid toolchain', function() {
        let env = new ToolchainEnv(compiler);
        const invalidToolchain = new DebianToolchain(new ToolchainInfo('abcde', 'Invalid package'));
        env.uninstall(invalidToolchain)
            .then(
                () => {
                  assert.fail();
                },
                () => {
                  assert.isTrue(true);
                });
      });
    });

    suite('#run()', function() {
      test('requests run', function() {
        let env = new ToolchainEnv(compiler);
        const installedToolchains = env.listInstalled();
        assert.isAbove(installedToolchains.length, 0);
        const modelCfg = 'model.cfg';
        env.run(modelCfg, installedToolchains[0])
            .then(
                () => {
                  assert.isTrue(true);
                },
                () => {
                  assert.fail();
                });
      });

      test('NEG: requests run with invalid cfg', function() {
        let env = new ToolchainEnv(compiler);
        const installedToolchains = env.listInstalled();
        assert.isAbove(installedToolchains.length, 0);
        const invalidCfg = 'model.abc';
        env.run(invalidCfg, installedToolchains[0])
            .then(
                () => {
                  assert.fail();
                },
                () => {
                  assert.isTrue(true);
                });
      });

      test('NEG: requests run with invalid toolchain', function() {
        let env = new ToolchainEnv(compiler);
        const invalidToolchain = new DebianToolchain(new ToolchainInfo('abcde', 'Invalid package'));
        const modelCfg = 'model.cfg';
        env.run(modelCfg, invalidToolchain)
            .then(
                () => {
                  assert.fail();
                },
                () => {
                  assert.isTrue(true);
                });
      });
    });
  });
});
