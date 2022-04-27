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

import {Backend} from '../Backend/API';
import { Toolchain, Toolchains } from '../Backend/Toolchain';
import { Command } from '../Project/Command';
import {Compiler, CompilerBase} from '../Backend/Compiler';
import {Executor, ExecutorBase} from '../Backend/Executor';
import { Version } from '../Utils/Version';
import * as cp from 'child_process';
import { LinkedEditingRanges } from 'vscode';

interface CommandFunc {
  (): Command;
}

class DummyCompiler extends CompilerBase {
  constructor() {
    super();
    // this._toolchains = [
    //   { 
    //     info: { name: 'dummy-toolchain', description: 'dummy', version: new Version(1,1,0), depends: [] },
    //     install: this.install('dummy-toolchain'),
    //     uninstall: this.uninstall('dummy-toolchain'),
    //     installed: this.installed('dummy-toolchain')
    //   },
    // ];
    this.resolveToolchains();
  }

  private getVersionString(name: string, version: string): string {
    return `${name}` + (version === '' ? '' : `=${version}`);
  }
  private install(name: string, version: string = ''): CommandFunc {
    return () => { return new Command('apt-get', ['install', this.getVersionString(name, version)]); };
  }
  private uninstall(name: string, version: string = ''): CommandFunc {
    return () => { return new Command('apt-get', ['remove', this.getVersionString(name, version)]); };
  }
  private installed(name: string, version: string = ''): CommandFunc {
    return () => { return new Command('dpkg', ['-l', this.getVersionString(name, version)]); };
  }

  private async resolveToolchains() {
    cp.exec('apt-cache madison triv2-toolchain-latest | head -4', (err, stdout, stderr) => {
      if (err) {
        console.log(`error: ${err.message}`);
        return;
      } else {
        const lines = stdout.split('\n').filter((p) => p.trim());
        lines.forEach(line => {
          const data = line.split(' | ');
          let ret;
          try {
            ret = cp.execSync(`dpkg -l ${data[0]}=${data[1]}`);
          } catch (err) {
            ret = 0;
          }
          this._toolchains.push({
            info: { name: data[0], description: '', version: new Version(data[1]), installed: Boolean(ret), depends: [] },
            install: this.install(data[0], data[1]),
            uninstall: this.uninstall(data[0], data[1]),
            installed: this.installed(data[0], data[1])
          });
        });
      }
    });
  }

  toolchains(): Toolchains {
    return this._toolchains;
  }

  compile(cfg: string): Command {
    let cmd = new Command('onecc');
    cmd.push('--config');
    cmd.push(cfg);
    return cmd;
  }

  _toolchains: Toolchains = [];
};

class DummyExecutor extends ExecutorBase {};

class DummyBackend implements Backend {
  _compiler: Compiler;
  _executor: Executor;

  constructor() {
    console.log('DUMMY: constructed');
    this._compiler = new DummyCompiler();
    this._executor = new DummyExecutor();
  }

  public name() {
    return 'Dummy';
  }

  public compiler(): Compiler {
    return this._compiler;
  }

  public executor(): Executor {
    return this._executor;
  }
};

export {DummyBackend};
