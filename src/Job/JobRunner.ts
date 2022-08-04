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

import {Logger} from '../Utils/Logger';

import {Job} from './Job';
import {ToolArgs} from './ToolArgs';
import {ToolRunner} from './ToolRunner';
import {WorkJobs} from './WorkJobs';

const K_INVOKE: string = 'invoke';
const K_CLEANUP: string = 'cleanup';

export class JobRunner extends EventEmitter {
  tag = this.constructor.name;  // logging tag
  jobs: WorkJobs = [];
  running: boolean = false;
  toolRunner: ToolRunner;
  private progressTimer?: NodeJS.Timeout;
  private progress?: vscode.Progress<{message?: string, increment?: number}>;

  constructor() {
    super();
    vscode.commands.executeCommand('setContext', 'one.job:running', this.running);
    this.toolRunner = new ToolRunner();

    this.on(K_INVOKE, this.onInvoke);
    this.on(K_CLEANUP, this.onCleanup);
  }

  private invoke(job: Job) {
    let tool: string = job.tool;
    let toolArgs: ToolArgs = job.toolArgs;
    let workDir: string = job.workDir;
    let success = job.successCallback;
    let failure = job.failureCallback;

    if (this.progress) {
      let message: string = `Running ${job.name}...`;
      if (job.notiTitle) {
        message = job.notiTitle;
      }
      this.progress.report({message: message});
    }

    Logger.info(this.tag, 'Run tool:', tool, 'args:', toolArgs, 'cwd:', workDir, 'root:', job.root);
    const runner = this.toolRunner.getRunner(job.name, tool, toolArgs, workDir, job.root);

    runner
        .then((value) => {
          if (value.intentionallyKilled) {
            Logger.info(this.tag, 'The job was cancelled.');
            this.emit(K_CLEANUP);
            return;
          }

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
          Logger.error(this.tag, 'The job was failed.');
          this.emit(K_CLEANUP);
        });
  }

  private onInvoke() {
    let job = this.jobs.shift();
    if (job === undefined) {
      Logger.info(this.tag, 'All jobs have been completed.');
      this.emit(K_CLEANUP);
      return;
    }
    this.invoke(job);
  }

  private onCleanup() {
    this.running = false;
    vscode.commands.executeCommand('setContext', 'one.job:running', this.running);
    process.env.userp = '';
  }

  public start(jobs: WorkJobs) {
    // TODO maybe there is better way to handle already running jobs
    if (this.running) {
      Logger.error(this.tag, 'The job is in progress.');
      return;
    }

    // Show the cancel button if all jobs are cancelable.
    let isCancellable = false;
    const jobCancelable = jobs.filter((value) => value.isCancelable);
    if (jobCancelable.length === jobs.length) {
      isCancellable = true;
    }

    Logger.show();
    vscode.window.withProgress(
        {location: vscode.ProgressLocation.Notification, cancellable: isCancellable},
        (progress, token) => {
          // TODO(jyoung): Implement to request cancel job.
          token.onCancellationRequested(() => {
            this.toolRunner.kill();
          });

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
    vscode.commands.executeCommand('setContext', 'one.job:running', this.running);
    this.jobs = jobs;
    this.emit(K_INVOKE);
  }
}
