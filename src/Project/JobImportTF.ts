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
import {JobImport} from './JobImport';
import {ToolArgs} from './ToolArgs';

export class JobImportTF extends JobImport {
  inputArrays?: string = undefined;
  outputArrays?: string = undefined;
  inputShapes?: string = undefined;
  converterVersion?: string = undefined;
  modelFormat?: string = undefined;
  saveIntermediate?: boolean = undefined;

  constructor() {
    super();
    this.jobType = Job.Type.tImportTF;
  }

  public get valid() {
    // TODO validate arguments;
    return true;
  }

  public get tool() {
    return 'one-import-tf';
  }

  public get toolArgs() {
    let args = new ToolArgs();

    // mandatory arguments
    args.add('--input_path', this.inputPath);
    args.add('--output_path', this.outputPath);

    // optional arguments
    args.add('--input_arrays', this.inputArrays);
    args.add('--output_arrays', this.outputArrays);
    args.add('--input_shapes', this.inputShapes);
    args.add('--converter_version', this.converterVersion);
    args.add('--model_format', this.modelFormat);
    if (this.saveIntermediate) {
      args.push('--save_intermediate');
    }

    console.log('args = ', args);

    return args;
  }
}
