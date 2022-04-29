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

import { assert } from 'console';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

enum NodeType {
  directory,
  model,
  config
}

interface Node {
  type: NodeType;
  name: string;
  path: string;
  childNodes: Node[];
  uri: vscode.Uri;
}

export class OneNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly node: Node,
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.node.uri.fsPath}`;

    if (node.type === NodeType.config) {
      this.iconPath = new vscode.ThemeIcon('gear');
    } else if (node.type === NodeType.directory) {
      this.iconPath = vscode.ThemeIcon.Folder;
    } else if (node.type === NodeType.model) {
      this.iconPath = vscode.ThemeIcon.File;
    }

    if(node.type == NodeType.config)
    {
      this.command = {command: 'onevscode.openfile-one-explorer', title: 'Open File', arguments: [this.node]};
    }
  }
}

export class OneTreeDataProvider implements vscode.TreeDataProvider<OneNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<OneNode|undefined|void> =
      new vscode.EventEmitter<OneNode|undefined|void>();
  readonly onDidChangeTreeData: vscode.Event<OneNode|undefined|void> =
      this._onDidChangeTreeData.event;

  private oneTree: Node|undefined;

  constructor(private workspaceRoot: vscode.Uri|undefined) {
    if (workspaceRoot !== undefined) {
      this.oneTree = this.getTree(workspaceRoot);
    }
  }

  refresh(): void {
    console.log('refresh called');
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: OneNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OneNode): OneNode[]|Thenable<OneNode[]> {
    if(element)
      console.log("getChildren for "+ element.node.path);

    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('Cannot find your workspace root.');
      return Promise.resolve([]);
    }

    if (element) {
      if(this.pathExists(element.node.path))
      {
        return Promise.resolve(this.getNode(element.node));
      }
      else
      {
        console.warn(`Path not exist: ${element}`);
        return Promise.resolve([]);
      }
    } else {
      if(this.workspaceRoot)
      {
        return Promise.resolve(this.getNode(this.getTree(this.workspaceRoot)));
      }
      else
      {
        console.log("ERROR");
        return Promise.resolve([]);
     }
   }
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }

  private getNode(node: Node): OneNode[] {
    const toOneNode = (node: Node): OneNode => {
      if (node.type == NodeType.directory){
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.Expanded, node);
      } else if(node.type == NodeType.model){
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.Collapsed, node);
      } else {// (node.type == NodeType.config)
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      }
    };

    return node.childNodes.map(node => toOneNode(node));
  }

  private getTree(rootPath: vscode.Uri): Node {
    const node: Node = {
      type: NodeType.directory,
      name: path.parse(rootPath.fsPath).base,
      path: rootPath.fsPath,
      childNodes: [],
      uri: rootPath
    };
    this.searchNode(node);
    return node;
  }

  private searchNode(node: Node) {
    assert(node.type === NodeType.directory);

    const dirpath = node.path;
    const files = fs.readdirSync(dirpath);

    for (const fname of files) {
      const fpath = path.join(dirpath, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isDirectory()) {
        const dirNode: Node =
            {type: NodeType.directory, name: fname, path: fpath, childNodes: [], uri: vscode.Uri.file(fpath)};

        this.searchNode(dirNode);
        if (dirNode.childNodes.length > 0) {
          node.childNodes.push(dirNode);
        }
      } 
      else if 
      (fstat.isFile() &&
        (fname.endsWith('.pb') || fname.endsWith('.tflite') || fname.endsWith('.onnx'))) {

        const modelNode:
          Node = {type: NodeType.model, name: fname, path: fpath, childNodes: [], uri: vscode.Uri.file(fpath)};

        this.searchPairConfig(modelNode);
        node.childNodes.push(modelNode);
      }
    }
  }

  /**
   * Search .cfg files in the same directory of the node
   */
  private searchPairConfig(node: Node) {
    const modelPath = node.path;
    const modelName = node.name;
    const modelExt = path.extname(modelPath).slice(1);
    
    const readInputPath = (configPath: string) => {
      const ini = require('ini');
      const config = ini.parse(fs.readFileSync(configPath).toString());
      return config[`one-import-${modelExt}`]['input_path'];
    };

    const dirPath = path.dirname(modelPath);
    const files = fs.readdirSync(dirPath);
    for (const fn of files) {
      const fpath = path.join(dirPath, fn);
      const fstat = fs.statSync(fpath);

      if (fstat.isFile() && fn.endsWith('.cfg')) {
        if (readInputPath(fpath) === modelName) {
          const configNode:
            Node = {type: NodeType.config, name: fn, path:fpath, childNodes: [], uri: vscode.Uri.file(fpath)};
          node.childNodes.push(configNode);
        }
      }
    }
  }
}

export class OneExplorer {
  constructor(context: vscode.ExtensionContext) {
    const rootPath =
        (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0)) ?
        vscode.workspace.workspaceFolders[0].uri :
        undefined;

    const oneTreeDataProvider = new OneTreeDataProvider(rootPath);

    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('OneExplorerView', oneTreeDataProvider));

    vscode.commands.registerCommand('onevscode.refresh-one-explorer', () => oneTreeDataProvider.refresh());
    vscode.commands.registerCommand('onevscode.openfile-one-explorer', (file) => this.openFile(file));
  }

  private openFile(node: Node) {
    vscode.window.showTextDocument(node.uri);
  }
}
