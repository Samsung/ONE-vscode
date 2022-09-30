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
import * as vscode from 'vscode';

import {Balloon} from '../Utils/Balloon';
import {obtainWorkspaceRoot} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

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
      return new Promise(() => {
        if (Object.keys(input).length === 0) {
          request();
        } else {
          request(input);
        }
      });
    }, input);
  }
}


/* istanbul ignore next */
export class MetadataEventManager {
  private fileWatcher = vscode.workspace.createFileSystemWatcher(`**/*`);  // glob pattern
  private eventBuffer = new MetadataEventBuffer();

    /**
   * Communicates among events
   * didCreateUri : communicates created file uri to delete event when file is renamed/moved.
   */
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
        manager.eventBuffer.setEvent(manager.changeFileEvent, {'uri': uri});
      }),
      manager.fileWatcher.onDidDelete(async () => {
        //TO BE IMPLEMENTED.
      }),
      manager.fileWatcher.onDidCreate(async () => {
        //TO BE IMPLEMENTED.
      }),
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable)); 
    //TO BE DONE.
  }

  async resetDidCreateUri() {
    //TO BE IMPLEMENTED.
  }

  async changeFileEvent(_input: {[key: string]: any}): Promise<void> {
    //TO BE IMPLEMENTED
  }

  async createDirEvent(_input: {[key: string]: any}) {
    //TO BE IMPLEMENTED
  }

  async createFileEvent(_input: {[key: string]: any}) {
    //TO BE IMPLEMENTED
  }

  async deleteDirEvent(_input: {[key: string]: any}){
    //TO BE IMPLEMENTED
  }

  async deleteFileEvent(_input: {[key: string]: any}){
    //TO BE IMPLEMENTED
  }
  async moveDirEvent(_input: {[key: string]: any}){
    //TO BE IMPLEMENTED   
  }
  async moveFileEvent(_input: {[key: string]: any}){
    //TO BE IMPLEMENTED   
  }
}
