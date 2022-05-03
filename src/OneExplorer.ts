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
import * as ini from 'ini';
import * as path from 'path';
import * as vscode from 'vscode';
import {CfgEditorPanel} from './CfgEditor/CfgEditorPanel';

import {ToolArgs} from './Project/ToolArgs';
import {ToolRunner} from './Project/ToolRunner';
import {Logger} from './Utils/Logger';

const which = require('which');
/**
 * Read an ini file
 * @param filePath
 * @returns `object` if file read is successful, or `null` if file open has failed
 *
 */
function readIni(filePath: string): object|null {
  let configRaw: string;
  try {
    configRaw = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.error(e);
    return null;
  }

  // TODO check if toString() is required
  return ini.parse(configRaw.toString());
}

enum NodeType {
  directory,
  model,
  config,
  baseModel
}

function nodeTypeToStr(t: NodeType): string {
  return NodeType[t];
}

class Node {
  type: NodeType;
  childNodes: Node[];
  uri: vscode.Uri;

  constructor(type: NodeType, childNodes: Node[], uri: vscode.Uri) {
    this.type = type;
    this.childNodes = childNodes;
    this.uri = uri;
  }

  get path(): string {
    return this.uri.fsPath;
  }

  get parent(): string {
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
    } else if (node.type === NodeType.baseModel) {
      this.iconPath = vscode.ThemeIcon.File;
    } else if (node.type === NodeType.model) {
      this.iconPath = vscode.ThemeIcon.File;
    }

    // To show contextual menu on items in OneExplorer,
    // we have to use "when" clause under "view/item/context" under "menus".
    // We first try to use the following:
    //    "when": "view == OneExplorerView && resourceExtname == .cfg"
    //
    // However, resourceExtname returns info of vscode Explorer view (not of OneExplorer).
    //    "when": "view == OneExplorerView && viewItem == config"
    this.contextValue = nodeTypeToStr(node.type);
  }
}

export class OneTreeDataProvider implements vscode.TreeDataProvider<OneNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<OneNode|undefined|void> =
      new vscode.EventEmitter<OneNode|undefined|void>();
  readonly onDidChangeTreeData: vscode.Event<OneNode|undefined|void> =
      this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: vscode.Uri|undefined) {}

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
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      } else if (node.type === NodeType.baseModel) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.Collapsed, node);
      } else {  // (node.type == NodeType.config)
        let oneNode = new OneNode(node.name, vscode.TreeItemCollapsibleState.Expanded, node);
        oneNode.command = {
          command: 'onevscode.open-cfg',
          title: 'Open File',
          arguments: [oneNode.node]
        };
        return oneNode;
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
      } else if (
          fstat.isFile() &&
          (fname.endsWith('.pb') || fname.endsWith('.tflite') || fname.endsWith('.onnx'))) {
        const childNode = new Node(NodeType.baseModel, [], vscode.Uri.file(fpath));

        this.searchPairConfig(childNode);

        node.childNodes.push(childNode);
      }
    }
  }

  // TODO(dayo) extract file-relative functions as another module
  private parseInputPath = (configPath: string, modelPath: string): string|undefined => {
    const config = readIni(configPath);
    const ext = path.extname(modelPath).slice(1);

    if (ext === undefined || config === null) {
      return undefined;
    }

    return config[`one-import-${ext}` as keyof typeof config] ?
        config[`one-import-${ext}` as keyof typeof config]['input_path'] :
        undefined;
  };

  // TODO(dayo) extract file-relative functions as another module
  private grepTargetInCommand = (str: string): string[] => {
    let targets: string[] = [];
    for (let entry of str.split(' ')) {
      if (path.extname(entry) === '.tvn' || path.extname(entry) === '.circle') {
        targets.push(entry);
      }
    }
    return targets;
  };

  // TODO(dayo) extract file-relative functions as another module
  private grepTarget = (str: string): string[] => {
    let targets: string[] = [];
    // TODO(dayo) add checks
    targets.push(str);
    return targets;
  };

  // TODO(dayo) extract file-relative functions as another module
  private parseIntermediates = (configPath: string): string[] => {
    const config = readIni(configPath);

    if (config === null) {
      return [];
    }

    const targetLocator = [
      {section: 'one-optimize', key: 'input_path', grepper: this.grepTarget},
      {section: 'one-optimize', key: 'input_path', grepper: this.grepTarget},
      {section: 'one-quantize', key: 'input_path', grepper: this.grepTarget},
      {section: 'one-quantize', key: 'input_path', grepper: this.grepTarget},
      {section: 'one-codegen', key: 'command', grepper: this.grepTargetInCommand},
    ];

    let intermediates: string[] = [];
    for (let loc of targetLocator) {
      let confSection = config[loc.section as keyof typeof config];
      let confKey = confSection ? confSection[loc.key as keyof typeof config] : undefined;
      if (confKey) {
        const targets = loc.grepper(confKey);
        for (let target of targets) {
          if (intermediates.includes(target) === false) {
            intermediates.push(target);
          }
        }
      }
    }

    return intermediates;
  };

  /**
   * compare paths by normalization
   * NOTE that '~'(home) is not supported
   * TODO(dayo) support '~'
   * TODO(dayo) extract file-relative functions as another module
   */
  private comparePath(path0: string, path1: string): boolean {
    const absPath0 = path.resolve(path.normalize(path0));
    const absPath1 = path.resolve(path.normalize(path1));
    return absPath0 === absPath1;
  }

  /**
   * Search .cfg files in the same directory
   */
  private searchPairConfig(node: Node) {
    console.assert(node.type === NodeType.baseModel);

    const files = fs.readdirSync(node.parent);

    for (const fname of files) {
      const fpath = path.join(node.parent, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isFile() && fname.endsWith('.cfg')) {
        const parsedInputPath = this.parseInputPath(fpath, node.path);
        if (parsedInputPath) {
          const fullInputPath = path.join(node.parent, parsedInputPath);
          if (this.comparePath(fullInputPath, node.path)) {
            const pairNode = new Node(NodeType.config, [], vscode.Uri.file(fpath));
            this.searchChildModels(pairNode);
            node.childNodes.push(pairNode);
          }
        }
      }
    }
  }

  /**
   * Search specified intermediate model files in the same directory
   */
  private searchChildModels(node: Node) {
    console.assert(node.type === NodeType.config);
    console.log('searchChildModels');
    const files = fs.readdirSync(node.parent);

    for (const fname of files) {
      const fpath = path.join(node.parent, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isFile() && (fname.endsWith('.circle') || fname.endsWith('.tvn'))) {
        const intermediates = this.parseIntermediates(node.path);
        for (let intermediate of intermediates) {
          const parsedPath = path.join(node.parent, intermediate);
          if (this.comparePath(parsedPath, fpath)) {
            const child = new Node(NodeType.model, [], vscode.Uri.file(fpath));
            node.childNodes.push(child);
          }
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

    vscode.commands.registerCommand('onevscode.open-cfg', (file) => this.openFile(file));
    vscode.commands.registerCommand(
        'onevscode.refresh-one-explorer', () => oneTreeDataProvider.refresh());

    let runCfgDisposal =
        vscode.commands.registerCommand('onevscode.run-cfg', (oneNode: OneNode) => {
          handleRunOnecc(oneNode.node.uri, new Logger);
        });
    context.subscriptions.push(runCfgDisposal);
  }

  private openFile(node: Node) {
    vscode.commands.executeCommand('vscode.openWith', node.uri, CfgEditorPanel.viewType);
  }
}

//
// menu handler
//

export {handleRunOnecc};

/**
 * Function called when onevscode.run-cfg is called (when user clicks 'Run' on cfg file).
 * @param cfgUri uri of cfg file
 */
function handleRunOnecc(cfgUri: vscode.Uri, logger: Logger) {
  const toolRunner = new ToolRunner(logger);

  // TODO Refine later
  const resolve = function(value: string) {
    console.log('Running onecc was successful!');
  };
  const reject = function(value: string) {
    console.log('Running onecc failed!');
  };

  const toolArgs = new ToolArgs('-C', cfgUri.fsPath);
  const cwd = path.dirname(cfgUri.fsPath);
  let oneccPath = toolRunner.getOneccPath();
  if (oneccPath === undefined) {
    throw new Error('Cannot find installed onecc');
  }

  const runner = toolRunner.getRunner('onecc', oneccPath, toolArgs, cwd);
  runner.then(resolve).catch(reject);
}
