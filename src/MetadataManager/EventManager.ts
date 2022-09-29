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

import { Metadata } from './metadataAPI';
import { Balloon } from '../Utils/Balloon';
import { obtainWorkspaceRoot } from '../Utils/Helpers';
import { Logger } from '../Utils/Logger';
import { PathToHash } from './pathToHash';

import * as crypto from 'crypto';


class EventQueue{
  private inProgress:boolean=false;
  private queue:{method:any, input:{[key: string]:any}}[]=[];

  constructor(){this.queue=[];}
  
  enqueue(method:any, input:{[key: string]: any}):void{
    this.queue.push({
      method:method,
      input:input
    });
    this.autoAction();
  }

  front() {
    return this.queue[0];
  }
  dequeue() {
    this.queue.shift();
  }
  
  clear(){
    this.inProgress=false;
    this.queue=[];
  }

  isEmpty(){
    return this.queue.length===0;
  }
  
  autoAction(){
    if(this.inProgress===false){
      this.inProgress=true;
      this.action();
    }
  }
  
  async action(){
    const result=await this.front().method();
    console.log(result);
    this.dequeue();
    
    if(this.isEmpty()){
      this.clear();
    }
    else {
      this.action();
    }
  }
}

class EventBuffer{
  private Queue=new EventQueue();
  constructor(){}
  public setEvent(request:any, input:{[key: string]:any}){
    this.Queue.enqueue(()=>{return new Promise(resolve=>{request(input).then((res:any) =>resolve(res))})
    },input);
  }
}



/* istanbul ignore next */
export class MetadataEventManager {
  private fileWatcher = vscode.workspace.createFileSystemWatcher(`**/*`); // glob pattern
  private eventBuffer=new EventBuffer();

  public static didHideExtra: boolean = false;

  public static createUri: vscode.Uri | undefined = undefined;

  public static register(context: vscode.ExtensionContext) {
    let workspaceRoot: vscode.Uri | undefined = undefined;

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

    const provider = new MetadataEventManager();

    let registrations = [
      provider.fileWatcher.onDidChange(async uri => {
        // provider.refresh('Change');
        // console.log('onDidChange  '+uri.fsPath);
        if(workspaceRoot){ provider.eventBuffer.setEvent(provider.changeEvent,{"uri":uri});}
      }),

      provider.fileWatcher.onDidDelete(async uri => {
        const instance = await PathToHash.getInstance();
        if (!instance.exists(uri)) {{return;}}

        // console.log('onDidDelete::', uri); provider.refresh('Delete');
        const newUri=MetadataEventManager.createUri;
        if (newUri) {

          MetadataEventManager.createUri=undefined;
          // The file/folder is moved/renamed
          if (fs.statSync(newUri.path).isDirectory()) {
            // case 4. [Dir]+Path       | move > search (delete & new)
            provider.eventBuffer.setEvent(Metadata.moveMetadataUnderFolder,{"fromUri":uri,"toUri":newUri});
          } else {
            // case 3. [File]+Path      | move (delete & new)
            provider.eventBuffer.setEvent(Metadata.moveMetadata,{"oldUri":uri,"newUri":newUri});
          }
        } else {
          const pathToHash = await PathToHash.getInstance();
          if (!pathToHash.isFile(uri)) {
            // case 2. [Dir]+undefined  | deactive > search
            provider.eventBuffer.setEvent(Metadata.disableMetadataUnderFolder,{"uri":uri});
          } else {
            // case 1. [File]+undefined | deactive
            provider.eventBuffer.setEvent(Metadata.disableMetadata,{"uri":uri});
          }
        }
      }),
      provider.fileWatcher.onDidCreate(async uri => {
        // provider.refresh('Create'); // test code
        // console.log('onDidCreate  '+uri.fsPath);
        MetadataEventManager.createUri=uri;       

        const instance= await PathToHash.getInstance();
        if(fs.statSync(uri.fsPath).isDirectory()){
          // case 1. [Dir]  Copy with files > Serch all the file in the Dir
          provider.eventBuffer.setEvent(provider.createDirEvent,{"uri":uri});
        }
        else if(Metadata.isValidFile(uri)){
          if(instance.get(uri)&&workspaceRoot){
            //case 2. [File] Contents change event in Ubuntu terminal (refer to pathToHash)
            provider.eventBuffer.setEvent(provider.changeEvent,{"uri":uri});
          }
          else{
            // case 3. [File] File generation event
            provider.eventBuffer.setEvent(provider.createFileEvent,{"uri":uri});
          }
        }
        provider.eventBuffer.setEvent(provider.resetOldUri,{});
      }),
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }
  async resetOldUri(input:{[key:string]:any}){
    MetadataEventManager.createUri=undefined;
  }

  async changeEvent(input:{[key:string]:any}): Promise<void> {
    const uri=input["uri"];
    if(!Metadata.isValidFile(uri)) {return;}

    // case 1. [File] Contents change event
    const relativePath = vscode.workspace.asRelativePath(uri);

    //(1) get beforehash and set afterhash
    const beforehash: string = await Metadata.getFileHash(uri);
    const buffer = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString();
    const afterhash: string = crypto.createHash('sha256').update(buffer).digest('hex');

    //(2) deactivate changed hash object
    let metadata: any = await Metadata.getMetadata(beforehash);
    if(Object.keys(metadata).length !== 0 && metadata[relativePath]) {
        metadata[relativePath]["isDeleted"] = true;
        await Metadata.setMetadata(beforehash, metadata);
    }

    //(3) change pathToHash
    const instance = await PathToHash.getInstance();
    await instance.addPath(uri);

    metadata = await Metadata.getMetadata(afterhash);

    //(4) create new hash object
    if (Object.keys(metadata).length === 0) {
      await Metadata.setMetadata(afterhash, {});
    }
    
    metadata = await MetadataEventManager.createDefaultMetadata(uri, metadata);

    await Metadata.setMetadata(afterhash, metadata);    
  }

  public static async createDefaultMetadata(uri:vscode.Uri, metadata: any){

    const relativePath = vscode.workspace.asRelativePath(uri);
    const filename: any = relativePath.split('/').pop();
    const stats: any = await MetadataEventManager.getStats(uri);

    metadata[relativePath] = {};
    metadata[relativePath]["name"] = filename;
    metadata[relativePath]["file-extension"] = filename.split(".").at(-1);
    metadata[relativePath]["create-time"] = stats.birthtime;
    metadata[relativePath]["modified-time"] = stats.mtime;
    metadata[relativePath]["is-deleted"] = false;

    return metadata;
  }
  
  public static getStats(uri:vscode.Uri) {
    return new Promise(function (resolve, reject) {
      fs.stat(uri.fsPath, function (err, stats) {
        if (err) {
          return reject(err);
        }
        return resolve(stats);
      });
    });
  }

  async createDirEvent(input:{[key:string]:any}){
    const uri=input["uri"];

    //(1) call search
    let fileList=await vscode.workspace.findFiles('**'+uri.fsPath+'/*.{pb,log,onnx,tflite,circle,cfg}');
    fileList.forEach((uri)=>{
      this.createFileEvent(uri);
    });
  }

  async createFileEvent(input:{[key:string]:any}){
    const uri=input["uri"];

    //(1) refer to getPathToHash
    let relPath=vscode.workspace.asRelativePath(uri);
    const instance=await PathToHash.getInstance();

    //(2) insert PathToHash
    await instance.addPath(uri);
    let newHash=await instance.get(uri);

    //(3) Hash로 getMetadata
    let metadata=await Metadata.getMetadata(newHash);
    
    //(4) Metadata Exist (searching with Hash)? (activate | deactivate) : copy format 
    if(Object.keys(metadata).length !== 0){ // metadata exist
      if(metadata[relPath]){

        if (!metadata[relPath]["is-deleted"]) {return;} // path already activate. ignore this case
        metadata[relPath]["is-deleted"]=false;  // path deactive > activate    
      }
      else{ // for copy format
        const keyList=Object.keys(metadata);
        const keyResult=keyList.filter(key=> !metadata[key]["is-deleted"]); // find activate. or last key of KeyList;

        //data copy
        let data=JSON.parse(JSON.stringify(metadata[keyList[keyList.length-1]]));
        if(keyResult.length){data=JSON.parse(JSON.stringify(metadata[keyResult[0]]));}
        else {data["is-deleted"]=false;}


        //data update
        const stats: any = await MetadataEventManager.getStats(uri);
        data["name"]=uri.fsPath.split('/').pop();
        data["file-extension"]=uri.fsPath.split('.').pop();
        data["created-time"]=stats.birthtime;
        data["modified-time"]=stats.mtime;

        metadata[relPath]=data;
      }
    }
    else{ // metadata doesn't exist : common file        
      const stats: any = await MetadataEventManager.getStats(uri);

      metadata[relPath]={
        "name":uri.fsPath.split('/').pop(),
        "file-extension": uri.fsPath.split('.').pop(),
        "created-time": stats.birthtime,
        "modified-time": stats.mtime,
        "is-deleted": false,
      };
    }
    //(6) Metadata Generation
    await Metadata.setMetadata(newHash,metadata);
    // Todo. [File] Generate Product from ONE (processing like case 1 or ignore)
  }
}