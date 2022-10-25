/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

import {Balloon} from './Balloon';
import {Logger} from './Logger';

const logTag = 'Helpers';

/**
 * @brief This class represents a normalized absolute path
 *        which actually exists on the filesystem
 */
export class RealPath {
  absPath: string;

  private constructor(absPath: string) {
    this.absPath = absPath;
  }

  public static areEqual(path0: string, path1: string): boolean {
    const realPath0 = this.createRealPath(path0);
    const realPath1 = this.createRealPath(path1);

    if (!realPath0 || !realPath1) {
      return false;
    }

    return realPath0.equal(realPath1);
  }

  public equal(lhs: RealPath): boolean {
    return this.absPath === lhs.absPath;
  }

  public static createRealPath(rawPath: string): RealPath|null {
    const absPath = path.resolve(path.normalize(rawPath));

    return fs.existsSync(absPath) ? new RealPath(absPath) : null;
  }

  public static exists(rawPath: string|undefined): boolean {
    if (!rawPath) {
      return false;
    }
    const absPath = path.resolve(path.normalize(rawPath));

    return fs.existsSync(absPath) ? true : false;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

/**
 * @brief Get Workspace root folder as string
 * @return Return only the first workspaceFolder if multiple root exists, with showing a notfication
 *         balloon. Throw if there is no workspace.
 */
export function obtainWorkspaceRoot(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    Logger.info(logTag, 'obtainWorkspaceRoot', 'No WorkspaceFolders');
    // TODO revise message
    throw new Error('Need workspace');
  }

  // TODO support multi-root workspace
  if (workspaceFolders.length > 1) {
    Balloon.info('Warning: Only the first workspace directory is currently supported');
  }

  const workspaceRoot = workspaceFolders[0].uri.path;
  Logger.debug(logTag, 'obtainWorkspaceRoot:', workspaceRoot);

  return workspaceRoot;
}

/**
 * @brief Get a workspace root list as a string list
 * @return Return an empty list when workspace is not set
 * @note VSCode api says `vscode.workspace.workspaceFolders` is undefined when there is no
 *       workspace. However, it's observed that an empty list is returned when workspace is not set.
 *       Therefore, let's make it a uniform return here.
 */
export function obtainWorkspaceRoots(): string[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    Logger.error(logTag, 'obtainWorkspaceRoots', 'workspaceFolders is undefined');
    return [];
  }

  return workspaceFolders.map(ws => ws.uri.path);
}

export interface FileSelector {
  onFileSelected(uri: vscode.Uri|undefined): void;
}

/**
 * Show an information message to ask users whether to save the unsaved file.
 *
 * @param filepath a full path to the file.
 * @return a Promise returning true, if documents are saved.
 *         a Promise returning false, if error occurs or user choose not
 *          to save documents.
 */
export async function saveDirtyDocuments(filepath: string): Promise<boolean> {
  const unsavedDocuments = vscode.workspace.textDocuments.filter(td => {
    if ((td.fileName === filepath) && td.isDirty) {
      return true;
    }
    return false;
  });

  if (unsavedDocuments.length === 0) {
    return true;
  }

  const title = `Do you want to save the changes you made to ${path.parse(filepath).name}?`;
  const detail = undefined;
  const ansSave = 'Save';
  const ans =
      await vscode.window.showInformationMessage(title, {detail: detail, modal: true}, ansSave);

  if (ans === ansSave) {
    return Promise.all(unsavedDocuments.map(doc => doc.save())).then(res => {
      if (res.includes(false)) {
        Logger.error('Failed to save document');
        return false;
      } else {
        return true;
      }
    });
  } else {
    return false;
  }
}

// TODO Manage target file ext in ONE Explorer
export function isOneExplorerTargetFile(uri: vscode.Uri): boolean {
  const path = uri.fsPath;
  const ends = ['.pb', '.onnx', '.tflite', '.circle', '.cfg', '.log'];
  return ends.some((x) => path.endsWith(x));
}
