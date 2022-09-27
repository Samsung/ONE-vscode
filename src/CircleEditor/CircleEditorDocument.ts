import * as vscode from "vscode";
import { Disposable } from "./dispose";
import * as Circle from './circle_schema_generated';
import * as flatbuffers from 'flatbuffers';
import { ResponseModel, RequestMessage, CustomInfoMessage, ResponseModelPath, ResponseFileRequest, ResponseJson } from './MessageType';
import * as flexbuffers from 'flatbuffers/js/flexbuffers';
import * as Types from './CircleType';
import { Balloon } from "../Utils/Balloon";

export class CircleEditorDocument extends Disposable implements vscode.CustomDocument{
  private readonly _uri: vscode.Uri;
  private _model: Circle.ModelT;
  private readonly packetSize = 1024 * 1024 * 10;

  public get uri(): vscode.Uri { return this._uri; }
  public get model(): Circle.ModelT { return this._model; }
  public get modelData(): Uint8Array {
    let fbb = new flatbuffers.Builder(1024);
	this._model.pack(fbb);
		Circle.Model.finishModelBuffer(fbb, this._model.pack(fbb));
    return fbb.asUint8Array();
  }

  static async create(uri: vscode.Uri):
    Promise<CircleEditorDocument|PromiseLike<CircleEditorDocument>> {
		let bytes = new Uint8Array(await vscode.workspace.fs.readFile(uri));
		return new CircleEditorDocument(uri, bytes);
  }

  private constructor (uri: vscode.Uri, bytes: Uint8Array) {
    super();
    this._uri = uri;
    this._model = this.loadModel(bytes);
  }

  // dispose
  private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());
  public readonly onDidDispose = this._onDidDispose.event;

  // tell to webview
  public readonly _onDidChangeContent = this._register(new vscode.EventEmitter<{
		readonly modelData: Uint8Array;
  } | ResponseModel | CustomInfoMessage | ResponseModelPath | ResponseFileRequest | ResponseJson>());
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

	makeEdit(message: RequestMessage) {
		const oldModelData = this.modelData;

		switch (message.type) {
			case "attribute":
				this.editAttribute(message.data);
				break;
			case "tensor":
				this.editTensor(message.data);
				break;
			default:
				return;
			
		}

		const newModelData = this.modelData;
		this.notifyEdit(oldModelData, newModelData);
	}

	notifyEdit(oldModelData: Uint8Array, newModelData: Uint8Array) {
		
		this.sendModel('0');
		
		this._onDidChangeDocument.fire({
			label: 'Model',
			undo: async () => {
						this._model = this.loadModel(oldModelData);
						this.sendModel('0');  //여기 체크 필요
					},
			redo: async () => {
				this._model = this.loadModel(newModelData);
				this.sendModel('0');
			}
		});
 	}

	sendModel(offset: string) {

		if (parseInt(offset) > this.modelData.length - 1) {return;}
		
		let responseModelPath = { command: 'loadmodel', type: 'modelpath', value: this._uri.fsPath};
		this._onDidChangeContent.fire(responseModelPath);
		
		let responseArray = this.modelData.slice(parseInt(offset), parseInt(offset) + this.packetSize);
		
		let responseModel:ResponseModel =  {
			command: 'loadmodel',
			type : 'uint8array',
			offset : parseInt(offset),
			length: responseArray.length,
			total : this.modelData.length,
			responseArray : responseArray
		};

		this._onDidChangeContent.fire(responseModel);
  }
  
  editJsonModel(message: any){
	const oldModelData = this.modelData;
    try{
        let try1 = new Circle.ModelT();
        
        let newModel : any = new Circle.ModelT();
        newModel = JSON.parse(message.data); //예외 처리
        
        this._model = newModel;

        let fbb = new flatbuffers.Builder(1024);
        try1.pack(fbb);
        Circle.Model.finishModelBuffer(fbb, try1.pack(fbb));
        let tmp = fbb.asUint8Array();

        const newModelData = tmp;
        console.log(1);
        this.notifyEdit(oldModelData, newModelData);
        this.loadJson();
    }catch{
        Balloon.error("invalid model");
    }
  }

  loadJson(){
	// let jsonModel = "{\n";
	// jsonModel += `\t"version": `;
	// jsonModel += JSON.stringify(this._model.version, null, 2);
	// jsonModel +=`,\n\t"operatorCodes": [`;
	// jsonModel += JSON.stringify(this._model.operatorCodes, null, 2).slice(1,-1);
	// jsonModel +="],";
	// jsonModel += JSON.stringify(this._model.subgraphs,null,2).slice(1,-1);
	// jsonModel +=",";
	// jsonModel += JSON.stringify(this._model.description, null, 2).slice(1,-1);
	// jsonModel +=",";

	// let bufferArray = this._model.buffers;
	// for(let i=0; i< bufferArray.length; i++){
	// 	jsonModel += JSON.stringify(bufferArray[i]);
	// 	jsonModel +=",\n";
	// }
	
	// jsonModel += JSON.stringify(this._model.buffers).slice(1,-1);
	// jsonModel += "\n";
	// jsonModel += JSON.stringify(this._model.metadataBuffer, null, 2).slice(1,-1);
	// jsonModel +="\n";
	// jsonModel += JSON.stringify(this._model.metadata, null, 2).slice(1,-1);
	// jsonModel +="\n";
	// jsonModel += JSON.stringify(this._model.signatureDefs,null,2).slice(1,-1);
	// jsonModel += "\n}";


	let jsonModel = JSON.stringify(this._model, null,2);
	let responseJson: ResponseJson = {
		command: 'loadJson',
		data: jsonModel
	};
	this._onDidChangeContent.fire(responseJson);
  }	

	private guessExactType(n : any){
		if(Number(n) === n && n % 1 === 0){
			return "int";
		}
		else if(Number(n) === n && n % 1 !== 0){
			return "float";
		}
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
		let responseData:CustomInfoMessage = {
			command: 'CustomType',
			data: resData
		};

		this._onDidChangeContent.fire(responseData);
		return;
	}

  private loadModel(bytes: Uint8Array): Circle.ModelT {
    let buf = new flatbuffers.ByteBuffer(bytes);
    return Circle.Model.getRootAsModel(buf).unpack();
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
	 *
	 * These backups are used to implement hot exit.
	 */
	async backup(destination: vscode.Uri, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
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
		if(!name||!subgraphIdx) {
			Balloon.error("input data is undefined");
			return;
		}
		const argument = data._arguments;
		argname = argument._name;
		tensorIdx = Number(argument._location);
		const isChanged : boolean = argument._isChanged;
		tensorType = argument._type._dataType;
		tensorShape = argument._type._shape._dimensions;
		if(!argname || !tensorIdx || !tensorType || !tensorShape) {
			Balloon.error("input data is undefined");
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
		if(!targetTensor) {
			Balloon.error("model is undefined");
			return;
		}
		targetTensor.name = argname;
		//type은 enum참조   
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
			Balloon.error("input data is undefined");
			return;
		}
		inputTypeName = inputTypeName.toUpperCase();
		const inputTypeOptionName : any = inputTypeName + "OPTIONS";
		// for문으로 BuiltinOperator enum key 파싱 및 enum val 찾기
		let operatorCode : number = 0;
		for(let i = -4; i <= 146; i++){
			let builtinOperatorKey = Circle.BuiltinOperator[i];
			if(builtinOperatorKey === undefined) {continue;}
			builtinOperatorKey = Circle.BuiltinOperator[i].replace('_','');
			builtinOperatorKey = builtinOperatorKey.toUpperCase();
			if(builtinOperatorKey === inputTypeName){
			// enum_val을 찾았으면 입력
			operatorCode = i;
			break;
			}
		}
		const operator : any = this._model.subgraphs[subgraphIdx].operators[operatorIdx];
		if(!operator){
			Balloon.error("model is undefined");
			return;
		}
		// builtin Case
		// builtinOptionsType 수정
		if(operatorCode !== 32){ // builtinOptions
			if(operator.builtinOptions === null) {
				Balloon.error("built-in Options is null");
				return;
			}
			operator.builtinOptionsType = Types.BuiltinOptionsType[inputTypeOptionName];
			const key = data._attribute.name;
			const value : any = data._attribute._value;
			const type : any = data._attribute._type;
			// 해당 타입에 접근해서 enum 값을 뽑아와야한다.
			
			// 현재는 type변경 없다고 생각하고 구현
			const upValue = value.toUpperCase();
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
			const circleTypeArr = Object.keys(Types._CircleType);
			if(circleTypeArr.find(element => element === type ) !== undefined){
				// Circle Type 참조
				operator.builtinOptions[targetKey] = Types._CircleType[type][upValue];
			}
			else{
				// 보여주는 타입을 그대로 띄워줌
				if(type !== "float"){
					operator.builtinOptions[targetKey] = Types._NormalType[type](value);
				}
				else{
					operator.builtinOptions[targetKey] = parseFloat(value);
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
						Balloon.error("'boolean' type must be 'true' or 'false'");
						return;
					} // true, false 오타 에러처리
				}
				else if(valType === "int"){
					if(this.guessExactType(val) === 'float') {
						return;
					} // 소수점 들어간거 에러처리
					fbb.addInt(Number(val));
				}
				// else if(valType === "float"){
				// 	fbb.add(Number(val));
				// }
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