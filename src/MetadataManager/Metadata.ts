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
import * as vscode from 'vscode';

import {ToolchainInfo} from '../Backend/Toolchain';
import {obtainWorkspaceRoot} from '../Utils/Helpers';

import {} from './PathToHash';
import {getStats, isValidFile} from './Utils';

type BuildInfoKeys = 'onecc'|'toolchain'|'cfg';

interface BuildInfoObj {
  'onecc': string, 'toolchain': ToolchainInfo|undefined, 'cfg': any
}

export class BuildInfo {
  private static _map = new Map<string, BuildInfoObj>();
  
  public static get(metadata: any, uri: vscode.Uri) {
    const path = vscode.workspace.asRelativePath(uri);
    const info = BuildInfo._map.get(path);
    if (info) {
      metadata['onecc-version'] = info['onecc'];
      metadata['toolchain-version'] = info['toolchain'] ?.version ?.str();
      metadata['cfg-settings'] = info['cfg'];
    }

    BuildInfo._map.delete(path);
    return info;
  }

  public static set(path: string, key: BuildInfoKeys, value: any) {
    const relPath = vscode.workspace.asRelativePath(path);
    let info = BuildInfo._map.get(relPath);
    if (info === undefined) {
      info = {onecc: '', toolchain: undefined, cfg: undefined};
      BuildInfo._map.set(relPath, info);
    }
    info[key] = value;
  }
}

export class Metadata {
  constructor() {}

  public static async getObj(hash: string) {
    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    const jsonUri = vscode.Uri.joinPath(
        vscode.workspace.workspaceFolders[0].uri,
        `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);

    if (fs.existsSync(jsonUri.fsPath)) {
      return JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(jsonUri)).toString());
    }
    // TODO: Error Handling
    return undefined;
  }

  public static async setObj(hash: string, obj: object) {
    const workspaceroot = obtainWorkspaceRoot();
    const jsonUri = vscode.Uri.joinPath(
        vscode.Uri.file(workspaceroot),
        `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);
    await vscode.workspace.fs.writeFile(
      jsonUri, Buffer.from(JSON.stringify(obj, null, 4), 'utf8'));
  }

  public static async getEntry(uri: vscode.Uri, hash: string) {
    const metadata = await Metadata.getObj(hash);
    const relPath = vscode.workspace.asRelativePath(uri);
    if (metadata && metadata[relPath] && Object.keys(metadata[relPath]).length !== 0) {
      return metadata[relPath];
    }
    // TODO: Error Handling
    return undefined;
  }

  public static async setEntry(uri: vscode.Uri, hash: string, obj: any) {
    const workspaceroot = obtainWorkspaceRoot();
    const metadataUri = vscode.Uri.joinPath(
      vscode.Uri.file(workspaceroot),
      `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);

    const relPath = vscode.workspace.asRelativePath(uri);
    let metadata = await Metadata.getObj(hash);
    if (!metadata[relPath]) {
      metadata[relPath] = {};
    }
    for (let key in obj) {
      metadata[relPath][key] = obj[key];
    }
    await vscode.workspace.fs.writeFile(metadataUri, Buffer.from(JSON.stringify(metadata, null,
    4), 'utf8'));
  }

  // TODO: 덮어쓰기 추가
  public static async createDefault(uri: vscode.Uri, hash: string) {
    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    let metadata: any = await Metadata.getObj(hash);
    const relPath = vscode.workspace.asRelativePath(uri);

    // If it doesn't have metadata, create default metadata
    if (!metadata) {
      metadata = {};
      await Metadata.setObj(hash, metadata);
      // If it has metadata, exit
    } else if (metadata[relPath] && Object.keys(metadata[relPath]).length !== 0) {
      return;
    }

    const filename: any = relPath.split('/').pop();
    const stats: any =
        await getStats(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, relPath));
    metadata[relPath] = {};
    metadata[relPath]['name'] = filename;
    metadata[relPath]['file-extension'] = filename.split('.')[1];
    metadata[relPath]['create-time'] = stats.birthtime;
    metadata[relPath]['modified-time'] = stats.mtime;
    metadata[relPath]['is-deleted'] = false;
    await Metadata.setObj(hash, metadata);
  }

  /**
   * Move metadata of the files and folders under the fromUri folder to the toUri folder
   */

  // TODO: move to event manager
  // public static async moveUnderFolder(input: {[key: string]: any}) {
  //   const fromUri = input['fromUri'];
  //   const toUri = input['toUri'];

  //   const pathToHash = await PathToHash.getInstance();
  //   const toRelPath = vscode.workspace.asRelativePath(toUri);
  //   const files = await vscode.workspace.findFiles(`${toRelPath}/**/*`);

  //   for (let file of files) {
  //     const toFilePath = file.path;
  //     const fromFileUri = vscode.Uri.joinPath(
  //         fromUri, toFilePath.substring(toFilePath.lastIndexOf(toUri.path) + toUri.path.length));
  //     if (!pathToHash.isFile(fromFileUri)) {
  //       await Metadata.moveUnderFolder({'fromUri': fromFileUri, 'toUri': file});
  //     } else if (isValidFile(file)) {
  //       await Metadata.move({'fromUri': fromFileUri, 'newUri': file});
  //     }
  //   }
  // }

  // TODO: move to event manager
  // public static async move(input: {[key: string]: any}) {
  //   const fromUri = input['fromUri'];
  //   const toUri = input['toUri'];

  //   const fromRelPath = vscode.workspace.asRelativePath(fromUri);
  //   const toRelPath = vscode.workspace.asRelativePath(toUri);

  //   if (isValidFile(fromUri) && !isValidFile(toUri)) {
  //     // when the file is renamed from a valid file name to a invalid file name
  //     // ex. a.log > a.txt
  //     await Metadata.disable(fromUri);
  //     return;
  //   } else if (!isValidFile(fromUri) || !isValidFile(toUri)) {
  //     return;
  //   }

  //   // 1. Get hash from pathToHash
  //   const pathToHash = await PathToHash.getInstance();
  //   const hash = pathToHash.get(fromUri);
  //   if (hash === undefined) {
  //     return;
  //   }

  //   // 2. Get metadata from the old path
  //   const metadata = await Metadata.getObj(hash);
  //   if (!metadata || !metadata[fromRelPath] || Object.keys(metadata[fromRelPath]).length === 0) {
  //     // TODO: if there is no metadata, should we make a default metadata?
  //     return;
  //   }

  //   // 3. Move metadata to the new path
  //   metadata[fromRelPath]['name'] = toRelPath.split('/').pop();
  //   metadata[toRelPath] = metadata[fromRelPath];
  //   delete metadata[fromRelPath];
  //   await Metadata.setObj(hash, metadata);

  //   // 4. Update pathToHash
  //   await pathToHash.add(toUri);
  //   pathToHash.delete(fromUri);
  // }

  // deactivate all metadata under the folder
  // TODO: move to event manager
  // public static async disableUnderFolder(input: {[key: string]: any}) {
  //   const uri = input['uri'];

  //   // if it is a folder, deactivate all of its child files
  //   const pathToHash = await PathToHash.getInstance();
  //   const files = pathToHash.getFilesUnderFolder(uri);
  //   for (let file of files) {
  //     if (!pathToHash.isFile(file)) {
  //       await Metadata.disableUnderFolder(file);
  //     } else if (isValidFile(file)) {
  //       await Metadata.disable(file);
  //     }
  //   }
  // }

  // TODO: enable disable, delete 외에는 event로 볼 것
  public static async enable(uri: vscode.Uri, hash: string) {

  }

  // deactivate metadata
  public static async disable(uri: vscode.Uri, hash: string) {
    const relPath = vscode.workspace.asRelativePath(uri);
    if (!isValidFile(uri)) {
      return;
    }

    // step 1. Find hash object with hash value
    const metadata = await Metadata.getObj(hash);

    // step 2. Check if the hash object has the deleted uri
    if (metadata === undefined || !metadata[relPath] ||
        Object.keys(metadata[relPath]).length !== 0) {
      return;
    }

    // step 3. deactivate (set 'is_deleted') that path.
    metadata[relPath]['is-deleted'] = true;
    await Metadata.setObj(hash, metadata);
  }

  public static async delete(uri: vscode.Uri, hash: string) {
    const metadata = await Metadata.getObj(hash);
    const relPath = vscode.workspace.asRelativePath(uri);
    delete metadata[relPath];
    await Metadata.setObj(hash, metadata);
  }
}
