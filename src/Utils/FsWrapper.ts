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

/**
 * A helper module for `vscode.workspace.fs`
 *
 * VS Code extension team recommends 
 * (1) using vscode.workspace.fs instead of fs
 * (2) not accessing file system synchronously.
 *
 * Add more helper functions as you may.
 */

export module fswrapper{

  export interface Stat{isDirectory: boolean, isFile: boolean, isSymbolic: boolean}

  /**
   * Replace fs.statSync
   *
   * @example Check whether it's a directory
   * ```
   * if(await fswrapper.stat(filePath)).isDirectory){...}
   * ```
   */
  export function stat(fsPath: string): Thenable<Stat> {
    return vscode.workspace.fs.stat(vscode.Uri.file(fsPath)).then((fstat) => {
      const isDirectory: boolean = ((fstat.type | vscode.FileType.Directory) === fstat.type);
      const isFile: boolean = ((fstat.type | vscode.FileType.File) === fstat.type);
      const isSymbolic: boolean = ((fstat.type | vscode.FileType.SymbolicLink) === fstat.type);
      return {isDirectory: isDirectory, isFile: isFile, isSymbolic: isSymbolic} as Stat;
    });
  }

  /**
   * Replace fs.readFileSync
   */
  export async function readFile(fsPath: string): Promise<string> {
    return (await vscode.workspace.fs.readFile(vscode.Uri.file(fsPath))).toString();
  }

  /**
   * Replace fs.existsSync
   */
  export async function exists(fsPath: string): Promise<boolean> {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(fsPath));
      return true;
    }
    catch {
      return false;
    }
  }

  // Support more
};
