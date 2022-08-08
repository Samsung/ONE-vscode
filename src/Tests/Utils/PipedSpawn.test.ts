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
import {spawnSync} from 'child_process';

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
        let cat = pipedSpawn('cat', ['invalid_file'], {}, 'grep', ['not_exist'], {});
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
