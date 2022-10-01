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

import {Logger} from '../Utils/Logger';

/* istanbul ignore next */
export class CircleException {
  static seeLogBtn = 'See log';

  static handleBtn(selection: string|undefined) {
    if (selection === CircleException.seeLogBtn) {
      Logger.show();
    }
    // Ignore 'OK' button
  }

  // Error notification message shows 'See log' button by default
  static error(msg: string, showSeeLogBtn: boolean = true) {
    let func = vscode.window.showErrorMessage;
    if (showSeeLogBtn) {
      func(msg, 'OK', CircleException.seeLogBtn).then(CircleException.handleBtn);
    } else {
      func(msg, 'OK');
    }
  }

  // Info notification message does not show 'See log' button by default
  static exceptionAlert(msg: string, showSeeLogBtn: boolean = false) {
    let func = vscode.window.showErrorMessage;
    if (showSeeLogBtn) {
      func(msg, 'OK', CircleException.seeLogBtn).then(CircleException.handleBtn);
    } else {
      func(msg, 'OK');
    }
  }

  // Warning notification message shows 'See log' button by default
  static warning(msg: string, showSeeLogBtn: boolean = true) {
    let func = vscode.window.showWarningMessage;
    if (showSeeLogBtn) {
      func(msg, 'OK', CircleException.seeLogBtn).then(CircleException.handleBtn);
    } else {
      func(msg, 'OK');
    }
  }
}
