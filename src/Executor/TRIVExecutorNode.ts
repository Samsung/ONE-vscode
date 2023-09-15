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
import { ExecutorNode, ExecutorNodeBuilder } from "./ExecutorNodeBuilder";

class TRIVExecutorNode extends ExecutorNode {
  child: (TRIVSimulatorNode|TRIVTargetNode)[] = [];
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState, 'TRIV');
    this.contextValue += ".triv";
  }
}

class TRIVNameNode extends TRIVExecutorNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue += ".name";
    this.iconPath = '';
  }
}

class TRIVSimulatorNode extends TRIVExecutorNode {
  tag = this.constructor.name; // logging tag
  toolchain: Toolchain;
  toolchainEnv: ToolchainEnv;

  constructor(
    public readonly label: string,
    public readonly t: Toolchain,
    public readonly tEnv: ToolchainEnv
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue += ".simulator";
    this.toolchain = t;
    this.toolchainEnv = tEnv;
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

class TRIVTargetNode extends TRIVExecutorNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue += ".target";
  }
}

class TRIVExecutorNodeBuilder implements ExecutorNodeBuilder {
  node: TRIVExecutorNode[] = [];

  constructor() {
    this.node.push(new TRIVNameNode("TRIV"));
  }

  buildNode(element?: ExecutorNode | undefined): ExecutorNode[] {
    if (element === undefined) {
      return this.node;
    } else if (element.label === "TRIV") {
      return this.buildSimulatorNode(element as TRIVExecutorNode );
    }
    return [];
  }

  buildSimulatorNode(element: TRIVExecutorNode): TRIVSimulatorNode[] {
    element.child.length = 0;
    Object.entries(gToolchainEnvMap).forEach(([_, toolchainEnv]) => {
      const toolchains = toolchainEnv.listInstalled();
      toolchains
        .filter((t) => t.info.version)
        .map((t) => {
          element.child.push(new TRIVSimulatorNode(t.info.name, t, toolchainEnv));
        });
    });
    return element.child as TRIVSimulatorNode[];
  }
}

export { TRIVExecutorNodeBuilder };