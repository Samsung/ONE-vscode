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

import * as vscode from "vscode";

type MsgList = (number | boolean | string | object)[];

const isDebugMode = process.env.VSCODE_DEBUG_MODE === "true";

/**
 * @Examples:
 *
 * _logStr('info', 'ut_test', 'first_message', 10, new Foo(10), new Error('watch out')
 *  where Foo has one var 'bar' will return the following:
 *
 * [8/3/2022, 12:25:23 PM][ut_teset][info] first_message 10
 * Foo: {"bar":10}       <--- object
 * Error was thrown:     <--- Error
 * - name: Error
 * - message: watch out
 */
function _logStr(severity: string, tag: string, ...msgs: MsgList) {
  if (msgs.length === 0) {
    // Do not print
    return "";
  }

  const flatten = (msgs: MsgList) => {
    let logStrList = [];
    for (let m of msgs) {
      if (m instanceof Error) {
        const err = m as Error;
        logStrList.push(
          `\nError was thrown:\n- name: ${err.name}\n- message: ${err.message}`
        );
      } else if (typeof m === "object") {
        logStrList.push(`\n${m.constructor.name}: ${JSON.stringify(m)}`);
      } else {
        logStrList.push(`${m}`);
      }
    }
    return logStrList.join(" ");
  };

  const redact = (msg: string) => {
    // Replace Github Personal Access Tokens with ********
    const classicPAT = "ghp_[a-zA-Z0-9]+";
    const findGrainedPAT = "github_pat_[a-zA-Z0-9_]+";
    const regex = new RegExp(`(${classicPAT})|(${findGrainedPAT})`, "g");

    return msg.replace(regex, "*********************");
  };

  const msg = redact(flatten(msgs));
  const time = new Date().toLocaleString();

  return `[${time}][${tag}][${severity}] ${msg}`;
}

// Import this only for unit test
export { _logStr as _unit_test_logStr };

/* istanbul ignore next */
export class Logger {
  static outputChannel = vscode.window.createOutputChannel("ONE-VSCode");
  static firstFocus: boolean;

  private static checkShow() {
    if (Logger.firstFocus) {
      Logger.outputChannel.show(false);
      Logger.firstFocus = false;
    }
  }

  private static log(severity: string, tag: string, ...msgs: MsgList) {
    Logger.checkShow();
    Logger.outputChannel.appendLine(_logStr(severity, tag, ...msgs));
  }

  /**
   * @brief Print log with prefix '[time][tag][severity]' where severity = 'err'
   */
  public static error(tag: string, ...msgs: MsgList) {
    const severity = "err";
    Logger.log(severity, tag, ...msgs);
  }

  /**
   * @brief Print log with prefix '[time][tag][severity]' where severity = 'warn'
   */
  public static warn(tag: string, ...msgs: MsgList) {
    const severity = "warn";
    Logger.log(severity, tag, ...msgs);
  }

  /**
   * @brief Print log with prefix '[time][tag][severity]' where severity = 'info'
   */
  public static info(tag: string, ...msgs: MsgList) {
    const severity = "info";
    Logger.log(severity, tag, ...msgs);
  }

  /**
   * @brief Print log with prefix '[time][tag][severity]' where severity = 'debug'
   */
  public static debug(tag: string, ...msgs: MsgList) {
    if (isDebugMode) {
      const severity = "debug";
      Logger.log(severity, tag, ...msgs);
    }
  }

  /**
   * @brief Print msg and a line feed character without adding '[time][tag][severity]'
   * @detail When log is long and need to be splitted into many chunks, append() could be used
   *         after the first chunk.
   *
   * @todo streamify logger to format consistently (ex. redact is not applied to this function)
   */
  public static appendLine(msg: string) {
    Logger.checkShow();
    Logger.outputChannel.appendLine(msg);
  }

  /**
   * @brief Print msg without adding '[time][tag][severity]'
   * @detail When log is long and need to be splitted into many chunks, append() could be used
   *         after the first chunk.
   *
   * @todo streamify logger to format consistently (ex. redact is not applied to this function)
   */
  public static append(msg: string) {
    Logger.checkShow();
    Logger.outputChannel.append(msg);
  }

  public static show() {
    Logger.outputChannel.show(true);
  }
}
