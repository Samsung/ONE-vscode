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

import { Command } from "../Command";
import { DebianToolchain } from "../ToolchainImpl/DebianToolchain";

import * as ini from "ini";
import * as fs from "fs";
import * as path from "path";

class EdgeTPUDebianToolchain extends DebianToolchain {
  run(cfg: string): Command {
    let cmd = new Command("edgetpu_compiler");
    var config = ini.parse(fs.readFileSync(cfg, "utf-8").trim());

    if (config["edgetpu-compile"] === undefined) {
      return cmd;
    }

    let outDir = path.dirname(config["edgetpu-compile"]["output_path"]);
    cmd.push("--out_dir");
    cmd.push(outDir);

    let intermediateTensors =
      config["edgetpu-compile"]["intermediate_tensors"];
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

    let delegateSearchStep =
      config["edgetpu-compile"]["delegate_search_step"];
    if (delegateSearchStep !== undefined) {
      cmd.push("--delegate_search_step");
      cmd.push(delegateSearchStep);
    }

    let inputPath = config["edgetpu-compile"]["input_path"];
    cmd.push(inputPath);

    return cmd;
  }
}

export { EdgeTPUDebianToolchain };
