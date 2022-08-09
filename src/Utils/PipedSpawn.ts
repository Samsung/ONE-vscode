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
import {spawn, SpawnOptionsWithoutStdio} from 'child_process';

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
 *
 * @see https://nodejs.org/api/child_process.html#child_processspawncommand-args-options has similar
 *      example for pipe
 */
export function pipedSpawn(
    cmd1: string, cmd1List: string[], cmd1Option: SpawnOptionsWithoutStdio, cmd2: string,
    cmd2List: string[], cmd2Option: SpawnOptionsWithoutStdio) {
  // Let's handle `$ cmd1 | cmd2`
  // TODO Consider case with `set -o pipefail`
  const first = spawn(cmd1, cmd1List, cmd1Option);
  const second = spawn(cmd2, cmd2List, cmd2Option);

  first.stdout.on('data', (data) => {
    second.stdin.write(data);
  });

  first.stderr.on('data', (data) => {
    Logger.error('pipedSpawn', `${cmd1} stderr: ${data}`);
    // TODO Find better to notify caller that error occured
  });

  first.on('close', (code) => {
    if (code !== 0) {
      Logger.error('pipedSpawn', `${cmd1} process exited with code ${code}`);
      // TODO Find better to notify caller that error occured
    }
    second.stdin.end();
  });

  return second;
}
