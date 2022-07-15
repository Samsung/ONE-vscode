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

import {Logger} from './Utils/Logger';
import * as cp from 'child_process';

function trySpawnSync() {

  const tempfile="./z/echo_pw.sh";
  const cmd = 'whoami';
  const cwd = '/home/eric';

  {
    let child = cp.spawnSync('ls', ['-l', tempfile], {cwd: cwd, shell: false});
    Logger.info('try (ls -l)', '====>', child.stdout.toString());

    child = cp.spawnSync('chmod', ['+x', tempfile], {cwd: cwd, shell: false});

    child = cp.spawnSync('ls', ['-l', tempfile], {cwd: cwd, shell: false});
    Logger.info('try (ls -l)', '====>', child.stdout.toString());
  }
  {
    // Not sudo
    Logger.info('try', `${cmd}`);
    let child = cp.spawnSync('whoami', [], {cwd: cwd, shell: false});
    Logger.info('try (not sudo)', '====>', child.stdout.toString());
  }
  {
    // With sudo
    Logger.info('try', `SUDO_ASKPASS=${tempfile} sudo -A ${cmd}`);
    let child = cp.spawnSync('sudo', ['-A', cmd],
        { cwd: cwd,
          env: {'SUDO_ASKPASS': tempfile},
          shell: false
        });
    Logger.info('try (sudo)', '====>', child.stdout.toString());
  }
}

export {trySpawnSync};

