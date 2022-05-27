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

  // TODO: Add move()

  /**
   * Rename a file of all types of nodes (baseModel, derivedModel, config) excepts for directory.
   * It only alters the file name, not the path.
   */
  rename(oneNode: OneNode): void {
    // TODO: prohibit special characters for security ('..', '*', etc)
    let warningMessage;
    if (oneNode.node.type === NodeType.baseModel) {
      // TODO automatically change the corresponding files
      warningMessage = 'WARNING: You may need to change input paths in the following cfg files:\n';
      for (const conf of oneNode.node.childNodes) {
        // NOTE A newline character is not supported in input box.
        // vscode-extension doesn't plan to support multiple lines inside in input box or in
        // notification box.
        warningMessage += `${conf.name} `;
      }
    } else {
      warningMessage = 'WARNING: Renaming may result in some unexpected changes on the tree view.';
    }

    const validateInputPath = (newname: string): string|undefined => {
      const oldpath = oneNode.node.path;
      const dirpath = path.dirname(oneNode.node.uri.fsPath);
      const newpath: string = path.join(dirpath, newname);

      if (path.extname(newpath) !== path.extname(oldpath)) {
        return `File ext must be (${path.extname(oldpath)})`;
      }

      if (fs.existsSync(newpath)) {
        return `Invalid: File already exists!`;
      }
    };

    vscode.window
        .showInputBox({
          title: 'Enter a file name:',
          placeHolder: `${path.basename(oneNode.node.uri.fsPath)}`,
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
  createCfg(oneNode: OneNode): void {
    const dirName = path.parse(oneNode.node.path).dir;
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

    vscode.window
        .showInputBox({
          title: `Create ONE configuration of '${modelName}.${extName}' :`,
          placeHolder: `${modelName}.cfg`,
          value: `${modelName}.cfg`
        })
        .then(value => {
          const cfgPath = `${dirName}/${value}`;
          try {
            if (fs.existsSync(cfgPath)) {
              vscode.window.showInformationMessage(`Cancelled: Path already exists (${cfgPath})`);
              return;
            }
          } catch (err) {
            console.error(err);
            return;
          }

          vscode.workspace.fs.writeFile(vscode.Uri.file(cfgPath), content);
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

  // TODO(dayo) extract file-relative functions as another module
  private parseInputPath = (configPath: string, modelPath: string): string|undefined => {
    const config = readIni(configPath);
    const ext = path.extname(modelPath).slice(1);

    if (ext === undefined || config === null) {
      return undefined;
    }

    return config[`one-import-${ext}` as keyof typeof config] ?.['input_path'];
  };

  // TODO(dayo) extract file-relative functions as another module
  private grepTargetInCommand = (str: string): string[] => {
    return str.split(' ').filter(e => path.extname(e) === '.tvn' || path.extname(e) === '.circle');
  };

  // TODO(dayo) extract file-relative functions as another module
  private grepAll = (str: string): string[] => {
    return [str];
  };

  // TODO(dayo) extract file-relative functions as another module
  private parseIntermediates = (configPath: string): string[] => {
    const config = readIni(configPath);

    if (config === null) {
      return [];
    }

    const targetLocator = [
      {section: 'one-import-tf', key: 'output_path', grepper: this.grepAll},
      {section: 'one-import-tflite', key: 'output_path', grepper: this.grepAll},
      {section: 'one-import-onnx', key: 'output_path', grepper: this.grepAll},
      {section: 'one-import-bcq', key: 'output_path', grepper: this.grepAll},
      {section: 'one-optimize', key: 'input_path', grepper: this.grepAll},
      {section: 'one-optimize', key: 'output_path', grepper: this.grepAll},
      {section: 'one-quantize', key: 'input_path', grepper: this.grepAll},
      {section: 'one-quantize', key: 'output_path', grepper: this.grepAll},
      {section: 'one-codegen', key: 'command', grepper: this.grepTargetInCommand},
    ];

    let intermediates: string[] = [];
    for (let loc of targetLocator) {
      let confSection = config[loc.section as keyof typeof config];
      let confKey = confSection ?.[loc.key as keyof typeof config];
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
          console.log(`DerivedModels : ${derivedModels}`);

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

  /**
   * Search specified intermediate model files (a.k.a NodeType.derivedModel) in the same directory
   */
  private searchChildModels(node: Node) {
    console.assert(node.type === NodeType.config);
    console.log('searchChildModels');
    const files = fs.readdirSync(node.parent);

    for (const fname of files) {
      const fpath = path.join(node.parent, fname);
      const fstat = fs.statSync(fpath);

      // TODO(dayo) Get .tvn file extension from backend
      if (fstat.isFile() && (fname.endsWith('.circle') || fname.endsWith('.tvn'))) {
        const intermediates = this.parseIntermediates(node.path);
        for (let intermediate of intermediates) {
          const parsedPath = path.join(node.parent, intermediate);
          if (this.comparePath(parsedPath, fpath)) {
            const child = new Node(NodeType.derivedModel, [], vscode.Uri.file(fpath));
            node.childNodes.push(child);
            break;
          }
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
          (oneNode: OneNode) => oneTreeDataProvider.rename(oneNode))
    ]);
  }

  private openFile(node: Node) {
    vscode.commands.executeCommand('vscode.openWith', node.uri, CfgEditorPanel.viewType);
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
