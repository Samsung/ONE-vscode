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

import * as crypto from 'crypto';
import fs from 'fs';
import * as vscode from 'vscode';

import {Metadata} from './metadataAPI';

export class PathToHash {
  private static _instance: PathToHash;
  private _map: any;

  private constructor() {}

  public static async getInstance() {
    if (!this._instance) {
      this._instance = new PathToHash();
      this._instance._map = await this._instance.init();
      await this._instance.validateMetadata(this._instance._map);
    }
    return this._instance;
  }

  private async init() {
    if (vscode.workspace.workspaceFolders === undefined) {
      return;
    }
    const uri = vscode.workspace.workspaceFolders[0].uri;

    return this.getSubPathToHash(uri);
  }

  private async getSubPathToHash(uri: vscode.Uri) {
    let subPathToHash: {[key: string]: any} = {};
    const files = await vscode.workspace.fs.readDirectory(uri);

    for (const file of files) {
      const name: string = file[0];
      const type: number = file[1];

      if (type === 1) {
        subPathToHash[name] = await PathToHash.generateHash(vscode.Uri.joinPath(uri, '/' + name));
      } else if (type === 2 && name !== '.meta') {
        subPathToHash[name] = await this.getSubPathToHash(vscode.Uri.joinPath(uri, '/' + name));
      }
    }

    return subPathToHash;
  }

  public async validateMetadata(pathToHash: any) {
    // 1. Changing pathToHash, a tree structure, into a one-dimensional structure
    let flattenPathToHash = await this.getFlatPathToHash(pathToHash);

    // 2. Create metadata if pathToHash exists but does not have actual metadata files,
    // If pathToHash exists and there is a actual metadata file, but there is no path inside, create
    // a path and data insde
    await this.createMetadata(flattenPathToHash);

    // 3. Replace is_deleted with true for all metadata not in pathToHash
    await this.deleteMetadata(flattenPathToHash);
  }

  public async getFlatPathToHash(pathToHash: any) {
    let flatPathTohash: any = {};

    let queue = [];
    for (let data in pathToHash) {
      queue.push([data, pathToHash[data], data.toString()]);
    }

    while (queue.length !== 0) {
      const subPathToHash = queue.pop();
      if (subPathToHash === undefined) {
        continue;
      }
      if (vscode.workspace.workspaceFolders === undefined) {
        break;
      }
      let path =
          vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, subPathToHash[2]).path;
      if (fs.lstatSync(path).isDirectory()) {
        for (let key in subPathToHash[1]) {
          queue.push([key, subPathToHash[1][key], subPathToHash[2] + '/' + key]);
        }
      } else {
        flatPathTohash[subPathToHash[2]] = subPathToHash[1];
      }
    }
    return flatPathTohash;
  }

  public async createMetadata(flattenPathToHash: any) {
    for (let path in flattenPathToHash) {
      const hash = flattenPathToHash[path];

      let metadata: any = await Metadata.get(hash);

      if (Object.keys(metadata).length === 0) {
        await Metadata.set(hash, {});

      } else if (metadata[path]) {
        return;
      }

      const filename: any = path.split('/').pop();
      if (vscode.workspace.workspaceFolders === undefined) {
        return;
      }
      const stats: any = await Metadata.getStats(
          vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, path));
      metadata[path] = {};
      metadata[path]['name'] = filename;
      metadata[path]['file-extension'] = filename.split('.')[1];
      metadata[path]['create-time'] = stats.birthtime;
      metadata[path]['modified-time'] = stats.mtime;
      metadata[path]['is-deleted'] = false;
      await Metadata.set(hash, metadata);
    }
  }

  public async deleteMetadata(flattenpathToHash: any) {
    if (vscode.workspace.workspaceFolders === undefined) {
      return;
    }
    const baseUri =
        vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.meta/hash_objects');
    const arrayList = await vscode.workspace.fs.readDirectory(baseUri);
    for (const array of arrayList) {
      const hashFolderUri = vscode.Uri.joinPath(baseUri, array[0]);
      const hashList = await vscode.workspace.fs.readDirectory(hashFolderUri);
      for (const hashFile of hashList) {
        const hashUri = vscode.Uri.joinPath(hashFolderUri, hashFile[0]);
        let metadata =
            JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(hashUri)).toString());
        const hash = array[0] + hashFile[0].split('.')[0];
        for (const key in metadata) {
          if (!metadata[key]['is-deleted'] && flattenpathToHash[key] !== hash) {
            metadata[key]['is-deleted'] = true;
          }
        }
        Metadata.set(hash, metadata);
      }
    }
  }


  public get(uri: vscode.Uri) {
    const path = vscode.workspace.asRelativePath(uri);
    const splitPath = path.split('/');
    let pathToHash = this._map;

    splitPath.forEach((data) => {
      if (pathToHash === undefined) {
        return undefined;
      }
      pathToHash = pathToHash[data];
    });

    return pathToHash;
  }


  public static async generateHash(uri: vscode.Uri) {
    // TODO: Error handling
    return crypto.createHash('sha256')
        .update(Buffer.from(await vscode.workspace.fs.readFile(uri)).toString())
        .digest('hex');
  }

  public isFile(uri: vscode.Uri): boolean {
    const hash = this.get(uri);
    return typeof (hash) === 'string';
  }

  public exists(uri: vscode.Uri): boolean {
    return this.get(uri) !== undefined;
  }

  public getFilesUnderFolder(uri: vscode.Uri): vscode.Uri[] {
    const folder = this.get(uri);
    const files: vscode.Uri[] = [];
    if (typeof (folder) === 'string') {
      // not a folder
      return files;
    }
    for (const name in folder) {
      files.push(vscode.Uri.joinPath(uri, name));
    }

    return files;
  }

  // TODO: optimise the function (deal with files under a folder at once, etc)
  public async addPath(uri: vscode.Uri) {
    const path = vscode.workspace.asRelativePath(uri);
    const paths = path.split('/');
    let content: any = await PathToHash.generateHash(uri);
    let subPathToHash = this._map;
    let idx = 0;
    for (let path = paths[idx]; idx < paths.length - 1; path = paths[++idx]) {
      if (!subPathToHash[path]) {
        break;
      }
      subPathToHash = subPathToHash[path];
    }
    if (paths.length - 1 === idx) {  // paths.length - 1: index of a file name
      // When all of the folder path are stored in pathToHash
      // update / create pathToHash for a file
      subPathToHash[paths[idx]] = content;
      return;
    }

    for (let i = paths.length - 1; i > idx; --i) {
      let tempContent: {[key: string]: any} = {};
      tempContent[paths[i]] = content;
      content = tempContent;
    }
    subPathToHash[paths[idx]] = content;
  }

  public deletePath(uri: vscode.Uri) {
    const path = vscode.workspace.asRelativePath(uri);
    const paths = path.split('/');

    let subPathToHash = this._map;
    for (let i = 0, path = paths[i]; i < paths.length - 1; path = paths[++i]) {
      if (!subPathToHash) {
        return;
      }
      subPathToHash = subPathToHash[path];
    }
    if (subPathToHash === undefined) {
      // already deleted
      return;
    }
    delete subPathToHash[paths[paths.length - 1]];
    if (paths.length > 1) {
      this.markDeletedFolder(this._map, paths, 0);
    }
  }

  private markDeletedFolder(parent: any, paths: string[], idx: number) {
    const path = paths[idx];
    if (paths.length - 2 === idx) {
      if (Object.keys(parent[path]).length === 0) {
        delete parent[path];
      }
      return;
    }
    if (parent[path] === undefined) {
      return;
    }
    this.markDeletedFolder(parent[path], paths, idx + 1);
    if (Object.keys(parent[path]).length === 0) {
      delete parent[path];
    }
  }
}