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

import {assert} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {CfgEditorPanel} from '../CfgEditor/CfgEditorPanel';
import {obtainWorkspaceRoots} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {ArtifactAttr} from './ArtifactLocator';
import {OneStorage} from './OneStorage';

// Exported for unit testing only
export {
  BaseModelNode as _unit_test_BaseModelNode,
  ConfigNode as _unit_test_ConfigNode,
  DirectoryNode as _unit_test_DirectoryNode,
  NodeFactory as _unit_test_NodeFactory,
  NodeType as _unit_test_NodeType,
  OneNode as _unit_test_OneNode,
  ProductNode as _unit_test_ProductNode,
};

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
export enum NodeType {
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
  public readonly id: string;
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
    this.id = Math.random().toString();
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

  resetChildren(): void {
    this._childNodes = undefined;
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
  static create(type: NodeType, fpath: string, parent: Node|undefined, attr?: ArtifactAttr): Node {
    const uri = vscode.Uri.file(fpath);

    let node: Node;
    switch (type) {
      case NodeType.directory: {
        assert.strictEqual(attr, undefined, 'Directory nodes cannot have attributes');
        node = new DirectoryNode(uri, parent);
        break;
      }
      case NodeType.baseModel: {
        node = new BaseModelNode(uri, parent, attr?.openViewType, attr?.icon, attr?.canHide);
        break;
      }
      case NodeType.config: {
        assert.strictEqual(attr, undefined, 'Config nodes cannot have attributes');
        node = new ConfigNode(uri, parent);
        break;
      }
      case NodeType.product: {
        node = new ProductNode(uri, parent, attr?.openViewType, attr?.icon, attr?.canHide);
        break;
      }
      default: {
        throw Error('Undefined NodeType');
      }
    }

    OneStorage.insert(node);

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
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly node: Node,
  ) {
    super(node.name, collapsibleState);

    this.id = node.id;
    this.resourceUri = node.uri;
    this.description = true;
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

  private _tree: Node[]|undefined;
  private _workspaceRoots: vscode.Uri[] = [];

  public static didHideExtra: boolean = false;

  public static register(context: vscode.ExtensionContext) {
    const provider = new OneTreeDataProvider(context.extension.extensionKind);

    const _treeView = vscode.window.createTreeView(
        'OneExplorerView',
        {treeDataProvider: provider, showCollapseAll: true, canSelectMany: true});

    let registrations = [
      provider.fileWatcher.onDidCreate((_uri: vscode.Uri) => {
        provider.refresh();
      }),
      provider.fileWatcher.onDidChange((_uri: vscode.Uri) => {
        // TODO Handle by each node types
        provider.refresh();
      }),
      provider.fileWatcher.onDidDelete((uri: vscode.Uri) => {
        const node = OneStorage.getNode(uri.fsPath);
        if (!node) {
          return;
        }

        OneStorage.delete(node, true);
        provider.refresh(node.parent);
      }),
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        provider._workspaceRoots = obtainWorkspaceRoots().map(root => vscode.Uri.file(root));
        provider.refresh();
      }),
      _treeView,
      vscode.commands.registerCommand(
          'one.explorer.revealInOneExplorer',
          (path: string) => {
            const node = OneStorage.getNode(path);
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
      vscode.commands.registerCommand('one.explorer.rename', (node: Node) => provider.rename(node)),
      vscode.commands.registerCommand(
          'one.explorer.refactor', (node: Node) => provider.refactor(node)),
    ];

    if (provider.isLocal) {
      registrations = [
        ...registrations,
        vscode.commands.registerCommand(
            'one.explorer.openContainingFolder',
            (node: Node) => provider.openContainingFolder(node)),
      ];
    } else {
      vscode.commands.executeCommand('setContext', 'one:extensionKind', 'Workspace');
    }

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(private _extensionKind: vscode.ExtensionKind) {
    this._workspaceRoots = obtainWorkspaceRoots().map(root => vscode.Uri.file(root));
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

    this.refresh(undefined, false);
  }

  /**
   * @command one.explorer.showExtra
   */
  showExtra(): void {
    OneTreeDataProvider.didHideExtra = false;

    vscode.commands.executeCommand(
        'setContext', 'one.explorer:didHideExtra', OneTreeDataProvider.didHideExtra);

    this.refresh(undefined, false);
  }

  /**
   * Refresh the tree under the given Node
   * @command one.explorer.refresh
   * @param node A start node to rebuild. The sub-tree under the node will be rebuilt.
   *                If not given, the whole tree will be rebuilt.
   * @param clear A flag whether to clear the stored node data or not.
   */
  refresh(node?: Node, clear: boolean = true): void {
    if (!node) {
      if (clear) {
        OneStorage.reset();
        // Reset the root in order to build from scratch (at OneTreeDataProvider.getTree)
        this._tree = undefined;
      }
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
   * @brief A helper function to show input box to ask a new file name
   */
  private askNewName = (node: Node) => {
    return vscode.window.showInputBox({
      title: 'Enter a file name:',
      value: `${path.basename(node.uri.fsPath)}`,
      valueSelection:
          [0, path.basename(node.uri.fsPath).length - path.parse(node.uri.fsPath).ext.length],
      placeHolder: `Enter a new name for ${path.basename(node.uri.fsPath)}`,
      validateInput: this.validateNewPath(node)
    });
  };

  /**
   * @brief A helper function to validate the given path
   * It checks whether
   * (1) the new path has the same ext
   * (2) the new path already exists
   */
  private validateNewPath = (node: Node): (newname: string) => string | undefined => {
    return (newname: string): string|undefined => {
      const oldpath = node.path;
      const dirpath = path.dirname(node.uri.fsPath);
      const newpath: string = path.join(dirpath, newname);
      if (!newname.endsWith(path.extname(oldpath))) {
        // NOTE
        // DO NOT use the code below.
        // `if (path.extname(newpath) !== path.extname(oldpath))`
        // It will evaluate '.tflite' as false, because it's extname is ''.
        return `A file extension must be (${path.extname(oldpath)})`;
      }
      if (newpath !== oldpath && fs.existsSync(newpath)) {
        return `A file or folder ${
            newname} already exists at this location. Please choose a different name.`;
      }
    };
  };

  /**
   * Rename a file
   * @note Renaming is only allowed for config files as it has no impact on the explorer view.
   * @command one.explorer.rename
   * @todo prohibit special characters from new name for security ('..', '*', etc)
   */
  rename(node: Node): void {
    assert.ok(node.type === NodeType.config);

    if (node.type !== NodeType.config) {
      return;
    }

    this.askNewName(node).then(newname => {
      if (newname) {
        const dirpath = path.dirname(node.uri.fsPath);
        const newpath = `${dirpath}/${newname}`;

        const edit = new vscode.WorkspaceEdit();
        edit.renameFile(node.uri, vscode.Uri.file(newpath));
        vscode.workspace.applyEdit(edit);
      }
    });
  }

  /**
   * Refactor BaseModel or Product(TBD)
   * It renames the file and changes the corresponding path in its referring config files.
   * @command one.explorer.refactor
   * @todo support refactoring of Product
   * @todo prohibit special characters from new name for security ('..', '*', etc)
   */
  async refactor(node: Node): Promise<void> {
    assert.ok(node.type === NodeType.baseModel);

    // Ask the new name of the model file
    const newname = await this.askNewName(node);
    if (!newname) {
      return;
    }

    const newpath = `${path.dirname(node.uri.fsPath)}/${newname}`;
    const children = node.getChildren();

    // If it has no child, simply rename it
    if (children.length === 0) {
      const edit = new vscode.WorkspaceEdit();
      edit.renameFile(node.uri, vscode.Uri.file(newpath));
      vscode.workspace.applyEdit(edit);
      return;
    }

    // Ask whether the user want to change the config files
    const askChangingCfgs = () => vscode.window.showInformationMessage(
        `Change corresponding fields in these following files?`, {
          detail: `${children.length} file(s): ${children.map(node => ' ' + node.name).toString()}`,
          modal: true
        },
        'Yes');

    if (!await askChangingCfgs()) {
      return;
    }

    // Refactor config files
    const refactorCfgs = () => {
      return Promise.all(children.map(child => {
        const cfgObj = OneStorage.getCfgObj(child.path);
        if (cfgObj) {
          const oldpath = node.path;
          return cfgObj.updateBaseModelField(oldpath, newpath).then(() => {
            Logger.info('OneExplorer', `Replaced ${oldpath} with ${newpath} in ${child.path}`);
          });
        }
        return undefined;
      }));
    };

    refactorCfgs().then(() => {
      const edit = new vscode.WorkspaceEdit();
      edit.renameFile(node.uri, vscode.Uri.file(newpath));
      vscode.workspace.applyEdit(edit);
    });
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

    if (this.isRemote) {
      approval = 'Delete';
      detail = 'The file will be deleted permanently.';
    } else {
      approval = 'Move to Trash';
      detail = `You can restore this file from the Trash.`;
    }

    vscode.window.showInformationMessage(title, {detail: detail, modal: true}, approval)
        .then(ans => {
          if (ans === approval) {
            Logger.info('OneExplorer', `Delete '${node.name}'.`);

            const edit = new vscode.WorkspaceEdit();
            edit.deleteFile(node.uri, {recursive: recursive, ignoreIfNotExists: true});
            vscode.workspace.applyEdit(edit);
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

    // TODO(dayo) Auto-configure more fields
    const content = `[onecc]
one-import-${extName}=True
[one-import-${extName}]
input_path=${modelName}.${extName}
`;

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

          // 'uri' path is not occupied, assured by validateInputPath
          const uri = vscode.Uri.file(`${dirPath}/${value}`);

          const edit = new vscode.WorkspaceEdit();
          edit.createFile(uri);
          edit.insert(uri, (new vscode.Position(0, 0)), content);

          vscode.workspace.applyEdit(edit).then(isSuccess => {
            if (isSuccess) {
              vscode.workspace.openTextDocument(uri).then(document => {
                document.save();
                vscode.commands.executeCommand('vscode.openWith', uri, CfgEditorPanel.viewType);
              });
            } else {
              Logger.error('OneExplorer', 'CreateCfg', `Failed to create the file ${uri}`);
            }
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
      return new OneNode(vscode.TreeItemCollapsibleState.Expanded, node);
    } else if (node.type === NodeType.product) {
      return new OneNode(vscode.TreeItemCollapsibleState.None, node);
    } else if (node.type === NodeType.baseModel || node.type === NodeType.config) {
      return new OneNode(
          (node.getChildren().length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                            vscode.TreeItemCollapsibleState.None,
          node);
    } else {
      throw Error('Undefined NodeType');
    }
  }

  /**
   * Note that vscode TreeDataProvider does build the tree by:
   * (1) getting children nodes from getChildren() and
   * (2) mapping the nodes to OneNode(Tree Item) using getTreeItem()
   * Therefore, to decide whether to display node or not, getChildren() should make decision.
   */
  getChildren(element?: Node): vscode.ProviderResult<Node[]> {
    if (!element) {
      return this.getTree();
    }

    return OneTreeDataProvider.didHideExtra ? element.getChildren().filter(node => !node.canHide) :
                                              element.getChildren();
  }

  /**
   * Get the root of the tree
   */
  private getTree(): Node[]|undefined {
    if (!this._workspaceRoots || this._workspaceRoots.length === 0) {
      return undefined;
    }

    if (!this._tree) {
      this._tree = this._workspaceRoots.map(
          root => NodeFactory.create(NodeType.directory, root.fsPath, undefined) as DirectoryNode);
    }

    return this._tree;
  }
}
