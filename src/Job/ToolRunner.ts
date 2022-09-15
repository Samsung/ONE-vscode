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
import {pipedSpawn} from '../Utils/PipedSpawn';
import {ToolArgs} from './ToolArgs';

const which = require('which');

const K_DATA: string = 'data';
const K_EXIT: string = 'exit';
const K_ERROR: string = 'error';

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
      reject: (value: ErrorResult|PromiseLike<ErrorResult>) => void, root: boolean) {
    // stdout
    this.child!.stdout.on(K_DATA, (data: any) => {
      Logger.append(data.toString());
    });
    // stderr
    this.child!.stderr.on(K_DATA, (data: any) => {
      Logger.append(data.toString());
    });

    // NOTE
    // The 'error' event is emitted whenever:
    //   1. The process could not be spawned, or
    //   2. The process could not be killed, or
    //   3. Sending a message to the child process failed.
    // The 'exit' event may or may not fire after an error has occurred.
    // When listening to both the 'exit' and 'error' events, guard against
    // accidentally invoking handler functions multiple times.
    // from https://nodejs.org/api/child_process.html#event-error
    this.child!.on(K_ERROR, (err) => {
      Logger.append(err.message);
    });

    this.child!.on(K_EXIT, (code: number|null, signal: NodeJS.Signals|null) => {
      this.child = undefined;

      if (root) {
        /*
        NOTE

        Considering a case:

          `echo correct_pw | sudo -S ...` --> `echo wrong_pw | sudo -S ...`

        The second call does not fail because pw is cached by sudo.
        Let's invalidate sudo cache by putting `sudo -k` somewhere.

          `echo correct_pw | sudo -S ...` --> `sudo -k` --> `echo wrong_pw | sudo -S ...`

        When should we call `sudo -k`?
        1. We observed that `sudo -k` right after spawning `echo correct_pw | sudo -S ...` does not
          seem to work, making `echo wrong_pw | sudo -S ...` succeed.
        2. Calling `sudo -k` after first sudo process finishes seems to make
          `echo wrong_pw | sudo -S ...` fail.
        */
        cp.spawnSync('sudo', ['-k']);
      }

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
    if (this.child === undefined || this.child.killed || this.child.exitCode !== null) {
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

    if (this.child.kill()) {
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

  public getRunner(
      name: string, tool: string, toolargs: ToolArgs, cwd: string, root: boolean = false) {
    if (this.isRunning()) {
      const msg = `Error: Running: ${name}. Process is already running.`;
      Logger.error(this.tag, msg);
      throw Error(msg);
    }

    this.killedByMe = false;

    return new Promise<SuccessResult>((resolve, reject) => {
      Logger.info(this.tag, 'Running: ' + name);
      if (root === true) {
        // NOTE
        // To run the root command job, it must requires a password in `process.env.userp`
        // environment.
        // TODO(jyoung): Need password encryption
        if (process.env.userp === undefined) {
          throw Error('Cannot find required environment variable');
        }
        // sudo -S gets pw from stdin
        const args = ['-S', tool].concat(toolargs);
        this.child = pipedSpawn('echo', [process.env.userp], {cwd: cwd}, 'sudo', args, {cwd: cwd});
      } else {
        this.child = cp.spawn(tool, toolargs, {cwd: cwd});
      }
      this.handlePromise(resolve, reject, root);
    });
  }
}
