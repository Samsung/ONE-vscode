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

import {Metadata} from './Metadata';
import {PathToHash} from './PathToHash';

/**
 * Relation information for displaying data in relation viewer
 */
interface RelationInfo {
  'selected': string, 'relation-data': Node[]
}

/**
 * A node which has the entire hash object information
 */
interface Node {
  'id': string, 'parent': string, 'represent-idx': number, 'data-list': NodeData[]
}

/**
 * An object which has metadata of one of the path in the hash object
 */
interface NodeData {
  'path': string, 'name': string, 'onecc-version'?: string, 'toolchain-version'?: string,
      'is-deleted': boolean
}

/**
 * Relation is a class which controls relation data of the base models and production files.
 */
export class Relation {
  constructor() {}
  /**
   * A map to save relation bewteen a child path and a parent path
   */
  private static _childToParentMap = new Map<string, string>();

  /**
   * Store relation between a path and its parent path temporarily
   */
  public static store(path: string, parentPath: string) {
    this._childToParentMap.set(path, parentPath);
  }

  /**
   * Save relation of the `uri` to the `relation.json` file, using the information stored in
   * `_childToParentMap`
   * @param uri An uri to save its relation
   */
  public static async updateFile(uri: vscode.Uri) {
    const path = uri.path;
    const relation = await readJson('relation');
    const parentPath = this._childToParentMap.get(path);
    if (parentPath === undefined) {
      return;
    }

    const pathToHash = await PathToHash.getInstance();
    const hash = await pathToHash.getHash(uri);
    if (hash === undefined || hash === '') {
      return;
    }

    let parentHash = await pathToHash.getHash(vscode.Uri.parse(parentPath));
    if (parentHash === undefined) {
      parentHash = '';
    }

    Relation._setParent(relation, hash, parentHash);
    if (parentHash !== '') {
      Relation._setChild(relation, parentHash, hash);
    }
    await saveJson('relation', relation);
  }

  /**
   * Set parent hash of the file
   * @param relation A map to store the information
   * @param hash A hash string of the file
   * @param parentHash A hash string of the parent file
   */
  private static _setParent(relation: any, hash: string, parentHash: string) {
    let data = Relation._getData(relation, hash);
    data.parent = parentHash;
    relation[hash] = data;
  }

  /**
   * Set child hash of the file
   * @param relation A map to store the information
   * @param hash A hash string of the file
   * @param childHash A hash string of the child file
   */
  private static _setChild(relation: any, hash: string, childHash: string) {
    let data = Relation._getData(relation, hash);

    if (!data.children.includes(childHash)) {
      data.children.push(childHash);
    }
    relation[hash] = data;
  }

  /**
   * Find the data of the file which has the hash value from the given relation
   * @param relation A map which has the entire relaion
   * @param hash A hash string to find data
   */
  private static _getData(relation: any, hash: string) {
    let data = relation[hash];
    if (data === undefined) {
      data = {parent: '', children: []};
    }
    return data;
  }

  /**
   * Get relation information of the file to display in the relation viewer
   * @param uri The uri of the file
   * @returns `RelationInfo` of the file
   */
  public static async getRelationInfo(uri: vscode.Uri) {
    const pathToHash = await PathToHash.getInstance();
    const nowHash = pathToHash.getHash(uri);
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
    const nowMetadata: any = await Metadata.getObj(nowHash);

    relationInfos.selected = nowHash;

    relationInfos['relation-data'].push({
      'id': nowHash,
      'parent': relJSON[nowHash].parent,
      'represent-idx': 0,
      'data-list': Relation._getNodeDataList(nowMetadata)
    });


    // find parents node
    let parentHash: string = relJSON[nowHash].parent;
    while (true) {
      if (!parentHash) {
        break;
      } else {
        const parentMetadata: any = await Metadata.getObj(parentHash);

        relationInfos['relation-data'].push({
          'id': parentHash,
          'parent': relJSON[parentHash].parent,
          'represent-idx': 0,
          'data-list': Relation._getNodeDataList(parentMetadata)
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
          const childMetadata: any = await Metadata.getObj(childrenHash[i]);

          relationInfos['relation-data'].push({
            'id': childrenHash[i],
            'parent': relJSON[childrenHash[i]].parent,
            'represent-idx': 0,
            'data-list': Relation._getNodeDataList(childMetadata)
          });
          hashs = [...relJSON[childrenHash[i]].children];
        }

        childrenHash = hashs;
      }
    }

    return relationInfos;
  }

  /**
   * Get a list of the entire data from metadata
   * @param metadata A map containing data to be listed
   * @returns
   */
  private static _getNodeDataList(metadata: any) {
    const dataList: NodeData[] = [];

    // TODO refactor
    const keys = Object.keys(metadata);
    for (let i = 0; i < keys.length; i++) {
      const element = metadata[keys[i]];
      const data: NodeData = {
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
}

async function saveJson(name: string, data: any) {
  if (vscode.workspace.workspaceFolders === undefined) {
    return;
  }

  const uri =
      vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.meta', name + '.json');
  await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(data, null, 4), 'utf8'));
}

async function readJson(name: string) {
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
