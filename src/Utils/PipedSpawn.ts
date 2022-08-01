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
import {spawn, SpawnOptions, spawnSync, SpawnSyncOptions} from 'child_process';

import {Logger} from './Logger';

/**
 * Function to run '$ cmd1 | cmd2'
 * @param cmd1 first command before pipe
 * @param cmd1List args of cmd1
 * @param cmd2 second command after pipe
 * @param cmd2List args of cmd2
 * @returns ChildProcess spawned cmd2
 * @example
 * grep = pipedSpawn('ls', ['-hl', '/'], {cwd: '/'}, 'grep', ['usr'], {});
 * grep.stdout.on('data', (data)=>{ console.log(data.toString(); })
 * grep.stderr.on('data', (data)=>{ console.log(data.toString(); })
 * grep.on('exit', (exitcode: number | null, signal: NodeJS.Signals | null)=>{
 *   if (exitcode === null) { // handle signal
 *   } else if (exitcode === 0) { console.log("success!");
 *   } else { console.log("exit code is not 0"); })
 */
export function pipedSpawn(
    cmd1: string, cmd1List: string[], cmd1Option: SpawnOptions, cmd2: string, cmd2List: string[],
    cmd2Option: SpawnOptions) {
  // Let's handle `$ cmd1 | cmd2`
  const first = spawn(cmd1, cmd1List, cmd1Option);
  const second = spawn(cmd2, cmd2List, cmd2Option);

  first.stdout!.on('data', (data) => {
    second.stdin!.write(data);
  });

  first.stderr!.on('data', (data) => {
    Logger.error('pipedSpawn', `${cmd1} stderr: ${data}`);
    // TODO Find better to notify caller that error occured
  });

  first.on('close', (code) => {
    if (code !== 0) {
      Logger.error('pipedSpawn', `${cmd1} process exited with code ${code}`);
      // TODO Find better to notify caller that error occured
    }
    second.stdin!.end();
  });

  return second;
}

export function pipedSpawnSync(
    cmd1: string, cmd1List: string[], cmd1Option: SpawnSyncOptions, cmd2: string,
    cmd2List: string[], cmd2Option: SpawnSyncOptions) {
  if (cmd2 === 'sudo' && cmd2List.includes('-S')) {
    // In case of command, e.g., 'echo wrong_pw | sudo -S ls', sometimes it takes long time(> 2 sec)
    // before `sudo` exits with code === 1. So it would be better to use `pipedSpawn()` instead.
    const msg = 'Use pipedSpawn() instead';
    Logger.error('pipedSpawnSync', msg);
    throw Error(msg);
  }

  // Let's handle `$ cmd1 | cmd2` in sync mode
  const mergedSpawnOption1: SpawnSyncOptions = {
    // NOTE: interesting JS syntax. This creates an object by merging two objects with '...' prefix.
    ...cmd1Option,
    ...{
      // In out test, apt-cache sometime returns 13MB text.
      // Let's make it reasonably big.
      maxBuffer: 1024 * 1024 * 64
    }
  };
  const first = spawnSync(cmd1, cmd1List, mergedSpawnOption1);

  if (first.status === 0) {
    const mergedSpawnOption2: SpawnSyncOptions = {
      ...cmd2Option,
      ...{
        input: first.stdout
      }
    };
    return spawnSync(cmd2, cmd2List, mergedSpawnOption2);
  } else {
    const msg = `Error: running ${cmd1} failed. Exit code: ${first.status}, stdout: ${
        first.stdout}, stderr: ${first.stderr}`;
    Logger.error('pipedSpawnSync', msg);
    throw Error(msg);
  }
}
