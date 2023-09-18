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

import { Logger } from "../Utils/Logger";
import { Toolchain } from "../Backend/Toolchain";
import { ToolchainEnv, gToolchainEnvMap } from "../Toolchain/ToolchainEnv";
import { CompilerNode, CompilerNodeBuilder } from "./CompilerNodeBuilder";
import { defaultCompiler } from "./DefaultCompiler";

const deviceName = "Backend";

class ToolchainCompilerNode extends CompilerNode {
  child: ToolchainNode[] = [];
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState, deviceName);
    this.contextValue += ".Backend";
  }
}

class ToolchainNameNode extends ToolchainCompilerNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue += ".name";
    this.iconPath = "";
  }
}

// ToolchainNode expresses a toolchain from a backend
// Toolchain doesn't have dependency BackendNode directly but can know its backend name
class ToolchainNode extends ToolchainCompilerNode {
  readonly tag = this.constructor.name; // logging tag
  readonly backendName: string;

  constructor(
    public readonly label: string,
    public readonly backend: string,
    public readonly toolchain: Toolchain
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = toolchain.info.version?.str();
    const dependency = toolchain.info.depends
      ?.map((t) => `${t.name} ${t.version.str()}`)
      .join("\n")
      .toString();
    this.tooltip = dependency;
    this.backendName = backend;
  }

  private error(msg: string, ...args: string[]): Thenable<string | undefined> {
    Logger.error(this.tag, msg);
    return vscode.window.showErrorMessage(msg, ...args);
  }

  private checkAvailableToolchain(): [
    ToolchainEnv | undefined,
    Toolchain | undefined
  ] {
    /* istanbul ignore next */
    const notifyGuideline = () => {
      this.error(
        "Default toolchain is not set. Please install toolchain and set the default toolchain.",
        "OK",
        "See Instructions"
      ).then((value) => {
        if (value === "See Instructions") {
          /* istanbul ignore next */
          defaultCompiler.openDocument();
        }
      });
    };

    const compilerNode = defaultCompiler.get();
    if (compilerNode instanceof ToolchainNode) {
      const toolchainNode = compilerNode as ToolchainNode;
      const activeToolchainEnv = gToolchainEnvMap[toolchainNode.backendName];
      const activeToolchain = toolchainNode.toolchain;

      if (!activeToolchainEnv || !activeToolchain) {
        notifyGuideline();
        return [undefined, undefined];
      }

      return [activeToolchainEnv, activeToolchain];
    }
    return [undefined, undefined];
  }

  public compile(
    cfg: string,
    _options?: Map<string, string>
  ): string | undefined {
    /* istanbul ignore next */
    const notifySuccess = () => {
      vscode.window.showInformationMessage("Onecc has run successfully.");
    };

    /* istanbul ignore next */
    const notifyError = () => {
      this.error("Running onecc has failed.");
    };

    const [activeToolchainEnv, activeToolchain] =
      this.checkAvailableToolchain();
    if (activeToolchainEnv === undefined || activeToolchain === undefined) {
      return;
    }

    Logger.info(
      this.tag,
      `Run onecc with ${cfg} cfg and ${
        activeToolchain.info.name
      }-${activeToolchain.info.version?.str()} toolchain.`
    );
    activeToolchainEnv.run(cfg, activeToolchain).then(
      () => notifySuccess(),
      () => notifyError()
    );
    return;
  }
}

// NodeBuilder creates BackendNodes or ToolchainNodes
class ToolchainCompilerNodeBuilder implements CompilerNodeBuilder {
  createBackendNodes(): ToolchainCompilerNode[] {
    const nodes: ToolchainCompilerNode[] = [];
    nodes.push(new ToolchainNameNode("TRIV"));
    Object.keys(gToolchainEnvMap).forEach((backendName) => {
      // Ignore Backend backends with version number
      if (!backendName.includes("TRIV")) {
        nodes.push(new ToolchainNameNode(backendName));
      }
    });
    return nodes;
  }

  createToolchainNodes(node: CompilerNode): ToolchainNode[] {
    let children: ToolchainNode[] = [];
    const filter = Object.keys(gToolchainEnvMap).filter((backendName) =>
      backendName.includes(node.label)
    );
    filter.forEach((backendName) => {
      const toolchains = gToolchainEnvMap[backendName].listInstalled();
      toolchains
        .filter((t) => t.info.version)
        .map((t) => {
          children.push(new ToolchainNode(t.info.name, backendName, t));
        });
    });
    return children;
  }

  buildNode(element?: CompilerNode | undefined): CompilerNode[] {
    if (element === undefined) {
      return this.createBackendNodes();
    } else {
      return this.createToolchainNodes(element);
    }
  }
}

export { ToolchainCompilerNodeBuilder };
