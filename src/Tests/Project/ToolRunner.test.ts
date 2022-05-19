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

import {ToolRunner} from '../../Project/ToolRunner';
import {obtainWorkspaceRoot} from '../../Utils/Helpers';
import {Logger} from '../../Utils/Logger';
import {MockJob} from '../MockJob';

suite('Project', function() {
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
      suite('#getRunner()', function() {
        test('returns runner as Promise<string>', function(done) {
          let job = new MockJob('mockup');
          let toolRunner = new ToolRunner();
          const oneccPath = toolRunner.getOneccPath();
          // oneccPath could be string or undefined. Avoid compiling error
          if (oneccPath === undefined) {
            assert.fail('oneccPath should be string type');
          }
          const workspaceRoot: string = obtainWorkspaceRoot();
          const runner = toolRunner.getRunner(job.name, oneccPath, job.toolArgs, workspaceRoot);
          assert.isNotNull(runner);
          runner
              .then(function(str) {
                assert.ok(str);
                done();
              })
              .catch(done);
        });
      });
    });
  });
});
