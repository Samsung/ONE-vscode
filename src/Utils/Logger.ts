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

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('ONE-VSCode');
    this.firstFocus = true;
  }

  private checkShow() {
    if (this.firstFocus) {
      this.outputChannel.show(false);
      this.firstFocus = false;
    }
  }

  public outputWithTime(msg: string) {
    let dateTime = new Date();
    this.checkShow();
    this.outputChannel.appendLine('[' + dateTime.toLocaleString() + '] ' + msg);
  }

  public output(msg: string) {
    this.checkShow();
    this.outputChannel.append(msg);
  }

  public outputLine(msg: string) {
    this.checkShow();
    this.outputChannel.appendLine(msg);
  }
}
