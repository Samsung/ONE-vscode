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
import * as fs from 'fs';
import {Logger} from '../Utils/Logger';
import {ToolArgs} from './ToolArgs';

const path = require('path');
const which = require('which');

const K_DATA: string = 'data';
const K_EXIT: string = 'exit';

export class ToolRunner {
  private handlePromise(
      resolve: (value: string|PromiseLike<string>) => void,
      reject: (value: string|PromiseLike<string>) => void, cmd: cp.ChildProcessWithoutNullStreams) {
    // stdout
    cmd.stdout.on(K_DATA, (data: any) => {
      Logger.output(data.toString());
    });
    // stderr
    cmd.stderr.on(K_DATA, (data: any) => {
      Logger.output(data.toString());
    });

    cmd.on(K_EXIT, (code: any) => {
      let codestr = code.toString();
      Logger.outputWithTime('child process exited with code ' + codestr);
      if (codestr === '0') {
        Logger.outputWithTime('Build Success.');
        Logger.outputLine('');
        resolve(codestr);
      } else {
        Logger.outputWithTime('Build Failed:' + codestr);
        Logger.outputLine('');
        let errorMsg = 'Failed with exit code: ' + codestr;
        reject(errorMsg);
      }
    });
  }

  public getOneccPath(): string|undefined {
    let oneccPath = which.sync('onecc', {nothrow: true});
    if (oneccPath === null) {
      // Use fixed installation path
      oneccPath = '/usr/share/one/bin/onecc';
    }
    Logger.outputWithTime('onecc path: ' + oneccPath);
    // check if onecc exist
    if (!fs.existsSync(oneccPath)) {
      Logger.outputWithTime('Failed to find onecc file');
      return undefined;
    }
    // onecc maybe symbolic link: use fs.realpathSync to convert to real path
    let oneccRealPath = fs.realpathSync(oneccPath);
    Logger.outputWithTime('onecc real path: ' + oneccRealPath);
    // check if this onecc exist
    if (!fs.existsSync(oneccRealPath)) {
      Logger.outputWithTime('Failed to find onecc file');
      return undefined;
    }
    return oneccRealPath;
  }

  public getRunner(name: string, tool: string, toolargs: ToolArgs, path: string, root?: boolean) {
    return new Promise<string>((resolve, reject) => {
      Logger.outputWithTime('Running: ' + name);
      let cmd = undefined;
      if (root) {
        // NOTE
        // To run the root command job, it must requires a password in `process.env.userp`
        // environment.
        // TODO(jyoung): Need password encryption
        tool = `echo ${process.env.userp} | sudo -S ` + tool;
        cmd = cp.spawn(tool, toolargs, {cwd: path, shell: true});
        process.env.userp = '';
      } else {
        cmd = cp.spawn(tool, toolargs, {cwd: path});
      }
      this.handlePromise(resolve, reject, cmd);
    });
  }
}
