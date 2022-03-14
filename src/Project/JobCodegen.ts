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
import {JobBase} from './JobBase';
import {ToolArgs} from './ToolArgs';

export class JobCodegen extends JobBase {
  backend: string = '';
  command?: string = undefined;
  // NOTE codegen inputPath, outputPath are not mandatory
  // TODO revise 'dummy-compile' manual copy somehow
  // NOTE for testing res/samples/cfg/inception_v3.cfg,
  //      need to copy 'dummy-compile' file in /(one-install-path)/test to
  //      /(one-install-path)/backends/dummy, which should look like this;
  //
  //        $ tree | more
  //        .
  //        ├── backends
  //        │   └── dummuy
  //        │       ├── dummy-compile
  //        │       └── dummy-profile
  //        ├── bin
  //        │   ├── circle2circle
  //
  constructor() {
    super();
    this.jobType = Job.Type.tCodegen;
  }

  public get valid() {
    if (this.backend === '') {
      console.log('JobCodegen: backend not set');
      return false;
    }
    return true;
  }

  public get tool() {
    return 'one-codegen';
  }

  public get toolArgs() {
    let args = new ToolArgs();

    // mandatory arguments
    args.add('--backend', this.backend);

    // backend specific arguments
    if (this.command !== undefined) {
      args.push('--');
      let cmds = this.command.split(' ');
      for (let i = 0; i < cmds.length; i++) {
        args.push(cmds[i]);
      }
    }

    return args;
  }
}
