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
      manager.fileWatcher.onDidDelete(async uri => {
        
        const toUri = MetadataEventManager.didCreateUri;
        const pathToHash = await PathToHash.getInstance();
        const caseFlag = pathToHash.getHash(uri);
        console.log('delete event!', toUri, caseFlag);
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
            //console.log('moveFile');
            MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.moveFileEvent, {'fromUri': uri, 'toUri': toUri});
          } else {
            // case 2. [Dir]+Path       | move > search (delete & new)
            //console.log('moveDir');
            MetadataEventManager.eventBuffer.setEvent(manager.moveDirEvent, {'fromUri': uri, 'toUri': toUri});
          }
        } else {
          if (typeof (caseFlag) === 'string') {
            // case 3. [File]+undefined | deactive
            //console.log('deleteFile');
            MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.deleteFileEvent, {'uri': uri});
          } else {
            // case 4. [Dir]+undefined  | deactive > search
            //console.log('deleteDir');
            MetadataEventManager.eventBuffer.setEvent(manager.deleteDirEvent, {'uri': uri,'manager':manager});
          }
        }
      }),
      manager.fileWatcher.onDidCreate(async uri => {
        MetadataEventManager.didCreateUri = uri;
        const pathToHash = await PathToHash.getInstance();
        const caseFlag = pathToHash.getHash(uri);
        if (fs.statSync(uri.fsPath).isDirectory()) {
          //console.log('createDir');
          // case 1. [Dir]  Copy with files > Serch all the file in the Dir
          MetadataEventManager.eventBuffer.setEvent(manager.createDirEvent, {'uri': uri});
        } else if (isTarget(uri)) {
          if (caseFlag) {
            ////console.log('b');
            // case 2. [File] Contents change event in Ubuntu terminal (already file exists but call
            MetadataEventManager.eventBuffer.setEvent(manager.changeFileEvent, {'uri': uri});
          } else {
            ////console.log('d');
            // case 3. [File] File generation event
            MetadataEventManager.eventBuffer.setEvent(MetadataEventManager.createFileEvent, {'uri': uri});
          }
        } else {
          ////console.log('h');
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
    // ////console.log('o2');

    // case 1. [File] Contents change event
    //(1) get beforehash and set afterhash
    const fromHash: string = pathToHash.getHash(uri);
    //(2) deactivate changed hash object
    await Metadata.disable(uri, fromHash);
    // ////console.log('l2');

    //(3) change pathToHash
    await pathToHash.add(uri);
    const toHash: string = pathToHash.getHash(uri);

    //(4) get metaObj from hash
    let metaObj = await Metadata.getObj(toHash);
    ////console.log('w2');

    if(!metaObj){metaObj={};}

    //(5) Metadata copy : metaObj exists, metaEntry doesn't exist
    ////console.log(metaObj);
    if (Object.keys(metaObj).length !== 0 && !metaObj[relPath]) {
      const keyList = Object.keys(metaObj);
      const keyResult = keyList.filter(key => !metaObj[key]['is-deleted']);  // find activate or last key of KeyList;
      ////console.log(keyList);
      ////console.log(keyResult);
      ////console.log('p2');
      // data deep copy
      let metaEntry = JSON.parse(JSON.stringify(metaObj[keyList[keyList.length - 1]]));
      if (keyResult.length !== 0) {
        metaEntry = JSON.parse(JSON.stringify(metaObj[keyResult[0]]));
      }
      ////console.log('t2');
      metaObj[relPath] = metaEntry;
      Metadata.setObj(toHash, metaObj);
    }

    ////console.log('try2');
    //(6) create or update new hash object
    await Metadata.createDefault(uri, toHash);
    ////console.log('r2');

    let metaEntry = await Metadata.getEntry(uri, toHash);
    ////console.log('e2');

    BuildInfo.save(metaEntry, uri);
    await Relation.updateFile(uri);
    await Metadata.setEntry(uri, toHash, metaEntry);
  }

  async createDirEvent(input: {[key: string]: any}) {
    const uri = input['uri'];

    //(1) call search
    const relPath = vscode.workspace.asRelativePath(uri);
    const uriList = await vscode.workspace.findFiles(`${relPath}/**/*`);
    console.log(uriList);
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
      const keyResult = keyList.filter(
          key => !metaObj[key]['is-deleted']);  // find activate or last key of KeyList;
      // data deep copy
      let metaEntry = JSON.parse(JSON.stringify(metaObj[keyList[keyList.length - 1]]));
      if (keyResult.length !== 0) {
        metaEntry = JSON.parse(JSON.stringify(metaObj[keyResult[0]]));
      }
      metaObj[relPath] = metaEntry;
      await Metadata.setObj(hash, metaObj);
    }

    ////console.log('try');
    //(6) create or update new hash object
    await Metadata.createDefault(uri, hash);

    ////console.log('re');
    let metaEntry = await Metadata.getEntry(uri, hash);
    ////console.log('bye');
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
      if (typeof (file.path) === 'string') {
        console.log("important!!! ", pathToHash);
        await MetadataEventManager.deleteFileEvent({'uri': file});
      }
    }
  }

  public static async deleteFileEvent(input: {[key: string]: any}) {
    const uri = input['uri'];
    console.log('deleteFileEvent', uri);
    if (!isTarget(uri)) {
      return;
    }
    ////console.log('aa=');

    const pathToHash = await PathToHash.getInstance();
    console.log("important22",pathToHash);
    // step 1. Get hash value from pathToHash
    const hash = pathToHash.getHash(uri);
    if (hash === undefined) {
      return;
    }
    ////console.log('ada');

    // step 2. deactivate (set 'is_deleted') that path.
    await Metadata.disable(uri, hash);
    ////console.log('saa');

    // step 3. Update pathToHash
    await pathToHash.delete(uri);
    console.log(pathToHash);
    ////console.log('opa');
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
    console.log("moveFileEvent", fromUri, toUri);
    const fromRelPath = vscode.workspace.asRelativePath(fromUri);
    // console.log('1');
    const pathToHash = await PathToHash.getInstance();
    const isFromUriTarget = isTarget(fromUri);
    const isToUriTarget = isTarget(toUri);
    if (isFromUriTarget && !isToUriTarget) {
      // when the file is renamed from a valid file name to a invalid file name
      // ex. a.log > a.txt
      await MetadataEventManager.deleteFileEvent({uri: fromUri});
      // console.log('2');
      return;
    } else if (!isFromUriTarget || !isToUriTarget) {
      // console.log('3');
      return;
    }

    //console.log('4');
    // 1. Get hash from pathToHash
    const fromHash = pathToHash.getHash(fromUri);
    if (fromHash === undefined) {
      //console.log('5');
      return;
    }

    // 2. Update pathToHash
    //console.log('6');
    await pathToHash.delete(fromUri);
    //console.log('7');
    await pathToHash.add(toUri);
    //console.log('8');
    const toHash = pathToHash.getHash(toUri);
    //console.log('9');
    // 3. Get metadata from the old path
    let fromMetaEntry = await Metadata.getEntry(fromUri, fromHash);
    //console.log('10');

    if(!fromMetaEntry){fromMetaEntry={};};
    if (Object.keys(fromMetaEntry).length !== 0) {
      //console.log('11');
      await Metadata.delete(fromUri, fromHash);
      //console.log('12');
      await Metadata.setEntry(toUri, toHash, fromMetaEntry);
      //console.log('13');
    }
    //console.log('14');
    // 4. Move metadata to the new path
    await Metadata.createDefault(toUri, toHash);
    //console.log('15');
  }
}

function isTarget(uri: vscode.Uri) {
  const relPath = vscode.workspace.asRelativePath(uri);
  return isOneExplorerTargetFile(uri) && relPath.split('/').every(p => p !== '.meta');
}