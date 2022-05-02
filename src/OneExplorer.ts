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

class Node {
  type: NodeType;
  childNodes: Node[];
  uri: vscode.Uri;

  constructor(type: NodeType,
    childNodes: Node[],
    uri: vscode.Uri)
  {
    this.type = type;
    this.childNodes = childNodes;
    this.uri = uri;
  }

  get path():string {
    return this.uri.fsPath;
  }

  get parent():string {
    return path.dirname(this.uri.fsPath);
  }

  get name(): string {
    return path.parse(this.uri.fsPath).base;
  }

  get ext(): string {
    return path.extname(this.uri.fsPath);
  }
}

export class OneNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly node: Node,
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.node.path}`;

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

  constructor(private workspaceRoot: vscode.Uri|undefined) {}

  // TODO(dayo): enable refresh command
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: OneNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OneNode): OneNode[]|Thenable<OneNode[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('Cannot find workspace root');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(this.getNode(element.node));
    } else {
      return Promise.resolve(this.getNode(this.getTree(this.workspaceRoot)));
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
    const node = new Node(NodeType.directory, [], rootPath);

    this.searchNode(node);
    return node;
  }

  /**
   * Construct a tree under the given node
   * @returns void
   */
  private searchNode(node: Node) {
    const files = fs.readdirSync(node.path);

    for (const fname of files) {
      const fpath = path.join(node.path, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isDirectory()) {
        const childNode = new Node(NodeType.directory, [], vscode.Uri.file(fpath));

        this.searchNode(childNode);
        if (childNode.childNodes.length > 0) {
          node.childNodes.push(childNode);
        }
      } 
      else if (fstat.isFile() &&
          (fname.endsWith('.pb') || fname.endsWith('.tflite') || fname.endsWith('.onnx'))) {
        const childNode = new Node(NodeType.model, [], vscode.Uri.file(fpath));

        this.searchPairConfig(childNode);

        node.childNodes.push(childNode);
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
  private searchPairConfig(node: Node) {
    const dirpath = path.dirname(node.path);
    const files = fs.readdirSync(dirpath);

    const extSlicer = (fileName: string) => {
      return fileName.slice(0, fileName.lastIndexOf('.'));
    };

    for (const fname of files) {
      const fpath = path.join(dirpath, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isFile() && fname.endsWith('.cfg') && (extSlicer(fname) === extSlicer(node.name))) {
        const pairNode = new Node(NodeType.config, [], vscode.Uri.file(fpath));
        node.childNodes.push(pairNode);
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
  }
}
