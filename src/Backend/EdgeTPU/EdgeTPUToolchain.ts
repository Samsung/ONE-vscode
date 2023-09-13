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

import * as cp from "child_process";
import * as vscode from "vscode";
import * as ini from "ini";
import * as fs from "fs";
import * as path from "path";

import { pipedSpawnSync } from "../../Utils/PipedSpawnSync";
import { Backend } from "../Backend";
import { Command } from "../Command";
import { Compiler } from "../Compiler";
import { Executor } from "../Executor";
import { PackageInfo, ToolchainInfo, Toolchains } from "../Toolchain";
import { DebianToolchain } from "../ToolchainImpl/DebianToolchain";
import { Version } from "../Version";

class EdgeTPUDebianToolchain extends DebianToolchain {
  run(cfg: string): Command {
    let cmd = new Command("edgetpu_compiler");
    var config = ini.parse(fs.readFileSync(cfg, "utf-8").trim());

    if (config["one-import-edgetpu"] === undefined) {
      return cmd;
    }

    let outDir = path.dirname(config["one-import-edgetpu"]["output_path"]);
    cmd.push("--out_dir");
    cmd.push(outDir);

    let help = config["one-import-edgetpu"]["help"];
    if (help === "True") {
      cmd.push("--help");
    }

    let intermediateTensors =
      config["one-import-edgetpu"]["intermediate_tensors"];
    if (intermediateTensors !== undefined) {
      cmd.push("--intermediate_tensors");
      cmd.push(intermediateTensors);
    }

    let showOperations = config["one-import-edgetpu"]["show_operations"];
    if (showOperations === "True") {
      cmd.push("--show_operations");
    }

    let minRuntimeVersion = config["one-import-edgetpu"]["min_runtime_version"];
    if (minRuntimeVersion !== undefined) {
      cmd.push("--min_runtime_version");
      cmd.push(minRuntimeVersion);
    }

    let searchDelegate = config["one-import-edgetpu"]["search_delegate"];
    if (searchDelegate === "True") {
      cmd.push("--search_delegate");
    }

    let delegateSearchStep =
      config["one-import-edgetpu"]["delegate_search_step"];
    if (delegateSearchStep !== undefined) {
      cmd.push("--delegate_search_step");
      cmd.push(delegateSearchStep);
    }

    let inputPath = config["one-import-edgetpu"]["input_path"];
    cmd.push(inputPath);

    return cmd;
  }
}

class EdgeTPUCompiler implements Compiler {
  private readonly toolchainTypes: string[];
  private readonly toolchainName: string;

  constructor() {
    this.toolchainName = "edgetpu-compiler";
    this.toolchainTypes = ["latest"];
  }

  getToolchainTypes(): string[] {
    return this.toolchainTypes;
  }

  parseVersion(version: string): Version {
    if (!version.trim()) {
      throw Error("Invalid version format.");
    }

    let _version = version;

    const optionIndex = version.search(/[~+-]/);
    if (optionIndex !== -1) {
      _version = version.slice(0, optionIndex);
    }

    const splitedVersion = _version.split(".");

    if (splitedVersion.length > 2) {
      throw Error("Invalid version format.");
    }

    let major: number | string;
    let minor: number | string;

    [major = "0", minor = "0"] = _version.split(".");

    const epochIndex = major.search(/:/);
    if (epochIndex !== -1) {
      major = major.slice(epochIndex + 1);
    }

    major = Number(major);
    minor = Number(minor);

    if (isNaN(major) || isNaN(minor)) {
      throw Error("Invalid version format.");
    }

    return new Version(major, minor);
  }

  getToolchains(
    _toolchainType: string,
    _start: number,
    _count: number
  ): Toolchains {
    if (_toolchainType !== "latest") {
      throw Error(`Invalid toolchain type : ${_toolchainType}`);
    }

    if (_start < 0) {
      throw Error(`wrong start number: ${_start}`);
    }
    if (_count < 0) {
      throw Error(`wrong count number: ${_count}`);
    }
    if (_count === 0) {
      return [];
    }

    try {
      cp.spawnSync(`apt-cache show ${this.toolchainName}`);
    } catch (error) {
      throw Error(`Getting ${this.toolchainName} package list is failed`);
    }

    let result;
    try {
      result = pipedSpawnSync(
        "apt-cache",
        ["madison", `${this.toolchainName}`],
        { encoding: "utf8" },
        "awk",
        ['{printf $3" "}'],
        { encoding: "utf8" }
      );
    } catch (error) {
      throw Error(
        `Getting ${this.toolchainName} package version list is failed`
      );
    }

    if (result.status !== 0) {
      return [];
    }

    const toolchainVersions: string = result.stdout.toString();
    const versionList = toolchainVersions.trim().split(" ");

    const availableToolchains = new Toolchains();
    for (const version of versionList) {
      const toolchainInfo = new ToolchainInfo(
        this.toolchainName,
        "Description: test",
        this.parseVersion(version)
      );

      const toolchain = new EdgeTPUDebianToolchain(toolchainInfo);
      availableToolchains.push(toolchain);
    }

    return availableToolchains;
  }

  getInstalledToolchains(_toolchainType: string): Toolchains {
    if (_toolchainType !== "latest") {
      throw Error(`Invalid toolchain type : ${_toolchainType}`);
    }

    let result;
    try {
      result = cp.spawnSync(
        "dpkg-query",
        [
          "--show",
          `--showformat='\${Version} \${Description}'`,
          `${this.toolchainName}`,
        ],
        { encoding: "utf8" }
      );
    } catch (error) {
      throw new Error(
        `Getting installed ${this.toolchainName} package list is failed`
      );
    }

    if (result.status !== 0) {
      return [];
    }

    // NOTE
    // The output format string of dpkg-query is '${Version} ${Description}'.
    // To remove the first and last single quote character of output string, it slices from 1 to -1.
    const installedToolchain: string = result.stdout.toString().slice(1, -1);

    const descriptionIdx = installedToolchain.search(" ");
    const versionStr = installedToolchain.slice(0, descriptionIdx).trim();
    const description = installedToolchain.slice(descriptionIdx).trim();

    const depends: Array<PackageInfo> = [
      new PackageInfo("edgetpu_compiler", new Version(16, 0)),
    ];
    const toolchainInfo = new ToolchainInfo(
      this.toolchainName,
      description,
      this.parseVersion(versionStr),
      depends
    );
    const toolchain = new EdgeTPUDebianToolchain(toolchainInfo);
    return [toolchain];
  }

  prerequisitesForGetToolchains(): Command {
    const extensionId = "Samsung.one-vscode";
    const ext = vscode.extensions.getExtension(
      extensionId
    ) as vscode.Extension<any>;
    const scriptPath = vscode.Uri.joinPath(
      ext!.extensionUri,
      "script",
      "prerequisitesForGetEdgeTPUToolchain.sh"
    ).fsPath;

    const cmd = new Command("/bin/sh", [`${scriptPath}`]);
    cmd.setRoot();
    return cmd;
  }
}

class EdgeTPUToolchain implements Backend {
  private readonly backendName: string;
  private readonly toolchainCompiler: EdgeTPUCompiler | undefined;

  constructor() {
    this.backendName = "EdgeTPU";
    this.toolchainCompiler = new EdgeTPUCompiler();
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

export { EdgeTPUDebianToolchain, EdgeTPUCompiler, EdgeTPUToolchain };
