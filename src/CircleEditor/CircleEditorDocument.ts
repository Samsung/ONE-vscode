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

import {Balloon} from '../Utils/Balloon';
import {Disposable} from '../Utils/external/Dispose';

import * as Circle from './circle_schema_generated';
import * as Types from './CircleType';

/**
 * Make BigInt data to string type.
 * This is called by JSON.stringify function.
 */
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

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
  public readonly _onDidChangeContent = this._register(new vscode.EventEmitter<any>());
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
  makeEdit(message: any) {
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

    let responseModelPath = {command: 'loadmodel', type: 'modelpath', value: this._uri.fsPath};
    this._onDidChangeContent.fire(responseModelPath);

    let responseArray = this.modelData.slice(offset, offset + this.packetSize);

    let responseModel = {
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

  /**
   * edit _model state when user modified model through json editor
   */
  editJsonModel(newModelString: string) {
    const oldModelData = this.modelData;
    try {
      let newModel = JSON.parse(newModelString);

      // Copying model from message to _model starts from here.
      // This is required as parsed json object do not have any prototypes necessary for
      // Circle.ModelT object.

      // version
      this._model.version = newModel.version;

      // operatorCodes
      this._model.operatorCodes = newModel.operatorCodes.map((data: Circle.OperatorCodeT) => {
        return Object.setPrototypeOf(data, Circle.OperatorCodeT.prototype);
      });

      // subgraphs
      this._model.subgraphs = newModel.subgraphs.map((data: Circle.SubGraphT) => {
        // tensors
        data.tensors = data.tensors.map((tensor: Circle.TensorT) => {
          if (tensor.quantization) {
            if (tensor.quantization.details) {
              tensor.quantization.details = Object.setPrototypeOf(tensor.quantization?.details, Circle.CustomQuantizationT.prototype);
            }
            tensor.quantization.zeroPoint = tensor.quantization.zeroPoint.map(value => {
              return BigInt(value);
            });
            tensor.quantization = Object.setPrototypeOf(
                tensor.quantization, Circle.QuantizationParametersT.prototype);
          }
          // sparsity parameters
          if (tensor.sparsity) {
            if (tensor.sparsity.dimMetadata) {
              tensor.sparsity.dimMetadata =
                  tensor.sparsity.dimMetadata.map((dimMeta: Circle.DimensionMetadataT) => {
                    if (dimMeta.arraySegmentsType && dimMeta.arraySegments) {
                      const sparseVectorClass = Object.entries(Types.SparseVector).find(element => {
                        return dimMeta.arraySegmentsType === parseInt(element[0]);
                      });
                      if (sparseVectorClass && sparseVectorClass[1]) {
                        dimMeta.arraySegments = Object.setPrototypeOf(
                            dimMeta.arraySegments, sparseVectorClass[1].prototype);
                      }
                    } else {
                      dimMeta.arraySegments = null;
                    }
                    if (dimMeta.arrayIndicesType && dimMeta.arrayIndices) {
                      const sparseVectorClass = Object.entries(Types.SparseVector).find(element => {
                        return dimMeta.arrayIndicesType === parseInt(element[0]);
                      });
                      if (sparseVectorClass && sparseVectorClass[1]) {
                        dimMeta.arrayIndices = Object.setPrototypeOf(
                            dimMeta.arrayIndices, sparseVectorClass[1].prototype);
                      }
                    } else {
                      dimMeta.arrayIndices = null;
                    }
                    return Object.setPrototypeOf(dimMeta, Circle.DimensionMetadataT.prototype);
                  });  // end map dimMeta

              if (!tensor.sparsity.traversalOrder || !tensor.sparsity.traversalOrder.length) {
                tensor.sparsity.traversalOrder = [];
              }
              if (!tensor.sparsity.blockMap || !tensor.sparsity.blockMap.length) {
                tensor.sparsity.blockMap = [];
              }
              Object.setPrototypeOf(
                  tensor.sparsity.dimMetadata, Circle.DimensionMetadataT.prototype);
            }  // end if tensor.sparsity.dimMetadata

            tensor.sparsity =
                Object.setPrototypeOf(tensor.sparsity, Circle.SparsityParametersT.prototype);
          }  // end if tensor.sparsity

          return Object.setPrototypeOf(tensor, Circle.TensorT.prototype);
        });

        // operators
        data.operators = data.operators.map((operator: Circle.OperatorT) => {
          if (this._model.operatorCodes[operator.opcodeIndex].deprecatedBuiltinCode === 32) {
            // case1 : custom operator
            if (operator.builtinOptionsType || operator.builtinOptions) {
              throw new Error;
            }
          } else {
            // case2 : builtin operator
            const optionsClass = Object.entries(Types.NumberToBuiltinOptions).find(element => {
              return operator.builtinOptionsType === parseInt(element[0]);
            });
            if (optionsClass && optionsClass[1] && operator.builtinOptions) {
              let tmpBuiltinOptions = new optionsClass[1];
              Object.keys(operator.builtinOptions).forEach((element) => {
                if (!(element in tmpBuiltinOptions)) {
                  throw new Error;
                }
              });
              Object.keys(tmpBuiltinOptions).forEach((element) => {
                if (operator.builtinOptions && !(element in operator.builtinOptions)) {
                  throw new Error;
                }
              });
              operator.builtinOptions = Object.setPrototypeOf(
                  operator.builtinOptions === null ? {} : operator.builtinOptions,
                  optionsClass[1].prototype);
            } else {
              operator.builtinOptions = null;
            }
          }
          return Object.setPrototypeOf(operator, Circle.OperatorT.prototype);
        });  // end map operators
        return Object.setPrototypeOf(data, Circle.SubGraphT.prototype);
      });  // end map subgraphs

      // description
      this._model.description = newModel.description;

      // buffers
      this._model.buffers = newModel.buffers.map((data: Circle.BufferT) => {
        return Object.setPrototypeOf(data, Circle.BufferT.prototype);
      });

      // metadataBuffer
      this._model.metadataBuffer = newModel.metadataBuffer;

      // metadata
      this._model.metadata = newModel.metadata.map((data: Circle.MetadataT) => {
        return Object.setPrototypeOf(data, Circle.MetadataT.prototype);
      });

      // signatureDefs
      this._model.signatureDefs = newModel.signatureDefs.map((data: Circle.SignatureDefT) => {
        data.inputs = data.inputs.map((tensor: Circle.TensorMapT) => {
          return Object.setPrototypeOf(tensor, Circle.TensorMapT.prototype);
        });
        data.outputs = data.outputs.map((tensor: Circle.TensorMapT) => {
          return Object.setPrototypeOf(tensor, Circle.TensorMapT.prototype);
        });
        return Object.setPrototypeOf(data, Circle.SignatureDefT.prototype);
      });
      // end copying json to model object

      const newModelData = this.modelData;
      this.notifyEdit(oldModelData, newModelData);

    } catch (e) {
      this._model = this.loadModel(oldModelData);
      Balloon.error('invalid model', false);
    }
  }

  /**
   * Send model of JSON format to webview.
   * TODO: Implement feature to load json with multiple times as this does not work when size of
   * JSON is too large.
   */
  loadJson() {
    let jsonModel = JSON.stringify(this._model, null, 2);
    const numberArrayStrings = jsonModel.match(/\[[0-9,\s]*\]/gi);
    if (numberArrayStrings) {
      numberArrayStrings.forEach(text => {
        let replaced = text.replace(/,\s*/gi, ', ').replace(/\[\s*/gi, '[').replace(/\s*\]/gi, ']');
        jsonModel = jsonModel.replace(text, replaced);
      });
    }
    let responseJson = {command: 'loadJson', data: jsonModel};
    this._onDidChangeContent.fire(responseJson);
  }
}
