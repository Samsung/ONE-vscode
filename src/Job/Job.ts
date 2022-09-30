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

export type JobCallback = {
  (): void;
};

export interface Job {
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
}
// TODO
// In the future, Job will be changed like
// Ex1) onecc --config model.cfg
// - tool: onecc
// - toolArgs: --config, model.cfg
// Ex2) apt-get install pkg_name
// - tool: apt-get
// - toolArgs: install pkg_name

export const enum JobType {
  tUndefined = 0,  // TODO maybe use Job.jobType = undefined?
  tConfig,
  tPrerequisites,
  tInstall,
  tUninstall,
  // TODO add more
}
