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

import * as flatbuffers from 'flatbuffers';
import * as fs from 'fs';
import * as vscode from 'vscode';

import {ToolchainInfo} from '../Backend/Toolchain';
import * as Circle from '../CircleEditor/circle_schema_generated';
import {obtainWorkspaceRoot} from '../Utils/Helpers';

import {isOneExplorerTargetFile} from '../Utils/Helpers';

type BuildInfoKeys = 'onecc'|'toolchain'|'cfg';

interface BuildInfoObj {
  'onecc': string, 'toolchain': ToolchainInfo|undefined, 'cfg': any
}

export class BuildInfo {
  private static _map = new Map<string, BuildInfoObj>();

  public static set(path: string, key: BuildInfoKeys, value: any) {
    const relPath = vscode.workspace.asRelativePath(path);
    let info = BuildInfo._map.get(relPath);
    if (info === undefined) {
      info = {onecc: '', toolchain: undefined, cfg: undefined};
      BuildInfo._map.set(relPath, info);
    }
    info[key] = value;
  }

  public static save(metaEntry: any, uri: vscode.Uri) {
    const path = vscode.workspace.asRelativePath(uri);
    const info = BuildInfo._map.get(path);
    if (info) {
      metaEntry['onecc-version'] = info['onecc'];
      metaEntry['toolchain-version'] = info['toolchain'] ?.version ?.str();
      metaEntry['cfg-settings'] = info['cfg'];
    }
    BuildInfo._map.delete(path);
  }
}

export class Operator {
  public static async get(uri: vscode.Uri) {
    const bytes = new Uint8Array(await vscode.workspace.fs.readFile(uri));
    const buf = new flatbuffers.ByteBuffer(bytes);
    const model = Circle.Model.getRootAsModel(buf).unpack();
    const operators = model.operatorCodes.map(
        (operator) => Circle.BuiltinOperator[operator.deprecatedBuiltinCode]);
    return operators;
  }

  public static async save(metaEntry: any, uri: vscode.Uri) {
    if (!uri.fsPath.endsWith('.circle')) {
      return;
    }

    const stat = fs.statSync(uri.fsPath);
    const operations: any = {};
    // TODO deal with large files
    if (stat.size > 10000) {
      operations['error-message'] = 'File size is too large';
    } else {
      const opInfo = await Operator.get(uri);
      operations['op-total'] = opInfo.length;
      operations['ops'] = opInfo;
    }
    metaEntry['operations'] = operations;
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
    await vscode.workspace.fs.writeFile(jsonUri, Buffer.from(JSON.stringify(obj, null, 4), 'utf8'));
  }

  public static async getEntry(uri: vscode.Uri, hash: string) {
    const metaObj = await Metadata.getObj(hash);
    const relPath = vscode.workspace.asRelativePath(uri);
    if (metaObj && metaObj[relPath] && Object.keys(metaObj[relPath]).length !== 0) {
      return metaObj[relPath];
    }
    // TODO: Error Handling
    return undefined;
  }

  public static async setEntry(uri: vscode.Uri, hash: string, entry: any) {
    const workspaceroot = obtainWorkspaceRoot();
    const jsonUri = vscode.Uri.joinPath(
        vscode.Uri.file(workspaceroot),
        `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);

    const relPath = vscode.workspace.asRelativePath(uri);
    const metaObj = await Metadata.getObj(hash);
    if (!metaObj[relPath]) {
      metaObj[relPath] = {};
    }
    for (let key in entry) {
      metaObj[relPath][key] = entry[key];
    }
    await vscode.workspace.fs.writeFile(
        jsonUri, Buffer.from(JSON.stringify(metaObj, null, 4), 'utf8'));
  }

  public static async createDefault(uri: vscode.Uri, hash: string) {
    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    let metaObj: any = await Metadata.getObj(hash);
    const relPath = vscode.workspace.asRelativePath(uri);

    if (metaObj === undefined) {
      metaObj = {};
      await Metadata.setObj(hash, metaObj);
    }
    if (metaObj[relPath] === undefined) {
      metaObj[relPath] = {};
    }

    const filename: any = relPath.split('/').pop();
    const stats: any = fs.statSync(uri.fsPath);

    metaObj[relPath]['name'] = filename;
    metaObj[relPath]['file-extension'] = filename.split('.').pop();
    metaObj[relPath]['create-time'] = stats.birthtime;
    metaObj[relPath]['modified-time'] = stats.mtime;
    metaObj[relPath]['is-deleted'] = false;
    await Metadata.setObj(hash, metaObj);
  }

  // NOTE When the deleted file is recovered, metadata is also recovered.
  //    For that situation, metadata is not deleted but deactivated.
  public static async disable(uri: vscode.Uri, hash: string) {
    if (!isOneExplorerTargetFile(uri)) {
      return;
    }
    // step 1. Find hash object with hash value
    const metaObj = await Metadata.getObj(hash);

    // step 2. Check if the hash object has the deleted uri
    const relPath = vscode.workspace.asRelativePath(uri);
    if (metaObj === undefined || metaObj[relPath] === undefined ||
        Object.keys(metaObj[relPath]).length === 0) {
      return;
    }

    // step 3. deactivate (set 'is_deleted') that path.
    metaObj[relPath]['is-deleted'] = true;
    await Metadata.setObj(hash, metaObj);
  }

  public static async delete(uri: vscode.Uri, hash: string) {
    const metaObj = await Metadata.getObj(hash);
    const relPath = vscode.workspace.asRelativePath(uri);
    delete metaObj[relPath];
    await Metadata.setObj(hash, metaObj);
  }

  public static async getInfo(uri: vscode.Uri, hash: string) {
    const metaEntry = await Metadata.getEntry(uri, hash);
    const info: any = {};
    info[metaEntry['name']] = metaEntry;
    return info;
  }
}
