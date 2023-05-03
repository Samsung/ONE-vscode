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

import { Command } from "./Command";
import { ICompilerCommand } from "./Compiler";
import { IExecutorCommand } from "./Executor";
import { Version } from "./Version";

class PackageInfo {
  name: string;
  version: Version;
  constructor(name: string, version: Version) {
    this.name = name;
    this.version = version;
  }
}

// NOTE: This structure should be used as Return Values
// TODO: Support the latest version
class ToolchainInfo {
  name: string;
  description: string;
  version?: Version; // specific version
  depends?: PackageInfo[]; // NOTE: too much dependens on deb
  constructor(
    name: string,
    description: string,
    version?: Version,
    depends?: PackageInfo[]
  ) {
    this.name = name;
    this.description = description;
    this.version = version;
    this.depends = depends;
  }
}

interface IToolCommand {
  info: ToolchainInfo;
  install(): Command;
  uninstall(): Command;
  installed(): Command;
}

class ToolCommand implements IToolCommand {
  info: ToolchainInfo;
  constructor(info: ToolchainInfo) {
    this.info = info;
  }
  install(): Command {
    throw Error("Method not implemented.");
  }
  uninstall(): Command {
    throw Error("Method not implemented.");
  }
  installed(): Command {
    throw Error("Method not implemented.");
  }
}

interface IToolchain<T extends IToolCommand>
  extends ICompilerCommand,
    IExecutorCommand {
  tool: T;
  info: ToolchainInfo | undefined;
}

// TODO: Support `DockerToolchain` so multiple toolchains can be installed
// Toolchain: Debian(...) OR Docker(...)
// A toolchain has a package or multiple packages
class Toolchain implements IToolchain<ToolCommand> {
  tool: ToolCommand;
  info: ToolchainInfo;
  constructor(info: ToolchainInfo) {
    this.tool = new ToolCommand(info);
    this.info = info;
  }
  run(_cfg: string): Command {
    throw new Error("Method not implemented.");
  }
  runInference(_model: string, _options?: Map<string, string>): Command {
    throw new Error("Method not implemented.");
  }
  runProfile(_model: string, _options?: Map<string, string>): Command {
    throw new Error("Method not implemented.");
  }
  runShow(_model: string, _option: string): Command {
    throw new Error("Method not implemented.");
  }
}

// TODO: Introduce ToolchainRequest
// NOTE: This structure should be used as Request Values for Toolchains
// class ToolchainRequest

// TODO: How to handle `nightly`?
// TODO: Support MinimumVersion(): >=
// TODO: Support filter(), where(), filter(regex) or orderBy()
class Toolchains extends Array<Toolchain> {}

export {
  PackageInfo,
  ToolchainInfo,
  Toolchain,
  Toolchains,
  ToolCommand,
  IToolCommand,
  IToolchain,
};
