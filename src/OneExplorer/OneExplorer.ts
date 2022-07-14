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
import {CircleViewerProvider} from '../CircleGraph/CircleViewer';
import {MondrianEditorProvider} from '../Mondrian/MondrianEditor';
import {obtainWorkspaceRoot, RealPath} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {Artifact, ConfigObj} from './ConfigObject';
import {OneccRunner} from './OneccRunner';

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

  /**
   * ABOUT EXTENDED EXTENSION (WITH MULTIPLE PERIODS, *.extended.ext) 
   *
   * Generally, filename extensions are defined from the last period.
   * We defined our custom 'extended file extension' with multiple periods.
   * 
   * EXAMPLE
   * 
   * (File name)          model.circle.log
   * (Extension)          .log
   * (Extended Extension) .circle.log
   */
  abstract extendedExt?: string | undefined;
  abstract viewType?: string | undefined;

  abstract icon: vscode.ThemeIcon;
  abstract isExtra: boolean;

  constructor(childNodes: Node[], uri: vscode.Uri) {
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

  get typeAsString(): string {
    // Return a NodeType as a string value
    return NodeType[this.type];
  }
}

class DirectoryNode extends Node {
  type = NodeType.directory;
  extendedExt = undefined;
  viewType = undefined;
  icon = vscode.ThemeIcon.Folder;
  isExtra = false;

  constructor(childNodes: Node[], uri: vscode.Uri, icon?:vscode.ThemeIcon, isExtra?:boolean) {
    super(childNodes, uri);

    if(icon) {
      this.icon = icon;
    }
    if(isExtra){
      this.isExtra = isExtra;
    }
  }
}

class BaseModelNode extends Node {
  type = NodeType.baseModel;
  extendedExt : string|undefined= undefined;
  viewType : string | undefined = undefined;
  icon = new vscode.ThemeIcon('symbol-variable');
  isExtra = false;

  constructor(childNodes: Node[], uri: vscode.Uri, extendedExt?: string, viewType?: string, icon?:vscode.ThemeIcon, isExtra?:boolean) {
    super(childNodes, uri);

    if(extendedExt) {
      this.extendedExt = extendedExt;
    }
    if(viewType) {
      this.viewType = viewType;
    }
    if(icon) {
      this.icon = icon;
    }
    if(isExtra){
      this.isExtra = isExtra;
    }
  }
}

class ConfigNode extends Node {
  type = NodeType.config;
  extendedExt : string|undefined= undefined;
  viewType = "cfg.editor";
  icon = new vscode.ThemeIcon('gear');
  isExtra = false;

  constructor(childNodes: Node[], uri: vscode.Uri, extendedExt?: string, viewType?: string, icon?:vscode.ThemeIcon, isExtra?:boolean) {
    super(childNodes, uri);

    if(extendedExt) {
      this.extendedExt = extendedExt;
    }
    if(viewType) {
      this.viewType = viewType;
    }
    if(icon) {
      this.icon = icon;
    }
    if(isExtra){
      this.isExtra = isExtra;
    }
  }
}

class ProductNode extends Node {
  type = NodeType.product;
  extendedExt : string|undefined= undefined;
  viewType : string|undefined= undefined;
  icon = vscode.ThemeIcon.File;
  isExtra = false;

  constructor(childNodes: Node[], uri: vscode.Uri, extendedExt?: string, viewType?: string, icon?:vscode.ThemeIcon, isExtra?:boolean) {
    super(childNodes, uri);

    if(extendedExt) {
      this.extendedExt = extendedExt;
    }
    if(viewType) {
      this.viewType = viewType;
    }
    if(icon) {
      this.icon = icon;
    }
    if(isExtra){
      this.isExtra = isExtra;
    }
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

    // const getCustomViewType = (node: Node): string|undefined => {
    //   } else if (node.ext === '.tracealloc.json') {
    //   } else if (node.ext === '.circle.log') {
    // };

    if(node.viewType){
      this.command = {
        command: 'vscode.openWith',
        title: 'Open with Custom Viewer',
        arguments: [node.uri, node.viewType]
      };
    }

    this.iconPath = node.icon;
    // } else if (node.type === NodeType.product && node.ext === '.circle.log') {
    //   this.iconPath = new vscode.ThemeIcon('file');
    // } else if (node.type === NodeType.product && node.ext === '.tracealloc.json') {
    //   this.iconPath = new vscode.ThemeIcon('graph-scatter');

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

export class OneTreeDataProvider implements vscode.TreeDataProvider<OneNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<OneNode|undefined|void> =
      new vscode.EventEmitter<OneNode|undefined|void>();
  readonly onDidChangeTreeData: vscode.Event<OneNode|undefined|void> =
      this._onDidChangeTreeData.event;

  // TODO(dayo) Get the ext list(cfg,tflite..) from backend
  private fileWatcher =
      vscode.workspace.createFileSystemWatcher(`**/*.{cfg,tflite,onnx,circle,tvn}`);

  public didHideExtra : boolean = false;
  private tree: Node|undefined;

  constructor(private workspaceRoot: vscode.Uri) {
    vscode.commands.executeCommand('setContext', 'one.explorer:hasHidenExtra', this.didHideExtra);

    const fileWatchersEvents =
        [this.fileWatcher.onDidCreate, this.fileWatcher.onDidChange, this.fileWatcher.onDidDelete];

    for (let event of fileWatchersEvents) {
      event(() => this.refresh());
    }
  }

  hideExtra(): void {
    this.didHideExtra = true;
    
    vscode.commands.executeCommand('setContext', 'one.explorer:hasHidenExtra', this.didHideExtra);
    this.refresh();
  }

  unhideExtra(): void {
    this.didHideExtra = false;
    
    vscode.commands.executeCommand('setContext', 'one.explorer:hasHidenExtra', this.didHideExtra);
    this.refresh();
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
            return vscode.workspace.fs.delete(
                oneNode.node.uri, {recursive: recursive, useTrash: true});
          }
        })
        .then(() => this.refresh());
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
    const toOneNode = (node: Node): OneNode | undefined => {
      if(node.isExtra && this.didHideExtra)
      {
        // Hide node
        return undefined;
      }

      if (node.type === NodeType.directory) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.Expanded, node);
      } else if (node.type === NodeType.product) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      } else if (node.type === NodeType.baseModel) {
        return new OneNode(
            node.name,
            (node.childNodes.length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                           vscode.TreeItemCollapsibleState.None,
            node);
      } else if (node.type === NodeType.config) {
        return new OneNode(
            node.name,
            (node.childNodes.length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                           vscode.TreeItemCollapsibleState.None,
            node);
      } else{
        throw Error("Undefined NodeType");
      }
    };

    return node.childNodes.map(node => toOneNode(node)!);
  }

  private getTree(rootPath: vscode.Uri): Node {
    if (!this.tree) {
      this.tree = new DirectoryNode([], rootPath);
      this.searchNode(this.tree);
    }

    return this.tree;
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
        const dirNode = this.createDirectoryNode(fpath);

        if (dirNode) {
          node.childNodes.push(dirNode);
        }
      } else if (
          fstat.isFile() &&
          (fname.endsWith('.pb') || fname.endsWith('.tflite') || fname.endsWith('.onnx'))) {
        const baseModelNode = this.createBaseModelNode(fpath);

        node.childNodes.push(baseModelNode);
      }
    }
  }

  private createDirectoryNode(fpath: string): Node|undefined {
    let dirNode = new DirectoryNode([], vscode.Uri.file(fpath));

    this.searchNode(dirNode);

    return (dirNode.childNodes.length > 0) ? dirNode : undefined;
  }

  private createBaseModelNode(fpath: string): Node {
    const baseModelNode = new BaseModelNode([], vscode.Uri.file(fpath));

    this.searchConfig(baseModelNode);

    return baseModelNode;
  }

  /**
   * Get the list of .cfg files wiithin this workspace
   * TODO Move to constructor
   */
  private getCfgList(root: string = this.workspaceRoot!.fsPath): string[] {
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
   * Search corresponding .cfg files inside the workspace
   * for the given baseModelNode
   *
   * @param baseModelNode a Node of the base model
   */
  private searchConfig(baseModelNode: Node) {
    console.assert(baseModelNode.type === NodeType.baseModel);

    const cfgList = this.getCfgList();

    for (const cfg of cfgList) {
      const cfgObj = ConfigObj.createConfigObj(vscode.Uri.file(cfg));

      if (!cfgObj) {
        Logger.info('OneExplorer', `Failed to open file ${cfg}`);
        continue;
      }

      if (!cfgObj.isChildOf(baseModelNode.path)) {
        continue;
      }

      const pairNode = this.createConfigNode(cfg, cfgObj.getProductsExists);

      baseModelNode.childNodes.push(pairNode);
    }
  }

  private createConfigNode(conf: string, products: Artifact[]): Node {
    const pairNode = new ConfigNode([], vscode.Uri.file(conf), '.cfg');

    Logger.debug('OneExplorer', `Products : ${products}`);

    products.forEach(product => {
      const {ext, viewType, icon, isExtra} = product.attr;

      pairNode.childNodes.push(
          new ProductNode([], vscode.Uri.file(product.path), ext, viewType, icon, isExtra));
    });


    return pairNode;
  }
}

export function initOneExplorer(context: vscode.ExtensionContext) {
  // TODO Support multi-root workspace
  let workspaceRoot: vscode.Uri = vscode.Uri.file(obtainWorkspaceRoot());
  // NOTE: Fix `obtainWorksapceRoot` if non-null assertion is false
  const oneTreeDataProvider = new OneTreeDataProvider(workspaceRoot!);

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
    vscode.commands.registerCommand('one.explorer.hideExtra', () => oneTreeDataProvider.hideExtra()),
    vscode.commands.registerCommand('one.explorer.unhideExtra', () => oneTreeDataProvider.unhideExtra()),
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
