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
import {Job} from '../../Project/Job';
import {JobCodegen} from '../../Project/JobCodegen';

suite('Project', function() {
  suite('JobCodegen', function() {
    suite('#contructor()', function() {
      test('is contructed with jobtype', function() {
        let job = new JobCodegen();
        assert.equal(job.jobType, Job.Type.tCodegen);
      });
    });
    suite('#valid()', function() {
      test('returns false when backend is null', function() {
        let job = new JobCodegen();
        assert.isFalse(job.valid);
      });
      test('returns true when backend is not null', function() {
        let job = new JobCodegen();
        job.backend = 'dummy';
        assert.isTrue(job.valid);
      });
    });
    suite('#tool()', function() {
      test('returns toolname as string', function() {
        let job = new JobCodegen();
        let toolName = 'one-codegen';
        assert.strictEqual(job.tool, toolName);
      });
    });
    suite('#toolArgs()', function() {
      test('returns args as ToolArgs', function() {
        let backend = 'dummy';
        let arg0 = 'arg0';
        let arg1 = 'arg1';

        let job = new JobCodegen();
        job.backend = backend;
        job.command = arg0 + ' ' + arg1;
        assert.isTrue(job.valid);

        let expected: Array<string> = ['--backend', backend, '--', arg0, arg1];
        let args = job.toolArgs;
        assert.includeOrderedMembers(args, expected);
      });
    });
  });
});
