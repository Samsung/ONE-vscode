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
/*
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*
Some part of this code refers to
https://github.com/microsoft/vscode-extension-samples/blob/2556c82cb333cf65d372bd01ac30c35ea1898a0e/custom-editor-sample/src/catScratchEditor.ts
*/

import * as vscode from 'vscode';
import { Node } from '../OneExplorer/OneExplorer';
import { RelationViewer } from './RelationViewer';


export class RelationViewerDocument implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
  private _metadataViwer: RelationViewer[];
  

  static async create(uri: vscode.Uri):
      Promise<RelationViewerDocument|PromiseLike<RelationViewerDocument>> {
    return new RelationViewerDocument(uri);
  }

  private constructor(uri: vscode.Uri) {
    this._uri = uri;
    this._metadataViwer = [];
    
  }

  public get uri() {
    return this._uri;
  }

  // CustomDocument implements
  dispose(): void {
    // NOTE panel is closed before document and this is just for safety
    this._metadataViwer.forEach((view) => {
      while (this._metadataViwer.length) {
        view.disposeMetadataView();
      }
    });
    this._metadataViwer = [];
  }

  public openView(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, fileUri:vscode.Uri) {
    let view = new RelationViewer(panel,extensionUri);

    view.initRelationViewer();
    view.loadContent();
    this._metadataViwer.push(view);
    
    //relationData를 가져오는 함수
    let payload:any;

    // relation 데이터를 웹뷰로 메세지를 보낸다.
    payload = getRelationData(fileUri);
    panel.webview.postMessage(
      {type:'create',payload: payload,fileUri: fileUri}
    );
    

    panel.onDidDispose(() => {
      // TODO make faster
      this._metadataViwer.forEach((view, index) => {
        if (view.owner(panel)) {
          view.disposeMetadataView();
          this._metadataViwer.splice(index, 1);
        }
      });
    });

    return view;
  }
}

export class RelationViewerProvider implements
    vscode.CustomReadonlyEditorProvider<RelationViewerDocument> {
  public static readonly viewType = 'one.viewer.relation';

  private _context: vscode.ExtensionContext;

  public static register(context: vscode.ExtensionContext): void {
    const provider = new RelationViewerProvider(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(RelationViewerProvider.viewType, provider, {
        webviewOptions: {
          retainContextWhenHidden: true,
        }
      }),
      vscode.commands.registerCommand('one.relation.showRelationViewer', async (uri) => {
        //만약 원에서 메서드를 실행했을 경우 uri를 변경해준다.
        let fileUri = uri;
        if(uri instanceof Node){
          fileUri = uri.uri;
        }
        vscode.commands.executeCommand('vscode.openWith', fileUri, RelationViewerProvider.viewType);
      })
      // Add command registration here
    ];

    // show relation 보여줄 파일 확장자
    vscode.commands.executeCommand('setContext', 'relation.supportedFiles', [
      '.tflite',
      '.pb',
      '.onnx',
      '.circle',
      '.log'  // log 파일 제외할지 결정
    ]);

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(private readonly context: vscode.ExtensionContext) {
    this._context = context;
  }

  // CustomReadonlyEditorProvider implements
  async openCustomDocument(
      uri: vscode.Uri, openContext: {backupId?: string},
      _token: vscode.CancellationToken): Promise<RelationViewerDocument> {
    const document: RelationViewerDocument = await RelationViewerDocument.create(uri);
    // NOTE as a readonly viewer, there is not much to do

    // TODO handle dispose
    // TODO handle file change events
    // TODO handle backup

    return document;
  }

  // CustomReadonlyEditorProvider implements
  async resolveCustomEditor(
      document: RelationViewerDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    document.openView(webviewPanel, this._context.extensionUri, document.uri);
  }
}

export function getRelationData(path:any) {
  return {
    "selected": "1",
    "relationData": [
      {"id": "1", "parent": "", "idx": 0, "dataList": [{"name": "a.tflite", "path": "./a.tflite"}]},  // TODO: id, parentid: hashId
      {"id": "2", "parent": "1", "idx": 0, "dataList": [{"name": "b.circle", "path": "./b.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "3", "parent": "1", "idx": 0, "dataList": [{"name": "c.circle", "path": "./c.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "4", "parent": "2", "idx": 0, "dataList": [{"name": "b1.circle", "path": "./b1.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "5", "parent": "2", "idx": 0, "dataList": [{"name": "b2.circle", "path": "./b2.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "6", "parent": "2", "idx": 0, "dataList": [{"name": "b3.circle", "path": "./b3.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "7", "parent": "2", "idx": 0, "dataList": [{"name": "b4.circle", "path": "./b4.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "8", "parent": "2", "idx": 0, "dataList": [{"name": "b5.circle", "path": "./b5.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "9", "parent": "3", "idx": 0, "dataList": [{"name": "d.circle", "path": "./d.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "10", "parent": "9", "idx": 0, "dataList": [{"name": "e.circle", "path": "./e.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "11", "parent": "10", "idx": 0, "dataList": [{"name": "e1.circle", "path": "./e1.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "12", "parent": "10", "idx": 0, "dataList": [{"name": "e2.circle", "path": "./e2.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]}
    ]
  };
}