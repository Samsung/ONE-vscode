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

import * as chai from 'chai';

import {JobRunner} from '../../Project/JobRunner';
import {WorkJobs} from '../../Project/WorkJobs';
import {obtainWorkspaceRoot} from '../../Utils/Helpers';
import {Logger} from '../../Utils/Logger';
import {MockupJob} from '../MockupJob';

const assert = chai.assert;

suite('Project', function() {
  suite('JobRunner', function() {
    const logger = new Logger();
    suite('#start()', function() {
      test('jobs are done', function(done) {
        let jobRunner = new JobRunner(logger);
        const workspaceRoot: string = obtainWorkspaceRoot();
        let workJobs = new WorkJobs();
        workJobs.push(new MockupJob('mockup'));
        workJobs.push(new MockupJob('mockup'));
        assert.strictEqual(workJobs.length, 2);

        // overwrite events so that multiple events will be emitted
        jobRunner.on('cleanup', function() {
          assert.strictEqual(workJobs.length, 0);
          done();
        });
        jobRunner.start(workspaceRoot, workJobs);
      });
    });
  });
});
