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
    await vscode.workspace.fs.writeFile(jsonUri, Buffer.from(JSON.stringify(obj, null, 4), 'utf8'));
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

  public static async setEntry(uri: vscode.Uri, hash: string, entry: any) {
    const workspaceroot = obtainWorkspaceRoot();
    const metadataUri = vscode.Uri.joinPath(
        vscode.Uri.file(workspaceroot),
        `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);

    const relPath = vscode.workspace.asRelativePath(uri);
    let metadata = await Metadata.getObj(hash);
    if (!metadata[relPath]) {
      metadata[relPath] = {};
    }
    for (let key in entry) {
      metadata[relPath][key] = entry[key];
    }
    await vscode.workspace.fs.writeFile(
        metadataUri, Buffer.from(JSON.stringify(metadata, null, 4), 'utf8'));
  }

  public static async createDefault(uri: vscode.Uri, hash: string) {
    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    let metadata: any = await Metadata.getObj(hash);
    const relPath = vscode.workspace.asRelativePath(uri);

    if (!metadata) {
      metadata = {};
      await Metadata.setObj(hash, metadata);
    }
    if (!metadata[relPath]) {
      metadata[relPath] = {};
    }

    const filename: any = relPath.split('/').pop();
    const stats: any =
        await getStats(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, relPath));

    metadata[relPath]['name'] = filename;
    metadata[relPath]['file-extension'] = filename.split('.').pop();
    metadata[relPath]['create-time'] = stats.birthtime;
    metadata[relPath]['modified-time'] = stats.mtime;
    metadata[relPath]['is-deleted'] = false;
    await Metadata.setObj(hash, metadata);
  }

  // NOTE When the deleted file is recovered, metadata is also recovered.
  //    For that situation, metadata is not deleted but deactivated.
  public static async disable(uri: vscode.Uri, hash: string) {
    if (!isValidFile(uri)) {
      return;
    }
    // step 1. Find hash object with hash value
    const metadata = await Metadata.getObj(hash);

    // step 2. Check if the hash object has the deleted uri
    const relPath = vscode.workspace.asRelativePath(uri);
    if (metadata === undefined || metadata[relPath] === undefined ||
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

  // NOTE enable does not seem necessary because eventmanager does not call it.
  //    When it's clear, this will be deleted.
  // public static async enable(uri: vscode.Uri, hash: string) {
  // }
}
