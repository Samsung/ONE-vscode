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
import {TextEncoder} from 'util';
import * as vscode from 'vscode';

import {CfgEditorPanel} from '../CfgEditor/CfgEditorPanel';
import {ToolArgs} from '../Project/ToolArgs';
import {ToolRunner} from '../Project/ToolRunner';
import {obtainWorkspaceRoot, RealPath} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';
import {ConfigObj} from './ConfigObject';

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


/**
 * The term is unique for OneExplorer.
 * It may not correspond to which of other modules.
 */
enum NodeType {
  /**
   * A base model from which ONE imports 'circle'.
   * (.onnx, .tflite, .tf, ..)
   */
  baseModel,

  /**
   * All intermediate model files transformed(compiled/quantized/optimized) from a 'base model'.
   * (.circle, .tvn, ...)
   */
  derivedModel,

  /**
   * A directory which contains any baseModel.
   */
  directory,

  /**
   * An ONE configuration file for onecc.
   * Which imports a targetted 'baseModel' (NOTE baseModel:config has 1:N relationship)
   */
  config,
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
    } else if (node.type === NodeType.derivedModel) {
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

  // TODO(dayo) Get the ext list(cfg,tflite..) from backend
  private fileWatcher =
      vscode.workspace.createFileSystemWatcher(`**/*.{cfg,tflite,onnx,circle,tvn}`);

  constructor(private workspaceRoot: vscode.Uri) {
    const fileWatchersEvents =
        [this.fileWatcher.onDidCreate, this.fileWatcher.onDidChange, this.fileWatcher.onDidDelete];

    for (let event of fileWatchersEvents) {
      event(() => this._onDidChangeTreeData.fire());
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  collapseAll(oneNode: OneNode): void {
    vscode.commands.executeCommand('workbench.actions.treeView.OneExplorerView.collapseAll');
  }

  // TODO: Add move()

  openContainingFolder(oneNode: OneNode): void {
    vscode.commands.executeCommand('revealFileInOS', oneNode.node.uri);
  }

  /**
   * Rename a file of all types of nodes (baseModel, derivedModel, config) excepts for directory.
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
    } else if (oneNode.node.type === NodeType.derivedModel) {
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
                  this.refresh();

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
    const toOneNode = (node: Node): OneNode => {
      if (node.type === NodeType.directory) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.Expanded, node);
      } else if (node.type === NodeType.derivedModel) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      } else if (node.type === NodeType.baseModel) {
        return new OneNode(
            node.name,
            (node.childNodes.length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                           vscode.TreeItemCollapsibleState.None,
            node);
      } else {  // (node.type == NodeType.config)
        let oneNode = new OneNode(
            node.name,
            (node.childNodes.length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                           vscode.TreeItemCollapsibleState.None,
            node);
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
   * Search corresponding .cfg files inside the workspace
   * for the given baseModelNode
   *
   * @param baseModelNode a Node of the base model
   */
  private searchPairConfig(baseModelNode: Node) {
    console.assert(baseModelNode.type === NodeType.baseModel);

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
    const confs =
        readdirSyncRecursive(this.workspaceRoot!.fsPath).filter(val => val.endsWith('.cfg'));

    for (const conf of confs) {
      const parsedObj = ConfigObj.parse(vscode.Uri.file(conf));
      if (!parsedObj) {
        Logger.info('OneExplorer', `Failed to open file ${conf}`);
        continue;
      }

      const {baseModels, derivedModels} = parsedObj;

      for (const baseModel of baseModels) {
        if (this.comparePath(baseModel.fsPath, baseModelNode.path)) {
          const pairNode = new Node(NodeType.config, [], vscode.Uri.file(conf));
          Logger.info('OneExplorer', `DerivedModels : ${derivedModels}`);

          derivedModels ?.forEach(derivedModel => {
                           // Display only the existing node
                           const realPath = RealPath.createRealPath(derivedModel.fsPath);
                           if (realPath) {
                             pairNode.childNodes.push(new Node(
                                 NodeType.derivedModel, [], vscode.Uri.file(realPath.absPath)));
                           }
                         });

          baseModelNode.childNodes.push(pairNode);
        }
      }
    }
  }
}

export class OneExplorer {
  // TODO Support multi-root workspace
  public workspaceRoot: vscode.Uri = vscode.Uri.file(obtainWorkspaceRoot());

  constructor(context: vscode.ExtensionContext) {
    // NOTE: Fix `obtainWorksapceRoot` if non-null assertion is false
    const oneTreeDataProvider = new OneTreeDataProvider(this.workspaceRoot!);
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('OneExplorerView', oneTreeDataProvider));

    const subscribeCommands = (disposals: vscode.Disposable[]) => {
      for (const disposal of disposals) {
        context.subscriptions.push(disposal);
      }
    };

    subscribeCommands([
      vscode.commands.registerCommand('onevscode.open-cfg', (file) => this.openFile(file)),
      vscode.commands.registerCommand(
          'onevscode.open-cfg-as-text',
          (oneNode: OneNode) => this.openWithTextEditor(oneNode.node)),
      vscode.commands.registerCommand(
          'onevscode.refresh-one-explorer', () => oneTreeDataProvider.refresh()),
      vscode.commands.registerCommand(
          'onevscode.create-cfg', (oneNode: OneNode) => oneTreeDataProvider.createCfg(oneNode)),
      vscode.commands.registerCommand(
          'onevscode.run-cfg',
          (oneNode: OneNode) => {
            const oneccRunner = new OneccRunner(oneNode.node.uri);
            oneccRunner.run();
          }),
      vscode.commands.registerCommand(
          'onevscode.rename-on-oneexplorer',
          (oneNode: OneNode) => oneTreeDataProvider.rename(oneNode)),
      vscode.commands.registerCommand(
          'onevscode.openContainingFolder',
          (oneNode: OneNode) => oneTreeDataProvider.openContainingFolder(oneNode)),
      vscode.commands.registerCommand(
          'onevscode.collapse-all', (oneNode: OneNode) => oneTreeDataProvider.collapseAll(oneNode)),
    ]);
  }

  private openFile(node: Node) {
    vscode.commands.executeCommand('vscode.openWith', node.uri, CfgEditorPanel.viewType);
  }

  private openWithTextEditor(node: Node) {
    vscode.commands.executeCommand('vscode.openWith', node.uri, 'default');
  }
}

//
// menu handler
//

import {EventEmitter} from 'events';

class OneccRunner extends EventEmitter {
  private startRunningOnecc: string = 'START_RUNNING_ONECC';
  private finishedRunningOnecc: string = 'FINISHED_RUNNING_ONECC';

  constructor(private cfgUri: vscode.Uri) {
    super();
  }

  /**
   * Function called when onevscode.run-cfg is called (when user clicks 'Run' on cfg file).
   */
  public run() {
    const toolRunner = new ToolRunner();

    this.on(this.startRunningOnecc, this.onStartRunningOnecc);
    this.on(this.finishedRunningOnecc, this.onFinishedRunningOnecc);

    const toolArgs = new ToolArgs('-C', this.cfgUri.fsPath);
    const cwd = path.dirname(this.cfgUri.fsPath);
    let oneccPath = toolRunner.getOneccPath();
    if (oneccPath === undefined) {
      throw new Error('Cannot find installed onecc');
    }

    const runnerPromise = toolRunner.getRunner('onecc', oneccPath, toolArgs, cwd);
    this.emit(this.startRunningOnecc, runnerPromise);
  }

  private onStartRunningOnecc(runnerPromise: Promise<string>) {
    const progressOption: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: `Running: 'onecc --config ${this.cfgUri.fsPath}'`,
      cancellable: true
    };

    // Show progress UI
    vscode.window.withProgress(progressOption, (progress, token) => {
      token.onCancellationRequested(() => {
        vscode.window.showWarningMessage(`Error: NYI`);
      });

      const p = new Promise<void>((resolve, reject) => {
        runnerPromise
            .then(value => {
              resolve();
              this.emit(this.finishedRunningOnecc);
            })
            .catch(value => {
              vscode.window.showErrorMessage(
                  `Error occured while running: 'onecc --config ${this.cfgUri.fsPath}'`);
              reject();
            });
      });

      return p;
    });
  }

  private onFinishedRunningOnecc() {
    vscode.window.showInformationMessage(`Successfully completed`);
  }
}
