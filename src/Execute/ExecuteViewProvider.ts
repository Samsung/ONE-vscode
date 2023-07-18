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

import * as vscode from 'vscode';
import { gToolchainEnvMap } from '../Toolchain/ToolchainEnv';

type ExecutorTreeData = ExecutorNode | undefined | void;

class ExecutorNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
  }
}

class SimulatorNode extends ExecutorNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('debug-start');
    this.contextValue = 'simulator';
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

class TargetNode extends ExecutorNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('debug-start');
    this.contextValue = 'target';
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
    this.node.push(new SimulatorManageNode('SIMULATOR'));
    this.node.push(new TargetManageNode('TARGET'));
  }
  buildNode(element?: ExecutorNode) : ExecutorNode[] {
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
        basenode.child.push(new SimulatorNode(t.info.name));
      });
    });
    return basenode.child as SimulatorNode[];
  }
}

export class ExecutorViewProvider implements vscode.TreeDataProvider<ExecutorNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<ExecutorTreeData> =
    new vscode.EventEmitter<ExecutorTreeData>();
  readonly onDidChangeTreeData?: vscode.Event<ExecutorTreeData> =
    this._onDidChangeTreeData.event;

  builder: NodeBuilder = new NodeBuilder();

  /* istanbul ignore next */
  public static register(context: vscode.ExtensionContext) {
    const provider = new ExecutorViewProvider();

    const registrations = [
      vscode.window.registerTreeDataProvider('ExecutorView', provider),
      vscode.commands.registerCommand("one.executor.refresh", () =>
        provider.refresh()
      ),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }
  getTreeItem(element: ExecutorNode): vscode.TreeItem {
    return element;
  }
  getChildren(element?: ExecutorNode): vscode.ProviderResult<ExecutorNode[]> {
    return this.builder.buildNode(element);
  }
  refresh() {
    this._onDidChangeTreeData.fire();
  }
}