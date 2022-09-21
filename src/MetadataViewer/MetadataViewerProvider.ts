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
import { MetadataViewer } from './MetadataViewer';


export class RelationViewerDocument implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
  private _metadataViwer: MetadataViewer[];
  

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
    let view = new MetadataViewer(panel,extensionUri);

    view.initMetadataInfo();
    view.loadContent();
    this._metadataViwer.push(view);

    //메타데이터 정보를 가져오는 로직(Uri 인자를 이용하면 됨)
    const seletedMetadata = getMetadata();

    //패널 타이틀 변경(적용되지 않음)
    panel.title = `Metadata: ${this._getNameFromPath(fileUri.toString())}`;
    
    //가져온 메타데이터를 웹뷰로 메세지를 보낸다.
    panel.webview.postMessage({command:'showMetadata',metadata: seletedMetadata});
    
    

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

  private _getNameFromPath(path: string) {
    let idx = path.lastIndexOf("/");
    if (idx === undefined) {
      idx = -1;
    }
    return path.substring(idx + 1);
  }
}

export class MetadataViewerProvider implements
    vscode.CustomReadonlyEditorProvider<RelationViewerDocument> {
  public static readonly viewType = 'one.viewer.metadata';

  private _context: vscode.ExtensionContext;

  public static register(context: vscode.ExtensionContext): void {
    const provider = new MetadataViewerProvider(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(MetadataViewerProvider.viewType, provider, {
        webviewOptions: {
          retainContextWhenHidden: true,
        }
      }),
      vscode.commands.registerCommand('one.metadata.showMetadataViewer', async (uri) => {
        //만약 원에서 메서드를 실행했을 경우 uri를 변경해준다.
        let fileUri = uri;
        if(uri instanceof Node){
          fileUri = uri.uri;
        }
        vscode.commands.executeCommand('vscode.openWith', fileUri, MetadataViewerProvider.viewType);
      })
      // Add command registration here
    ];

    // show metadata 보여줄 파일 확장자
    vscode.commands.executeCommand('setContext', 'metadata.supportedFiles', [
      '.tflite',
      '.pb',
      '.onnx',
      '.circle',
      '.log'
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

function getMetadata() {
  return {
    "./test.log": {
      "file_extension": "log",
      "created_time": new Date().toLocaleString(),
      "modified_time": new Date().toLocaleString(),
      "deleted_time": null,

      "toolchain_version": "toolchain v1.3.0",
      "onecc_version": "1.20.0",
      "operations": {
        "op_total": 50,
        "ops": {
          "conv2d": 1,
          "relu": 1,
          'conv':3,
          'spp':1,
        }
      },
      "cfg_settings": {
        "onecc": {
          "one-import-tf": true,
          "one-import-tflite": false,
          "one-import-onnx": false,
          "one-quantize":true
        },
        "one-import-tf": {
          "converter_version": "v2",
          "input_array": "a",
          "output_array": "a",
          "input_shapes": "1,299,299"
        },
        "one-quantize":{
          "quantized_dtype":'int16',
          "input_data_format":'list',
          "min_percentile":'11',
          "max_percentile":'100',
          "mode":'movingAvg',
        }
      }
    }
  };
}