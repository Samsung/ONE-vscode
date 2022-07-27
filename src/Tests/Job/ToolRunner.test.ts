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
import {join} from 'path';

import {ToolArgs} from '../../Job/ToolArgs';
import {SuccessResult, ToolRunner} from '../../Job/ToolRunner';
import {obtainWorkspaceRoot} from '../../Utils/Helpers';
import {MockJob} from '../MockJob';

suite('Job', function() {
  suite('ToolRunner', function() {
    suite('@Use-onecc', function() {
      suite('#getOneccPath()', function() {
        test('returns onecc path as string', function() {
          let toolRunner = new ToolRunner();
          let actual = toolRunner.getOneccPath();  // string or undefined
          // Note. `onecc` path could be changed by user
        assert.isTrue((actual === '/usr/share/one/bin/onecc') ||
                      (actual?.endsWith('onecc')));
        });
      });
    });  // @use-onecc

    const wait = async function(sec: number) {
      await new Promise(resolve => setTimeout(resolve, sec * 1000));
    };

    suite(`#getRunner()`, function() {
      test('returns runner as Promise<string>', function(done) {
        let job = new MockJob('mockup');
        let toolRunner = new ToolRunner();
        const runner = toolRunner.getRunner(job.name, job.tool, job.toolArgs, job.workDir);
        assert.isNotNull(runner);
        runner
            .then(function(res: SuccessResult) {
              assert.ok(res.exitCode === 0);
              done();
            })
            .catch(done);
      });

      test('NEG: calling sequence', async function() {
        let toolRunner = new ToolRunner();
        {
          let args = new ToolArgs();
          args.push('0.3');
          assert.doesNotThrow(() => toolRunner.getRunner('sleep', 'sleep', args, '.'));
        }
        // runner1 is still running finished. calling getRunner() throws an error
        {
          let args = new ToolArgs();
          args.push('0.3');
          assert.throw(() => toolRunner.getRunner('sleep', 'sleep', args, '.'));
        }
      });

      test('calling sequence', async function() {
        let toolRunner = new ToolRunner();
        {
          let args = new ToolArgs();
          args.push('0.1');
          assert.doesNotThrow(() => toolRunner.getRunner('sleep', 'sleep', args, '.'));
        }
        await wait(0.3);
        // now runner1 was finished
        {
          let args = new ToolArgs();
          args.push('0.1');
          assert.doesNotThrow(() => toolRunner.getRunner('sleep', 'sleep', args, '.'));
          // finished without Error
        }
      });

      test('lots of simultaneous calls', async function() {
        let toolRunner = new ToolRunner();

        const simultaneousTrials = 32;  // some reasonably big number
        const errorAmongTrials = simultaneousTrials - 1;

        let errCount = 0;

        for (let i = 0; i < simultaneousTrials; i++) {
          let args = new ToolArgs();
          args.push('1');  // 1 sec
          try {
            toolRunner.getRunner('sleep', 'sleep', args, '.');
          } catch (err) {
            // cannot make process
            errCount++;
          }
        }

        assert.equal(errCount, errorAmongTrials);

        // kill to finish this test
        assert.equal(toolRunner.isRunning(), true);
        assert.equal(toolRunner.kill(), true);
        assert.equal(toolRunner.isRunning(), false);
      });
    });

    suite(`#kill()`, function() {
      test('basic case', async function() {
        let finished = false;

        let toolRunner = new ToolRunner();

        let args = new ToolArgs();
        args.push('10');  // sec

        const runner = toolRunner.getRunner('long process', 'sleep', args, obtainWorkspaceRoot());
        runner
            .then((val: SuccessResult) => {
              assert.equal(val.intentionallyKilled, true);
            })
            .catch(exitcode => {
              assert.fail();
            });

        // Let's kill the process!!
        // This will eventually call runner.then(...)
        assert.isTrue(toolRunner.kill());
      });

      test('NEG: too early kill', function() {
        let toolRunner = new ToolRunner();
        assert.throw(() => toolRunner.kill());
      });

      test('NEG: too late kill', async function() {
        let finished = false;

        let toolRunner = new ToolRunner();
        let args = new ToolArgs();
        args.push('0.01');  // 0.01 sec

        const runner = toolRunner.getRunner('long process', 'sleep', args, obtainWorkspaceRoot());
        runner
            .then((val: SuccessResult) => {
              assert.equal(val.exitCode, 0);
              finished = true;
            })
            .catch(exitcode => {
              assert.fail();
            });

        // wait some long time. sleep process will exit during this sleep.
        await wait(0.2);
        assert.isTrue(finished);  // sanity check

        assert.throw(() => toolRunner.kill());
      });
    });
  });
});
