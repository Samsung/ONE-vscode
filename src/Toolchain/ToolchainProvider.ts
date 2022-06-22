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

import * as vscode from 'vscode';

import {Toolchain} from '../Backend/Toolchain';
import {Logger} from '../Utils/Logger';
import {showInstallQuickInput} from '../View/InstallQuickInput';

import {gToolchainEnvMap} from './ToolchainEnv';

enum NodeType {
  backend,
  toolchain,
}

export class ToolchainNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly type: NodeType,
      public readonly backend?: string,
      public readonly toolchain?: Toolchain,
  ) {
    super(label, collapsibleState);

    if (type === NodeType.backend) {
      this.iconPath = new vscode.ThemeIcon('bracket');
    } else if (type === NodeType.toolchain) {
      if (backend === undefined || toolchain === undefined) {
        throw Error('Invalid ToolchainNode');
      }
      this.iconPath = new vscode.ThemeIcon('circle-filled');
      this.description = toolchain.info.version ?.str();
      const dependency =
          toolchain.info.depends ?.map((t) => `${t.name} ${t.version.str()}`).join('\n').toString();
      this.tooltip = dependency;
    }
    this.contextValue = NodeType[type];
  }
}

export class ToolchainProvider implements vscode.TreeDataProvider<ToolchainNode> {
  tag = this.constructor.name;  // logging tag

  private _onDidChangeTreeData: vscode.EventEmitter<ToolchainNode|undefined|void> =
      new vscode.EventEmitter<ToolchainNode|undefined|void>();
  readonly onDidChangeTreeData?: vscode.Event<ToolchainNode|undefined|void> =
      this._onDidChangeTreeData.event;

  constructor() {}

  getTreeItem(element: ToolchainNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ToolchainNode): Thenable<ToolchainNode[]> {
    return Promise.resolve(this.getNode(element));
  }

  // TODO(jyoung): Refactor deep depth branches
  private getNode(node: ToolchainNode|undefined): ToolchainNode[] {
    const toToolchainNode =
        (type: NodeType, name: string, backend?: string, toolchain?: Toolchain): ToolchainNode => {
          if (type === NodeType.toolchain) {
            return new ToolchainNode(
                name, vscode.TreeItemCollapsibleState.None, type, backend, toolchain);
          } else {
            return new ToolchainNode(name, vscode.TreeItemCollapsibleState.Expanded, type);
          }
        };
    if (node === undefined) {
      return Object.keys(gToolchainEnvMap)
          .map((backend) => toToolchainNode(NodeType.backend, backend));
    } else {
      if (node.type === NodeType.backend) {
        if (node.label in gToolchainEnvMap) {
          const toolchains = gToolchainEnvMap[node.label].listInstalled();
          return toolchains.filter((t) => t.info.version)
              .map((t) => toToolchainNode(NodeType.toolchain, t.info.name, node.label, t));
        }
      }
    }
    return [];
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  install() {
    showInstallQuickInput().then(
        () => {
          this.refresh();
        },
        () => {
          Logger.info(this.tag, 'Installation is canceled.');
        });
  }

  uninstall(node: ToolchainNode) {
    if (node.backend === undefined || node.toolchain === undefined) {
      throw Error('Invalid toolchain node');
    }
    gToolchainEnvMap[node.backend].uninstall(node.toolchain, (): void => {
      this.refresh();
    });
  }

  run(cfg: string) {
    throw Error('Not implemented yet');
  }
}
