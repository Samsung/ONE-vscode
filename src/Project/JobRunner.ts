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

import {EventEmitter} from 'events';

import {Balloon} from '../Utils/Balloon';
import {Logger} from '../Utils/Logger';

import {ToolArgs} from './ToolArgs';
import {ToolRunner} from './ToolRunner';
import {WorkJobs} from './WorkJobs';

const K_INVOKE: string = 'invoke';
const K_CLEANUP: string = 'cleanup';

export class JobRunner extends EventEmitter {
  logger: Logger;
  jobs: WorkJobs;
  cwd: string;
  running: boolean;
  toolRunner: ToolRunner;

  constructor(l: Logger) {
    super();
    this.logger = l;
    this.jobs = [];
    this.cwd = '';
    this.running = false;
    this.toolRunner = new ToolRunner(l);

    this.on(K_INVOKE, this.onInvoke);
    this.on(K_CLEANUP, this.onCleanup);
  }

  private invoke(name: string, tool: string, toolArgs: ToolArgs, path: string) {
    const runner = this.toolRunner.getRunner(name, tool, toolArgs, path);

    runner
        .then(() => {
          // Move on to next job
          this.emit(K_INVOKE);
        })
        .catch(() => {
          Balloon.error('Running ONE failed');
          this.emit(K_CLEANUP);
        });
  }

  private onInvoke() {
    let job = this.jobs.shift();
    if (job === undefined) {
      this.logger.outputWithTime('Finish Running ONE compilers.');
      this.emit(K_CLEANUP);
      return;
    }
    this.invoke(job.name, job.tool, job.toolArgs, this.cwd);
  }

  private onCleanup() {
    this.running = false;
  }

  public start(path: string, jobs: WorkJobs) {
    // TODO maybe there is better way to handle already running jobs
    if (this.running) {
      Balloon.error('ONE compile in progress');
      return;
    }
    this.running = true;
    this.jobs = jobs;
    this.cwd = path;
    this.emit(K_INVOKE);
  }
}
