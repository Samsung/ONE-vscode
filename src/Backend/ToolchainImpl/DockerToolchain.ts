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

import {Command} from '../Command';
import {Toolchain, ToolchainInfo} from '../Toolchain';

class DockerImage {
  repository: string;
  tag: string;
  id: string;
  constructor(repository: string, tag: string, id: string) {
    this.repository = repository;
    this.tag = tag;
    this.id = id;
  }
}

class DockerToolchain implements Toolchain {
  ready: boolean = false;

  image: DockerImage;
  info: ToolchainInfo;

  constructor(info: ToolchainInfo, image: DockerImage) {
    this.info = info;
    this.image = image;
  }

  prepare() {
    if (this.ready === false) {
      // TODO: make listfile and verify with it
      // /etc/apt/source.list.d/ONE-vscode.list
      // deb ${this.repo.uri} ${this.repo.foscal} ${this.repo.component}
      this.ready = true;
    }
    assert.ok(this.ready === true);
  }

  // impl of Toolchain
  install(): Command {
    // NOTE (Issue #30)
    // Install command uses `aptitude` tool because this tool resolves
    // package dependency issues automatically unlike `apt-get`.
    //
    // Command:
    // $ aptitude install triv2-toolchain-latest=1.1.0~22050320 -q -y
    //
    // According to man(8) aptitude
    // -q: suppress all incremental progress indicators
    // -y: assume that the user entered "yes"
    // -o: Set a configuration file option directly
    //   * Aptitude::ProblemResolver::SolutionCost
    //        : Describes how to determine the cost of a solution.
    //          ref: https://tools.ietf.org/doc/aptitude/html/en/ch02s03s04.html
    this.prepare();
    let cmd = new Command('docker');
    cmd.push('pull');
    cmd.push(`${this.image.repository}`);
    cmd.push(`-o Aptitude::ProblemResolver::SolutionCost='100*canceled-actions,200*removals'`);
    let pkg: string = this.info.name;
    if (this.info.version !== undefined) {
      pkg = `${pkg}=${this.info.version.str()}`;
    }
    cmd.push(pkg);
    cmd.push('-q');
    cmd.push('-y');
    cmd.setRoot();
    return cmd;
  }
  uninstall(): Command {
    // NOTE
    // Uninstall command uses `apt-get` tool.
    //
    // Command:
    // $ apt-get purge triv2-toolchain-latest=1.1.0~22050320 -q -y
    //
    // According to man(8) apt-get
    // -q: Quiet; produces output suitable for logging, omitting progress indicators.
    // -y: Automatic yes to prompts
    this.prepare();
    let cmd = new Command('aptitude');
    cmd.push('purge');
    cmd.push(this.info.name);
    cmd.push('-q');
    cmd.push('-y');
    cmd.setRoot();
    return cmd;
  }
  installed(): Command {
    this.prepare();
    let cmd = new Command('dpkg-query');
    cmd.push('--show');
    let pkg: string = this.info.name;
    if (this.info.version !== undefined) {
      pkg = `${pkg}=${this.info.version.str()}`;
    }
    cmd.push(pkg);
    cmd.push('&&');
    cmd.push('echo $?');
    return cmd;
  }
  run(cfg: string): Command {
    this.prepare();
    let cmd = new Command('onecc');
    cmd.push('--config');
    cmd.push(cfg);
    return cmd;
  }
};

export {DockerImage, DockerToolchain};
