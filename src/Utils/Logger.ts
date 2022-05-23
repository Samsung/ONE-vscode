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

import * as vscode from 'vscode';

export class Logger {
  outputChannel: vscode.OutputChannel;
  firstFocus: boolean;

  private static logger: Logger|null = null;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('ONE-VSCode');
    this.firstFocus = true;
  }

  public static getInstance(): Logger {
    if (Logger.logger === null) {
      Logger.logger = new Logger();
    }

    return Logger.logger;
  }

  private checkShow() {
    if (this.firstFocus) {
      this.outputChannel.show(false);
      this.firstFocus = false;
    }
  }

  // deprecate. replace to error(), warning(), info, or debug()
  public outputWithTime(msg: string) {
    let dateTime = new Date();
    this.checkShow();
    this.outputChannel.appendLine('[' + dateTime.toLocaleString() + '] ' + msg);
  }

  // deprecate. replace to append()
  public output(msg: string) {
    this.checkShow();
    this.outputChannel.append(msg);
  }

  // deprecate
  public outputLine(msg: string) {
    this.checkShow();
    this.outputChannel.appendLine(msg);
  }

  private log(severity: string, tag: string, msg: string) {
    const time = new Date().toLocaleString();

    this.checkShow();
    this.outputChannel.appendLine(`[${time}][${tag}][${severity}] ${msg}`);
  }

  /**
   * @brief Print log in '[time][tag][severity] msg' format where severity = 'err'
   */
  public error(tag: string, msg: string) {
    const severity = 'err';
    this.log(severity, tag, msg);
  }

  /**
   * @brief Print log in '[time][tag][severity] msg' format where severity = 'warn'
   */
  public warn(tag: string, msg: string) {
    const severity = 'warn';
    this.log(severity, tag, msg);
  }

  /**
   * @brief Print log in '[time][tag][severity] msg' format where severity = 'info'
   */
  public info(tag: string, msg: string) {
    const severity = 'info';
    this.log(severity, tag, msg);
  }

  /**
   * @brief Print log in '[time][tag][severity] msg' format where severity = 'debug'
   */
  public debug(tag: string, msg: string) {
    const severity = 'debug';
    this.log(severity, tag, msg);
  }

  /**
   * @brief Print msg without adding '[time][tag][severity]'
   * @detail When log is long and need to be splitted into many chunks, append() could be used
   *         after the first chunk.
   */
  public append(msg: string) {
    this.checkShow();
    this.outputChannel.appendLine(msg);
  }
}
