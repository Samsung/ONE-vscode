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

type ExecutorTreeData = ExecutorNode | undefined | void;

enum ExecutorType {
  none = 0,
  simulator,
  target,
}

enum DeviceType {
  none = 0,
  tv,
}

class ExecutorNode extends vscode.TreeItem {
  readonly executorType: ExecutorType;
  readonly deviceType: DeviceType;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly eType: ExecutorType = ExecutorType.none,
    public readonly dType: DeviceType = DeviceType.none
  ) {
    super(label, collapsibleState);
    this.executorType = eType;
    this.deviceType = dType;
  }

  public infer(
    _model: string,
    _options?: Map<string, string>
  ): string | undefined {
    throw new Error("Not implemented");
  }

  public profile(
    _model: string,
    _options?: Map<string, string>
  ): string | undefined {
    throw new Error("Not implemented");
  }

  public getModelInfo(_model: string): string | undefined {
    throw new Error("Not implemented");
  }
}

class TVNode extends ExecutorNode {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly eType: ExecutorType
  ) {
    super(label, collapsibleState, eType, DeviceType.tv);
  }
}

class SimulatorNode extends TVNode {
  tag = this.constructor.name; // logging tag
  toolchain: Toolchain;
  toolchainEnv: ToolchainEnv;

  constructor(
    public readonly label: string,
    public readonly t: Toolchain,
    public readonly tEnv: ToolchainEnv
  ) {
    super(label, vscode.TreeItemCollapsibleState.None, ExecutorType.simulator);
    this.iconPath = new vscode.ThemeIcon("debug-start");
    this.contextValue = "simulator";
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

class SimulatorManageNode extends ExecutorNode {
  child: SimulatorNode[] = [];
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
  }
  buildNode(): SimulatorNode[] {
    return this.child;
  }
}

class TargetNode extends TVNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None, ExecutorType.target);
    this.iconPath = new vscode.ThemeIcon("debug-start");
    this.contextValue = "target";
  }
}

class TargetManageNode extends ExecutorNode {
  child: TargetNode[] = [];
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
  }
  buildNode(): TargetNode[] {
    return this.child;
  }
}

class NodeBuilder {
  node: ExecutorNode[] = [];

  constructor() {
    this.node.push(new SimulatorManageNode("Simulator"));
    this.node.push(new TargetManageNode("Target"));
  }
  buildNode(element?: ExecutorNode): ExecutorNode[] {
    if (element === undefined) {
      return this.node;
    } else if (element instanceof SimulatorManageNode) {
      return this.buildSimulatorNode(element as SimulatorManageNode);
    } else if (element instanceof TargetManageNode) {
      return [];
    }
    return [];
  }
  buildSimulatorNode(basenode: SimulatorManageNode): SimulatorNode[] {
    basenode.child.length = 0;
    Object.entries(gToolchainEnvMap).forEach(([_, toolchainEnv]) => {
      const toolchains = toolchainEnv.listInstalled();
      toolchains
        .filter((t) => t.info.version)
        .map((t) => {
          basenode.child.push(new SimulatorNode(t.info.name, t, toolchainEnv));
        });
    });
    return basenode.child as SimulatorNode[];
  }
}

export class ExecutorViewProvider
  implements vscode.TreeDataProvider<ExecutorNode>
{
  tag = this.constructor.name; // logging tag

  private _onDidChangeTreeData: vscode.EventEmitter<ExecutorTreeData> =
    new vscode.EventEmitter<ExecutorTreeData>();
  readonly onDidChangeTreeData?: vscode.Event<ExecutorTreeData> =
    this._onDidChangeTreeData.event;

  builder: NodeBuilder = new NodeBuilder();
  defaultExecutor!: ExecutorNode;

  /* istanbul ignore next */
  public static register(context: vscode.ExtensionContext) {
    const provider = new ExecutorViewProvider();

    const registrations = [
      vscode.window.registerTreeDataProvider("ExecutorView", provider),
      vscode.commands.registerCommand("one.executor.refresh", () =>
        provider.refresh()
      ),
      vscode.commands.registerCommand("one.executor.inferModel", (model) =>
        provider.infer(model)
      ),
      vscode.commands.registerCommand(
        "one.executor.profileModel",
        (model, options) => provider.profile(model, options)
      ),
      vscode.commands.registerCommand("one.executor.getModelInfo", (model) =>
        provider.getModelInfo(model)
      ),
      // vscode.commands.registerCommand(
      //   "one.executor.setDefaultExecutor",
      //   (toolchain) => provider.setDefaultExecutor(toolchain)
      // ),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }
  getTreeItem(element: ExecutorNode): vscode.TreeItem {
    return element;
  }
  getChildren(element?: ExecutorNode): vscode.ProviderResult<ExecutorNode[]> {
    const nodes = this.builder.buildNode(element);
    const exeNodes = nodes.filter((n) => n.executorType !== ExecutorType.none);
    if (this.defaultExecutor === undefined && exeNodes.length > 0)
    {
      this.defaultExecutor = exeNodes[0];
    }
    return nodes;
  }
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  public infer(
    model: string,
    options?: Map<string, string>
  ): string | undefined {
    return this.defaultExecutor.infer(model, options);
  }

  public profile(
    model: string,
    options?: Map<string, string>
  ): string | undefined {
    return this.defaultExecutor.profile(model, options);
  }

  public getModelInfo(model: string): string | undefined {
    return this.defaultExecutor.getModelInfo(model);
  }

  // public setDefaultExecutor(tnode: ToolchainNode): boolean {
  //   const backendName = tnode.backendName;
  //   if (!Object.keys(gToolchainEnvMap).includes(backendName)) {
  //     this.error("Invalid toolchain node.");
  //     return false;
  //   }

  //   DefaultExecutor.getInstance().set(
  //     gToolchainEnvMap[tnode.backend],
  //     tnode.toolchain
  //   );
  //   this.refresh();
  //   vscode.commands.executeCommand("one.executor.refresh");
  //   return true;
  // }
}
