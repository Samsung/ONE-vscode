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

import * as cp from 'child_process';
import {Logger} from '../Utils/Logger';
import {ToolArgs} from './ToolArgs';

const K_DATA: string = 'data';
const K_EXIT: string = 'exit';

export class ToolRunner {
  logger: Logger;

  constructor(l: Logger) {
    this.logger = l;
  }

  private handlePromise(
      resolve: (value: string|PromiseLike<string>) => void,
      reject: (value: string|PromiseLike<string>) => void, cmd: cp.ChildProcessWithoutNullStreams) {
    // stdout
    cmd.stdout.on(K_DATA, (data: any) => {
      this.logger.output(data.toString());
    });
    // stderr
    cmd.stderr.on(K_DATA, (data: any) => {
      this.logger.output(data.toString());
    });

    cmd.on(K_EXIT, (code: any) => {
      let codestr = code.toString();
      console.log('child process exited with code ' + codestr);
      if (codestr === '0') {
        this.logger.outputWithTime('Build Success.');
        this.logger.outputLine('');
        resolve(codestr);
      } else {
        this.logger.outputWithTime('Build Failed:' + codestr);
        this.logger.outputLine('');
        let errorMsg = 'Failed with exit code: ' + codestr;
        reject(errorMsg);
      }
    });
  }

  public getRunner(name: string, tool: string, toolargs: ToolArgs, path: string) {
    return new Promise<string>((resolve, reject) => {
      this.logger.outputWithTime('Running: ' + name);

      let cmd = cp.spawn(tool, toolargs, {cwd: path});
      this.handlePromise(resolve, reject, cmd);
    });
  }
}
