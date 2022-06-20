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

/**
 * Return type when a process exits without error
 * One of exitCode or intentionallyKilled must NOT be undefined.
 */
export interface SuccessResult {
  // When successful exit, exit code must be 0
  exitCode?: number;
  // When this process was intentionally killed by user, this must be true.
  intentionallyKilled?: boolean;
}

/**
 * Return type when a process exits with error
 * One of exitCode or signal must NOT be undefined.
 */
export interface ErrorResult {
  // Exit code must be greater than 0
  exitCode?: number;
  // When this process was killed by, e.g., kill command from shell,
  // this must be set to proper NodeJS.Signals.
  signal?: NodeJS.Signals;
}

export class ToolRunner {
  tag = this.constructor.name;  // logging tag

  // This variable is undefined while a prcess is not running
  private child: cp.ChildProcessWithoutNullStreams|undefined = undefined;

  // When the spawned process was killed by kill() method, set this true
  // This value must be set to false when starting a process
  private killedByMe = false;

  private handlePromise(
      resolve: (value: SuccessResult|PromiseLike<SuccessResult>) => void,
      reject: (value: ErrorResult|PromiseLike<ErrorResult>) => void) {
    // stdout
    this.child!.stdout.on(K_DATA, (data: any) => {
      Logger.append(data.toString());
    });
    // stderr
    this.child!.stderr.on(K_DATA, (data: any) => {
      Logger.append(data.toString());
    });

    this.child!.on(K_EXIT, (code: number|null, signal: NodeJS.Signals|null) => {
      this.child = undefined;

      // From https://nodejs.org/api/child_process.html#event-exit
      //
      // The 'exit' event is emitted after the child process ends.
      // If the process exited, code is the final exit code of the process, otherwise null.
      // If the process terminated due to receipt of a signal, signal is the string name
      // of the signal, otherwise null.
      // One of the two will always be non-null.

      // when child was terminated due to a signal
      if (code === null) {
        Logger.debug(this.tag, `Child process was killed (signal: ${signal!})`);

        if (this.killedByMe) {
          resolve({intentionallyKilled: true});
        } else {
          reject({signal: signal!});
        }
        return;
      }

      // when child exited
      Logger.info(this.tag, 'child process exited with code', code);
      if (code === 0) {
        Logger.info(this.tag, 'Build Success.');
        Logger.appendLine('');
        resolve({exitCode: 0});
      } else {
        Logger.info(this.tag, 'Build Failed:', code);
        Logger.appendLine('');
        reject({exitCode: code});
      }
    });
  }

  public isRunning(): boolean {
    if (this.child === undefined) {
      return false;
    } else if (this.child.killed) {
      return false;
    } else if (this.child.exitCode !== null) {
      // From https://nodejs.org/api/child_process.html#subprocessexitcode
      // If the child process is still running, the field will be null.
      return false;
    }
    return true;
  }

  /**
   * Function to kill child process
   */
  public kill(): boolean {
    if (this.child === undefined || this.child.killed) {
      throw Error('No process to kill');
    }

    if (this.child!.kill()) {
      this.killedByMe = true;
      Logger.info(this.tag, `Process was terminated.`);
    } else {
      Logger.error(this.tag, 'Fail to terminate process.');
    }

    return this.killedByMe;
  }

  public getOneccPath(): string|undefined {
    let oneccPath = which.sync('onecc', {nothrow: true});
    if (oneccPath === null) {
      // Use fixed installation path
      oneccPath = '/usr/share/one/bin/onecc';
    }
    Logger.info(this.tag, 'onecc path:', oneccPath);
    // check if onecc exist
    if (!fs.existsSync(oneccPath)) {
      Logger.info(this.tag, 'Failed to find onecc file');
      return undefined;
    }
    // onecc maybe symbolic link: use fs.realpathSync to convert to real path
    let oneccRealPath = fs.realpathSync(oneccPath);
    Logger.info(this.tag, 'onecc real path: ', oneccRealPath);
    // check if this onecc exist
    if (!fs.existsSync(oneccRealPath)) {
      Logger.info(this.tag, 'Failed to find onecc file');
      return undefined;
    }
    return oneccRealPath;
  }

  public getRunner(name: string, tool: string, toolargs: ToolArgs, path: string, root?: boolean) {
    if (this.isRunning()) {
      const msg = `Error: Running: ${name}. Process is already running.`;
      Logger.error(this.tag, msg);
      throw Error(msg);
    }

    this.killedByMe = false;

    return new Promise<SuccessResult>((resolve, reject) => {
      Logger.info(this.tag, 'Running: ' + name);
      if (root) {
        // NOTE
        // To run the root command job, it must requires a password in `process.env.userp`
        // environment.
        // TODO(jyoung): Need password encryption
        tool = `echo ${process.env.userp} | sudo -S ` + tool;
        this.child = cp.spawn(tool, toolargs, {cwd: path, shell: true});
      } else {
        this.child = cp.spawn(tool, toolargs, {cwd: path});
      }
      this.handlePromise(resolve, reject);
    });
  }
}
