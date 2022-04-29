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

export class ToolchainNode extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    private readonly backend: string,
    private readonly version: string,
  ) {
    super(label, collapsibleState);

    this.label = `[${this.backend}] ${this.label}  ${this.version}`;
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
    const toToolchainNode = (b: string, t: Toolchain) : ToolchainNode => {
      return new ToolchainNode(t.info.name, vscode.TreeItemCollapsibleState.None, b, t.info.version.str());
    };

    if (element) {
      return Promise.resolve([]);
    } else {
      if (Object.keys(gCompileEnvMap).length === 0) {
        vscode.window.showInformationMessage('No toolchain installed');
        return Promise.resolve([]);
      } else {
        let nodes: Array<ToolchainNode> = new Array();
        Object.keys(gCompileEnvMap).forEach((backend) => {
          const toolchains = gCompileEnvMap[backend].listInstalled();
          toolchains.filter((t) => t.info.installed === true).forEach(t => {
            nodes.push(toToolchainNode(backend, t));
          });
        });
        return Promise.resolve(nodes);
      }
    }
  }

  refresh() {
    Object.keys(gCompileEnvMap).forEach((backend) => {
      gCompileEnvMap[backend].refresh();
    });
    this._onDidChangeTreeData.fire();
  }
}