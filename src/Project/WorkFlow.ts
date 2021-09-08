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

import {Logger} from '../Utils/Logger';
import {JobRunner} from './JobRunner';
import {WorkJobs} from './WorkJobs';

export class WorkFlow {
  logger: Logger;
  workspace: string;
  jobs: WorkJobs;
  jobRunner: JobRunner;

  constructor(logger: Logger) {
    this.logger = logger;
    this.workspace = '';
    this.jobs = new WorkJobs();
    this.jobRunner = new JobRunner(this.logger);
  }

  public start(workspace: string) {
    this.workspace = workspace;
    // TODO implement
  }
}
