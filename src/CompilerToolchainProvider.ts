/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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
import { gCompileEnvMap } from './Compile/CompileEnv';
import {Toolchain} from './Backend/Toolchain';

enum NodeType {
  backend,
  toolchain,
}

// interface Node {
//   type: NodeType;
//   name: string;
//   version: string;
// }

export class ToolchainNode extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private readonly type: NodeType,
    public readonly version?: string,
  ) {
    super(label, collapsibleState);

    if (type === NodeType.backend) {
      this.iconPath = new vscode.ThemeIcon('bracket');
    } else {
      this.iconPath = new vscode.ThemeIcon('circle-filled');
      this.label = `${this.label} ${this.version}`;
    }
  }
}

export class CompilerToolchainProvider implements vscode.TreeDataProvider<ToolchainNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<ToolchainNode | undefined | void> = new vscode.EventEmitter<ToolchainNode | undefined|void>();
  readonly onDidChangeTreeData?: vscode.Event<ToolchainNode | undefined | void> = this._onDidChangeTreeData.event; 

  constructor(private context: vscode.ExtensionContext) {
  }

  getTreeItem(element: ToolchainNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ToolchainNode): Thenable<ToolchainNode[]> {
    if (element) {
      return Promise.resolve(this.getNode(element.label));
    } else {
      if (Object.keys(gCompileEnvMap).length === 0) {
        vscode.window.showInformationMessage('No toolchain installed');
        return Promise.resolve([]);
      } else {
        const nodes = Object.keys(gCompileEnvMap).map((backend) => this.toToolchainNode(NodeType.backend, backend));
        return Promise.resolve(nodes);
      }
    }
  }

  private toToolchainNode(type: NodeType, name: string, version?: string): ToolchainNode {
    if (type === NodeType.backend) {
      return new ToolchainNode(name, vscode.TreeItemCollapsibleState.Expanded, type);
    } else {
      return new ToolchainNode(name, vscode.TreeItemCollapsibleState.None, type, version);
    }
  }

  private getNode(backend: string): ToolchainNode[] {
    if (backend in gCompileEnvMap) {
      const toolchains = gCompileEnvMap[backend].listInstalled();
      return toolchains.filter((t) => t.info.installed).map((t) => this.toToolchainNode(NodeType.toolchain, t.info.name, t.info.version.str()));
    } else {
      return [];
    }
  }

  refresh() {
    Object.keys(gCompileEnvMap).forEach((backend) => {
      gCompileEnvMap[backend].refresh();
    });
    this._onDidChangeTreeData.fire();
  }
}