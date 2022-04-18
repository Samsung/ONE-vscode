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

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'process';

export class ContextNode extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;
    this.description = this.label;
  }

  iconPath = vscode.ThemeIcon.File;

  
}

export class ContextTreeDataProvider implements vscode.TreeDataProvider<ContextNode> {

  private _onDidChangeTreeData: vscode.EventEmitter<ContextNode | undefined | void> = new vscode.EventEmitter<ContextNode | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ContextNode | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ContextNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ContextNode): ContextNode[] | Thenable<ContextNode[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No context in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      // return Promise.resolve(this.getContextFile(this.workspaceRoot));
      console.log(element);
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.getConfigFiles(this.workspaceRoot));
    }
  }

  private getConfigFiles(rootPath: string): ContextNode[] {
    if (this.pathExists(rootPath)) {
      const configLists: ContextNode[] = [];

    //   const searchConfig = (rootPath: string) => {
    //     fs.readdir(rootPath, function (err, files) {
    //     if (err) {
    //       vscode.window.showErrorMessage('Unable to load config files: ' + err);
    //     } else {
    //       files.forEach(function (file) {
    //         console.log(file);
    //         // if (file.endsWith('cfg')) {
    //         //   configLists.push(new ContextNode(file, false, vscode.TreeItemCollapsibleState.None));
    //         // } else {
    //         const stat = fs.lstatSync(file);
    //         if (stat.isDirectory()) {
    //           searchConfig(file);
    //         }
    //         // }
    //       });
    //     }
    //   });
    // };

    // searchConfig(rootPath);

      // const searchConfig = (rootPath: string) => {
      //   if (this.pathExists(rootPath)) {
      //     const isDir = (fn: string) => {
      //       return fs.lstatSync(fn).isDirectory();
      //     };
      //     const dirs = fs.readdirSync(rootPath).map(fn => {
      //       return path.join(rootPath, fn);
      //     })
      //     .filter(isDir);
      //     dirs.map(fn => {
      //       // configLists.push(new ContextNode(fn, true, vscode.TreeItemCollapsibleState.Collapsed));
      //       searchConfig(fn);
      //     });
      //     const cfgs = fs.readdirSync(rootPath).filter(fn => fn.endsWith('.cfg'));
      //     cfgs.forEach(fn => {
      //       console.log(fn);
      //       configLists.push(new ContextNode(fn, vscode.TreeItemCollapsibleState.None));
      //     });
      //   }
      // };

      const searchConfig = (rootPath: string) => {
        if (this.pathExists(rootPath)) {
          const isDir = (fn: string) => {
            return fs.lstatSync(fn).isDirectory();
          };
          const dirs = fs.readdirSync(rootPath).map(fn => {
            return path.join(rootPath, fn);
          })
          .filter(isDir);
          dirs.map(fn => {
            // configLists.push(new ContextNode(fn, true, vscode.TreeItemCollapsibleState.Collapsed));
            searchConfig(fn);
          });
          const cfgs = fs.readdirSync(rootPath).filter(fn => fn.endsWith('.cfg'));
          if (cfgs.length > 0) {
            configLists.push(new ContextNode(rootPath.replace(this.workspaceRoot!, ''), vscode.TreeItemCollapsibleState.Collapsed));
          }
          cfgs.forEach(fn => {
            console.log(fn);
            configLists.push(new ContextNode(fn, vscode.TreeItemCollapsibleState.None));
          });
        }
      };

      searchConfig(rootPath);

      return configLists;
    } else {
      return [];
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
}

export class ContextExplorer {
  constructor(context: vscode.ExtensionContext) {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    const contextProvider = new ContextTreeDataProvider(rootPath);
    vscode.window.registerTreeDataProvider('ContextExplorerView', contextProvider);
  }
}