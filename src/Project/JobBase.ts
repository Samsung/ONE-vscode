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

import {Job} from './Job';
import {MixinInOutPaths} from './JobMixins';
import {ToolArgs} from './ToolArgs';

export class JobBase implements Job, MixinInOutPaths {
  jobType: Job.Type;
  name: string;
  inputPath: string;
  outputPath: string;

  constructor() {
    this.jobType = Job.Type.tUndefined;
    this.name = '(noname)';
    this.inputPath = '';
    this.outputPath = '';
  }

  public get valid(): boolean {
    throw Error('Invalid valid call');
  }

  public get tool(): string {
    throw Error('Invalid tool call');
  }

  public get toolArgs(): ToolArgs {
    throw Error('Invalid toolArgs call');
  }
}
