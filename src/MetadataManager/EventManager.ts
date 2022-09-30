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

import {Balloon} from '../Utils/Balloon';
import {obtainWorkspaceRoot} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {Metadata} from './metadataAPI';
import {PathToHash} from './pathToHash';


class EventQueue {
  private inProgress: boolean = false;
  private queue: {method: any, input: {[key: string]: any}}[] = [];

  constructor() {
    this.queue = [];
  }

  enqueue(method: any, input: {[key: string]: any}): void {
    this.queue.push({method: method, input: input});
    this.autoAction();
  }

  front() {
    return this.queue[0];
  }
  dequeue() {
    this.queue.shift();
  }

  clear() {
    this.inProgress = false;
    this.queue = [];
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  autoAction() {
    if (this.inProgress === false) {
      this.inProgress = true;
      this.action();
    }
  }

  async action() {
    await this.front().method();
    this.dequeue();

    if (this.isEmpty()) {
      this.clear();
    } else {
      this.action();
    }
  }
}

class EventBuffer {
  private _queue = new EventQueue();
  constructor() {}
  public setEvent(request: any, input: {[key: string]: any}) {
    this._queue.enqueue(() => {
      return new Promise(() => {
        if (Object.keys(input).length === 0) {
          request();
        } else {
          request();
        }
      });
    }, input);
  }
}



/* istanbul ignore next */
export class MetadataEventManager {
  private fileWatcher = vscode.workspace.createFileSystemWatcher(`**/*`);  // glob pattern
  private eventBuffer = new EventBuffer();

  public static didCreateUri: vscode.Uri|undefined = undefined;

  public static register(context: vscode.ExtensionContext) {
    let workspaceRoot: vscode.Uri|undefined = undefined;

    try {
      workspaceRoot = vscode.Uri.file(obtainWorkspaceRoot());
      Logger.info('OneExplorer', `workspace: ${workspaceRoot.fsPath}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message === 'Need workspace') {
          Logger.info('OneExplorer', e.message);
        } else {
          Logger.error('OneExplorer', e.message);
          Balloon.error('Something goes wrong while setting workspace.', true);
        }
      } else {
        Logger.error('OneExplorer', 'Unknown error has been thrown.');
      }
    }

    const manager = new MetadataEventManager();

    let registrations = [
      manager.fileWatcher.onDidChange(async uri => {
        if (workspaceRoot) {
          manager.eventBuffer.setEvent(manager.changeFileEvent, {'uri': uri});
        }
      }),

      manager.fileWatcher.onDidDelete(async uri => {
        const pathToHash = await PathToHash.getInstance();
        if (!pathToHash.exists(uri)) {
          return;
        }

        const toUri = MetadataEventManager.didCreateUri;
        if (toUri) {
          MetadataEventManager.didCreateUri = undefined;
          // The file/folder is moved/renamed
          // case 1. [Dir]+Path       | move > search (delete & new)
          if (fs.statSync(toUri.path).isDirectory()) {
            manager.eventBuffer.setEvent(
                Metadata.moveMetadataUnderFolder, {'fromUri': uri, 'toUri': toUri});
          }
          // case 2. [File]+Path      | move (delete & new)
          else {
            manager.eventBuffer.setEvent(Metadata.moveMetadata, {'fromUri': uri, 'toUri': toUri});
          }
        } else {
          // case 3. [Dir]+undefined  | deactive > search
          if (!pathToHash.isFile(uri)) {
            manager.eventBuffer.setEvent(Metadata.disableMetadataUnderFolder, {'uri': uri});
          }
          // case 4. [File]+undefined | deactive
          else {
            manager.eventBuffer.setEvent(Metadata.disableMetadata, {'uri': uri});
          }
        }
      }),
      manager.fileWatcher.onDidCreate(async uri => {
        MetadataEventManager.didCreateUri = uri;

        const instance = await PathToHash.getInstance();
        // case 1. [Dir]  Copy with files > Serch all the file in the Dir
        if (fs.statSync(uri.fsPath).isDirectory()) {
          manager.eventBuffer.setEvent(manager.createDirEvent, {'uri': uri});
        } else if (Metadata.isValidFile(uri)) {
          // case 2. [File] Contents change event in Ubuntu terminal (refer to pathToHash)
          if (instance.get(uri) && workspaceRoot) {
            manager.eventBuffer.setEvent(manager.changeFileEvent, {'uri': uri});
          }
          // case 3. [File] File generation event
          else {
            manager.eventBuffer.setEvent(manager.createFileEvent, {'uri': uri});
          }
        }
        manager.eventBuffer.setEvent(manager.resetDidCreateUri, {});
      }),
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }
  async resetDidCreateUri() {
    MetadataEventManager.didCreateUri = undefined;
  }

  async changeFileEvent(input: {[key: string]: any}): Promise<void> {
    const uri = input['uri'];
    if (!Metadata.isValidFile(uri)) {
      return;
    }

    // case 1. [File] Contents change event
    const relPath = vscode.workspace.asRelativePath(uri);

    //(1) get beforehash and set afterhash
    const pathToHash = await PathToHash.getInstance();
    const fromHash: string = await pathToHash.get(uri);
    const toHash: string = await PathToHash.generateHash(uri);

    //(2) deactivate changed hash object
    let metadata: any = await Metadata.get(fromHash);
    if (Object.keys(metadata).length !== 0 && metadata[relPath]) {
      metadata[relPath]['is-deleted'] = true;
      await Metadata.set(fromHash, metadata);
    }

    //(3) change pathToHash
    await pathToHash.addPath(uri);

    metadata = await Metadata.get(toHash);

    //(4) create new hash object
    // TODO remain not default metadata format
    metadata = await MetadataEventManager.createDefaultMetadata(uri, metadata);
    Metadata.setBuildInfoMetadata(metadata[relPath], uri);
    await Metadata.setRelation(uri);

    await Metadata.set(toHash, metadata);
  }

  public static async createDefaultMetadata(uri: vscode.Uri, metadata: any) {
    const relPath = vscode.workspace.asRelativePath(uri);
    const filename: any = relPath.split('/').pop();
    const stats: any = await Metadata.getStats(uri);

    metadata[relPath]['name'] = filename;
    metadata[relPath]['file-extension'] = filename.split('.').at(-1);
    metadata[relPath]['create-time'] = stats.birthtime;
    metadata[relPath]['modified-time'] = stats.mtime;
    metadata[relPath]['is-deleted'] = false;

    return metadata;
  }

  async createDirEvent(input: {[key: string]: any}) {
    const uri = input['uri'];

    //(1) call search
    let fileList =
        await vscode.workspace.findFiles('**' + uri.fsPath + '/*.{pb,log,onnx,tflite,circle,cfg}');
    fileList.forEach((uri) => {
      this.createFileEvent({uri: uri});
    });
  }

  async createFileEvent(input: {[key: string]: any}) {
    const uri = input['uri'];

    //(1) refer to getPathToHash
    let relPath = vscode.workspace.asRelativePath(uri);
    const pathToHash = await PathToHash.getInstance();

    //(2) insert PathToHash
    await pathToHash.addPath(uri);
    let newHash = await pathToHash.get(uri);

    //(3) Hash로 getMetadata
    let metadata = await Metadata.get(newHash);

    //(4) Metadata Exist (searching with Hash)? (activate | deactivate) : copy format
    if (Object.keys(metadata).length !== 0) {  // metadata exist
      if (metadata[relPath]) {
        if (!metadata[relPath]['is-deleted']) {
          return;
        }                                         // path already activate. ignore this case
        metadata[relPath]['is-deleted'] = false;  // path deactive > activate
      } else {                                    // for copy format
        const keyList = Object.keys(metadata);
        const keyResult = keyList.filter(
            key => !metadata[key]['is-deleted']);  // find activate. or last key of KeyList;

        // data copy
        let data = JSON.parse(JSON.stringify(metadata[keyList[keyList.length - 1]]));
        if (keyResult.length) {
          data = JSON.parse(JSON.stringify(metadata[keyResult[0]]));
        }

        else {
          data['is-deleted'] = false;
        }

        // data update
        const stats: any = await Metadata.getStats(uri);
        data['name'] = uri.fsPath.split('/').pop();
        data['file-extension'] = uri.fsPath.split('.').pop();
        data['created-time'] = stats.birthtime;
        data['modified-time'] = stats.mtime;

        metadata[relPath] = data;
      }
    } else {  // metadata doesn't exist : common file
      metadata = await MetadataEventManager.createDefaultMetadata(uri, metadata);
    }
    Metadata.setBuildInfoMetadata(metadata[relPath], uri);
    await Metadata.setRelation(uri);
    //(6) Metadata Generation
    await Metadata.set(newHash, metadata);
    // Todo. [File] Generate Product from ONE (processing like case 1 or ignore)
  }
}
