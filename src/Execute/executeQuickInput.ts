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

import {exec} from 'child_process';
import {appendFileSync} from 'fs';
import * as vscode from 'vscode';

import {Backend} from '../Backend/API';
import {Logger} from '../Utils/Logger';

import {collectInputs} from './InferenceQuickInput';


const logTag = 'runInferenceQuickInput';

type Task = (resolve: (value: unknown) => void, reject: (reason?: any) => void) => unknown;

async function showProgressWith(task: Task): Promise<void> {
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

async function showInference(task: Task, successMsg: string, failedMsg: string) {
  showProgressWith(task).then(
      () => vscode.window.showInformationMessage(successMsg, {title: 'OK'})),
      // TODO: Find if the message includes new line character.
      () => vscode.window.showErrorMessage(failedMsg, {title: 'Close'});
}

async function runInference(
    backend: Backend, modelPath: vscode.Uri, inputSpec: string): Promise<void> {
  let cmd = backend.executor() ?.runInference(modelPath.path, ['--input-spec', inputSpec]);
  let outFileName: string = `${modelPath.path}.infer.log`;

  const task: Task = (resolve, reject) => {
    exec(cmd?.str() + ' > ' + outFileName, (error, stdout, stderr) => {
      if (error) {
        appendFileSync(outFileName, error.message);
        return reject(error.message);
      }
      // Some of warnings are treated as error.
      // TODO: handle the stderr
      // if (stderr) return reject(stderr);
      else {
        return resolve(stdout);
      }
    });
  };

  // show ui
  await showInference(
      task, `Inference succeeded! You can find the log at ${outFileName}`,
      `Exception Occurred! You can find the log at ${outFileName}`);
}

export async function runInferenceQuickInput(context: vscode.ExtensionContext): Promise<void> {
  const state = await collectInputs();
  if (state.error !== undefined) {
    vscode.window.showErrorMessage(state.error);
    return;
  }

  await runInference(state.backend, state.modelPath, state.inputSpec);
}
