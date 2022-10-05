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
import * as vscode from 'vscode';

import {Disposable} from '../Utils/external/Dispose';

import * as Circle from './circle_schema_generated';
import {CustomInfoMessage, RequestMessage, ResponseFileRequest, ResponseJson, ResponseModel, ResponseModelPath} from './MessageType';

/**
 * Custom Editor Document necessary for vscode extension API
 * This class contains model object as _model variable
 * and manages its state when modification is occured.
 */
export class CircleEditorDocument extends Disposable implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
  private _model: Circle.ModelT;
  private readonly packetSize = 1024 * 1024 * 1024;

  public get uri(): vscode.Uri {
    return this._uri;
  }
  public get model(): Circle.ModelT {
    return this._model;
  }
  public get modelData(): Uint8Array {
    let fbb = new flatbuffers.Builder(1024);
    Circle.Model.finishModelBuffer(fbb, this._model.pack(fbb));
    return fbb.asUint8Array();
  }

  static async create(uri: vscode.Uri):
      Promise<CircleEditorDocument|PromiseLike<CircleEditorDocument>> {
    let bytes = new Uint8Array(await vscode.workspace.fs.readFile(uri));
    return new CircleEditorDocument(uri, bytes);
  }

  private constructor(uri: vscode.Uri, bytes: Uint8Array) {
    super();
    this._uri = uri;
    this._model = this.loadModel(bytes);
  }

  // dispose
  private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());
  public readonly onDidDispose = this._onDidDispose.event;

  // tell to webview
  public readonly _onDidChangeContent = this._register(
      new vscode.EventEmitter<{readonly modelData: Uint8Array;}|ResponseModel|CustomInfoMessage|
                              ResponseModelPath|ResponseFileRequest|ResponseJson>());
  public readonly onDidChangeContent = this._onDidChangeContent.event;

  // tell to vscode
  private readonly _onDidChangeDocument = this._register(new vscode.EventEmitter<{
    readonly label: string,
    undo(): void,
    redo(): void,
  }>());
  public readonly onDidChangeDocument = this._onDidChangeDocument.event;

  dispose(): void {
    this._onDidDispose.fire();
    super.dispose();
  }

  private loadModel(bytes: Uint8Array): Circle.ModelT {
    let buf = new flatbuffers.ByteBuffer(bytes);
    return Circle.Model.getRootAsModel(buf).unpack();
  }

  /**
   * execute appropriate edit feature and calls notifyEdit function
   */
  makeEdit(message: RequestMessage) {
    const oldModelData = this.modelData;
    switch (message.type) {
      case 'attribute':
        // TODO: implement functions to edit attributes of operator in model
        break;
      case 'tensor':
        // TODO: implement functions to edit tensors in model
        break;
      default:
        return;
    }
    const newModelData = this.modelData;
    this.notifyEdit(oldModelData, newModelData);
  }

  /**
   * calls sendModel function so that webviews can be aware of current model data
   * records old and new model for undo and redo features
   */
  notifyEdit(oldModelData: Uint8Array, newModelData: Uint8Array) {
    this.sendModel();

    this._onDidChangeDocument.fire({
      label: 'Model',
      undo: async () => {
        this._model = this.loadModel(oldModelData);
        this.sendModel();
      },
      redo: async () => {
        this._model = this.loadModel(newModelData);
        this.sendModel();
      }
    });
  }

  /**
   * send current model data to webviews with declared packetsize
   */
  sendModel(offset: number = 0) {
    if (offset > this.modelData.length - 1) {
      return;
    }

    let responseModelPath:
        ResponseModelPath = {command: 'loadmodel', type: 'modelpath', value: this._uri.fsPath};
    this._onDidChangeContent.fire(responseModelPath);

    let responseArray = this.modelData.slice(offset, offset + this.packetSize);

    let responseModel: ResponseModel = {
      command: 'loadmodel',
      type: 'uint8array',
      offset: offset,
      length: responseArray.length,
      total: this.modelData.length,
      responseArray: responseArray
    };

    this._onDidChangeContent.fire(responseModel);
  }

  /**
   * Called by VS Code when the user saves the document.
   */
  async save(cancellation: vscode.CancellationToken): Promise<void> {
    await this.saveAs(this.uri, cancellation);
  }

  /**
   * Called by VS Code when the user saves the document to a new location.
   */
  async saveAs(targetResource: vscode.Uri, cancellation: vscode.CancellationToken): Promise<void> {
    if (cancellation.isCancellationRequested) {
      return;
    }
    await vscode.workspace.fs.writeFile(targetResource, this.modelData);
  }

  /**
   * Called by VS Code when the user calls `revert` on a document.
   */
  async revert(_cancellation: vscode.CancellationToken): Promise<void> {
    const oldModelData = this.modelData;
    const newModelData = await vscode.workspace.fs.readFile(this.uri);
    this._model = this.loadModel(newModelData);
    this.notifyEdit(oldModelData, newModelData);
  }

  /**
   * Called by VS Code to backup the edited document.
   * These backups are used to implement hot exit.
   */
  async backup(destination: vscode.Uri, cancellation: vscode.CancellationToken):
      Promise<vscode.CustomDocumentBackup> {
    await this.saveAs(destination, cancellation);

    return {
      id: destination.toString(),
      delete: async () => {
        try {
          await vscode.workspace.fs.delete(destination);
        } catch {
          // noop
        }
      }
    };
  }
}
