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

import assert from 'assert';

import {Command} from '../../Project/Command';
import {Toolchain, ToolchainInfo} from '../Toolchain';

interface DebianRepo {
  uri: string;
  distribute: string;  // like "foscal"
  component: string;   // like "universe"
}

enum DebianArch {
  amd64 = 'amd64',
  undefined = 'undefined'
}

class DebianToolchain implements Toolchain {
  ready: boolean = false;

  info: ToolchainInfo;
  repo: DebianRepo;
  arch: DebianArch = DebianArch.undefined;

  constructor(info: ToolchainInfo, repo: DebianRepo, arch: DebianArch) {
    this.info = info;
    this.repo = repo;
    this.arch = arch;
  }

  prepare() {
    if (this.ready === false) {
      // /etc/apt/source.list.d/ONE-vscode.list
      // deb ${this.repo.uri} ${this.repo.foscal} ${this.repo.component}
      this.ready = true;
    }
    assert.ok(this.ready === true);
  }

  // impl of Toolchain
  install(): Command {
    this.prepare();

    // sudo?
    let cmd = new Command('apt-get');
    cmd.push(`-t=${this.repo.distribute}`);
    cmd.push(`-a=${this.arch.toString()}`);
    cmd.push('install');
    let pkg: string = this.info.name;
    if (this.info.version !== undefined) {
      pkg = `${pkg}=${this.info.version.str()}`;
    }
    cmd.push(pkg);
    return cmd;
  }
  uninstall(): Command {
    this.prepare();

    // sudo?
    let cmd = new Command('apt-get');
    cmd.push(`-t=${this.repo.distribute}`);
    cmd.push(`-a=${this.arch.toString()}`);
    cmd.push('purge');
    let pkg: string = this.info.name;
    if (this.info.version !== undefined) {
      pkg = `${pkg}=${this.info.version.str()}`;
    }
    cmd.push(pkg);
    return cmd;
  }
  installed(): Command {
    this.prepare();

    // dpkg-query --show npu-toolchain-latest
    let cmd = new Command('dpkg-query');
    cmd.push('--show');
    cmd.push(this.info.name);
    cmd.push('&&');
    cmd.push('echo $?');
    return cmd;
  }
};

export {DebianRepo, DebianArch, DebianToolchain};
