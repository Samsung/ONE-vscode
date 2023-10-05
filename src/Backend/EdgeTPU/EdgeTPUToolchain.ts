/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as ini from "ini";
import * as fs from "fs";
import * as path from "path";

import { Logger } from "../../Utils/Logger";
import { Command } from "../Command";
import { PackageInfo } from "../Toolchain";
import { DebianToolchain } from "../ToolchainImpl/DebianToolchain";
import { Version } from "../Version";
import { DebianCompiler } from "../CompilerImpl/DebianCompiler";

class EdgeTPUDebianToolchain extends DebianToolchain {
  run(cfg: string): Command {
    let cmd = new Command("edgetpu_compiler");
    var config = ini.parse(fs.readFileSync(cfg, "utf-8").trim());

    if (config["edgetpu-compile"] === undefined) {
      Logger.error(
        "EdgeTPUDebianToolchain",
        `The configuration file doesn't include 'edgetpu-compile' section.`
      );

      throw new Error(
        `The configuration file doesn't include ''edgetpu-compile' section.`
      );
    }

    let outDir = path.dirname(config["edgetpu-compile"]["output_path"]);
    cmd.push("--out_dir");
    cmd.push(outDir);

    let intermediateTensors = config["edgetpu-compile"]["intermediate_tensors"];
    if (intermediateTensors !== undefined) {
      cmd.push("--intermediate_tensors");
      cmd.push(intermediateTensors);
    }

    let showOperations = config["edgetpu-compile"]["show_operations"];
    if (showOperations === "True") {
      cmd.push("--show_operations");
    }

    let minRuntimeVersion = config["edgetpu-compile"]["min_runtime_version"];
    if (minRuntimeVersion !== undefined) {
      cmd.push("--min_runtime_version");
      cmd.push(minRuntimeVersion);
    }

    let searchDelegate = config["edgetpu-compile"]["search_delegate"];
    if (searchDelegate === "True") {
      cmd.push("--search_delegate");
    }

    let delegateSearchStep = config["edgetpu-compile"]["delegate_search_step"];
    if (delegateSearchStep !== undefined) {
      cmd.push("--delegate_search_step");
      cmd.push(delegateSearchStep);
    }

    let inputPath = config["edgetpu-compile"]["input_path"];
    cmd.push(inputPath);

    return cmd;
  }
}

class EdgeTPUCompiler extends DebianCompiler {
  constructor() {
    super(
      ["latest"],
      "edgetpu-compiler",
      EdgeTPUDebianToolchain,
      [new PackageInfo("edgetpu_compiler", new Version(16, 0, undefined))],
      "prerequisitesForGetEdgeTPUToolchain.sh"
    );
  }

  parseVersion(version: string): Version {
    if (!version.trim()) {
      throw Error("Invalid version format.");
    }

    let _version = version;
    let option = "";

    const optionIndex = version.search(/[~+-]/);
    if (optionIndex !== -1) {
      option = version.slice(optionIndex);
      _version = version.slice(0, optionIndex);
    }

    const splitedVersion = _version.split(".");

    if (splitedVersion.length > 3) {
      throw Error("Invalid version format.");
    }

    let major: number | string;
    let minor: number | string;
    let patch: number | string;

    [major = "0", minor = "0", patch = "0"] = _version.split(".");

    const epochIndex = major.search(/:/);
    if (epochIndex !== -1) {
      major = major.slice(epochIndex + 1);
    }

    major = Number(major);
    minor = Number(minor);
    patch = Number(patch);

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      throw Error("Invalid version format.");
    }

    if (splitedVersion.length === 2 && !option) {
      return new Version(major, minor, undefined);
    }

    return new Version(major, minor, patch, option);
  }
}

export { EdgeTPUDebianToolchain, EdgeTPUCompiler };
