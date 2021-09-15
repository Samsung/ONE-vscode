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

import {Balloon} from '../Utils/Balloon';
import {Logger} from '../Utils/Logger';
import {Job} from './Job';
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

  private validateJobs(): boolean {
    let isValid = true;
    this.jobs.forEach((job) => {
      if (!job.valid) {
        Balloon.error('Job ' + job.name + ' is not valid');
        isValid = false;
      }
    });
    return isValid;
  }

  // Make copy of Jobs for running as it will alter while running
  private getRunJobs(): WorkJobs {
    let runJobs = new WorkJobs();
    this.jobs.forEach((job) => {
      runJobs.push(job);
    });
    return runJobs;
  }

  private startRunner() {
    let runJobs: WorkJobs = this.getRunJobs();
    this.jobRunner.start(this.workspace, runJobs);
  }

  public addJob(job: Job) {
    this.jobs.push(job);
  }

  public clearJobs() {
    while (this.jobs.length) {
      this.jobs.pop();
    }
  }

  public start(workspace: string) {
    this.workspace = workspace;
    if (!this.validateJobs()) {
      return;
    }
    this.startRunner();
  }
}
