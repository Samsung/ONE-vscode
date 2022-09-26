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

// import * as assert from 'assert';
import * as fs from 'fs';
// import * as path from 'path';
// import {TextEncoder} from 'util';
import * as vscode from 'vscode';

import { Metadata } from './metadataAPI';
import { Balloon } from '../Utils/Balloon';
import { obtainWorkspaceRoot } from '../Utils/Helpers';
import { Logger } from '../Utils/Logger';
import { PathToHash } from './pathToHash';

import * as crypto from 'crypto';
// import {ArtifactAttr} from './ArtifactLocator';
// import {OneStorage} from './OneStorage';


/* istanbul ignore next */
export class MetadataEventManager {
  private fileWatcher = vscode.workspace.createFileSystemWatcher(`**/*`); // glob pattern

  public static didHideExtra: boolean = false;

  public static createUri: vscode.Uri | undefined = undefined;
  public static deleteUri: vscode.Uri | undefined = undefined;

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

    const provider = new MetadataEventManager(workspaceRoot, context.extension.extensionKind);

    // let timerId: NodeJS.Timeout | undefined=undefined;

    // let uri = vscode.Uri.file("/home/pjt01/Workspace/Test_space/a.log") //string to vscode.Uri(type)
    // let path = uri.fsPath; // file:///home/pjt01/Workspace/Test_space/a.log // vscode.Uri(type) to string 
          // provider.fileWatcher.onDidCreate(async uri => {
      //   console.log(uri); provider.refresh('Create'); // test code
      //   // case 1. Contents change event (when uri already in pathToHash)
      //   // case 2. Baseline event (when create file in file system or copy from external source)
      //   // case 3. Rename or Move File (processing like case 1 or ignore)
      //   // case 4. Generate Product from ONE (processing like case 1 or ignore)
      //   if (uri.fsPath.endsWith('a.log')){
      //     let path='a.log';
      //     console.log(1);
      //     let hash=await Metadata.contentHash(path);
      //     console.log(hash);
      //     let content=await Metadata.getMetadata(hash);
      //     console.log(content);
      //     content['b.log']="Test";
      //     await Metadata.setMetadata(hash, content);
      //   }
      // }),
      // vscode.workspace.onDidRenameFiles(uri => {
      //   provider.refresh('Rename'); //test code

      //   if(provider.isValidFile(uri['files'][0]['oldUri'].fsPath) && provider.isValidFile(uri['files'][0]['newUri'].fsPath)){
      //   // case 1. file rename  > command event
      //     console.log('Yes Rename');
      //   }
      //   else if(fs.statSync(uri['files'][0]['newUri'].fsPath).isDirectory()){
      //   // case 2. Directory check > child(pathToHash) updated & command event
      //     console.log('Directory  Rename');
      //   }
      //   else{
      //   // case 3. ignore
      //     console.log('No  Rename');
      //   }
      // }),
    let timerId:NodeJS.Timeout | undefined=undefined;
    let registrations = [
      provider.fileWatcher.onDidChange(async uri => {
        provider.refresh('Change'); // test code
        console.log('onDidChange  '+uri.fsPath);
        if(workspaceRoot){ await provider.changeEvent(workspaceRoot.fsPath, uri.fsPath);}
      }),
      provider.fileWatcher.onDidDelete(async uri => { // To Semi Jeong
        // FIXME: declare PathToHash instance outside of the function (i.e. make instance member variable)
        const instance = await PathToHash.getInstance();
        if (!instance.exists(uri)) return;
        console.log('onDidDelete::', uri); provider.refresh('Delete'); // test code
        const path = uri.path;
        if (MetadataEventManager.createUri) {
          const newUri = MetadataEventManager.createUri;
          // The file/folder is moved/renamed
          if (fs.statSync(newUri.path).isDirectory()) {
            // case 4. [Dir]+Path       | move > search (delete & new)
            await Metadata.moveMetadataUnderFolder(uri, newUri);
          } else {
            // case 3. [File]+Path      | move (delete & new)
            await Metadata.moveMetadata(uri, newUri);
          }
        } else {
          const pathToHash = await PathToHash.getInstance();
          if (!pathToHash.isFile(uri)) {
            // case 2. [Dir]+undefined  | deactive > search
            await Metadata.disableMetadataUnderFolder(uri);
          } else {
            // case 1. [File]+undefined | deactive
            await Metadata.disableMetadata(uri);
          }
        }
      }),
      provider.fileWatcher.onDidCreate(async uri => {
        provider.refresh('Create'); // test code
        console.log('onDidCreate  '+uri.fsPath);
        MetadataEventManager.createUri=uri;
        if(fs.statSync(uri.fsPath).isDirectory()){
          //provider.createDir(); (1) call search > listup files > while [case4]
        }
        else if(provider.isValidFile(uri.fsPath)){
          //if(pathToHash()){await provider.changeEvent(workspaceRoot.fsPath, uri.fsPath  }
          //else{}
        }
        

        //if dir
        // [case 5] > (1) call search > listup files > while [case4]
        //else files
        // validcheck(endswith)
        // pathToHash search [case 1] > (1) call contentHash (2) change pathToHash (3) deactivate hash from pathToHash (4) insert hash from contentHash
        // [case 4] > (1) call contentHash (2) getMetadata (3) compare to path(activate?) > Yes(ignore), No(Setup)
        let temp=await vscode.workspace.findFiles('a.log/**');
        console.log(temp);
        timerId=setTimeout(()=>{MetadataEventManager.createUri=undefined; console.log('test  '+ MetadataEventManager.createUri);},0);
        ////// case 1. [File] Contents change event (refer to pathToHash)
        ////// case 2(ignore). [File] Move contents > Processing in Delete
        ////// case 3(ignore). [Dir]  Move contents > Processing in Delete (reconginition Dir when Dir+File moved)
        // case 4. [File] Copy many files
        // case 5. [Dir]  Copy with files > Serch all the file in the Dir
        // *if already exist, ignore the creation events.
        // *always new path.
        // *
        // case 4. [File] Generate Product from ONE (processing like case 1 or ignore)
      }),
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(private workspaceRoot: vscode.Uri | undefined, private _extensionKind: vscode.ExtensionKind) {
  }

  refresh(message: string): void {
    vscode.window.showInformationMessage(message);
  }

  isValidFile(path: string): boolean{
    let ends=['.pb','.onnx','.tflite','.circle','.cfg','.log'];
    return ends.some((x)=>path.endsWith(x));
  }

  async changeEvent(root: string, path: string): Promise<void> {
    // case 1. [File] Contents change event
    const relativePath = path.split(root+'/')[1];
    const uri = vscode.Uri.file(path);
    console.log(uri);
    console.log(1, relativePath);

    //(1) call contentHas
    const beforehash = await Metadata.getFileHash(uri);
    console.log(2, beforehash);

    // const afterhash=await Metadata.contentHash(path);
    const buffer = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString();
    console.log(3, buffer);
    const afterhash = crypto.createHash('sha256').update(buffer).digest('hex');
    console.log(4, afterhash);

    //(2) deactivate hash frompathToHash
    let metadata = await Metadata.getMetadata(beforehash);
    console.log(5, metadata);
    if(metadata[relativePath]) {  // TODO: change path to filename
        // step 4. If exists, deactivate (set deleted_time) that path.
        // FIXME: Do we need to deactivate it from pathToHash too? > If we deactivate pathToHash, if rename event came, we cannot specify what hash value the path is for.
        metadata[relativePath]["deleted_time"] = new Date();
        console.log(6, metadata);
        // await Metadata.setMetadata(beforehash, metadata);
    }
    metadata = await Metadata.getMetadata(beforehash);
    console.log(7, metadata);

    //(3) change pathToHash
    const instance = await PathToHash.getInstance();
    console.log(instance);
    //instance[relativePath]=afterhash;
    await instance.addPath(uri);
    console.log(8, instance);

    //(4) insert hash from contentHash
    await Metadata.setMetadata(afterhash, {});
    
    console.log(9, await Metadata.getMetadata(afterhash));
    
    const afterMetadata: any = {};
    const filename: any = path.split('/').pop();
    const stats: any = await MetadataEventManager.getStats(afterhash);
    console.log(stats);

    afterMetadata[filename] = {};
    afterMetadata[filename]["name"] = filename.split(".")[0];
    afterMetadata[filename]["file_extension"] = filename.split(".")[1];
    afterMetadata[filename]["create_time"] = stats.birthtime;
    afterMetadata[filename]["modified_time"] = stats.mtime;
    afterMetadata[filename]["deleted_time"] = "삭제 시각(date)";  // TODO: 빈문자열?
    await Metadata.setMetadata(afterhash, afterMetadata);
    
    console.log(11, await Metadata.getMetadata(afterhash));
    //afterMetadata[path]=data;
  }

  public static getStats(hash:any) {
    return new Promise(function (resolve, reject) {
      fs.stat(vscode.Uri.file(obtainWorkspaceRoot()).fsPath + `/.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`, function (err, stats) {
        if (err) {
          return reject(err);
        }
        return resolve(stats);
      });
    });
  }
}