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

import {BinaryControl} from 'apt-parser';
import * as cp from 'child_process';

import {Backend} from '../Backend/API';
import { PackageInfo, Toolchains } from '../Backend/Toolchain';
import { Command } from '../Backend/Command';
import {Compiler, CompilerBase} from '../Backend/Compiler';
import {Executor, ExecutorBase} from '../Backend/Executor';
import {Version} from '../Backend/Version';

/**
 * Convert semantic version string to Version object
 * @param trivVerStr version string in simplified Debian package format:
 *            version ::= major[.minor.patch]*([~-]alphanumeric+)*
 *            major ::= digit(alphanumeric)*
 * @returns Version object or null if trivVerStr does not match the above format.
 *          Version.option will include "-" or "~".
 * @see https://www.debian.org/doc/debian-policy/ch-controlfields.html#version
 */
function parseVersion(trivVerStr: string): Version|null {
  const regex = /^([0-9][\.a-zA-Z0-9]*)([-~+]*)(.*)/;
  const t = trivVerStr.match(regex);
  // example
  //  "1" -> t = ["1.0.0", "1.0.0", "", ""]
  //  "1.1.0" -> t = ["1.0.0", "1.0.0", "", ""]
  //  "1.1.0~RC0" -> t = ["1.1.0~RC0", "1.1.0", "~", "RC0"]
  //  "1.0-beta" -> t = ["1.0-beta", "1.0", "-", "beta"]
  //  "1.0-beta-2.3" -> t = ["1.0-beta-2.3", "1.0", "-", "beta-2.3"]
  //  "1.1a-beta-2.3" -> t = ["1.1a-beta-2.3", "1.1a", "-", "beta-2.3"]

  if (t === null || t.length === 1) {
    return null;
  }

  // NOTE
  // WHY t[2]+t[3]?
  // In the current version of backend API, t[2]+t[3] will be used for option
  // since Debian package manager treats "~" and "-" differently.
  //
  // TODO Find better way to handle "~" or "-"
  const option: string = (t.length === 4 && t[3] !== '') ? t[2] + t[3] : '';

  let v = t[0].split('.');

  if (v.length === 1) {
    const major = parseInt(v[0]);
    if (isNaN(major)) {
      return null;
    }
    return new Version(major, 0, 0, option);
  }
  if (v.length === 2) {
    const major = parseInt(v[0]);
    const minor = parseInt(v[1]);
    if (isNaN(major) || isNaN(minor)) {
      return null;
    }
    return new Version(major, minor, 0, option);
  }
  if (v.length === 3) {
    const major = parseInt(v[0]);
    const minor = parseInt(v[1]);
    const patch = parseInt(v[2]);
    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      return null;
    }
    return new Version(major, minor, patch, option);
  }

  return null;
};


interface CommandFunc {
  (): Command;
}

class DummyCompiler extends CompilerBase {
  constructor() {
    super();
    // this._toolchains = [
    //   {
    //     info: { name: 'dummy-toolchain', description: 'dummy', version: new Version(1,1,0),
    //     depends: [] }, install: this.install('dummy-toolchain'), uninstall:
    //     this.uninstall('dummy-toolchain'), installed: this.installed('dummy-toolchain')
    //   },
    // ];
    this.resolveToolchains();
  }

  private getVersionString(name: string, version: string): string {
    return `${name}` + (version === '' ? '' : `=${version}`);
  }
  private setupinstall(name: string, version: string = ''): CommandFunc[] {
    // sudo apt install ca-certificates
    // sudo echo "deb [trusted=yes] http://art.sec.samsung.net/artifactory/list/aip_debian bionic
    // universe"\
    //     | sudo tee /etc/apt/sources.list.d/artifactory.list
    // wget -qO - https://art.sec.samsung.net:443/artifactory/api/gpg/key/public | sudo apt-key add
    // - sudo apt update
    return [];
  }
  private install(name: string, version: string = ''): CommandFunc {
    return () => {
      return new Command('aptitude', ['install', '-y', '-q', this.getVersionString(name, version)])
          .setRoot();
    };
  }
  private uninstall(name: string, version: string = ''): CommandFunc {
    return () => {
      return new Command('apt-get', ['remove', this.getVersionString(name, version)]);
    };
  }
  private installed(name: string, version: string = ''): CommandFunc {
    return () => { return new Command(''); };
  }

  private async resolveToolchains() {
    // Apt-get doesn't support the multiple verison installation of the same package.
    // So dpkg-query --status command shows only one package information.
    cp.exec('dpkg-query -s triv2-toolchain-latest', (err, stdout, stderr) => {
      if (err) {
        console.log(`error: ${err.message}`);
        return;
      } else {
        const control = new BinaryControl(stdout);
        let depends: PackageInfo[] = [];
        control.depends?.forEach(item => {
          const data = item.replace(/[()=<>]/g, '').split(' ').filter(i => i);
          const version = parseVersion(data[1]);
          if (version) {
            depends.push({ name: data[0], version: version});
          } else {
            console.log(`data[0] does not have version string`);
          }
        });

        console.log(depends);
        const version = parseVersion(control.version);
        if (version) {
          this._installed.push({
            info: { 
              name: control.package,
              description: control.description,
              version: version,
              depends: depends},
            install: this.install(control.package, control.version),
            uninstall: this.uninstall(control.package, control.version),
            installed: this.installed(control.package, control.version)
          });
        }
        console.log(this._installed);
      }      
    });

    cp.exec('apt-cache madison triv2-toolchain-latest | head -4', (err, stdout, stderr) => {
      if (err) {
        console.log(`error: ${err.message}`);
        return;
      } else {
        const lines = stdout.split('\n').filter((p) => p.trim());
        lines.forEach(line => {
          const data = line.split(' | ');
          console.log(data);
          const version = parseVersion(data[1]);
          if (version) {
            this._toolchains.push({
              info: {name: data[0], description: '', version: version, depends: []},
              install: this.install(data[0], data[1]),
              uninstall: this.uninstall(data[0], data[1]),
              installed: this.installed(data[0], data[1])
            });
          }
        });
        console.log(this._toolchains);
      }
    });
  }

  availableToolchains(): Toolchains {
    return this._toolchains;
  }

  installedToolchains(): Toolchains {
    return this._installed;
  }

  compile(cfg: string): Command {
    let cmd = new Command('onecc');
    cmd.push('--config');
    cmd.push(cfg);
    return cmd;
  }

  _toolchains: Toolchains = [];
  _installed: Toolchains = [];
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