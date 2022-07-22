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

import * as vscode from 'vscode';
import {Logger} from '../Utils/Logger';

type Task = (resolve: (value: unknown) => void, reject: (reason?: any) => void) => unknown;

const logTag = 'InfernceShowBox';

/* istanbul ignore next */
class InfernceShowBox {
  constructor() {}

  private async showProgressWith(task: Task): Promise<void> {
    await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Inference Running!',
          cancellable: true
        },
        (progress, token) => {
          token.onCancellationRequested(() => {
            Logger.info(logTag, 'User canceled the log running operation');
          });
          return new Promise((resolve, reject) => {
            return task(resolve, reject);
          });
        });
  }

  async showInference(task: Task, successMsg: string, failedMsg: string) {
    this.showProgressWith(task).then(
        () => vscode.window.showInformationMessage(successMsg, {title: 'OK'})),
        // TODO: Find if the message includes new line character.
        () => vscode.window.showErrorMessage(failedMsg, {title: 'Close'});
  }
}

export {Task, InfernceShowBox};
