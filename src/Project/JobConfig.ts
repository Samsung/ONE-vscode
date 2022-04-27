/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

import {Command} from './Command';
import {Job} from './Job';
import {JobBase} from './JobBase';
import {ToolArgs} from './ToolArgs';

export class JobConfig extends JobBase {
  cmd: Command;
  constructor(cmd: Command) {
    super();
    this.jobType = Job.Type.tConfig;
    this.cmd = cmd;
  }

  public get valid() {
    // TODO validate arguments;
    return true;
  }

  public get driver() {
    return this.cmd.strs()[0];
  }

  public get tool() {
    return '';
  }

  public get toolArgs() {
    let args = new ToolArgs();
    this.cmd.strs().slice(1).map(item => args.push(item));
    return args;
  }
};
