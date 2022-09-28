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

import {Command} from '../../Backend/Command';
import {JobType} from '../../Job/Job';
import {JobInstall} from '../../Toolchain/JobInstall';

suite('Toolchain', function() {
  suite('JobInstall', function() {
    suite('#constructor()', function() {
      test('is contructed with command', function() {
        let cmd = new Command('apt-get');
        cmd.push('install');
        cmd.push('pkgname');

        let job = new JobInstall(cmd);
        assert.deepStrictEqual(job.tool, cmd[0]);
        assert.deepStrictEqual(job.toolArgs[0], cmd[1]);
        assert.deepStrictEqual(job.toolArgs[1], cmd[2]);
        assert.deepStrictEqual(job.name, 'install');
        assert.equal(job.jobType, JobType.tInstall);
        assert.isTrue(job.valid);
      });
    });
  });
});
