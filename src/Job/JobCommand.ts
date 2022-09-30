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

import assert from 'assert';

import {Command} from '../Backend/Command';

import {Job, JobCallback, JobType} from './Job';
import {ToolArgs} from './ToolArgs';

// NOTE: JobBase will be replaced by this
class JobCommand implements Job {
  jobType: JobType;
  name: string;
  notiTitle?: string;
  valid: boolean;
  tool: string;
  toolArgs: ToolArgs;
  root: boolean;
  workDir: string;
  isCancelable: boolean;
  successCallback?: JobCallback;
  failureCallback?: JobCallback;

  constructor(cmd: Command) {
    // should be implemented by child classes
    this.jobType = JobType.tUndefined;
    this.name = '';
    this.valid = false;
    this.workDir = require('os').homedir();
    this.isCancelable = false;

    // init by cmd
    assert(cmd.length > 0);
    this.tool = cmd[0];
    this.toolArgs = new ToolArgs();
    for (let i = 1; i < cmd.length; i++) {
      this.toolArgs.push(cmd[i]);
    }
    this.root = cmd.root;
  }
}

export {JobCommand};
