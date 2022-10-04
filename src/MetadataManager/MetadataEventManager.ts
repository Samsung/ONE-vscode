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
import {obtainWorkspaceRoot, isOneExplorerTargetFile} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';


import {BuildInfo, Metadata} from './Metadata';
import {PathToHash} from './PathToHash';
import {Relation} from './Relation';

class MetadataEventQueue {
  private inProgress: boolean = false;
  private queue: {method: Function, input: {[key: string]: any}}[] = [];

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
    console.log('q',this.queue);
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

class MetadataEventBuffer {
  private _queue = new MetadataEventQueue();
  constructor() {}
  public setEvent(request: any, input: {[key: string]: any}) {
    this._queue.enqueue(() => {
      return new Promise(resolve => {
        if (Object.keys(input).length === 0) {
          request().then((res:any)=>resolve(res));
        } else {
          request(input).then((res:any)=>resolve(res));
        }
      });
    }, input);
  }
}


/* istanbul ignore next */
export class MetadataEventManager {
  private fileWatcher = vscode.workspace.createFileSystemWatcher("**");  // glob pattern
  public static eventBuffer = new MetadataEventBuffer();
  public static didCreateUri: vscode.Uri|undefined = undefined;

  /**
   * Communicates among events
   * didCreateUri : communicates created file uri to delete event when file is renamed/moved.
   */

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
        const pathToHash = await PathToHash.getInstance();
        const caseFlag = pathToHash.getHash(uri);
        if (!caseFlag) {
          Logger.info('Metadata Manager', 'Unsupervised directory/file have been changed');
          return;
        }
        MetadataEventManager.eventBuffer.setEvent(manager.changeFileEvent, {'uri': uri});
      }),
      vscode.workspace.onDidDeleteFiles(async tempUriObj => {
        const uri=tempUriObj['files'][0];
        const pathToHash = await PathToHash.getInstance();
        const caseFlag = pathToHash.getHash(uri);
        const toUri = MetadataEventManager.didCreateUri;

        if(toUri){
          return;
        } else {
          if (typeof (caseFlag) !== 'string') {
            // case 1. [Dir]+undefined  | deactive > search for VScode
            MetadataEventManager.eventBuffer.setEvent(manager.deleteDirEvent, {'uri': uri});
          }
        }
      }),
      manager.fileWatcher.onDidDelete(async uri => {
        
        const toUri = MetadataEventManager.didCreateUri;
        const pathToHash = await PathToHash.getInstance();
        const caseFlag = pathToHash.getHash(uri);
        if (!caseFlag) {
          if (toUri) {
            Logger.info('Metadata Manager', 'Unsupervised directory/file have been renamed/moved');
          } else {
            Logger.info('Metadata Manager', 'Unsupervised directory/file have been removed');
          }
          return;
        }

        if (toUri) {
          MetadataEventManager.didCreateUri = undefined;
          // The file/folder is moved/renamed
          if (typeof (caseFlag) === 'string') {
            // case 1. [File]+Path      | move (delete & new)
            MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.moveFileEvent, {'fromUri': uri, 'toUri': toUri});
          } else {
            // case 2. [Dir]+Path       | move > search (delete & new)
            MetadataEventManager.eventBuffer.setEvent(manager.moveDirEvent, {'fromUri': uri, 'toUri': toUri});
          }
        } else {
          if (typeof (caseFlag) === 'string') {
            // case 3. [File]+undefined | deactive
            MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.deleteFileEvent, {'uri': uri});
          } else {
            // case 4. [Dir]+undefined  | deactive > search for Terminal
            MetadataEventManager.eventBuffer.setEvent(manager.deleteDirEvent, {'uri': uri,'manager':manager});
          }
        }
      }),
      manager.fileWatcher.onDidCreate(async uri => {
        MetadataEventManager.didCreateUri = uri;
        const pathToHash = await PathToHash.getInstance();
        const caseFlag = pathToHash.getHash(uri);
        if (fs.statSync(uri.fsPath).isDirectory()) {
          // case 1. [Dir]  Copy with files > Serch all the file in the Dir
          MetadataEventManager.eventBuffer.setEvent(manager.createDirEvent, {'uri': uri});
        } else if (isTarget(uri)) {
          if (caseFlag) {
            // case 2. [File] Contents change event in Ubuntu terminal (already file exists but call
            MetadataEventManager.eventBuffer.setEvent(manager.changeFileEvent, {'uri': uri});
          } else {
            // case 3. [File] File generation event
            MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.createFileEvent, {'uri': uri});
          }
        } else {
          Logger.info('Metadata Manager', 'Unsupervised directory/file have been created');
          return;
        }
        MetadataEventManager.eventBuffer.setEvent(manager.resetDidCreateUri, {});
      }),
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  async resetDidCreateUri() {
    MetadataEventManager.didCreateUri = undefined;
  }

  async changeFileEvent(input: {[key: string]: any}) {
    console.log("change file")
    const uri = input['uri'];
    const relPath = vscode.workspace.asRelativePath(uri);
    const pathToHash = await PathToHash.getInstance();

    // case 1. [File] Contents change event
    //(1) get fromhash and set tohash
    const fromHash: string = pathToHash.getHash(uri);

    //(2) deactivate changed hash object
    await Metadata.disable(uri, fromHash);

    //(3) change pathToHash
    await pathToHash.add(uri);
    const toHash: string = pathToHash.getHash(uri);

    //(4) get metaObj from hash
    let metaObj = await Metadata.getObj(toHash);
    if(!metaObj){metaObj={};}

    //(5) Metadata copy : metaObj exists, metaEntry doesn't exist
    if (Object.keys(metaObj).length !== 0 && !metaObj[relPath]) {
      const keyList = Object.keys(metaObj);
      const keyResult = keyList.filter(key => !metaObj[key]['is-deleted']);  // find activate or last key of KeyList;

      // data deep copy
      let metaEntry = JSON.parse(JSON.stringify(metaObj[keyList[keyList.length - 1]]));
      if (keyResult.length !== 0) {
        metaEntry = JSON.parse(JSON.stringify(metaObj[keyResult[0]]));
      }

      metaObj[relPath] = metaEntry;
      Metadata.setObj(toHash, metaObj);
    }

    //(6) create or update new hash object
    await Metadata.createDefault(uri, toHash);

    let metaEntry = await Metadata.getEntry(uri, toHash);

    BuildInfo.save(metaEntry, uri);
    await Relation.updateFile(uri);
    await Metadata.setEntry(uri, toHash, metaEntry);
  }

  async createDirEvent(input: {[key: string]: any}) {
    const uri = input['uri'];

    //(1) call search
    const relPath = vscode.workspace.asRelativePath(uri);
    const uriList = await vscode.workspace.findFiles(`${relPath}/**/*`);

    for (let uri of uriList) {
      if (isTarget(uri)) {
        MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.createFileEvent,{'uri': uri});
      }
    }
  }

  public static async createFileEvent(input: {[key: string]: any}) {
    const uri = input['uri'];
    const relPath = vscode.workspace.asRelativePath(uri);
    const pathToHash = await PathToHash.getInstance();

    console.log("create!");
    //(1) insert PathToHash
    await pathToHash.add(uri);
    const hash: string = pathToHash.getHash(uri);

    //(2) get metaObj from hash
    let metaObj = await Metadata.getObj(hash);
    if(!metaObj){metaObj={};}

    console.log("pass");

    //(3) Metadata copy : metaObj exists, metaEntry doesn't exist
    if (Object.keys(metaObj).length !== 0 && !metaObj[relPath]) {
      const keyList = Object.keys(metaObj);
      const keyResult = keyList.filter(key => !metaObj[key]['is-deleted']);  // find activate or last key of KeyList;

      // data deep copy
      let metaEntry = JSON.parse(JSON.stringify(metaObj[keyList[keyList.length - 1]]));
      if (keyResult.length !== 0) {
        metaEntry = JSON.parse(JSON.stringify(metaObj[keyResult[0]]));
      }

      metaObj[relPath] = metaEntry;
      await Metadata.setObj(hash, metaObj);
    }

    //(6) create or update new hash object
    await Metadata.createDefault(uri, hash);
    let metaEntry = await Metadata.getEntry(uri, hash);
    BuildInfo.save(metaEntry, uri);
    await Relation.updateFile(uri);
    await Metadata.setEntry(uri, hash, metaEntry);
  }

  async deleteDirEvent(input: {[key: string]: any}) {
    const uri = input['uri'];
    console.log("directDirEvent ", uri);
    //if it is a folder, deactivate all of its child files
    const pathToHash = await PathToHash.getInstance();
    console.log('underFolder', pathToHash.getAllHashesUnderFolder(uri));
    for (let file of pathToHash.getAllHashesUnderFolder(uri)) {
      if (isTarget(file)) {
        MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.deleteFileEvent,{'uri': file});
      //if (typeof (pathToHash.getHash(uri)) !== 'string') {
      //  console.log("important!!! ", pathToHash);
      //  await MetadataEventManager.deleteFileEvent({'uri': file});
      }
    }
  }

  public static async deleteFileEvent(input: {[key: string]: any}) {
    const uri = input['uri'];
    if (!isTarget(uri)) {
      return;
    }


    // step 1. Get hash value from pathToHash
    const pathToHash = await PathToHash.getInstance();
    const hash = pathToHash.getHash(uri);
    if (hash === undefined) {
      return;
    }

    // step 2. deactivate (set 'is_deleted') that path.
    await Metadata.disable(uri, hash);

    // step 3. Update pathToHash
    await pathToHash.delete(uri);
  }

  async moveDirEvent(input: {[key: string]: any}) {
    const fromDirUri = input['fromUri'];
    const toDirUri = input['toUri'];
    console.log("moveDirEvent", fromDirUri, toDirUri);

    const pathToHash = await PathToHash.getInstance();
    const toRelPath = vscode.workspace.asRelativePath(toDirUri);
    const uriList = await vscode.workspace.findFiles(`${toRelPath}/**/*`);

    for (let toUri of uriList) {
      const toPath=toUri.path;
      const fromUri= vscode.Uri.joinPath(fromDirUri, toPath.substring(toPath.lastIndexOf(toDirUri.path) + toDirUri.path.length));
      if(typeof (pathToHash.getHash(fromUri)) === 'string'){
        MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.moveFileEvent,{'fromUri': fromUri, 'toUri': toUri});
      }
    }
  }
  public static async moveFileEvent(input: {[key: string]: any}) {
    const fromUri = input['fromUri'];
    const toUri = input['toUri'];

    const pathToHash = await PathToHash.getInstance();
    const isFromUriTarget = isTarget(fromUri);
    const isToUriTarget = isTarget(toUri);
    if (isFromUriTarget && !isToUriTarget) {
      // when the file is renamed from a valid file name to a invalid file name
      // ex. a.log > a.txt
      await MetadataEventManager.deleteFileEvent({uri: fromUri});
      return;
    } else if (!isFromUriTarget || !isToUriTarget) {
      return;
    }

    // 1. Get hash from pathToHash
    const fromHash = pathToHash.getHash(fromUri);
    if (fromHash === undefined) {
      return;
    }

    // 2. Update pathToHash
    await pathToHash.delete(fromUri);
    await pathToHash.add(toUri);
    const toHash = pathToHash.getHash(toUri);

    // 3. Get metadata from the old path
    let fromMetaEntry = await Metadata.getEntry(fromUri, fromHash);
    if(!fromMetaEntry){fromMetaEntry={};}

    if (Object.keys(fromMetaEntry).length !== 0) {
      await Metadata.delete(fromUri, fromHash);
      await Metadata.setEntry(toUri, toHash, fromMetaEntry);
    }
    
    // 4. Move metadata to the new path
    await Metadata.createDefault(toUri, toHash);
  }
}

function isTarget(uri: vscode.Uri) {
  const relPath = vscode.workspace.asRelativePath(uri);
  return isOneExplorerTargetFile(uri) && relPath.split('/').every(p => p !== '.meta');
}