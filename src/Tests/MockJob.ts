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

import {Job, JobType} from '../Job/Job';
import {ToolArgs} from '../Job/ToolArgs';

class MockJob implements Job {
  jobType: JobType = JobType.tUndefined;
  name: string;
  root: boolean = false;
  workDir: string = require('os').homedir();
  isCancelable: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  public get valid(): boolean {
    return true;
  }

  public get tool(): string {
    return 'ls';
  }

  public get toolArgs(): ToolArgs {
    let args = new ToolArgs();
    args.push('-al');
    return args;
  }
}

class MockFailedJob implements Job {
  jobType: JobType = JobType.tUndefined;
  name: string;
  root: boolean = false;
  workDir: string = require('os').homedir();
  isCancelable: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  public get valid(): boolean {
    return true;
  }

  public get tool(): string {
    return 'lss';
  }

  public get toolArgs(): ToolArgs {
    let args = new ToolArgs();
    args.push('-h');
    return args;
  }
}

export {MockJob, MockFailedJob};
