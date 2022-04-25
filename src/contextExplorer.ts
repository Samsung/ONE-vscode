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

import * as fs from 'fs';
import * as path from 'path';
import {config} from 'process';
import {stringify} from 'querystring';
import * as vscode from 'vscode';

enum NodeType{
  directory,
  model,
  config
}


interface DirNode {
  type: NodeType, dir: boolean, name: string, childs: DirNode[], uri: vscode.Uri
}

interface ModelNode extends DirNode {
  modeltype: string
}
interface DirectoryNode extends DirNode {}
interface ConfigNode extends DirNode {}

export class ContextNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly dirnode: DirNode,
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;

    if (dirnode.type === NodeType.config) {
      this.iconPath = new vscode.ThemeIcon('gear');
    }

    if (dirnode.type === NodeType.directory){
      this.iconPath = vscode.ThemeIcon.Folder;
    }

    if (dirnode.type === NodeType.model) {
      this.iconPath = vscode.ThemeIcon.File;
    }
  }
}

export class ContextTreeDataProvider implements vscode.TreeDataProvider<ContextNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<ContextNode|undefined|void> =
      new vscode.EventEmitter<ContextNode|undefined|void>();
  readonly onDidChangeTreeData: vscode.Event<ContextNode|undefined|void> =
      this._onDidChangeTreeData.event;

  private cfgMap: DirNode|undefined;

  constructor(private workspaceRoot: vscode.Uri|undefined) {
    if (workspaceRoot !== undefined) {
      this.cfgMap = this.getConfigMap(workspaceRoot);
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ContextNode): vscode.TreeItem {
    if (element.dirnode.dir === false) {
      element.command = { command: 'contextExplorer.openConfigFile', title: "Open File", arguments: [element.dirnode] };
    }
    return element;
  }

  getChildren(element?: ContextNode): ContextNode[]|Thenable<ContextNode[]> {
    if (this.cfgMap === undefined) {
      vscode.window.showInformationMessage('No context in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(this.getContextNode(element.dirnode));
    } else {
      return Promise.resolve(this.getContextNode(this.cfgMap));
    }
  }

  private getContextNode(node: DirNode): ContextNode[] {
    const toContext = (node: DirNode): ContextNode => {
      if (node.dir) {
        return new ContextNode(node.name, vscode.TreeItemCollapsibleState.Collapsed, node);
      } else {
        return new ContextNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      }
    };

    return node.childs.map(node => toContext(node));
  }

  private getConfigMap(rootPath: vscode.Uri): DirNode {
    const node = {type: NodeType.directory, name: path.parse(rootPath.fsPath).base, dir: true, childs: [], uri: rootPath};
    this.searchConfigs(node, path.dirname(rootPath.fsPath));
    return node;
  }

  private searchConfigs(node: DirNode, rootPath: string) {
    const dirpath = path.join(rootPath, node.name);
    const files = fs.readdirSync(dirpath);
    for (const fn of files) {
      const fpath = path.join(dirpath, fn);
      const fstat = fs.statSync(fpath);

      if (fstat.isDirectory()) {
        const dirnode = {type: NodeType.directory, name: fn, dir: true, childs: [], uri: vscode.Uri.file(fpath)};

        this.searchConfigs(dirnode, dirpath);
        if (dirnode.childs.length > 0) {
          node.childs.push(dirnode);
        }
      }
      else if (fstat.isFile() && fn.endsWith('.cfg')) {
        const dirnode = {type: NodeType.config, name: fn, dir: false, childs: [], uri: vscode.Uri.file(fpath)};
        node.childs.push(dirnode);
      }
      else if (fstat.isFile() && fn.endsWith('.tflite')) {
        const dirnode = {type: NodeType.model, name: fn, dir: false, childs: [], uri: vscode.Uri.file(fpath)};
        node.childs.push(dirnode);
      }
      else if (fstat.isFile() && fn.endsWith('.onnx')) {
        const dirnode = {type: NodeType.model, name: fn, dir: false, childs: [], uri: vscode.Uri.file(fpath)};
        node.childs.push(dirnode);
      }
    }
  }
}

export class ContextExplorer {
  constructor(context: vscode.ExtensionContext) {
    const rootPath =
        (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0)) ?
        vscode.workspace.workspaceFolders[0].uri :
        undefined;

    const contextProvider = new ContextTreeDataProvider(rootPath);
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('ContextExplorerView', contextProvider));
    vscode.commands.registerCommand('contextExplorer.openConfigFile', (file) => this.openConfigFile(file));
  }

  private openConfigFile(node: DirNode) {
    vscode.window.showTextDocument(node.uri);
  }
}
