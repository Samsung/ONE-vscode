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

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {TextEncoder} from 'util';
import * as vscode from 'vscode';

import {CfgEditorPanel} from '../CfgEditor/CfgEditorPanel';
import {Balloon} from '../Utils/Balloon';
import {obtainWorkspaceRoot} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {ArtifactAttr} from './ArtifactLocator';
import {OneStorage} from './OneStorage';

// Exported for unit testing only
export {
  BaseModelNode as _unit_test_BaseModelNode,
  ConfigNode as _unit_test_ConfigNode,

  DirectoryNode as _unit_test_DirectoryNode,
  getCfgList as _unit_test_getCfgList,

  NodeFactory as _unit_test_NodeFactory,
  NodeType as _unit_test_NodeType,
  OneNode as _unit_test_OneNode,
  ProductNode as _unit_test_ProductNode,
};

/**
 * TODO Remove
 *
 * Get the list of .cfg files wiithin the workspace
 * @param root  the file or directory,
 *              which MUST exist in the file system
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

  try {
    fs.statSync(root);
  } catch {
    Logger.error('OneExplorer', 'getCfgList', 'called on not existing directory or file.');
    return [];
  }

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

export abstract class Node {
  abstract readonly type: NodeType;
  /**
   * @protected _childNodes
   * `undefined` when it's not build yet.
   * If it has no child, it is an empty array.
   */
  protected _childNodes: Node[]|undefined;

  /**
   * @protected _parent
   * `undefined` only if it has no parent (tree root)
   */
  protected _parent: Node|undefined;
  uri: vscode.Uri;

  abstract icon: vscode.ThemeIcon;
  abstract openViewType: string|undefined;
  abstract canHide: boolean;

  constructor(uri: vscode.Uri, parent: Node|undefined) {
    this._childNodes = undefined;
    this.uri = uri;
    this._parent = parent;
  }

  /**
   * Build `_childNodes` on demand, which is initially undefined
   */
  abstract _buildChildren: () => void;

  getChildren(): Node[] {
    if (this._childNodes) {
      return this._childNodes;
    }

    this._buildChildren();
    return this._childNodes!;
  }

  get path(): string {
    return this.uri.fsPath;
  }

  get parent(): Node|undefined {
    return this._parent;
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
  static create(type: NodeType, fpath: string, parent: Node|undefined, attr?: ArtifactAttr): Node
      |undefined {
    // WHY HIDDEN NODES ARE NOT TO BE CREATED?
    //
    // A 'TreeDataProvider<element>' expects every elements (Node) to be correspond to visible
    // TreeItem, so let's not build hidden nodes.
    if(attr && attr?.canHide === true && OneTreeDataProvider.didHideExtra === true)
    {
      return undefined;
    }

    const uri = vscode.Uri.file(fpath);

    let node: Node;
    if (type === NodeType.directory) {
      assert.strictEqual(attr, undefined, 'Directory nodes cannot have attributes');
      node = new DirectoryNode(uri, parent);
    } else if (type === NodeType.baseModel) {
      node = new BaseModelNode(uri, parent, attr?.openViewType, attr?.icon, attr?.canHide);
    } else if (type === NodeType.config) {
      assert.strictEqual(attr, undefined, 'Config nodes cannot have attributes');
      node = new ConfigNode(uri, parent);
    } else if (type === NodeType.product) {
      node = new ProductNode(uri, parent, attr?.openViewType, attr?.icon, attr?.canHide);
    } else {
      throw Error('Undefined NodeType');
    }

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

  constructor(uri: vscode.Uri, parent: Node|undefined) {
    assert.ok(fs.statSync(uri.fsPath));
    assert.strictEqual(fs.statSync(uri.fsPath).isDirectory(), true);

    super(uri, parent);
  }

  /**
   * Build a sub-tree under the node
   *
   * directory          <- this
   *   ∟ baseModel      <- children
   *      ∟ config
   *         ∟ product
   */
  _buildChildren = (): void => {
    this._childNodes = [];

    const files = fs.readdirSync(this.path);

    for (const fname of files) {
      const fpath = path.join(this.path, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isDirectory()) {
        const dirNode = NodeFactory.create(NodeType.directory, fpath, this);

        if (dirNode && dirNode.getChildren().length > 0) {
          this._childNodes!.push(dirNode);
        }
      } else if (
          fstat.isFile() &&
          (fname.endsWith('.pb') || fname.endsWith('.tflite') || fname.endsWith('.onnx'))) {
        const baseModelNode = NodeFactory.create(NodeType.baseModel, fpath, this);

        if (baseModelNode) {
          this._childNodes!.push(baseModelNode);
        }
      }
    }
  };
}

class BaseModelNode extends Node {
  readonly type = NodeType.baseModel;

  // Do not open file as default
  static defaultOpenViewType = undefined;
  // Display 'symbol-variable' icon to represent model file as default
  static defaultIcon = new vscode.ThemeIcon('symbol-variable');
  // Show file always as default
  static defaultCanHide = false;

  openViewType: string|undefined = BaseModelNode.defaultOpenViewType;
  icon = BaseModelNode.defaultIcon;
  canHide = BaseModelNode.defaultCanHide;

  constructor(
      uri: vscode.Uri, parent: Node|undefined,
      openViewType: string|undefined = BaseModelNode.defaultOpenViewType,
      icon: vscode.ThemeIcon = BaseModelNode.defaultIcon,
      canHide: boolean = BaseModelNode.defaultCanHide) {
    assert.ok(fs.statSync(uri.fsPath));
    assert.strictEqual(fs.statSync(uri.fsPath).isFile(), true);

    super(uri, parent);
    this.openViewType = openViewType;
    this.icon = icon;
    this.canHide = canHide;
  }

  /**
   * Build a sub-tree under the node
   *
   * directory
   *   ∟ baseModel      <- this
   *      ∟ config      <- children
   *         ∟ product
   */
  _buildChildren = (): void => {
    this._childNodes = [];

    const configPaths = OneStorage.getCfgs(this.path);

    if (!configPaths) {
      return;
    }
    configPaths.forEach(configPath => {
      const configNode = NodeFactory.create(NodeType.config, configPath, this);

      if (configNode) {
        this._childNodes!.push(configNode);
      }
    });
  };
}

class ConfigNode extends Node {
  readonly type = NodeType.config;

  // Open file with one.editor.cfg as default
  static defaultOpenViewType = 'one.editor.cfg';
  // Display gear icon as default
  static defaultIcon = new vscode.ThemeIcon('gear');
  // Show file always as default
  static defaultCanHide = false;

  openViewType = ConfigNode.defaultOpenViewType;
  icon = ConfigNode.defaultIcon;
  canHide = ConfigNode.defaultCanHide;

  constructor(
      uri: vscode.Uri, parent: Node|undefined,
      openViewType: string = ConfigNode.defaultOpenViewType,
      icon: vscode.ThemeIcon = ConfigNode.defaultIcon,
      canHide: boolean = ConfigNode.defaultCanHide) {
    assert.ok(fs.statSync(uri.fsPath));
    assert.strictEqual(fs.statSync(uri.fsPath).isFile(), true);

    super(uri, parent);
    this.openViewType = openViewType;
    this.icon = icon;
    this.canHide = canHide;
  }

  /**
   * Build a sub-tree under the node
   *
   * directory
   *   ∟ baseModel
   *      ∟ config      <- this
   *         ∟ product  <- children
   */
  _buildChildren = (): void => {
    this._childNodes = [];

    const cfgObj = OneStorage.getCfgObj(this.path);

    if (!cfgObj) {
      return;
    }

    const products = cfgObj.getProductsExists;

    products.forEach(product => {
      const productNode = NodeFactory.create(NodeType.product, product.path, this, product.attr);

      if (productNode) {
        this._childNodes!.push(productNode);
      }
    });
  };
}

class ProductNode extends Node {
  readonly type = NodeType.product;

  // Do not open file as default
  static defaultOpenViewType = undefined;
  // Display file icon as default
  static defaultIcon = vscode.ThemeIcon.File;
  // Show file always as default
  static defaultCanHide = false;

  openViewType: string|undefined = ProductNode.defaultOpenViewType;
  icon = ProductNode.defaultIcon;
  canHide = ProductNode.defaultCanHide;

  constructor(
      uri: vscode.Uri, parent: Node|undefined,
      openViewType: string|undefined = ProductNode.defaultOpenViewType,
      icon: vscode.ThemeIcon = ProductNode.defaultIcon,
      canHide: boolean = ProductNode.defaultCanHide) {
    assert.ok(fs.statSync(uri.fsPath));
    assert.strictEqual(fs.statSync(uri.fsPath).isFile(), true);

    super(uri, parent);
    this.openViewType = openViewType;
    this.icon = icon;
    this.canHide = canHide;
  }

  _buildChildren = (): void => {
    this._childNodes = [];
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
export class OneTreeDataProvider implements vscode.TreeDataProvider<Node> {
  private _onDidChangeTreeData: vscode.EventEmitter<Node|undefined|void> =
      new vscode.EventEmitter<Node|undefined|void>();
  readonly onDidChangeTreeData: vscode.Event<Node|undefined|void> = this._onDidChangeTreeData.event;

  private fileWatcher = vscode.workspace.createFileSystemWatcher(`**/*`);

  private _tree: DirectoryNode|undefined;
  private _nodeMap: Map<string, Node> = new Map<string, Node>();

  public static didHideExtra: boolean = false;

  public static register(context: vscode.ExtensionContext) {
    let workspaceRoot: vscode.Uri|undefined = undefined;

    // TODO: do error handling in one function (helper function or here)
    try {
      workspaceRoot = vscode.Uri.file(obtainWorkspaceRoot());
      Logger.info('OneExplorer', `workspace: ${workspaceRoot.fsPath}`);
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

    const provider = new OneTreeDataProvider(workspaceRoot, context.extension.extensionKind);

    const _treeView = vscode.window.createTreeView(
        'OneExplorerView',
        {treeDataProvider: provider, showCollapseAll: true, canSelectMany: true});

    let registrations = [
      provider.fileWatcher.onDidCreate(() => provider.refresh()),
      provider.fileWatcher.onDidChange(() => provider.refresh()),
      provider.fileWatcher.onDidDelete(() => provider.refresh()),
      _treeView,
      vscode.commands.registerCommand(
          'one.explorer.revealInOneExplorer',
          (path: string) => {
            const node = provider._nodeMap.get(path);
            if (node) {
              _treeView ?.reveal(node, {select: true, focus: true, expand: true});
            }
          }),
      vscode.commands.registerCommand(
          'one.explorer.openAsText',
          (node: Node) => {
            vscode.commands.executeCommand('vscode.openWith', node.uri, 'default');
          }),
      vscode.commands.registerCommand(
          'one.explorer.revealInDefaultExplorer',
          (node: Node) => {
            vscode.commands.executeCommand('revealInExplorer', node.uri);
          }),
      vscode.commands.registerCommand('one.explorer.refresh', () => provider.refresh()),
      vscode.commands.registerCommand('one.explorer.hideExtra', () => provider.hideExtra()),
      vscode.commands.registerCommand('one.explorer.showExtra', () => provider.showExtra()),
      vscode.commands.registerCommand(
          'one.explorer.createCfg', (node: Node) => provider.createCfg(node)),
      vscode.commands.registerCommand(
          'one.explorer.runCfg',
          (node: Node) => {
            vscode.commands.executeCommand('one.toolchain.runCfg', node.uri.fsPath);
          }),
      vscode.commands.registerCommand('one.explorer.delete', (node: Node) => provider.delete(node)),
    ];

    if (provider.isLocal) {
      registrations = [
        ...[vscode.commands.registerCommand(
                'one.explorer.openContainingFolder',
                (node: Node) => provider.openContainingFolder(node)),
      ]
      ];
    } else {
      vscode.commands.executeCommand('setContext', 'one:extensionKind', 'Workspace');
    }

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(
      private workspaceRoot: vscode.Uri|undefined, private _extensionKind: vscode.ExtensionKind) {
    vscode.commands.executeCommand(
        'setContext', 'one.explorer:didHideExtra', OneTreeDataProvider.didHideExtra);
  }

  /**
   * 'context.extension.extensionKind' indicates which side the extension is running.
   *
   * NOTE 'extensionKind' property in 'package.json' is different from
   * 'context.extension.extensionKind'. extenionKind(package.json) is a field to manifest the
   * extension's preference. extension.extensionKind is an eventual runtime property.
   *
   * @ref https://github.com/Samsung/ONE-vscode/issues/1209
   */
  get isRemote(): boolean {
    return (this._extensionKind === vscode.ExtensionKind.Workspace);
  }

  /**
   * 'context.extension.extensionKind' indicates which side the extension is running.
   *
   * NOTE 'extensionKind' property in 'package.json' is different from
   * 'context.extension.extensionKind'. extenionKind(package.json) is a field to manifest the
   * extension's preference. extension.extensionKind is an eventual runtime property.
   *
   * @ref https://github.com/Samsung/ONE-vscode/issues/1209
   */
  get isLocal(): boolean {
    return (this._extensionKind === vscode.ExtensionKind.UI);
  }

  /**
   * @command one.explorer.hideExtra
   */
  hideExtra(): void {
    OneTreeDataProvider.didHideExtra = true;

    vscode.commands.executeCommand(
        'setContext', 'one.explorer:didHideExtra', OneTreeDataProvider.didHideExtra);
    this.refresh();
  }

  /**
   * @command one.explorer.showExtra
   */
  showExtra(): void {
    OneTreeDataProvider.didHideExtra = false;

    vscode.commands.executeCommand(
        'setContext', 'one.explorer:didHideExtra', OneTreeDataProvider.didHideExtra);
    this.refresh();
  }

  /**
   * Refresh the tree under the given Node
   * @command one.explorer.refresh
   * @param node A start node to rebuild. The sub-tree under the node will be rebuilt.
   *                If not given, the whole tree will be rebuilt.
   */
  refresh(node?: Node): void {
    OneStorage.reset();

    if (!node) {
      // Reset the root in order to build from scratch (at OneTreeDataProvider.getTree)
      this._tree = undefined;
      this._nodeMap.clear();
      this._onDidChangeTreeData.fire(undefined);
    } else {
      this._onDidChangeTreeData.fire(node);
    }
  }

  // TODO: Add move()

  /**
   * @command one.explorer.openContainingFolder
   */
  openContainingFolder(node: Node): void {
    vscode.commands.executeCommand('revealFileInOS', node.uri);
  }

  /**
   * @command one.explorer.delete
   */
  delete(node: Node): void {
    const isDirectory = (node.type === NodeType.directory);

    let recursive: boolean;
    let title = `Are you sure you want to delete '${node.name}'`;
    if (isDirectory) {
      title += ` and its contents?`;
      recursive = true;
    } else {
      title += `?`;
      recursive = false;
    }

    let detail: string|undefined;
    let approval: string;
    let useTrash: boolean;

    if (this.isRemote) {
      // NOTE(dayo)
      // By experience, the file is not deleted with 'useTrash:true' option.
      approval = 'Delete';
      detail = 'The file will be deleted permanently.';
      useTrash = false;
    } else {
      approval = 'Move to Trash';
      detail = `You can restore this file from the Trash.`;
      useTrash = true;
    }

    vscode.window.showInformationMessage(title, {detail: detail, modal: true}, approval)
        .then(ans => {
          if (ans === approval) {
            Logger.info('OneExplorer', `Delete '${node.name}'.`);
            vscode.workspace.fs.delete(node.uri, {recursive: recursive, useTrash: useTrash})
                .then(() => this.refresh());
          }
        });
  }

  /**
   * Create ONE configuration file for a base model
   * Input box is prefilled as <base model's name>.cfg
   * The operation will be cancelled if the file already exists.
   *
   * @command one.explorer.createCfg
   * @param node A base model to create configuration
   */
  async createCfg(node: Node): Promise<void> {
    const dirPath = path.parse(node.path).dir;
    const modelName = path.parse(node.path).name;
    const extName = path.parse(node.path).ext.slice(1);

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
                  this.refresh(node);

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

  /**
   * This function is required for `reveal` function of TreeView<Node>.
   * @param element Node
   * @returns element's parent
   */
  getParent(element: Node): Node|undefined {
    return element.parent;
  }

  getTreeItem(node: Node): OneNode {
    if (node.type === NodeType.directory) {
      return new OneNode(node.name, vscode.TreeItemCollapsibleState.Expanded, node);
    } else if (node.type === NodeType.product) {
      return new OneNode(node.name, vscode.TreeItemCollapsibleState.None, node);
    } else if (node.type === NodeType.baseModel || node.type === NodeType.config) {
      return new OneNode(
          node.name,
          (node.getChildren().length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                            vscode.TreeItemCollapsibleState.None,
          node);
    } else {
      throw Error('Undefined NodeType');
    }
  }

  getChildren(element?: Node): vscode.ProviderResult<Node[]> {
    if (!element) {
      element = this.getTree();
    }

    return element ?.getChildren();
  }

  /**
   * Get the root of the tree
   */
  private getTree(): Node|undefined {
    if (!this.workspaceRoot) {
      return undefined;
    }

    if (!this._tree) {
      this._tree = NodeFactory.create(NodeType.directory, this.workspaceRoot.fsPath, undefined) as
          DirectoryNode;

      // NOTE That this change reverts the 'build children on demand' optimization.
      //
      // 'buildNodeMap' is required for revealing the corresponding TreeItem when a cfg file is
      // opened in cfg editor, because it pre-builts all the nodes to find the Node from a given
      // string path.
      //
      // TODO Let's try to build nodes on demand (only with string path)
      const buildNodeMap = (node: Node) => {
        node.getChildren().forEach(childNode => {
          this._nodeMap.set(childNode.path, childNode);
          buildNodeMap(childNode);
        });
      };

      buildNodeMap(this._tree);
    }

    return this._tree;
  }
}
