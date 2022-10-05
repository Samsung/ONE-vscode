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
import * as Types from './CircleType';
import { Balloon } from '../Utils/Balloon';
import * as flexbuffers from 'flatbuffers/js/flexbuffers';

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
        this.editAttribute(message.data);
        break;
      case 'tensor':
        this.editTensor(message.data);
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
   editJsonModel(message: any) {
    const oldModelData = this.modelData;
    try{
      let newModel = JSON.parse(message.data);

	  //copying model from message to _model starts from here
      //this is required as parsed json object do not have any prototypes necessary for Circle.ModelT object
      // version
      this._model.version = newModel.version;

      // operatoreCodes
      this._model.operatorCodes = newModel.operatorCodes.map((data: Circle.OperatorCodeT) => {
        return Object.setPrototypeOf(data, Circle.OperatorCodeT.prototype);
      });

      // subgraphs
      this._model.subgraphs = newModel.subgraphs.map((data: Circle.SubGraphT) => {
        //tensors
        data.tensors = data.tensors.map((tensor: Circle.TensorT) => {
          if (tensor.quantization) {
            if (tensor.quantization.details) {
              tensor.quantization.details = Object.setPrototypeOf(tensor.quantization?.details, Circle.CustomQuantizationT.prototype);
						}
						tensor.quantization.zeroPoint = tensor.quantization.zeroPoint.map(value => {
							return BigInt(value);
						});
            tensor.quantization = Object.setPrototypeOf(tensor.quantization, Circle.QuantizationParametersT.prototype);
          }
          //sparsity parameters
          if(tensor.sparsity) {
            if(tensor.sparsity.dimMetadata){
              tensor.sparsity.dimMetadata = tensor.sparsity.dimMetadata.map((dimMeta: Circle.DimensionMetadataT)=>{
                if(dimMeta.arraySegmentsType && dimMeta.arraySegments){
                  const sparseVectorClass = Object.entries(Types.SparseVector).find(element => {
                    return dimMeta.arraySegmentsType === parseInt(element[0]);
                  });
                  if (sparseVectorClass && sparseVectorClass[1]) {
                    dimMeta.arraySegments = Object.setPrototypeOf(dimMeta.arraySegments === null ? {} : dimMeta.arraySegments, sparseVectorClass[1].prototype);
                  }
								} else {
									dimMeta.arraySegments = null;
								}
                if(dimMeta.arrayIndicesType && dimMeta.arrayIndices){
                  const sparseVectorClass = Object.entries(Types.SparseVector).find(element => {
                    return dimMeta.arrayIndicesType === parseInt(element[0]);
                  });
                  if (sparseVectorClass && sparseVectorClass[1]) {
                    dimMeta.arrayIndices = Object.setPrototypeOf(dimMeta.arrayIndices === null ? {} : dimMeta.arrayIndices, sparseVectorClass[1].prototype);
                  }
								} else {
									dimMeta.arrayIndices = null; 
								}
                return Object.setPrototypeOf(dimMeta, Circle.DimensionMetadataT.prototype);
              });//end map dimMeta

							if (!tensor.sparsity.traversalOrder || !tensor.sparsity.traversalOrder.length) {
								tensor.sparsity.traversalOrder = [];
							}
							if (!tensor.sparsity.blockMap || !tensor.sparsity.blockMap.length) {
								tensor.sparsity.blockMap = [];
							}
              Object.setPrototypeOf(tensor.sparsity.dimMetadata,Circle.DimensionMetadataT.prototype);
            }//end if tensor.sparsity.dimMetadata

            tensor.sparsity = Object.setPrototypeOf(tensor.sparsity, Circle.SparsityParametersT.prototype);
          }//end if tensor.sparsity

          return Object.setPrototypeOf(tensor, Circle.TensorT.prototype);
        });

        //operators
        data.operators = data.operators.map((operator: Circle.OperatorT) => {
          //case1 : custom operator
          if(this._model.operatorCodes[operator.opcodeIndex].deprecatedBuiltinCode===32){
            if(operator.builtinOptionsType || operator.builtinOptions){
              throw new Error("Custom operator does not need builtin options");
            }
          //case2 : builtin operator
          }else{
            const optionsClass = Object.entries(Types.NumberToBuiltinOptions).find(element => {
              return operator.builtinOptionsType === parseInt(element[0]);
            });
            if (optionsClass && optionsClass[1] && operator.builtinOptions) {
              let tmpBuiltinOptions = new optionsClass[1];
              Object.keys(operator.builtinOptions).forEach((element) => {
                if(!(element in tmpBuiltinOptions)){
                  throw new Error("Input does not match with declared builtinOptions.");
                }
              });
              Object.keys(tmpBuiltinOptions).forEach((element) => {
                if(operator.builtinOptions && !(element in operator.builtinOptions)){
                  throw new Error("Input does not match with declared builtinOptions.");
                }
              });
              operator.builtinOptions = Object.setPrototypeOf(operator.builtinOptions === null ? {} : operator.builtinOptions, optionsClass[1].prototype);
            } else {
              operator.builtinOptions = null;
            }
          }
          return Object.setPrototypeOf(operator, Circle.OperatorT.prototype);
        });//end map operators
        return Object.setPrototypeOf(data, Circle.SubGraphT.prototype);
      });//end map subgraphs

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
      //end copying json to model object

      const newModelData = this.modelData;
      this.notifyEdit(oldModelData, newModelData);

    } catch (e) {
		  this._model = this.loadModel(oldModelData);
		  Balloon.error('invalid model', false);
    }
  }

  
  loadJson(){
    let jsonModel = JSON.stringify(this._model, null,2);
    jsonModel.match(/\[[0-9,\s]*\]/gi)?.forEach(text => {
      let replaced = text.replace(/,\s*/gi, ", ").replace(/\[\s*/gi, "[").replace(/\s*\]/gi, "]");
      jsonModel = jsonModel.replace(text, replaced);
    });
    let responseJson = {
      command: 'loadJson',
      data: jsonModel
    };
    this._onDidChangeContent.fire(responseJson);
  }	

  private guessExactType(n : any){
    if(Number(n) % 1 === 0){
      return "int";
    }
    else if(Number(n) % 1 !== 0){
      return "float";
    }
  }

  public sendEncodingData(message : any){
	let fbb = flexbuffers.builder();
	fbb.startMap();
	for(const key in message.data){
		fbb.addKey(key);
		const val = message.data[key][0];
		const valType = message.data[key][1];
		if(valType === "boolean"){
			if(val === "true" || val === true){
				fbb.add(true);
			}
			else if(val === "false" || val === false){
				fbb.add(false);
			}
			else{ 
				Balloon.error("'boolean' type must be 'true' or 'false'.", false);
				return;
			} // true, false 오타 에러처리
		}
		else if(valType === "int"){
			if(this.guessExactType(val) === 'float') {
				Balloon.error("'int' type doesn't include decimal point.", false);
				return;
			} // 소수점 들어간거 에러처리
			fbb.addInt(Number(val));
		}
		else{
			fbb.add(String(val));
		}
	}
	fbb.end();
	const res = fbb.finish();
	// ArrayBuffer -> Buffer -> Array 후 넣어줘야함.
	const buf = Buffer.alloc(res.byteLength);
	const view = new Uint8Array(res);
	for (let i = 0; i < buf.length; ++i) {
			buf[i] = view[i];
	}
	const data = Array.from(buf);
	let responseData = {
		command: 'responseEncodingData',
		data: data
	};
	this._onDidChangeContent.fire(responseData);
  }

  public sendCustomType(message : any){
		const msgData : any = message.data;
		const subgraphIdx : number = msgData._subgraphIdx;
		const operatorIdx : number = msgData._nodeIdx;
		const target = this._model.subgraphs[subgraphIdx].operators[operatorIdx].customOptions;
		// Array to Buffer
		const buffer = Buffer.from(target);
		// Buffer to ArrayBuffer
		const ab = new ArrayBuffer(buffer.length);
				const view = new Uint8Array(ab);
				for (let i = 0; i < buffer.length; ++i) {
						view[i] = buffer[i];
				}
		// decodding flexbuffer
		const customObj : any = flexbuffers.toObject(ab);	
		// 보내줄 형태로 다시 재저장
		let resData : any = new Object;
		resData._subgraphIdx = subgraphIdx;
		resData._nodeIdx = operatorIdx;
		resData._type = new Object;
		// 타입 파악
		for (const key in customObj){
			let customObjDataType : any = typeof(customObj[key]);
			if(customObjDataType === 'number'){
				customObjDataType = this.guessExactType(customObj[key]);
			}
			resData._type[key] = customObjDataType;
		}
		let responseData = {
			command: 'customType',
			data: resData
		};

		this._onDidChangeContent.fire(responseData);
		return;
	}


  private editTensor(data : any){
		let name;
		let subgraphIdx : number = 0 ;
		let argname : string;
		let tensorIdx : number;
		let isVariable : boolean= false;
		let tensorType;
		let tensorShape;
		let bufferData : any = null;
		name = data?._name;
		subgraphIdx = Number(data._subgraphIdx);
		if(name === undefined || name === undefined) {
			Balloon.error("input data is undefined", false);
			return;
		}
		const argument = data._arguments;
		argname = argument._name;
		tensorIdx = Number(argument._location);
		const isChanged : boolean = argument._isChanged;
		tensorType = argument._type._dataType;
		tensorShape = argument._type._shape._dimensions;
		if(name === undefined || name === undefined || name === undefined || name === undefined) {
			Balloon.error("input data is undefined", false);
			return;
		}
		if(argument._initializer !== null){
			const ini = argument._initializer;
			if(isChanged === true){
				bufferData = ini._data;
			}
			isVariable = ini._is_variable;
		}
		//enum화 시키기 위해서 대문자화 시켜야한다.
		tensorType = tensorType.toUpperCase();

		// 정보 갱신
		const targetTensor = this._model?.subgraphs[subgraphIdx]?.tensors[tensorIdx];
		if(targetTensor === undefined) {
			Balloon.error("model is undefined", false);
			return;
		}
		targetTensor.name = argname;
		//type은 enum참조   
		if(tensorType === 'BOOLEAN'){
			tensorType = 'BOOL';
		}
		let tensorTypeNum : any = Circle.TensorType[tensorType];
		targetTensor.type = tensorTypeNum;
		targetTensor.shape = tensorShape;
		if(bufferData !== null){
			// 버퍼 크기와 shape 크기가 다르면 에러 메시지를 보내주면 된다.
			const editBufferIdx : number = targetTensor.buffer;
			this._model.buffers[editBufferIdx].data = bufferData;
		}
		return;
  }

	private editAttribute(data:any){
		let subgraphIdx : number = Number(data._subgraphIdx);
		let operatorIdx : number = Number(data._nodeIdx);
		let inputTypeName : string = data.name;
		if(inputTypeName === undefined || subgraphIdx === undefined || operatorIdx === undefined){
			Balloon.error("input data is undefined", false);
			return;
		}
		inputTypeName = inputTypeName.toUpperCase();
		let inputTypeOptionName : any = inputTypeName + "OPTIONS";
		// for문으로 BuiltinOperator enum key 파싱 및 enum val 찾기
		let operatorCode : number = 0;
		for(let i = -4; i <= 146; i++){
			let builtinOperatorKey = Circle.BuiltinOperator[i];
			if(builtinOperatorKey === undefined) {continue;}
			let tempKey : any = Circle.BuiltinOperator[i];
			while(1){
				const tempKey2 =  tempKey.replace('_','');
				if(tempKey.length === tempKey2.length) {break;}
				tempKey = tempKey2;
			}
			builtinOperatorKey = tempKey;
			builtinOperatorKey = builtinOperatorKey.toUpperCase();
			if(builtinOperatorKey === inputTypeName){
			// enum_val을 찾았으면 입력
			operatorCode = i;
			break;
			}
		}
		const operator : any = this._model.subgraphs[subgraphIdx].operators[operatorIdx];
		if(operator === undefined){
			Balloon.error("model is undefined", false);
			return;
		}
		// builtin Case
		// builtinOptionsType 수정
		if(operatorCode !== 32){ // builtinOptions
			if(operator.builtinOptions === null) {
				Balloon.error("built-in Options is null", false);
				return;
			}
			if(inputTypeOptionName.indexOf("POOL2D") !== -1){
				inputTypeOptionName = "POOL2DOPTIONS";
			}
			operator.builtinOptionsType = Types.BuiltinOptionsType[inputTypeOptionName];
			const key = data._attribute.name;
			const value : any = data._attribute._value;
			const type : any = data._attribute._type;
			// 해당 타입에 접근해서 enum 값을 뽑아와야한다.
			
			// 현재는 type변경 없다고 생각하고 구현
			let targetKey : any = null;
			for(const obj in operator.builtinOptions){
				let compKey : any = key;
				while(1){
					const compKey2 =  compKey.replace('_','');
					if(compKey.length === compKey2.length) {break;}
					compKey = compKey2;
				}
				if(obj.toUpperCase() === compKey.toUpperCase()){
					targetKey = obj;
				}
			}

			const circleTypeArr = Object.keys(Types.CircleType);
			if(circleTypeArr.find(element => element === type ) !== undefined){
				// Circle Type 참조
				operator.builtinOptions[targetKey] = Types.CircleType[type][value];
			}
			else{
				// 보여주는 타입을 그대로 띄워줌
				if(type.includes('[]')){
					let editValue = value;
					// 맨 뒤 콤마 알아서 빼주는 로직
					let lastCommaIdx=value.lastIndexOf(',');
					let lastNumberIdx : number = value.length-1;
					for(let i = value.length-1; i>=0; i--){
						if(value[i] >= '0' && value[i] <= '9'){
							lastNumberIdx = i;
							break;
						}
					}
					if(lastCommaIdx > lastNumberIdx){
						editValue = value.slice(0,lastCommaIdx);
					}
					const valArr = editValue.split(',');
					const valNumArr = [];
					for(let i =0; i<valArr.length; i++){
						// 콤마가 여러번 들어가서 숫자가 입력되지 않은 경우의 로직
						if(valArr[i].search('0') === -1 && valArr[i].indexOf('1') === -1 && valArr[i].search('2') === -1 && valArr[i].search('3') === -1 && 
						valArr[i].search('4') === -1 && valArr[i].search('5') === -1 && valArr[i].search('6') === -1 && valArr[i].search('7') === -1 &&
						valArr[i].search('8') === -1 && valArr[i].search('9') === -1) {
							Balloon.error('Check your input array! you typed double comma (\',,\') or you didn\'t typed number', false);
							return;
						}
						else if(isNaN(Number(valArr[i]))){
							Balloon.error('Check your input array! you didn\'t typed number', false);
							return;
						}
						valNumArr.push(Number(valArr[i]));
					}
					const resArr = new Types.NormalType[type](valNumArr);
					operator.builtinOptions[targetKey] = resArr;
				}
				else if(type === 'boolean'){
					if(value === 'false'){
						operator.builtinOptions[targetKey] = false;
					}
					else if(value === 'true'){
						operator.builtinOptions[targetKey] = true;
					}
					else{
						Balloon.error('"boolean" type must be "true" or "false".', false);
						return;
					}
				}
				else if(type === "float16" || type === "float32" || type === "float64" || type === "float" || type === "epsilon"){
					operator.builtinOptions[targetKey] = parseFloat(value);
				}
				else{
					operator.builtinOptions[targetKey] = Types.NormalType[type](value);
				}
			}
		}
		// Custom인 경우
		// 커스텀인 경우 문자열로 받아온다.
		
		else if(operatorCode === 32){
			operator.builtinOptionsType = 0;
			operator.builtinOPtions = null;
			const customName = data._attribute.name;
			const customKeyArray = data._attribute.keys;
			const opCodeIdx = operator.opcodeIndex;
			this._model.operatorCodes[opCodeIdx].customCode = customName;
			// flexbuffer로 인코딩 진행

			let fbb = flexbuffers.builder();
			fbb.startMap();
			for(const key of customKeyArray){
				fbb.addKey(key);
				let val = data._attribute[key];
				const valType = data._attribute[key+"_type"];
				if(valType === "boolean"){
					if(val === "true" || val === true){
						fbb.add(true);
					}
					else if(val === "false" || val === false){
						fbb.add(false);
					}
					else{ 
						Balloon.error("'boolean' type must be 'true' or 'false'.", false);
						return;
					} // true, false 오타 에러처리
				}
				else if(valType === "int"){
					if(this.guessExactType(val) === 'float') {
						Balloon.error("'int' type doesn't include decimal point.", false);
						return;
					} // 소수점 들어간거 에러처리
					fbb.addInt(Number(val));
				}
				else{
					fbb.add(String(val));
				}
			}
			fbb.end();
			let res = fbb.finish();
			// ArrayBuffer -> Buffer -> Array 후 넣어줘야함.
			const buf = Buffer.alloc(res.byteLength);
			const view = new Uint8Array(res);
			for (let i = 0; i < buf.length; ++i) {
					buf[i] = view[i];
			}
			
			// buf는 res를 buf로 바꾼상태
			let res2 = Array.from(buf);
			operator.customOptions = res2;
		}
		return;
	}
}
