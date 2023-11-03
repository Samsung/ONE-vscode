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

import * as vscode from "vscode";

import { Balloon } from "../../Utils/Balloon";
import { Backend } from "../Backend";
import { Command } from "../Command";
import { Compiler } from "../Compiler";
import { Executor } from "../Executor";
import { PackageInfo } from "../Toolchain";
import {
  DebianArch,
  DebianRepo,
  DebianToolchain,
} from "../ToolchainImpl/DebianToolchain";
import { Version } from "../Version";
import { DebianCompiler } from "../CompilerImpl/DebianCompiler";

class OneDebianToolchain extends DebianToolchain {
  run(cfg: string): Command {
    const configs = vscode.workspace.getConfiguration();
    const value = configs.get("one.toolchain.githubToken", "");
    if (!value) {
      Balloon.showGithubTokenErrorMessage();
    }

    let cmd = new Command("onecc-docker");
    if (value !== "") {
      cmd.push("-t");
      cmd.push(value);
    }
    cmd.push("-C");
    cmd.push(cfg);
    return cmd;
  }
}

class OneCompiler extends DebianCompiler {
  constructor() {
    super({
      toolchainTypes: ["latest"],
      toolchainName: "onecc-docker",
      debianToolchainClass: OneDebianToolchain,
      depends: [new PackageInfo("one-compiler", new Version(1, 21, 0))],
      prerequisites: "prerequisitesForGetOneToolchain.sh",
      debianRepo: new DebianRepo(
        "http://ppa.launchpad.net/one-compiler/onecc-docker/ubuntu",
        "bionic",
        "main"
      ),
      debianArch: DebianArch.amd64,
    });
  }
}

class OneToolchain implements Backend {
  private readonly backendName: string;
  private readonly toolchainCompiler: Compiler | undefined;

  constructor() {
    this.backendName = "ONE";
    this.toolchainCompiler = new OneCompiler();
  }

  name(): string {
    return this.backendName;
  }

  compiler(): Compiler | undefined {
    return this.toolchainCompiler;
  }

  executor(): Executor | undefined {
    return undefined;
  }

  executors(): Executor[] {
    return [];
  }
}

export { OneDebianToolchain, OneCompiler, OneToolchain };
