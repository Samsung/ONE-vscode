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

import {PathToHash} from './pathToHash';

interface RelationInfo {
  'selected': string, 'relation-data': Node[]
}

interface Node {
  'id': string, 'parent': string, 'represent-idx': number, 'data-list': Data[]
}

interface Data {
  'path': string, 'name': string, 'onecc-version'?: string, 'toolchain-version'?: string,
      'is-deleted': boolean
}

type BuildInfoKeys = 'onecc'|'toolchain'|'cfg';

interface BuildInfo {
  'onecc': string, 'toolchain': ToolchainInfo|undefined, 'cfg': any
}

export class Metadata {
  constructor() {}
  private static _buildInfoMap = new Map<string, BuildInfo>();
  private static _childToParentMap = new Map<string, string>();

  public static setRelationMap(path: string, parentPath: string) {
    this._childToParentMap.set(path, parentPath);
  }

  public static async setRelation(uri: vscode.Uri) {
    const path = uri.path;
    const relation = await this.readJsonFile('relation');
    const parentPath = this._childToParentMap.get(path);
    if (parentPath === undefined) {
      return;
    }
    const pathToHash = await PathToHash.getInstance();
    const hash = await pathToHash.get(uri);
    if (hash === undefined || hash === '') {
      return;
    }

    let parentHash = await pathToHash.get(vscode.Uri.parse(parentPath));
    if (parentHash === undefined) {
      parentHash = '';
    }
    let data = relation[hash];
    if (data === undefined) {
      data = {children: []};
    }
    data.parent = parentHash;
    relation[hash] = data;
    if (parentHash !== '') {
      let parentData = relation[parentHash];
      if (parentData === undefined) {
        parentData = {parent: '', children: []};
      }
      if (!parentData.children.includes(hash)) {
        parentData.children.push(hash);
      }
      relation[parentHash] = parentData;
    }

    await this.saveJsonFile('relation', relation);
  }

  public static async saveJsonFile(name: string, data: any) {
    if (vscode.workspace.workspaceFolders === undefined) {
      return;
    }

    const uri =
        vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.meta', name + '.json');
    await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(data, null, 4), 'utf8'));
  }

  public static async readJsonFile(name: string) {
    if (vscode.workspace.workspaceFolders === undefined) {
      return;
    }

    const uri =
        vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.meta', name + '.json');
    if (!fs.existsSync(uri.fsPath)) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify({}, null, 4), 'utf8'));
      return {};
    }
    const json: any = JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(uri)).toString());
    return json;
  }

  public static setBuildInfoMap(path: string, key: BuildInfoKeys, value: any) {
    const relativePath = vscode.workspace.asRelativePath(path);
    let info = this._buildInfoMap.get(relativePath);
    if (info === undefined) {
      info = {onecc: '', toolchain: undefined, cfg: undefined};
      this._buildInfoMap.set(relativePath, info);
    }
    info[key] = value;
  }

  public static setBuildInfoMetadata(metadata: any, uri: vscode.Uri) {
    const path = vscode.workspace.asRelativePath(uri);
    const info = this._buildInfoMap.get(path);
    if (info) {
      metadata['onecc-version'] = info['onecc'];
      metadata['toolchain-version'] = info['toolchain'] ?.version ?.str();
      metadata['cfg-settings'] = info['cfg'];
    }

    this._buildInfoMap.delete(path);
    return info;
  }

  // get metadata of file by path
  public static async getFileInfo(uri: vscode.Uri) {
    const pathToHash = await PathToHash.getInstance();
    const hash = pathToHash.get(uri);
    let metadata = await Metadata.get(hash);
    if (Object.keys(metadata).length !== 0) {
      return metadata[vscode.workspace.asRelativePath(uri).toString()];
    } else {
      return null;
    }
  }

  // deactivate metadata
  public static async disableMetadata(input: {[key: string]: any}) {
    const uri = input['uri'];
    const relativePath = vscode.workspace.asRelativePath(uri);
    if (!Metadata.isValidFile(uri)) {
      return;
    }

    const pathToHash = await PathToHash.getInstance();
    // step 1. Get hash value from pathToHash
    const hash = pathToHash.get(uri);
    if (hash === undefined) {
      return;
    }

    // step 2. Find hash object with hash value
    const metadata = await Metadata.get(hash);
    if (metadata === undefined) {
      return;
    }

    // step 3. Check if the hash object has the deleted uri
    const data = metadata[relativePath];
    if (data) {
      // step 4. If exists, deactivate (set 'is_deleted') that path.
      metadata[relativePath]['is-deleted'] = true;
      await Metadata.set(hash, metadata);

      // step 5. Update pathToHash
      pathToHash.deletePath(uri);
    }
  }

  // deactivate all metadata under the folder
  public static async disableMetadataUnderFolder(input: {[key: string]: any}) {
    const uri = input['uri'];

    // if it is a folder, deactivate all of its child files
    const pathToHash = await PathToHash.getInstance();
    for (let f of pathToHash.getFilesUnderFolder(uri)) {
      if (!pathToHash.isFile(f)) {
        await Metadata.disableMetadataUnderFolder(f);
      } else if (Metadata.isValidFile(f)) {
        await Metadata.disableMetadata(f);
      }
    }
  }


  public static async moveMetadata(input: {[key: string]: any}) {
    const fromUri = input['fromUri'];
    const toUri = input['toUri'];

    // console.log('Metadata::moveMetadata()===========');
    const fromRelPath = vscode.workspace.asRelativePath(fromUri);
    const toRelPath = vscode.workspace.asRelativePath(toUri);
    if (Metadata.isValidFile(fromUri) && !Metadata.isValidFile(toUri)) {
      // when the file is renamed from a valid file name to a invalid file name
      // ex. a.log > a.txt
      await this.disableMetadata(fromUri);
      return;
    } else if (!Metadata.isValidFile(fromUri) || !Metadata.isValidFile(toUri)) {
      return;
    }

    // 1. Get hash from pathToHash
    const pathToHash = await PathToHash.getInstance();
    const hash = pathToHash.get(fromUri);
    if (hash === undefined) {
      return;
    }

    // 2. Get metadata from the old path
    const metadata = await Metadata.get(hash);
    // if there is no metadata, should we make a default metadata?
    if (metadata === undefined) {
      return;
    }
    const data = JSON.parse(JSON.stringify(metadata[fromRelPath]));
    if (data === undefined) {
      return;
    }

    data['name'] = toRelPath.split('/').pop();
    // 3. Move metadata to the new path
    delete metadata[fromRelPath];
    metadata[toRelPath] = data;
    await Metadata.set(hash, metadata);

    // 4. Update pathToHash
    await pathToHash.addPath(toUri);
    pathToHash.deletePath(fromUri);
  }

  /**
   * Move metadata of the files and folders under the fromUri folder to the toUri folder
   */

  public static async moveMetadataUnderFolder(input: {[key: string]: any}) {
    const fromUri = input['fromUri'];
    const toUri = input['toUri'];

    // console.log(`moveMetadataUnderFolder():`, fromUri, toUri);
    const pathToHash = await PathToHash.getInstance();
    const toRelPath = vscode.workspace.asRelativePath(toUri);
    const files = await vscode.workspace.findFiles(`${toRelPath}/**/*`);
    for (let file of files) {
      const toFilePath = file.path;
      const fromFileUri = vscode.Uri.joinPath(
          fromUri, toFilePath.substring(toFilePath.lastIndexOf(toUri.path) + toUri.path.length));
      if (!pathToHash.isFile(fromFileUri)) {
        await Metadata.moveMetadataUnderFolder({'fromUri': fromFileUri, 'toUri': file});
      } else if (Metadata.isValidFile(file)) {
        await Metadata.moveMetadata({'fromUri': fromFileUri, 'newUri': file});
      }
    }
  }

  public static isValidFile(uri: vscode.Uri): boolean {
    const path = uri.path;
    let ends = ['.pb', '.onnx', '.tflite', '.circle', '.cfg', '.log'];
    return ends.some((x) => path.endsWith(x));
  }

  // get metadata of file by path
  public static async getRelationInfo(uri: vscode.Uri) {
    const pathToHash = await PathToHash.getInstance();
    const nowHash = pathToHash.get(uri);
    if (vscode.workspace.workspaceFolders === undefined) {
      return;
    }

    const relUri =
        vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.meta/relation.json');
    const relJSON: any =
        JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(relUri)).toString());

    // Return Object generation
    const relationInfos: RelationInfo = {'selected': '', 'relation-data': []};

    // load metadata of target node

    const nowMetadata: any = await Metadata.get(nowHash);

    relationInfos.selected = nowHash;

    relationInfos['relation-data'].push({
      'id': nowHash,
      'parent': relJSON[nowHash].parent,
      'represent-idx': 0,
      'data-list': this.getDataList(nowMetadata)
    });


    // find parents node
    let parentHash: string = relJSON[nowHash].parent;
    while (true) {
      if (!parentHash) {
        break;
      } else {
        const parentMetadata: any = await Metadata.get(parentHash);

        relationInfos['relation-data'].push({
          'id': parentHash,
          'parent': relJSON[parentHash].parent,
          'represent-idx': 0,
          'data-list': this.getDataList(parentMetadata)
        });
        parentHash = relJSON[parentHash].parent;
      }
    }

    // find child node
    let childrenHash: string[] = relJSON[nowHash].children;
    while (true) {
      let hashs: string[] = [];
      if (childrenHash.length === 0) {
        break;
      } else {
        for (let i = 0; i < childrenHash.length; i++) {
          const childMetadata: any = await Metadata.get(childrenHash[i]);

          relationInfos['relation-data'].push({
            'id': childrenHash[i],
            'parent': relJSON[childrenHash[i]].parent,
            'represent-idx': 0,
            'data-list': this.getDataList(childMetadata)
          });
          hashs = [...relJSON[childrenHash[i]].children];
        }

        childrenHash = hashs;
      }
    }


    return relationInfos;
  }

  // get all Metadata of same hash object by hash
  // This function should be called after building PathToHash.
  public static async get(hash: string) {
    if (vscode.workspace.workspaceFolders !== undefined) {
      const metaUri = vscode.Uri.joinPath(
          vscode.workspace.workspaceFolders[0].uri,
          `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);
      if (!fs.existsSync(metaUri.fsPath)) {
        // await vscode.workspace.fs.writeFile(metaUri,Buffer.from(JSON.stringify({}, null,
        // 4),'utf8'));
        await Metadata.set(hash, {});
        return {};
      } else {
        return JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(metaUri)).toString());
      }
    }
  }

  // set all Metadata of same hash object by hash
  public static async set(hash: string|undefined, value: object) {
    const workspaceroot = obtainWorkspaceRoot();
    if (hash) {
      const uri = vscode.Uri.joinPath(
          vscode.Uri.file(workspaceroot),
          `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);
      await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(value, null, 4), 'utf8'));
    }
  }

  public static getDataList(metadata: any) {
    const dataList: Data[] = [];

    // TODO refactor
    const keys = Object.keys(metadata);
    for (let i = 0; i < keys.length; i++) {
      const element = metadata[keys[i]];
      const data: Data = {
        'path': keys[i],
        'name': element.name,
        'onecc-version': element['onecc-version'],
        'toolchain-version': element['toolchain-version'],
        'is-deleted': element['is-deleted']
      };
      dataList.push(data);
    }
    return dataList;
  }

  public static getStats(uri: vscode.Uri) {
    return new Promise(function(resolve, reject) {
      fs.stat(uri.fsPath, function(err, stats) {
        if (err) {
          return reject(err);
        }
        return resolve(stats);
      });
    });
  }
}
