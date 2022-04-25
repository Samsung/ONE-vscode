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
import { Model } from './Circlereader/circle-analysis/circle/model';

enum NodeType{
  directory,
  model,
  config,
  configWrapper
}

interface Node {
  type: NodeType, name: string, childs: Node[]
}

interface DirNode extends Node{
  uri: vscode.Uri
}

interface ModelNode extends Node {
  uri: vscode.Uri
}

interface ConfigNode extends Node {
  uri: vscode.Uri
  pairModel: Node
}

interface ConfigWrapperNode extends Node {
}

export class ContextNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly node: Node,
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;

    if (node.type === NodeType.config) {
      this.iconPath = new vscode.ThemeIcon('gear');
    }
    else if (node.type === NodeType.directory){
      this.iconPath = vscode.ThemeIcon.Folder;
    }
    else if (node.type === NodeType.model) {
      this.iconPath = vscode.ThemeIcon.File;
    }
    else if (node.type === NodeType.configWrapper) {
      this.iconPath = new vscode.ThemeIcon('symbol-structure');
    }
  }
}

export class ContextTreeDataProvider implements vscode.TreeDataProvider<ContextNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<ContextNode|undefined|void> =
      new vscode.EventEmitter<ContextNode|undefined|void>();
  readonly onDidChangeTreeData: vscode.Event<ContextNode|undefined|void> =
      this._onDidChangeTreeData.event;

  private cfgMap: Node|undefined;

  constructor(private workspaceRoot: vscode.Uri|undefined) {
    if (workspaceRoot !== undefined) {
      this.cfgMap = this.getConfigMap(workspaceRoot);
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ContextNode): vscode.TreeItem {
    if (element.node.type === NodeType.directory) {
      element.command = { command: 'contextExplorer.openConfigFile', title: "Open File", arguments: [element.node] };
    }
    return element;
  }

  getChildren(element?: ContextNode): ContextNode[]|Thenable<ContextNode[]> {
    if (this.cfgMap === undefined) {
      vscode.window.showInformationMessage('No context in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(this.getNode(element.node));
    } else {
      return Promise.resolve(this.getNode(this.cfgMap));
    }
  }

  private getNode(node: Node): ContextNode[] {
    const toContext = (node: Node): ContextNode => {
      if (node.childs.length > 0) {
        return new ContextNode(node.name, vscode.TreeItemCollapsibleState.Collapsed, node);
      } else {
        return new ContextNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      }
    };

    return node.childs.map(node => toContext(node));
  }

  private getConfigMap(rootPath: vscode.Uri): Node {
    const node = {type: NodeType.directory, name: path.parse(rootPath.fsPath).base, dir: true, childs: [], uri: rootPath};
    this.searchConfigs(node, path.dirname(rootPath.fsPath));
    return node;
  }

  private searchConfigs(node: Node, dirPath: string) {
    const dirpath = path.join(dirPath, node.name);
    const files = fs.readdirSync(dirpath);

    for (const fn of files) {
      const fpath = path.join(dirpath, fn);
      const fstat = fs.statSync(fpath);

      if (fstat.isDirectory()) {
        const dirNode = {type: NodeType.directory, name: fn, dir: true, childs: [], uri: vscode.Uri.file(fpath)};

        this.searchConfigs(dirNode, dirpath);
        if (dirNode.childs.length > 0) {
          node.childs.push(dirNode);
        }
      }
      else if ((fstat.isFile() 
        && (fn.endsWith('.tflite')) || fn.endsWith('.onnx'))){
        const modelNode: ModelNode = {type: NodeType.model, name: fn, childs: [], uri: vscode.Uri.file(fpath)};
        this.searchPairConfig(modelNode, dirpath);

        node.childs.push(modelNode);
      }
    }
  }

  /**
   * Search cfg files in the same directory of the node
   * 
   * NOTE It assumes 1-1 relation for model and config
   * 
   * TODO(dayo) Support N-N relation
   */
  private searchPairConfig(node: ModelNode, dirPath: string)
  {
    const dirpath = path.dirname(path.join(dirPath, node.name));
    const files = fs.readdirSync(dirpath);

    const extSlicer = (fileName: string) =>
    {
      return fileName.slice(0, fileName.lastIndexOf('.'));
    };

    for (const fn of files) {
      const fpath = path.join(dirpath, fn);
      const fstat = fs.statSync(fpath);

      if (fstat.isFile() 
      && fn.endsWith('.cfg')
      && (extSlicer(fn) === extSlicer(node.name))){
        console.log(fpath);
        const configWrapperNode : ConfigWrapperNode = {type: NodeType.configWrapper, name: extSlicer(fn) + ' (ONE configuration)', childs: []};
        node.childs.push(configWrapperNode);
        console.log("searchPairConfig: configWrapperNode: "+configWrapperNode);

        const configNode : ConfigNode = {pairModel: node, type: NodeType.config, name: fn, childs: [], uri: vscode.Uri.file(fpath)};
        configWrapperNode.childs.push(configNode);
        console.log("searchPairConfig: configNode: "+configNode);
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

  private openConfigFile(dirnode: DirNode) {
    vscode.window.showTextDocument(dirnode.uri);
  }
}
