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

import {JobRunner} from '../../Job/JobRunner';
import {WorkJobs} from '../../Job/WorkJobs';
import {MockJob} from '../MockJob';

suite('Job', function() {
  suite('JobRunner', function() {
    suite('@Use-onecc', function() {
      suite('#start()', function() {
        test('jobs are done', function(done) {
          let jobRunner = new JobRunner();
          let workJobs = new WorkJobs();
          workJobs.push(new MockJob('mockup'));
          workJobs.push(new MockJob('mockup'));
          assert.strictEqual(workJobs.length, 2);

          // overwrite events so that multiple events will be emitted
          jobRunner.on('cleanup', function() {
            assert.strictEqual(workJobs.length, 0);
            done();
          });
          jobRunner.start(workJobs);
        });
      });
    });
  });
});
