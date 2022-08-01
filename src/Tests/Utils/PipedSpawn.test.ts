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

import {pipedSpawn, pipedSpawnSync} from '../../Utils/PipedSpawn';

suite('Utils PipedSpawn Test Suite', function() {
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

    test('second cmd fails: NEG', function() {
      let wc = pipedSpawn('echo', ['123'], {}, 'grep', ['not_exist'], {});
      wc.on('exit', (exitcode) => {
        if (exitcode === 0) {
          assert.fail(`exitcode === ${exitcode}`);
        }
      });
    });

    test('sudo failed: NEG', function() {
      // make sure that sudo pw is not cached
      spawnSync('sudo', ['-k']);

      let sudo = pipedSpawn('echo', ['incorrect_pw'], {}, 'sudo', ['-S', 'date'], {});

      sudo.stdout!.on('data', (data) => {
        assert.fail(`should not fail. ${data}`);
      });
      sudo.on('exit', (exitcode: number | null, signal: NodeJS.Signals | null) => {
        console.log("exit code is---------->", exitcode, signal);
        if (exitcode === 0) {
          assert.fail(`exitcode === 0`);
        } else {
          assert.isTrue(exitcode !== 0); // success
        }
      });
    });
  });

  // suite('#pipedSpawnSync', function() {
  //   test('basic', function() {
  //     try {
  //       let wc = pipedSpawnSync('echo', ['123'], {cwd: '.'}, 'grep', ['123'], {cwd: '.'});
  //       assert.isTrue(wc.stdout.toString().startsWith('123'));
  //     } catch (err) {
  //       assert.fail('error happens with first process');
  //     }
  //   });

  //   test('second cmd fails: NEG', function() {
  //     try {
  //       let grep = pipedSpawnSync('echo', ['123'], {}, 'grep', ['not_exist'], {});
  //       assert.notEqual(grep.status, 0);
  //     } catch (err) {
  //       assert.fail('error happens');
  //     }
  //   });

  //   test('do not use sudo -S: NEG', function() {
  //     // make sure that sudo pw is not cached
  //     spawnSync('sudo', ['-k']);

  //     try {
  //       pipedSpawnSync('echo', ['incorrect_pw'], {}, 'sudo', ['-S', 'true'], {});
  //       assert.fail('should not reach here');
  //     } catch (err) {
  //       // success
  //       assert.isTrue(true);
  //     }
  //   });
  // });
});
