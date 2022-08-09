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
import {ChildProcessWithoutNullStreams, spawnSync} from 'child_process';

import {pipedSpawn} from '../../Utils/PipedSpawn';

suite('Utils', function() {
  suite('#pipedSpawn', function() {
    test('basic', function() {
      const ENABLE_BACKSLASH = '-e';
      let wc = pipedSpawn('echo', [ENABLE_BACKSLASH, '1\n2'], {cwd: '.'}, 'wc', ['-l'], {cwd: '.'});
      wc.stdout!.on('data', (data) => {
        // data.toString() is '2\n'
        assert.equal(data.toString()[0], '2');
      });
      wc.stderr!.on('data', (data) => {
        assert.fail(`should not fail. ${data}`);
      });
      wc.on('exit', (exitcode) => {
        if (exitcode !== 0) {
          assert.fail(`exitcode === ${exitcode}`);
        }
      });
    });

    test('NEG: first cmd fails', function() {
      try {
        let cat = pipedSpawn('cat', ['invalid_file'], {}, 'wc', ['-l'], {});
      } catch (err) {
        assert.ok(true, 'Should be thrown');
      }
    });

    test('NEG: second cmd fails', function() {
      let wc = pipedSpawn('echo', ['123'], {}, 'grep', ['not_exist'], {});
      wc.on('exit', (exitcode) => {
        if (exitcode === 0) {
          assert.fail(`exitcode === ${exitcode}`);
        }
      });
    });

    /**
     * From https://nodejs.org/api/child_process.html#child_processspawncommand-args-options,
     *
     * "Use cwd to specify the working directory from which the process is spawned.
     * If not given, the default is to inherit the current working directory. If given,
     * but the path does not exist, the child process emits an ENOENT error and exits immediately.
     * ENOENT is also emitted when the command does not exist.
     */
    function checkENOENT(a: ChildProcessWithoutNullStreams) {
      let errMsg = '';
      a.on('error', (err: Error) => {
        errMsg = `${err.message}`;  // This contains string 'ENOENT'
      });
      a.on('close', (err: number) => {
        // https://nodejs.org/api/child_process.html#event-close
        // 'close' event will processed after 'error' event handler
        if (errMsg === '') {
          assert.fail(`error should have occured`);
        } else if (!errMsg.includes('ENOENT')) {
          assert.fail(`error should contain 'ENOENT' but it was ${errMsg}`);
        } else {
          assert.ok(true);
          assert.notEqual(err, 0);
        }
      });
    }

    test('NEG: second cmd does not exist', function() {
      let a = pipedSpawn('true', [], {}, 'there_is_no_such_cmd', [], {});
      checkENOENT(a);
    });

    test('NEG: cwd path of second cmd does not exist', function() {
      let a = pipedSpawn('true', [], {}, 'true', [], {cwd: '/__no_where__'});
      checkENOENT(a);
    });

    // Why is the test below skipped? This sometimes fail in CI. Check the reason.
    test.skip('NEG: sudo failed', function() {
      // make sure that sudo pw is not cached
      spawnSync('sudo', ['-k']);

      let sudo = pipedSpawn('echo', ['incorrect_pw'], {}, 'sudo', ['-S', 'date'], {});

      sudo.stdout!.on('data', (data) => {
        assert.fail(`should not fail. ${data}`);
      });
      sudo.on('exit', (exitcode: number|null, signal: NodeJS.Signals|null) => {
        if (exitcode === 0) {
          assert.fail(`exitcode === 0`);
        } else {
          assert.isTrue(exitcode !== 0);  // success
        }
      });
    });
  });
});
