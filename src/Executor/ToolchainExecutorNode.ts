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

import * as vscode from "vscode";

import { ToolchainEnv, gToolchainEnvMap } from "../Toolchain/ToolchainEnv";
import { Toolchain } from "../Backend/Toolchain";
import { Logger } from "../Utils/Logger";
import {
  ExecutorNode,
  ExecutorNodeBuilder,
  SimulatorNode,
} from "./ExecutorNodeBuilder";
import { defaultExecutor } from "./DefaultExecutor";

class ToolchainNameNode extends ExecutorNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue += ".name";
    this.iconPath = "";
  }
}

class ToolchainSimulatorNode extends SimulatorNode {
  tag = this.constructor.name; // logging tag
  toolchain: Toolchain;
  toolchainEnv: ToolchainEnv;

  constructor(
    public readonly label: string,
    public readonly t: Toolchain,
    public readonly tEnv: ToolchainEnv
  ) {
    super(label);
    this.description = t.info.name;
    this.toolchain = t;
    this.toolchainEnv = tEnv;
    if (defaultExecutor.isEqual(this)) {
      this.iconPath = new vscode.ThemeIcon(
        "debug-continue",
        new vscode.ThemeColor("debugIcon.startForeground")
      );
      this.contextValue += ".default";
    }
  }

  public infer(
    model: string,
    options?: Map<string, string>
  ): string | undefined {
    Logger.info(
      this.tag,
      `Infer ${model} file using ${
        this.toolchain.info.name
      }-${this.toolchain.info.version?.str()} toolchain.`
    );

    this.toolchainEnv.infer(this.toolchain, model, options).then(
      (result: string) => {
        vscode.window.showInformationMessage("Inference success.");
        return result;
      },
      () => {
        vscode.window.showErrorMessage("Inference has failed.");
      }
    );
    return;
  }

  public profile(
    model: string,
    options?: Map<string, string>
  ): string | undefined {
    Logger.info(
      this.tag,
      `Profile ${model} file using ${
        this.toolchain.info.name
      }-${this.toolchain.info.version?.str()} toolchain.`
    );

    this.toolchainEnv.profile(this.toolchain, model, options).then(
      () => {
        vscode.window.showInformationMessage("Profile success.");
      },
      () => {
        vscode.window.showErrorMessage("Profile has failed.");
      }
    );
    return;
  }

  public getModelInfo(model: string): string | undefined {
    Logger.info(
      this.tag,
      `Run show with ${model} file using ${
        this.toolchain.info.name
      }-${this.toolchain.info.version?.str()} toolchain.`
    );

    this.toolchainEnv.getModelInfo(this.toolchain, model, "target-arch").then(
      (result: string) => {
        vscode.window.showInformationMessage(
          "Getting model information success."
        );
        return result;
      },
      () => {
        vscode.window.showErrorMessage("Getting model information has failed.");
      }
    );
    return;
  }
}

class ToolchainExecutorNodeBuilder implements ExecutorNodeBuilder {
  createBackendNodes(): ExecutorNode[] {
    const nodes: ExecutorNode[] = [];
    nodes.push(new ToolchainNameNode("TRIV"));
    Object.keys(gToolchainEnvMap).forEach((backendName) => {
      // Ignore TRIV backends with version number
      if (!backendName.includes("TRIV")) {
        nodes.push(new ToolchainNameNode(backendName));
      }
    });
    return nodes;
  }

  buildSimulatorNode(element: ExecutorNode): ToolchainSimulatorNode[] {
    element.child.length = 0;
    const filter = Object.keys(gToolchainEnvMap).filter((backendName) =>
      backendName.includes(element.label)
    );
    filter.forEach((backendName) => {
      const toolchainEnv = gToolchainEnvMap[backendName];
      const toolchains = toolchainEnv.listInstalled();
      toolchains
        .filter((t) => t.info.version)
        .map((t) => {
          const name = "simulator" + (element.child.length + 1);
          element.child.push(new ToolchainSimulatorNode(name, t, toolchainEnv));
        });
    });
    return element.child as ToolchainSimulatorNode[];
  }

  buildNode(element?: ExecutorNode | undefined): ExecutorNode[] {
    if (element === undefined) {
      return this.createBackendNodes();
    } else {
      return this.buildSimulatorNode(element as ExecutorNode);
    }
  }
}

export { ToolchainExecutorNodeBuilder };
