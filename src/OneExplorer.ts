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
import * as vscode from 'vscode';

enum NodeType {
  directory,
  model,
  config
}

interface Node {
  type: NodeType;
  name: string;
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

  // TODO(dayo): enable refresh command
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: OneNode): vscode.TreeItem {
    element
        .command = {command: 'oneExplorer.openFile', title: 'Open File', arguments: [element.node]};
    return element;
  }

  getChildren(element?: OneNode): OneNode[]|Thenable<OneNode[]> {
    if (this.oneTree === undefined) {
      vscode.window.showInformationMessage('No ONE model or config in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(this.getNode(element.node));
    } else {
      return Promise.resolve(this.getNode(this.oneTree));
    }
  }

  private getNode(node: Node): OneNode[] {
    const toOneNode = (node: Node): OneNode => {
      if (node.type === NodeType.directory) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.Expanded, node);
      } else if (node.type === NodeType.model) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.Collapsed, node);
      } else {  // (node.type == NodeType.config)
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      }
    };

    return node.childNodes.map(node => toOneNode(node));
  }

  private getTree(rootPath: vscode.Uri): Node {
    const node: Node = {
      type: NodeType.directory,
      name: path.parse(rootPath.fsPath).base,
      childNodes: [],
      uri: rootPath
    };
    this.searchNode(node, path.dirname(rootPath.fsPath));
    return node;
  }

  private searchNode(node: Node, dirPath: string) {
    const dirpath = path.join(dirPath, node.name);
    const files = fs.readdirSync(dirpath);

    for (const fn of files) {
      const fpath = path.join(dirpath, fn);
      const fstat = fs.statSync(fpath);

      if (fstat.isDirectory()) {
        const dirNode: Node =
            {type: NodeType.directory, name: fn, childNodes: [], uri: vscode.Uri.file(fpath)};

        this.searchNode(dirNode, dirpath);
        if (dirNode.childNodes.length > 0) {
          node.childNodes.push(dirNode);
        }
      } else if (
          fstat.isFile() &&
          (fn.endsWith('.pb') || fn.endsWith('.tflite') || fn.endsWith('.onnx'))) {
        const modelNode:
            Node = {type: NodeType.model, name: fn, childNodes: [], uri: vscode.Uri.file(fpath)};

        this.searchPairConfig(modelNode, dirpath);

        node.childNodes.push(modelNode);
      }
    }
  }

  /**
   * Search .cfg files in the same directory of the node
   *
   * NOTE It assumes 1-1 relation for model and config
   *
   * TODO(dayo) Support N-N relation
   * TODO(dayo) Search by parsing config file's model entry (Currently model name and cfg name must
   * match)
   */
  private searchPairConfig(node: Node, dirPath: string) {
    const dirpath = path.dirname(path.join(dirPath, node.name));
    const files = fs.readdirSync(dirpath);

    const extSlicer = (fileName: string) => {
      return fileName.slice(0, fileName.lastIndexOf('.'));
    };

    for (const fn of files) {
      const fpath = path.join(dirpath, fn);
      const fstat = fs.statSync(fpath);

      if (fstat.isFile() && fn.endsWith('.cfg') && (extSlicer(fn) === extSlicer(node.name))) {
        const configNode:
            Node = {type: NodeType.config, name: fn, childNodes: [], uri: vscode.Uri.file(fpath)};
        node.childNodes.push(configNode);
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
    vscode.commands.registerCommand('oneExplorer.openFile', (file) => this.openFile(file));
  }

  private openFile(node: Node) {
    vscode.window.showTextDocument(node.uri);
  }
}
