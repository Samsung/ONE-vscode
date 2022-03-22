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
import {Builder} from '../../Project/Builder';
import {Logger} from '../../Utils/Logger';
import {MockJob} from '../MockJob';

suite('Project', function() {
  suite('Builder', function() {
    const logger = new Logger();
    suite('#contructor()', function() {
      test('is contructed with Logger', function() {
        let builder = new Builder(logger);
        assert.isObject<Builder>(builder);
      });
    });

    suite('#init()', function() {
      test('inits members of Builder', function() {
        let builder = new Builder(logger);
        builder.init();
        assert.equal(builder.workFlow.jobs.length, 0);
      });
    });

    suite('#addJob()', function() {
      test('adds job', function() {
        let builder = new Builder(logger);
        builder.init();
        assert.equal(builder.workFlow.jobs.length, 0);
        let job = new MockJob('job0');
        builder.addJob(job);
        assert.equal(builder.workFlow.jobs.length, 1);
      });
    });

    suite('#clearJobs()', function() {
      test('clears jobs', function() {
        let builder = new Builder(logger);
        builder.init();
        assert.equal(builder.workFlow.jobs.length, 0);
        let job = new MockJob('job0');
        builder.addJob(job);
        assert.equal(builder.workFlow.jobs.length, 1);
        builder.clearJobs();
        assert.equal(builder.workFlow.jobs.length, 0);
      });
    });

    // TODO: build(context), import(context)
    // Q. How to handle `vscode.ExtensionContext context`?
  });
});
