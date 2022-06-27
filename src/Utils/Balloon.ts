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

import {Logger} from './Logger';

export class Balloon {
  static seeLogBtn = 'See logs';

  static handleBtn(selection: string|undefined) {
    if (selection === Balloon.seeLogBtn) {
      Logger.show();
    }
    // Ignore 'OK' button
  }

  static error(msg: string) {
    vscode.window.showErrorMessage(msg, 'OK', Balloon.seeLogBtn).then(Balloon.handleBtn);
  }

  static info(msg: string) {
    vscode.window.showInformationMessage(msg, 'OK', Balloon.seeLogBtn).then(Balloon.handleBtn);
  }

  static warning(msg: string) {
    vscode.window.showWarningMessage(msg, 'OK', Balloon.seeLogBtn).then(Balloon.handleBtn);
  }
}
