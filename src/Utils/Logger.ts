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
  static outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('ONE-VSCode');
  static firstFocus: boolean;

  // TODO Remove code in comment. These lines were commented out for easy review.
  /*
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
*/
  private static checkShow() {
    if (Logger.firstFocus) {
      Logger.outputChannel.show(false);
      Logger.firstFocus = false;
    }
  }

  public static outputWithTime(msg: string) {
    let dateTime = new Date();
    Logger.checkShow();
    Logger.outputChannel.appendLine('[' + dateTime.toLocaleString() + '] ' + msg);
  }

  public static output(msg: string) {
    Logger.checkShow();
    Logger.outputChannel.append(msg);
  }

  public static outputLine(msg: string) {
    Logger.checkShow();
    Logger.outputChannel.appendLine(msg);
  }
}
