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
import {TextEncoder} from 'util';
import * as vscode from 'vscode';

import {CfgEditorPanel} from '../CfgEditor/CfgEditorPanel';
import {Balloon} from '../Utils/Balloon';
import {obtainWorkspaceRoot, RealPath} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';
import {ArtifactAttr} from './ArtifactLocator';
import {ConfigObj} from './ConfigObject';

/**
 * Get the list of .cfg files wiithin the workspace
 */
function getCfgList(root: string = obtainWorkspaceRoot()): string[] {
  /**
   * Returns every file inside directory
   * @todo Check soft link
   * @param root
   * @returns
   */
  const readdirSyncRecursive = (root: string): string[] => {
    if (fs.statSync(root).isFile()) {
      return [root];
    }

    let children: string[] = [];
    if (fs.statSync(root).isDirectory()) {
      fs.readdirSync(root).forEach(val => {
        children = children.concat(readdirSyncRecursive(path.join(root, val)));
      });
    }
    return children;
  };

  // Get the list of all the cfg files inside workspace root
  const cfgList = readdirSyncRecursive(root).filter(val => val.endsWith('.cfg'));

  return cfgList;
}

/**
 * NOTE
 *
 * 'NodeType' for OneExplorer.
 *
 * DESCRIPTION
 *
 * OneExplorer makes a tree as below
 *
 * directory          (1)
 *   ∟ baseModel      (1)
 * ----------------------
 *      ∟ config      (2)
 *         ∟ product (2)
 *
 * RELATIONS
 *
 * (1) File System
 *    OneExplorer shows directories and base models as they appear in file system.
 *    Directories without any base model will not show up.
 *
 * (2) Config Contents
 *    Configuration files(.cfg) and product files(output model, log, ..) appear as how they are
 * specified in the cfg file. Config files will be shown under the base model, whose path is
 * specified in the config file. products will be shown under the config whose path is specified in
 * the config file.
 *
 */
enum NodeType {
  /**
   * A directory which contains one or more baseModel.
   */
  directory,

  /**
   * A base model from which ONE imports 'circle'.
   * EXAMPLE: .onnx, .tflite, .tf
   */
  baseModel,

  /**
   * An ONE configuration file for onecc.
   * Which imports a targetted 'baseModel' (NOTE baseModel:config has 1:N relationship)
   */
  config,

  /**
   * All the result files obtained by running ONE config.
   *
   * EXAMPLE: .circle, .tvn, .log
   */
  product,
}

abstract class Node {
  abstract readonly type: NodeType;
  childNodes: Node[];
  uri: vscode.Uri;

  abstract icon: vscode.ThemeIcon;
  abstract openViewType: string|undefined;
  abstract canHide: boolean;

  constructor(uri: vscode.Uri) {
    this.childNodes = [];
    this.uri = uri;
  }

  abstract buildChildren: () => void;

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

  get typeAsString(): string {
    // Return a NodeType as a string value
    return NodeType[this.type];
  }
}

class NodeFactory {
  static create(type: NodeType, fpath: string, attr?: ArtifactAttr): Node {
    const uri = vscode.Uri.file(fpath);

    let node: Node;
    if (type === NodeType.directory) {
      node = new DirectoryNode(uri);
    } else if (type === NodeType.baseModel) {
      node = new BaseModelNode(uri, attr?.openViewType, attr?.icon, attr?.canHide);
    } else if (type === NodeType.config) {
      node = new ConfigNode(uri);
    } else if (type === NodeType.product) {
      node = new ProductNode(uri, attr?.openViewType, attr?.icon, attr?.canHide);
    } else {
      throw Error('Undefined NodeType');
    }

    node.buildChildren();

    return node;
  }
}

class DirectoryNode extends Node {
  readonly type = NodeType.directory;

  // DO NOT OPEN DIRECTORY AS ALWAYS
  readonly openViewType = undefined;
  // DISPLAY FOLDER ICON AS ALWAYS
  readonly icon = vscode.ThemeIcon.Folder;
  // DO NOT HIDE DIRECTORY NODE AS ALWAYS
  readonly canHide = false;

  constructor(uri: vscode.Uri) {
    super(uri);
  }

  /**
   * Build a sub-tree under the node
   *
   * directory          <- this
   *   ∟ baseModel      <- children
   *      ∟ config
   *         ∟ product
   */
  buildChildren = (): void => {
    const files = fs.readdirSync(this.path);

    for (const fname of files) {
      const fpath = path.join(this.path, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isDirectory()) {
        const dirNode = NodeFactory.create(NodeType.directory, fpath);

        if (dirNode && dirNode.childNodes.length > 0) {
          this.childNodes.push(dirNode);
        }
      } else if (
          fstat.isFile() &&
          (fname.endsWith('.pb') || fname.endsWith('.tflite') || fname.endsWith('.onnx'))) {
        const baseModelNode = NodeFactory.create(NodeType.baseModel, fpath);

        this.childNodes.push(baseModelNode);
      }
    }
  };
}

class BaseModelNode extends Node {
  readonly type = NodeType.baseModel;

  // Do not open file as default
  openViewType: string|undefined = undefined;
  // Display 'symbol-variable' icon to represent model file as default
  icon = new vscode.ThemeIcon('symbol-variable');
  // Show file always as default
  canHide = false;

  constructor(uri: vscode.Uri, openViewType?: string, icon?: vscode.ThemeIcon, canHide?: boolean) {
    super(uri);

    this.openViewType = openViewType ? openViewType : this.openViewType;
    this.icon = icon ? icon : this.icon;
    this.canHide = canHide ? canHide : this.canHide;
  }

  /**
   * Build a sub-tree under the node
   *
   * directory
   *   ∟ baseModel      <- this
   *      ∟ config      <- children
   *         ∟ product
   */
  buildChildren = (): void => {
    const configPaths = getCfgList().filter(cfg => {
      const cfgObj = ConfigObj.createConfigObj(vscode.Uri.file(cfg));
      if (!cfgObj) {
        Logger.info('OneExplorer', `Failed to open file ${cfg}`);
        return false;
      }

      return cfgObj.isChildOf(this.path);
    });

    configPaths.forEach(configPath => {
      const configNode = NodeFactory.create(NodeType.config, configPath);

      this.childNodes.push(configNode);
    });
  };
}

class ConfigNode extends Node {
  readonly type = NodeType.config;

  // Open file with cfg.editor as default
  openViewType = 'cfg.editor';
  // Display gear icon as default
  icon = new vscode.ThemeIcon('gear');
  // Show file always as default
  canHide = false;

  constructor(uri: vscode.Uri, openViewType?: string, icon?: vscode.ThemeIcon, canHide?: boolean) {
    super(uri);

    this.openViewType = openViewType ? openViewType : this.openViewType;
    this.icon = icon ? icon : this.icon;
    this.canHide = canHide ? canHide : this.canHide;
  }

  /**
   * Build a sub-tree under the node
   *
   * directory
   *   ∟ baseModel
   *      ∟ config      <- this
   *         ∟ product  <- children
   */
  buildChildren = (): void => {
    const cfgObj = ConfigObj.createConfigObj(vscode.Uri.file(this.path));
    const products = cfgObj!.getProductsExists;

    products!.forEach(product => {
      const productNode = NodeFactory.create(NodeType.product, product.path, product.attr);

      this.childNodes.push(productNode);
    });
  };
}

class ProductNode extends Node {
  readonly type = NodeType.product;

  // Do not open file as default
  openViewType: string|undefined = undefined;
  // Display file icon as default
  icon = vscode.ThemeIcon.File;
  // Show file always as default
  canHide = false;

  constructor(uri: vscode.Uri, openViewType?: string, icon?: vscode.ThemeIcon, canHide?: boolean) {
    super(uri);

    this.openViewType = openViewType ? openViewType : this.openViewType;
    this.icon = icon ? icon : this.icon;
    this.canHide = canHide ? canHide : this.canHide;
  }

  buildChildren = (): void => {
    // Do nothing
  };
}


export class OneNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly node: Node,
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.node.path}`;

    if (node.openViewType) {
      this.command = {
        command: 'vscode.openWith',
        title: 'Open with Custom Viewer',
        arguments: [node.uri, node.openViewType]
      };
    }

    this.iconPath = node.icon;

    // To show contextual menu on items in OneExplorer,
    // we have to use "when" clause under "view/item/context" under "menus".
    // We first try to use the following:
    //    "when": "view == OneExplorerView && resourceExtname == .cfg"
    //
    // However, resourceExtname returns info of vscode Explorer view (not of OneExplorer).
    //    "when": "view == OneExplorerView && viewItem == config"
    this.contextValue = node.typeAsString;
  }
}

/* istanbul ignore next */
export class OneTreeDataProvider implements vscode.TreeDataProvider<OneNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<OneNode|undefined|void> =
      new vscode.EventEmitter<OneNode|undefined|void>();
  readonly onDidChangeTreeData: vscode.Event<OneNode|undefined|void> =
      this._onDidChangeTreeData.event;

  // TODO(dayo) Get the ext list(cfg,tflite..) from backend
  private fileWatcher =
      vscode.workspace.createFileSystemWatcher(`**/*.{cfg,tflite,onnx,circle,tvn}`);

  private tree: DirectoryNode|undefined;

  constructor(private workspaceRoot: vscode.Uri|undefined) {
    const fileWatchersEvents =
        [this.fileWatcher.onDidCreate, this.fileWatcher.onDidChange, this.fileWatcher.onDidDelete];

    for (let event of fileWatchersEvents) {
      event(() => this.refresh());
    }
  }

  /**
   * Refresh the tree under the given oneNode
   * @param oneNode A start node to rebuild. The sub-tree under the node will be rebuilt.
   *                If not given, the whole tree will be rebuilt.
   */
  refresh(oneNode?: OneNode): void {
    if (!oneNode) {
      // Reset the root in order to build from scratch (at OneTreeDataProvider.getTree)
      this.tree = undefined;
    }

    this._onDidChangeTreeData.fire(oneNode);
  }

  // TODO: Add move()

  openContainingFolder(oneNode: OneNode): void {
    vscode.commands.executeCommand('revealFileInOS', oneNode.node.uri);
  }

  /**
   * Rename a file of all types of nodes (baseModel, product, config) excepts for directory.
   * It only alters the file name, not the path.
   */
  rename(oneNode: OneNode): void {
    // TODO: prohibit special characters for security ('..', '*', etc)
    let warningMessage;
    if (oneNode.node.type === NodeType.baseModel) {
      // TODO automatically change the corresponding files
      warningMessage = `WARNING! ${
          oneNode.node.childNodes.map(node => `'${node.name}'`)
              .toString()} will disappear from the view.`;
    } else if (oneNode.node.type === NodeType.product) {
      // TODO automatically change the corresponding files
      warningMessage = `WARNING! '${oneNode.node.name}' may disappear from the view.`;
    }

    const validateInputPath = (newname: string): string|undefined => {
      const oldpath = oneNode.node.path;
      const dirpath = path.dirname(oneNode.node.uri.fsPath);
      const newpath: string = path.join(dirpath, newname);

      if (!newname.endsWith(path.extname(oldpath))) {
        // NOTE
        // `if (path.extname(newpath) !== path.extname(oldpath))`
        // Do not use above code here.
        // It will evaluate '.tflite' as false, because it's extname is ''.
        return `A file extension must be (${path.extname(oldpath)})`;
      }

      if (newpath !== oldpath && fs.existsSync(newpath)) {
        return `A file or folder ${
            newname} already exists at this location. Please choose a different name.`;
      }
    };

    vscode.window
        .showInputBox({
          title: 'Enter a file name:',
          value: `${path.basename(oneNode.node.uri.fsPath)}`,
          valueSelection: [
            0,
            path.basename(oneNode.node.uri.fsPath).length -
                path.parse(oneNode.node.uri.fsPath).ext.length
          ],
          placeHolder: `Enter a new name for ${path.basename(oneNode.node.uri.fsPath)}`,
          prompt: warningMessage,
          validateInput: validateInputPath
        })
        .then(newname => {
          if (newname) {
            const dirpath = path.dirname(oneNode.node.uri.fsPath);
            const newpath = `${dirpath}/${newname}`;
            vscode.workspace.fs.rename(oneNode.node.uri, vscode.Uri.file(newpath));

            this.refresh();
          }
        });
  }

  delete(oneNode: OneNode): void {
    const isDirectory = (oneNode.node.type === NodeType.directory);
    const title =
        `Are you sure you want to delete '${path.parse(oneNode.node.path).base}'` + isDirectory ?
        'and its contents?' :
        '?';
    const detail = `You can restore this file from the Trash.`;
    const approval = 'Move to Trash';
    const recursive = isDirectory ? true : false;

    vscode.window.showInformationMessage(title, {detail: detail, modal: true}, approval)
        .then(ans => {
          if (ans === approval) {
            Logger.info('OneExplorer', `Delete '${oneNode.node.name}'.`);
            vscode.workspace.fs.delete(oneNode.node.uri, {recursive: recursive, useTrash: true})
                .then(() => this.refresh());
          }
        });
  }

  /**
   * Create ONE configuration file for a base model
   * Input box is prefilled as <base model's name>.cfg
   * The operation will be cancelled if the file already exists.
   *
   * @param oneNode A base model to create configuration
   */
  async createCfg(oneNode: OneNode): Promise<void> {
    const dirPath = path.parse(oneNode.node.path).dir;
    const modelName = path.parse(oneNode.node.path).name;
    const extName = path.parse(oneNode.node.path).ext.slice(1);

    const encoder = new TextEncoder;
    // TODO(dayo) Auto-configure more fields
    const content = encoder.encode(`
[onecc]
one-import-${extName}=True
[one-import-${extName}]
input_path=${modelName}.${extName}
`);

    const validateInputPath = (cfgName: string): string|undefined => {
      const cfgPath: string = path.join(dirPath, cfgName);

      if (!cfgName.endsWith('.cfg')) {
        return `A file extension must be .cfg`;
      }

      if (fs.existsSync(cfgPath)) {
        return `A file or folder ${
            cfgName} already exists at this location. Please choose a different name.`;
      }
    };

    vscode.window
        .showInputBox({
          title: `Create ONE configuration of '${modelName}.${extName}' :`,
          placeHolder: `Enter a file name`,
          value: `${modelName}.cfg`,
          valueSelection: [0, `${modelName}.cfg`.length - `.cfg`.length],
          validateInput: validateInputPath
        })
        .then(value => {
          if (!value) {
            Logger.debug('OneExplorer', 'User hit the excape key!');
            return;
          }

          const uri = vscode.Uri.file(`${dirPath}/${value}`);

          // 'uri' path is not occupied, assured by validateInputPath
          vscode.workspace.fs.writeFile(uri, content)
              .then(() => {
                return new Promise<vscode.Uri>(resolve => {
                  this.refresh(oneNode);

                  // Wait until the refresh event listeners are handled
                  // TODO: Add an event after revising refresh commmand
                  setTimeout(() => resolve(uri), 200);
                });
              })
              .then((uri) => {
                return Promise.all([
                  vscode.commands.executeCommand('list.expand', uri),
                  vscode.commands.executeCommand('vscode.openWith', uri, CfgEditorPanel.viewType)
                ]);
              });
        });
  }

  getTreeItem(element: OneNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OneNode): OneNode[]|Thenable<OneNode[]> {
    if (!this.workspaceRoot) {
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
      } else if (node.type === NodeType.product) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      } else if (node.type === NodeType.baseModel || node.type === NodeType.config) {
        return new OneNode(
            node.name,
            (node.childNodes.length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                           vscode.TreeItemCollapsibleState.None,
            node);
      } else {
        throw Error('Undefined NodeType');
      }
    };

    return node.childNodes.map(node => toOneNode(node)!);
  }

  private getTree(rootPath: vscode.Uri): Node {
    if (!this.tree) {
      this.tree = NodeFactory.create(NodeType.directory, rootPath.fsPath) as DirectoryNode;
    }

    return this.tree;
  }
};

/* istanbul ignore next */
export function initOneExplorer(context: vscode.ExtensionContext) {
  // TODO Support multi-root workspace
  let workspaceRoot: vscode.Uri|undefined = undefined;
  try {
    workspaceRoot = vscode.Uri.file(obtainWorkspaceRoot());
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (e.message === 'Need workspace') {
        Logger.info('OneExplorer', e.message);
      } else {
        Logger.error('OneExplorer', e.message);
        Balloon.error('Something goes wrong while setting workspace.', true);
      }
    } else {
      Logger.error('OneExplorer', 'Unknown error has been thrown.');
    }
  }

  const oneTreeDataProvider = new OneTreeDataProvider(workspaceRoot);

  let treeView: vscode.TreeView<OneNode|undefined>|undefined = vscode.window.createTreeView(
      'OneExplorerView',
      {treeDataProvider: oneTreeDataProvider, showCollapseAll: true, canSelectMany: true});

  const subscribeDisposals = (disposals: vscode.Disposable[]) => {
    for (const disposal of disposals) {
      context.subscriptions.push(disposal);
    }
  };

  subscribeDisposals([
    treeView,
    vscode.commands.registerCommand(
        'one.explorer.open',
        (file) => {
          vscode.commands.executeCommand('vscode.openWith', file.uri, CfgEditorPanel.viewType);
        }),
    vscode.commands.registerCommand(
        'one.explorer.openAsText',
        (oneNode: OneNode) => {
          vscode.commands.executeCommand('vscode.openWith', oneNode.node.uri, 'default');
        }),
    vscode.commands.registerCommand('one.explorer.refresh', () => oneTreeDataProvider.refresh()),
    vscode.commands.registerCommand(
        'one.explorer.createCfg', (oneNode: OneNode) => oneTreeDataProvider.createCfg(oneNode)),
    vscode.commands.registerCommand(
        'one.explorer.runCfg',
        (oneNode: OneNode) => {
          vscode.commands.executeCommand('one.toolchain.runCfg', oneNode.node.uri.fsPath);
        }),
    vscode.commands.registerCommand(
        'one.explorer.rename', (oneNode: OneNode) => oneTreeDataProvider.rename(oneNode)),
    vscode.commands.registerCommand(
        'one.explorer.openContainingFolder',
        (oneNode: OneNode) => oneTreeDataProvider.openContainingFolder(oneNode)),
    vscode.commands.registerCommand(
        'one.explorer.delete', (oneNode: OneNode) => oneTreeDataProvider.delete(oneNode)),
  ]);
}
