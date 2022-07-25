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

import {Backend} from '../Backend/Backend';
import {Command} from '../Backend/Command';
import {Executor} from '../Backend/Executor';
import {Logger} from '../Utils/Logger';

import {InfernceShowBox, Task} from './InferenceShowBox';

const logTag = 'InferenceRunner';

class InferenceRunner {
  backend: Backend;
  executor: Executor;
  modelPath: vscode.Uri;
  inputSpec: string;

  constructor(backend: Backend, executor: Executor, modelPath: vscode.Uri, inputSpec: string) {
    this.backend = backend;
    this.executor = executor;
    this.modelPath = modelPath;
    this.inputSpec = inputSpec;
  }

  getInferenceCmd(): Command {
    const executor = this.executor as Executor;
    return executor.runInference(this.modelPath.path, ['--input-spec', this.inputSpec]);
  }

  getOutFileName(): string {
    return `${this.modelPath.path}.infer.log`;
  }

  // TODO: It's possible divide to inferance and others
  getInferenceTask(cmd: Command, outFileName: string): Task {
    return (resolve, reject) => {
      exec(cmd.str() + ' > ' + outFileName, (error, stdout, stderr) => {
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
  }

  async runInference(): Promise<void> {
    const cmd = this.getInferenceCmd();
    const outFileName = this.getOutFileName();
    const task = this.getInferenceTask(cmd, outFileName);

    const showBox = new InfernceShowBox();
    await showBox.showInference(
        task, `Inference succeeded! You can find the log at ${outFileName}`,
        `Exception Occurred! You can find the log at ${outFileName}`);
  }
}

export {InferenceRunner};
