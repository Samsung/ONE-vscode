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

import {ToolArgs} from './ToolArgs';

export interface Job {
  jobType: Job.Type;
  name: string;
  valid: boolean;
  tool: string;
  toolArgs: ToolArgs;
}

export namespace Job {

export const enum Type {
  tUndefined = 0,  // TODO maybe use Job.jobType = undefined?
  tImportTF = 1,
  tImportTFLite,
  tImportONNX,
  tImportBCQ,
  tOptimize,
  tQuantize,
  tPack,
  tCodegen,
  // TODO add more
}

}  // namespace Job
