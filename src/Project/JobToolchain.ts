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

import {Command} from './Command';
import {Job} from './Job';
import {JobBase} from './JobBase';
import {ToolArgs} from './ToolArgs';

class JobToolchain extends JobBase {
  cmd: Command;
  constructor(type: Job.Type, cmd: Command) {
    super();
    this.jobType = type;
    this.cmd = cmd;

    assert(this.jobType >= Job.Type.tInstall && this.jobType <= Job.Type.tInstalled);
    assert(this.cmd.strs.length >= 3);
  }

  public get valid() {
    // TODO validate arguments;
    return true;
  }

  public get driver() {
    return this.cmd.strs()[0];
  }

  public get tool() {
    return this.cmd.strs()[1];
  }

  public get toolArgs() {
    let args = new ToolArgs();
    args.concat(this.cmd.strs().slice(2));
    return args;
  }
};

class JobInstall extends JobToolchain {
  constructor(cmd: Command) {
    super(Job.Type.tInstall, cmd);
  }
};

class JobUninstall extends JobToolchain {
  constructor(cmd: Command) {
    super(Job.Type.tUninstall, cmd);
  }
};

class JobInstalled extends JobToolchain {
  constructor(cmd: Command) {
    super(Job.Type.tInstalled, cmd);
  }
};

export {JobInstall, JobUninstall, JobInstalled};
