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
import { spawnSync, SpawnSyncOptions } from "child_process";

/**
 * Function that call cmd1 and then cmd2. stdout of cmd1 is put into stdin of cmd2.
 *
 * When error happens during cmd1, Error will be thrown.
 * Otherwise, result after calling spawnSync(cmd2,...) will be returned.
 */
export function pipedSpawnSync(
  cmd1: string,
  cmd1Args: string[],
  cmd1Option: SpawnSyncOptions,
  cmd2: string,
  cmd2Args: string[],
  cmd2Option: SpawnSyncOptions
) {
  if (cmd2 === "sudo" && cmd2Args.includes("-S")) {
    // In case of command, e.g., 'echo wrong_pw | sudo -S ls', sometimes it takes long time(> 2 sec)
    // before `sudo` exits with code === 1. So it would be better to use `pipedSpawn()` instead.
    const msg = "Use pipedSpawn() instead";
    console.log("[error][pipedSpawnSync]", msg);
    throw Error(msg);
  }

  // Let's handle `$ cmd1 | cmd2` in sync mode
  const mergedSpawnOption1: SpawnSyncOptions = {
    // NOTE: interesting JS syntax. This creates an object by merging two objects with '...' prefix.
    ...cmd1Option,
    ...{
      // In out test, apt-cache sometime returns 13MB text.
      // Let's make it reasonably big.
      maxBuffer: 1024 * 1024 * 64,
    },
  };
  const first = spawnSync(cmd1, cmd1Args, mergedSpawnOption1);

  if (first.status === 0) {
    const mergedSpawnOption2: SpawnSyncOptions = {
      ...cmd2Option,
      ...{
        input: first.stdout,
      },
    };
    return spawnSync(cmd2, cmd2Args, mergedSpawnOption2);
  } else {
    const msg = `Error: running ${cmd1} failed. Exit code: ${first.status}, stdout: ${first.stdout}, stderr: ${first.stderr}`;
    console.log("[error][pipedSpawnSync]", msg);
    throw Error(msg);
  }
}

/**
 * Function that call cmd1 and then cmd2. stdout of cmd1 is put into stdin of cmd2.
 *
 * When exit code is not 0 after running cmd1 or cmd2, Error will be thrown.
 * Otherwise, it returns stdout of cmd2.
 */
export function pipedSpawnSyncStdout(
  cmd1: string,
  cmd1Args: string[],
  cmd1Option: SpawnSyncOptions,
  cmd2: string,
  cmd2Args: string[],
  cmd2Option: SpawnSyncOptions
): string {
  let stdout: string | null = null;

  try {
    let cmd1Result = pipedSpawnSync(
      cmd1,
      cmd1Args,
      cmd1Option,
      cmd2,
      cmd2Args,
      cmd2Option
    );
    if (cmd1Result.status !== 0) {
      const msg = `${cmd1} exists with code ${cmd1Result.status}`;
      console.log(msg);
      throw Error(msg);
    } else {
      stdout = cmd1Result.stdout.toString();
    }
  } catch (cmd2Err) {
    console.log(cmd2Err);
    throw cmd2Err;
  }

  return stdout;
}
