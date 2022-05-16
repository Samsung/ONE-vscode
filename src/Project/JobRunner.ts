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
import * as vscode from 'vscode';

import {Balloon} from '../Utils/Balloon';
import {Logger} from '../Utils/Logger';

import {Job} from './Job';
import {ToolArgs} from './ToolArgs';
import {ToolRunner} from './ToolRunner';
import {WorkJobs} from './WorkJobs';

const K_INVOKE: string = 'invoke';
const K_CLEANUP: string = 'cleanup';

export class JobRunner extends EventEmitter {
  logger: Logger;
  jobs: WorkJobs = [];
  cwd: string = '';
  running: boolean = false;
  toolRunner: ToolRunner;
  private progressTimer?: NodeJS.Timeout;
  private progress?: vscode.Progress<{message?: string, increment?: number}>;

  constructor(l: Logger) {
    super();
    this.logger = l;
    this.toolRunner = new ToolRunner(l);

    this.on(K_INVOKE, this.onInvoke);
    this.on(K_CLEANUP, this.onCleanup);
  }

  private invoke(job: Job, path: string) {
    let tool: string = job.tool;
    let toolArgs: ToolArgs = job.toolArgs;
    let success = job.successCallback;
    let failure = job.failureCallback;

    if (this.progress) {
      this.progress.report({message: `Running ${job.name}...`});
    }

    // TODO: Remove this and deprecate old Jobs like JobQuantize
    if (job.jobType >= Job.Type.tImportTF && job.jobType <= Job.Type.tCodegen) {
      // This is tricky. Now old jobs like `JobQuantize` are
      // tool: quantize, toolArgs: options
      // and the `tool` & `toolArgs` are only getter(not setter.)
      // So the `quantize` is shifted to new ToolArgs.
      // This trick will be disappeared after Old jobs are removed
      toolArgs.unshift(tool);
      tool = 'onecc';
    }

    console.log('Run tool: ', tool, ' args: ', toolArgs, ' cwd: ', path, ' root: ', job.root);
    const runner = this.toolRunner.getRunner(job.name, tool, toolArgs, path, job.root);

    runner
        .then(() => {
          if (success !== undefined) {
            success();
          }
          // Move on to next job
          this.emit(K_INVOKE);
        })
        .catch(() => {
          if (failure !== undefined) {
            failure();
          }
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
    this.invoke(job, this.cwd);
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

    vscode.window.withProgress(
        {location: vscode.ProgressLocation.Notification, title: 'Running...', cancellable: false},
        (progress) => {
          // TODO(jyoung): Implement to request cancel job.
          return new Promise<void>(resolve => {
            this.progress = progress;
            this.progressTimer = setInterval(() => {
              if (!this.running) {
                if (this.progressTimer) {
                  clearInterval(this.progressTimer);
                  resolve(undefined);
                }
              }
            }, 1000);
          });
        });

    this.running = true;
    this.jobs = jobs;
    this.cwd = path;
    this.emit(K_INVOKE);
  }
}
