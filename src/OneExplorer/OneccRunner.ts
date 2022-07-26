/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
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
import * as path from 'path';
import * as vscode from 'vscode';

import {ToolArgs} from '../Job/ToolArgs';
import {SuccessResult, ToolRunner} from '../Job/ToolRunner';
import {Balloon} from '../Utils/Balloon';

/* istanbul ignore next */
export class OneccRunner extends EventEmitter {
  private startRunningOnecc: string = 'START_RUNNING_ONECC';
  private finishedRunningOnecc: string = 'FINISHED_RUNNING_ONECC';

  private toolRunner: ToolRunner;

  constructor(private cfgUri: vscode.Uri) {
    super();
    this.toolRunner = new ToolRunner();
  }

  /**
   * Function called when one.explorer.runCfg is called (when user clicks 'Run' on cfg file).
   */
  public run() {
    this.on(this.startRunningOnecc, this.onStartRunningOnecc);
    this.on(this.finishedRunningOnecc, this.onFinishedRunningOnecc);

    const toolArgs = new ToolArgs('-C', this.cfgUri.fsPath);
    const cwd = path.dirname(this.cfgUri.fsPath);
    let oneccPath = this.toolRunner.getOneccPath();
    if (oneccPath === undefined) {
      throw new Error('Cannot find installed onecc');
    }

    const runnerPromise = this.toolRunner.getRunner('onecc', oneccPath, toolArgs, cwd);
    this.emit(this.startRunningOnecc, runnerPromise);
  }

  private onStartRunningOnecc(runnerPromise: Promise<SuccessResult>) {
    const progressOption: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: `Running: 'onecc --config ${this.cfgUri.fsPath}'`,
      cancellable: true
    };

    // Show progress UI
    vscode.window.withProgress(progressOption, (progress, token) => {
      token.onCancellationRequested(() => {
        this.toolRunner.kill();
      });

      const p = new Promise<void>((resolve, reject) => {
        runnerPromise
            .then((value: SuccessResult) => {
              resolve();
              this.emit(this.finishedRunningOnecc, value);
            })
            .catch(value => {
              Balloon.error(`Error occured while running: 'onecc --config ${this.cfgUri.fsPath}'`);
              reject();
            });
      });

      return p;
    });
  }

  private onFinishedRunningOnecc(val: SuccessResult) {
    if (val.exitCode !== undefined && val.exitCode === 0) {
      Balloon.info(`Successfully completed.`);
    } else if (val.intentionallyKilled !== undefined && val.intentionallyKilled === true) {
      Balloon.info(`The job was cancelled.`);
    } else {
      throw Error('unexpected value onFinishedRunningOnecc');
    }
  }
}
