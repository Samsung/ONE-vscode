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
import {Job} from '../Project/Job';
import {JobInstall} from '../Project/JobInstall';
import {JobUninstall} from '../Project/JobUninstall';
import {Logger} from '../Utils/Logger';
import {showInstallQuickInput} from '../View/InstallQuickInput';
import {gToolchainEnvMap} from './ToolchainEnv';


type ToolchainTreeData = BaseNode|undefined|void;

// BaseNode is a wrapper class for vscode.TreeItem
export class BaseNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
    super(label, collapsibleState);
  }
}

// BackendNode expresses a backend for a group of toolchains
// However, BackendNode doesn't have dependency ToolchainNode directly
export class BackendNode extends BaseNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.iconPath = new vscode.ThemeIcon('bracket');
    this.contextValue = 'backend';
  }
}

// ToolchainNode expresses a toolchain from a backend
// Toolchain doesn't have dependency BackendNode directly but can know its backend name
export class ToolchainNode extends BaseNode {
  readonly backendName: string;

  constructor(
      public readonly label: string, public readonly backend: string,
      public readonly toolchain: Toolchain) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('layers');
    this.description = toolchain.info.version ?.str();
    const dependency =
        toolchain.info.depends ?.map((t) => `${t.name} ${t.version.str()}`).join('\n').toString();
    this.tooltip = dependency;
    this.contextValue = 'toolchain';
    this.backendName = backend;
  }
}

// NodeBuilder creates BackendNodes or ToolchainNodes
export class NodeBuilder {
  static createBackendNodes(): BackendNode[] {
    return Object.keys(gToolchainEnvMap).map((backendName) => {
      let bnode = new BackendNode(backendName);
      return bnode;
    });
  }

  static createToolchainNodes(bnode: BaseNode): ToolchainNode[] {
    if ((bnode instanceof BackendNode) === false) {
      return [];
    }

    const backendName = bnode.label;
    if ((backendName in gToolchainEnvMap) === undefined) {
      return [];
    }
    const toolchains = gToolchainEnvMap[bnode.label].listInstalled();
    return toolchains.filter((t) => t.info.version).map((t) => {
      let tnode = new ToolchainNode(t.info.name, backendName, t);
      return tnode;
    });
  }
}

// ToolchainProvider provides TreeData
export class ToolchainProvider implements vscode.TreeDataProvider<BaseNode> {
  tag = this.constructor.name;  // logging tag

  private _onDidChangeTreeData: vscode.EventEmitter<ToolchainTreeData> =
      new vscode.EventEmitter<ToolchainTreeData>();
  readonly onDidChangeTreeData?: vscode.Event<ToolchainTreeData> = this._onDidChangeTreeData.event;

  constructor() {}

  getTreeItem(element: BaseNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: BaseNode): Thenable<BaseNode[]> {
    if (element === undefined) {
      return Promise.resolve(NodeBuilder.createBackendNodes());
    } else {
      return Promise.resolve(NodeBuilder.createToolchainNodes(element));
    }
  }

  error(msg: string): void {
    Logger.error(this.tag, msg);
    vscode.window.showErrorMessage(msg);
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  install() {
    showInstallQuickInput().then(
        ([toolchainEnv, toolchain]) => {
          // NOTE(jyoung)
          // The `DebianToolchain` of the backend and the `DebianToolchain` of this project
          // are not recognized as the same object by `instanceof` function.
          const installed = toolchainEnv.listInstalled().filter(
              value => value.constructor.name === 'DebianToolchain');

          if (installed.length > 1) {
            this.error('Installed debian toolchain must be unique');
            return;
          }

          if (installed.length !== 1) {
            toolchainEnv.install(toolchain).then(() => this.refresh(), () => {
              this.error('Installation is failed');
            });
            return;
          }

          vscode.window
              .showInformationMessage(
                  'Do you want to remove the existing and re-install? Backend toolchain can be installed only once.',
                  'Yes', 'No')
              .then((answer) => {
                if (answer === 'Yes') {
                  const jobs: Array<Job> = [];
                  jobs.push(new JobUninstall(installed[0].uninstall()));
                  jobs.push(new JobInstall(toolchain.install()));
                  const name = `${toolchain.info.name}-${toolchain.info.version ?.str()}`;
                  toolchainEnv.request(jobs).then(
                      () => {
                        this.refresh();
                        vscode.window.showInformationMessage(`Install ${name} successfully`);
                      },
                      () => {
                        this.error('Installation is failed');
                      });
                } else {
                  Logger.info(this.tag, 'Installation is canceled');
                }
              });
        },
        () => {
          Logger.info(this.tag, 'Installation is canceled.');
        });
  }

  uninstall(tnode: ToolchainNode) {
    if (tnode === undefined) {
      throw Error('Invalid toolchain node');
    }

    const backendName = tnode.backendName;
    if (backendName === undefined) {
      throw Error('Invalid toolchain node');
    }

    gToolchainEnvMap[backendName].uninstall(tnode.toolchain).then(() => {
      this.refresh();
    });
  }

  run(_cfg: string) {
    throw Error('Not implemented yet');
  }

  setDefaultToolchain(_node: ToolchainNode) {
    throw Error('Not implemented yet');
  }
}
