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

type MsgList = (number|boolean|string|object)[];

export class Logger {
  static outputChannel = vscode.window.createOutputChannel('ONE-VSCode');
  static firstFocus: boolean;

  private static checkShow() {
    if (Logger.firstFocus) {
      Logger.outputChannel.show(false);
      Logger.firstFocus = false;
    }
  }

  private static log(severity: string, tag: string, ...msgs: MsgList) {
    let logStrList = [];

    for (var i = 0; i < msgs.length; i++) {
      // ref: https://stackoverflow.com/q/5612787
      if (typeof (msgs[i]) === 'object') {
        logStrList.push(JSON.stringify(msgs[i]));
      } else {
        logStrList.push(`${msgs[i]}`);
      }
    }
    const msg = logStrList.join(' ');
    const time = new Date().toLocaleString();

    Logger.checkShow();
    Logger.outputChannel.appendLine(`[${time}][${tag}][${severity}] ${msg}`);
  }

  /**
   * @brief Print log with prefix '[time][tag][severity]' where severity = 'err'
   */
  public static error(tag: string, ...msgs: MsgList) {
    const severity = 'err';
    Logger.log(severity, tag, ...msgs);
  }

  /**
   * @brief Print log with prefix '[time][tag][severity]' where severity = 'warn'
   */
  public static warn(tag: string, ...msgs: MsgList) {
    const severity = 'warn';
    Logger.log(severity, tag, ...msgs);
  }

  /**
   * @brief Print log with prefix '[time][tag][severity]' where severity = 'info'
   */
  public static info(tag: string, ...msgs: MsgList) {
    const severity = 'info';
    Logger.log(severity, tag, ...msgs);
  }

  /**
   * @brief Print log with prefix '[time][tag][severity]' where severity = 'debug'
   */
  public static debug(tag: string, ...msgs: MsgList) {
    const severity = 'debug';
    Logger.log(severity, tag, ...msgs);
  }

  /**
   * @brief Print msg and a line feed character without adding '[time][tag][severity]'
   * @detail When log is long and need to be splitted into many chunks, append() could be used
   *         after the first chunk.
   */
  public static appendLine(msg: string) {
    Logger.checkShow();
    Logger.outputChannel.appendLine(msg);
  }

  /**
   * @brief Print msg without adding '[time][tag][severity]'
   * @detail When log is long and need to be splitted into many chunks, append() could be used
   *         after the first chunk.
   */
  public static append(msg: string) {
    Logger.checkShow();
    Logger.outputChannel.append(msg);
  }
}
