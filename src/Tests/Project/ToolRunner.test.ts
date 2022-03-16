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
import * as path from 'path';

import {ToolRunner} from '../../Project/ToolRunner';
import {obtainWorkspaceRoot} from '../../Utils/Helpers';
import {Logger} from '../../Utils/Logger';
import {MockupJob} from '../MockupJob';

const assert = chai.assert;

suite('Project', function() {
  suite('ToolRunner', function() {
    const logger = new Logger();
    suite('#getToolPath()', function() {
      test('returns tool path as string', function() {
        let toolRunner = new ToolRunner(logger);
        let job = new MockupJob('mockup');
        let tool = job.tool;
        let toolPath = path.join('/usr/share/one/bin', tool);
        assert.strictEqual(toolRunner.getToolPath(tool), toolPath);
      });
    });
    suite('#getRunner()', function() {
      test('returns runner as Promise<string>', function(done) {
        let toolRunner = new ToolRunner(logger);
        let job = new MockupJob('mockup');
        let tool = job.tool;
        const toolPath = toolRunner.getToolPath(tool);
        // toolPath could be string or undefined. Avoid compiling error
        if (toolPath === undefined) {
          assert.fail('toolPath should be string type');
          return;
        }
        console.log(toolPath);
        const toolArgs = job.toolArgs;
        console.log(toolArgs);
        const workspaceRoot: string = obtainWorkspaceRoot();
        const runner = toolRunner.getRunner(tool, toolPath, toolArgs, workspaceRoot);
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
