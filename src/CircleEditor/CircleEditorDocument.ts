import * as vscode from "vscode";
import { Disposable, disposeAll } from "./dispose";
import * as Circle from './circle_schema_generated';
import * as flatbuffers from 'flatbuffers';
import { responseModel } from './ResponseType';
import * as flexbuffers from 'flatbuffers/js/flexbuffers';

// HW
enum BuiltinOptionsType {
	CONV2DOPTIONS = 1,
	DEPTHWISECONV2DOPTIONS,
	CONCATEMBEDDINGSOPTIONS,
	LSHPROJECTIONOPTIONS,
	POOL2DOPTIONS,
	SVDFOPTIONS,
	RNNOPTIONS,
	FULLYCONNECTEDOATIONOPTIONS,
	SOFTMAXOPTIONS,
	CONCATENATIONOPTIONS,
	ADDOPTIONS,
	L2NORMOPTIONS,
	LOCALRESPONSENORMALIZATIONOPTIONS,
	LSTMOPTIONS,
	RESIZEBILINEAROPTIONS,
	CALLOPTIONS,
	RESHAPEOPTIONS,
	SKIPGRAMOPTIONS,
	SPACETODEPTHOPTIONS,
	EMBEDDINGLOOKUPSPARSEOPTIONS,
	MULOPTIONS,
	PADOPTIONS,
	GATHEROPTIONS,
	BATCHTOSPACENDOPTIONS,
	SPACETOBATCHNDOPTIONS,
	TRANSPOSEOPTIONS,
	REDUCEROPTIONS,
	SUBOPTIONS,
	DIVOPTIONS,
	SQUEEZEOPTIONS,
	SEQUENCERNNOPTIONS,
	STRIDEDSLICEOPTIONS,
	EXPOPTIONS,
	TOPKV2OPTIONS,
	SPLITOPTIONS,
	LOGSOFTMAXOPTIONS,
	CASTOPTIONS,
	DEQUANTIZEOPTIONS,
	MAXIMUMMINIMUMOPTIONS,
	ARGMAXOPTIONS,
	LESSOPTIONS,
	NEGOPTIONS,
	PADV2OPTIONS,
	GREATEROPTIONS,
	GREATEREQUALOPTIONS,
	LESSEQUALOPTIONS,
	SELECTOPTIONS,
	SLICEOPTIONS,
	TRANSPOSECONVOPTIONS,
	SPARSETODENSEOPTIONS,
	TILEOPTIONS,
	EXPANDDIMSOPTIONS,
	EQUALOPTIONS,
	NOTEQUALOPTIONS,
	SHAPEOPTIONS,
	POWOPTIONS,
	ARGMINOPTIONS,
	FAKEQUANTOPTIONS,
	PACKOPTIONS,
	LOGICALOROPTIONS,
	ONEHOTOPTIONS,
	LOGICALANDOPTIONS,
	LOGICALNOTOPTIONS,
	UNPACKOPTIONS,
	FLOORDIVOPTIONS,
	SQUAREOPTIONS,
	ZEROSLIKEOPTIONS,
	FILLOPTIONS,
	BIDIRECTIONALSEQUENCELSTMOPTIONS,
	BIDIRECTIONALSEQUENCERNNOPTIONS,
	UNIDIRECTIONALSEQUENCELSTMOPTIONS,
	FLOORMODOPTIONS,
	RANGEOPTIONS,
	RESIZENEARESTNEIGHBOROPTIONS,
	LEAKYRELUOPTIONS,
	SQUAREDDIFFERENCEOPTIONS,
	MIRRORPADOPTIONS,
	ABSOPTIONS,
	SPLITVOPTIONS,
	UNIQUEOPTIONS,
	REVERSEV2OPTIONS,
	ADDNOPTIONS,
	GATHERNDOPTIONS,
	COSOPTIONS,
	WHEREOPTIONS,
	RANKOPTIONS,
	REVERSESEQUENCEOPTIONS,
	MATRIXDIAGOPTIONS,
	QUANTIZEOPTIONS,
	MATRIXSETDIAGOPTIONS,
	HARDSWISHOPTIONS,
	IFOPTIONS,
	WHILEOPTIONS,
	DEPTHTOSPACEOPTIONS,
	NONMAXSUPPRESSIONV4OPTIONS,
	NONMAXSUPPRESSIONV5OPTIONS,
	SCATTERNDOPTIONS,
	SELECTV2OPTIONS,
	DENSIFYOPTIONS,
	SEGMENTSUMOPTIONS,
	BATCHMATMULOPTIONS,
	CUMSUMOPTIONS,
	CALLONCEOPTIONS,
	BROADCASTTOOPTIONS,
	RFFT2DOPTIONS,
	CONV3DOPTIONS,
	HASHTABLEOPTIONS,
	HASHTABLEFINDOPTIONS,
	HASHTABLEIMPORTOPTIONS,
	HASHTABLESIZEOPTIONS,
	VARHANDLEOPTIONS,
	READVARIABLEOPTIONS,
	ASSIGNVARIABLEOPTIONS,
	RANDOMOPTIONS,
	BCQGATHEROPTIONS = 252,
	BCQFULLYCONNECTEDOPTIONS = 253,
	INSTANCENORMOPTIONS = 254,
  }


export class CircleEditorDocument extends Disposable implements vscode.CustomDocument{
  private readonly _uri: vscode.Uri;
  private _model: Circle.ModelT;
	private _CircleType : any;
  private _NormalType : any;
	private _FindAttribute : any;
  //private readonly packetSize = 1024 * 1024 * 10;
  private readonly packetSize =1024;

  public get uri(): vscode.Uri { return this._uri; }
  public get model(): Circle.ModelT { return this._model }
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

  private constructor (uri: vscode.Uri, bytes: Uint8Array) {
    super();
    this._uri = uri;
    this._model = this.loadModel(bytes);
		this._CircleType  = {
			"TensorType" : Circle.TensorType,
			"DimensionType" : Circle.DimensionType,
			"Padding" : Circle.Padding,
			"ActivationFunctionType" : Circle.ActivationFunctionType,
			"LSHProjectionType" : Circle.LSHProjectionType,
			"FullyConnectedOptionsWeightsFormat" : Circle.FullyConnectedOptionsWeightsFormat,
			"LSTMKernelType" : Circle.LSTMKernelType,
			"CombinerType" : Circle.CombinerType,
			"MirrorPadMode" : Circle.MirrorPadMode,
			"CustomOptionsFormat" : Circle.CustomOptionsFormat,
			"DataFormat" : Circle.DataFormat,
			};
			this._NormalType = {
			"int" : Int32Array,
			"bool" : Boolean,
			"float" : Float64Array,
			"int32" : Int32Array,
			"string" : String,
			"byte" : Int8Array,
			"ubyte" : Uint8Array,
			"uint" : Uint32Array,
			"int64" : Number
			};
		this._FindAttribute = {
			"CONV2DOPTIONS" : Circle.Conv2DOptionsT,
			"DEPTHWISECONV2DOPTIONS" : Circle.DensifyOptionsT, 
			"CONCATEMBEDDINGSOPTIONS" : Circle.ConcatEmbeddingsOptionsT,
			"LSHPROJECTIONOPTIONS" : Circle.LSHProjectionOptionsT,
			"POOL2DOPTIONS" : Circle.Pool2DOptionsT,
			"SVDFOPTIONS" : Circle.SVDFOptionsT,
			"RNNOPTIONS" : Circle.RNNOptionsT,
			"FULLYCONNECTEDOATIONOPTIONS" : Circle.FullyConnectedOptionsT,
			"SOFTMAXOPTIONS" : Circle.SoftmaxOptionsT,
			"CONCATENATIONOPTIONS" : Circle.ConcatenationOptionsT,
			"ADDOPTIONS" : Circle.AddOptionsT,
			"L2NORMOPTIONS" : Circle.L2NormOptionsT,
			"LOCALRESPONSENORMALIZATIONOPTIONS" : Circle.LocalResponseNormalizationOptionsT,
			"LSTMOPTIONS" : Circle.LSTMOptionsT,
			"RESIZEBILINEAROPTIONS" : Circle.ResizeBilinearOptionsT,
			"CALLOPTIONS" : Circle.CallOptionsT,
			"RESHAPEOPTIONS" : Circle.ReshapeOptionsT,
			"SKIPGRAMOPTIONS" : Circle.SkipGramOptionsT,
			"SPACETODEPTHOPTIONS" : Circle.SpaceToDepthOptionsT,
			"EMBEDDINGLOOKUPSPARSEOPTIONS" : Circle.EmbeddingLookupSparseOptionsT,
			"MULOPTIONS" : Circle.MulOptionsT,
			"PADOPTIONS" : Circle.PadOptionsT,
			"GATHEROPTIONS" : Circle.GatherOptionsT,
			"BATCHTOSPACENDOPTIONS" : Circle.BatchToSpaceNDOptionsT,
			"SPACETOBATCHNDOPTIONS" : Circle.SpaceToBatchNDOptionsT,
			"TRANSPOSEOPTIONS" : Circle.TransposeOptionsT,
			"REDUCEROPTIONS" : Circle.ReducerOptionsT,
			"SUBOPTIONS" : Circle.SubOptionsT,
			"DIVOPTIONS" : Circle.DivOptionsT,
			"SQUEEZEOPTIONS" : Circle.SqueezeOptionsT,
			"SEQUENCERNNOPTIONS" : Circle.SequenceRNNOptionsT,
			"STRIDEDSLICEOPTIONS" : Circle.StridedSliceOptionsT,
			"EXPOPTIONS" : Circle.ExpOptionsT,
			"TOPKV2OPTIONS" : Circle.TopKV2OptionsT,
			"SPLITOPTIONS" : Circle.SplitOptionsT,
			"LOGSOFTMAXOPTIONS" : Circle.LogSoftmaxOptionsT,
			"CASTOPTIONS" : Circle.CastOptionsT,
			"DEQUANTIZEOPTIONS" : Circle.DequantizeOptionsT,
			"MAXIMUMMINIMUMOPTIONS" : Circle.MaximumMinimumOptionsT,
			"ARGMAXOPTIONS" : Circle.ArgMaxOptionsT,
			"LESSOPTIONS" : Circle.LessOptionsT,
			"NEGOPTIONS" : Circle.NegOptionsT,
			"PADV2OPTIONS" : Circle.PadV2OptionsT,
			"GREATEROPTIONS" : Circle.GreaterOptionsT,
			"GREATEREQUALOPTIONS" : Circle.GreaterEqualOptionsT,
			"LESSEQUALOPTIONS" : Circle.LessEqualOptionsT,
			"SELECTOPTIONS" : Circle.SelectOptionsT,
			"SLICEOPTIONS" : Circle.SliceOptionsT,
			"TRANSPOSECONVOPTIONS" : Circle.TransposeConvOptionsT,
			"SPARSETODENSEOPTIONS" : Circle.SparseToDenseOptionsT,
			"TILEOPTIONS" : Circle.TileOptionsT,
			"EXPANDDIMSOPTIONS" : Circle.ExpandDimsOptionsT,
			"EQUALOPTIONS" : Circle.EqualOptionsT,
			"NOTEQUALOPTIONS" : Circle.NotEqualOptionsT,
			"SHAPEOPTIONS" : Circle.ShapeOptionsT,
			"POWOPTIONS" : Circle.PowOptionsT,
			"ARGMINOPTIONS" : Circle.ArgMinOptionsT,
			"FAKEQUANTOPTIONS" : Circle.FakeQuantOptionsT,
			"PACKOPTIONS" : Circle.PackOptionsT,
			"LOGICALOROPTIONS" : Circle.LogicalOrOptionsT,
			"ONEHOTOPTIONS" : Circle.OneHotOptionsT,
			"LOGICALANDOPTIONS" : Circle.LogicalAndOptionsT,
			"LOGICALNOTOPTIONS" : Circle.LogicalNotOptionsT,
			"UNPACKOPTIONS" : Circle.UnpackOptionsT,
			"FLOORDIVOPTIONS" : Circle.FloorDivOptionsT,
			"SQUAREOPTIONS" : Circle.SquareOptionsT,
			"ZEROSLIKEOPTIONS" : Circle.ZerosLikeOptionsT,
			"FILLOPTIONS" : Circle.FillOptionsT,
			"BIDIRECTIONALSEQUENCELSTMOPTIONS" : Circle.BidirectionalSequenceLSTMOptionsT,
			"BIDIRECTIONALSEQUENCERNNOPTIONS" : Circle.BidirectionalSequenceRNNOptionsT,
			"UNIDIRECTIONALSEQUENCELSTMOPTIONS" : Circle.UnidirectionalSequenceLSTMOptionsT,
			"FLOORMODOPTIONS" : Circle.FloorModOptionsT,
			"RANGEOPTIONS" : Circle.RangeOptionsT,
			"RESIZENEARESTNEIGHBOROPTIONS" : Circle.ResizeNearestNeighborOptionsT,
			"LEAKYRELUOPTIONS" : Circle.LeakyReluOptionsT,
			"SQUAREDDIFFERENCEOPTIONS" : Circle.SquaredDifferenceOptionsT,
			"MIRRORPADOPTIONS" : Circle.MirrorPadOptionsT,
			"ABSOPTIONS" : Circle.AbsOptionsT,
			"SPLITVOPTIONS" : Circle.SplitVOptionsT,
			"UNIQUEOPTIONS" : Circle.UniqueOptionsT,
			"REVERSEV2OPTIONS" : Circle.ReverseV2OptionsT,
			"ADDNOPTIONS" : Circle.AddNOptionsT,
			"GATHERNDOPTIONS" : Circle.GatherNdOptionsT,
			"COSOPTIONS" : Circle.CosOptionsT,
			"WHEREOPTIONS" : Circle.WhereOptionsT,
			"RANKOPTIONS" : Circle.RankOptionsT,
			"REVERSESEQUENCEOPTIONS" : Circle.ReverseSequenceOptionsT,
			"MATRIXDIAGOPTIONS" : Circle.MatrixDiagOptionsT,
			"QUANTIZEOPTIONS" : Circle.QuantizeOptionsT,
			"MATRIXSETDIAGOPTIONS" : Circle.MatrixSetDiagOptionsT,
			"HARDSWISHOPTIONS" : Circle.HardSwishOptionsT,
			"IFOPTIONS" : Circle.IfOptionsT,
			"WHILEOPTIONS" : Circle.WhileOptionsT,
			"DEPTHTOSPACEOPTIONS" : Circle.DepthToSpaceOptionsT,
			"NONMAXSUPPRESSIONV4OPTIONS" : Circle.NonMaxSuppressionV4OptionsT,
			"NONMAXSUPPRESSIONV5OPTIONS" : Circle.NonMaxSuppressionV5OptionsT,
			"SCATTERNDOPTIONS" : Circle.ScatterNdOptionsT,
			"SELECTV2OPTIONS" : Circle.SelectV2OptionsT,
			"DENSIFYOPTIONS" : Circle.DensifyOptionsT,
			"SEGMENTSUMOPTIONS" : Circle.SegmentSumOptionsT,
			"BATCHMATMULOPTIONS" : Circle.BatchMatMulOptionsT,
			"CUMSUMOPTIONS" : Circle.CumsumOptionsT,
			"CALLONCEOPTIONS" : Circle.CallOnceOptionsT,
			"BROADCASTTOOPTIONS" : Circle.BroadcastToOptionsT,
			"RFFT2DOPTIONS" : Circle.Rfft2dOptionsT,
			"CONV3DOPTIONS" : Circle.Conv3DOptionsT,
			"HASHTABLEOPTIONS" : Circle.HashtableOptionsT,
			"HASHTABLEFINDOPTIONS" : Circle.HashtableFindOptionsT,
			"HASHTABLEIMPORTOPTIONS" : Circle.HashtableImportOptionsT,
			"HASHTABLESIZEOPTIONS" : Circle.HashtableSizeOptionsT,
			"VARHANDLEOPTIONS" : Circle.VarHandleOptionsT,
			"READVARIABLEOPTIONS" : Circle.ReadVariableOptionsT,
			"ASSIGNVARIABLEOPTIONS" : Circle.AssignVariableOptionsT,
			"RANDOMOPTIONS" : Circle.RandomOptionsT,
			"BCQGATHEROPTIONS" : Circle.BCQGatherOptionsT,
			"BCQFULLYCONNECTEDOPTIONS" : Circle.BCQFullyConnectedOptionsT,
			"INSTANCENORMOPTIONS" : Circle.InstanceNormOptionsT,
		}
  }

  // dispose
  private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());
  public readonly onDidDispose = this._onDidDispose.event;

  // tell to webview
  private readonly _onDidChangeContent = this._register(new vscode.EventEmitter<{
		readonly modelData: Uint8Array;
  } | responseModel>());
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
  

	makeEdit(message: any) {
		const oldModelData = this.modelData;
		
		//message type이 모두 있는지 확인
		switch (message.type) {
			case "attribute":
				const jsonBuffer_Attribute  = require('/home/ssdc/AttributeExam.json')
      	const str_Attriibute = JSON.stringify(jsonBuffer_Attribute);
				const res_Attribute = this.AttributeEdit(str_Attriibute);
				console.log(res_Attribute)
				break;
			case "tensor":
				//const str = message.input
				const jsonBuffer_Tensor = require('/home/ssdc/TensorExam.json')
      	const str_Tensor = JSON.stringify(jsonBuffer_Tensor);
				const res_Tensor = this.TensorEdit(str_Tensor);
				console.log(res_Tensor);
				break;
			
			default:
				break;
		}

		const newModelData = this.modelData;

		this.notifyEdit(oldModelData, newModelData);
	}

	notifyEdit(oldModelData: Uint8Array, newModelData: Uint8Array) {
		
		this.sendModel(0);

		this._onDidChangeDocument.fire({
			label: 'Model',
			undo: async () => {
						this._model = this.loadModel(oldModelData);
						this.sendModel(0);
					},
			redo: async () => {
				this._model = this.loadModel(newModelData);
				this.sendModel(0);
	 		}
		})
  }

  sendModel(offset: number){
	
	if(offset>this.modelData.length) return;
    let responseArray = this.modelData.slice(offset, offset+this.packetSize);
    let responseModel =  {
		command: 'loadmodel',
		type : 'uint8array',
		offset : offset,
		length: this.packetSize,
		total : this.modelData.length,
		responseArray : responseArray
	}
	this._onDidChangeContent.fire(responseModel);
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

	private TensorEdit(data : string){

		// Input Json 파일 받아오기 (GUI에서 Edit 수행 후 JSON으로 준다고 가정)
		// EditTensor에 수정할 Tensor값 받아오는 과정
		console.log("TensorEdit Start");
		const InputjsonFile = JSON.parse(data);
		console.log(InputjsonFile);
	
		// 정보 받아오기
		let name;
		let subgraph_Idx : number = 0 ;
		let argname : string;
		let Tensor_Idx : number;
		let isVariable : boolean= false;
		let Tensor_Type;
		let Tensor_Shape;
		let Buffer_data : any = null;
	
		name = InputjsonFile?._name;
		subgraph_Idx = Number(InputjsonFile._subgraphIdx);

		for(let i = 0; i<InputjsonFile._arguments.length; i++){
		  let argument = InputjsonFile._arguments[i];
		  argname = argument._name;
		  Tensor_Idx = Number(argument._location);
		  if(argument._initializer === null){
			Tensor_Type = argument._type._dataType;
			Tensor_Shape = argument._type._shape._dimensions;
		  }
		  else{
			  let ini = argument._initializer;
			  Tensor_Type = ini._type._dataType;
			  Tensor_Shape = ini._type._shape._dimensions;
			  if(ini?._is_changed === true){
				  Buffer_data = ini._data;
			  }
			  isVariable = ini._is_variable;
		  }
		  //enum화 시키기 위해서 대문자화 시켜야한다.
		  Tensor_Type = Tensor_Type.toUpperCase();
	
		  // 정보 갱신
		  const EditTensor = this._model?.subgraphs[subgraph_Idx]?.tensors[Tensor_Idx];
		  EditTensor.name = argname;
		  //type은 enum참조   
		  let Tensor_Type_number : any = Circle.TensorType[Tensor_Type];
		  EditTensor.type = Tensor_Type_number;
		  EditTensor.shape = Tensor_Shape;
		  if(Buffer_data !== null){
			  // 버퍼 크기와 shape 크기가 다르면 에러 메시지를 보내주면 된다.
			  const EditBuffer_Idx : number = EditTensor.buffer;
			  this._model.buffers[EditBuffer_Idx].data = Buffer_data;
			  return "error";
		  }
		};
		return "success";
	  }

	  private AttributeEdit(data:string){
    
		const InputjsonFile = JSON.parse(data);
		console.log("AttributeEdit Start")

		let subgraph_Idx : number = Number(InputjsonFile._subgraphIdx);
		let Operator_Idx : number = Number(InputjsonFile._location);
		let inputTypeName : string = InputjsonFile.name;
		inputTypeName = inputTypeName.toUpperCase();
		const inputTypeOptionName : any = inputTypeName + "OPTIONS";
		// for문으로 BuiltinOperator enum key 파싱 및 enum val 찾기
		let operatorCode : number = 0;
		for(let i = -4; i <= 146; i++){
		  let BuiltinOperatorKey = Circle.BuiltinOperator[i];
		  if(BuiltinOperatorKey === undefined) continue;
		  BuiltinOperatorKey = Circle.BuiltinOperator[i].replace('_','');
		  BuiltinOperatorKey = BuiltinOperatorKey.toUpperCase();
		  if(BuiltinOperatorKey === inputTypeName){
			// enum_val을 찾았으면 입력
			operatorCode = i;
			break;
		  }
		}
		
		const operator : any = this._model.subgraphs[subgraph_Idx].operators[Operator_Idx];
		// builtin Case
		// builtinOptionsType 수정
		
		console.log("operatorCode :", operatorCode);
		if(operatorCode !== 32){ // builtinOptions
			console.log("Built-In Start");
		  if(operator.builtinOptions === null) return "error";
			operator.builtinOptionsType = BuiltinOptionsType[inputTypeOptionName];
		  const key = InputjsonFile._attribute.name;
		  const value : string = InputjsonFile._attribute._value;
		  const type : string = InputjsonFile._attribute._type;
		  // 해당 타입에 접근해서 enum 값을 뽑아와야한다.
		  
		  // 현재는 type변경 없다고 생각하고 구현
		  if(this._NormalType[type]=== undefined){
			// Circle Type 참조
			operator.builtinOptions[key] = this._CircleType[type][value];
		  }
		  else{
			// 보여주는 타입을 그대로 띄워줌
			operator.builtinOptions[key] = this._NormalType[type](value);
		  }

		}
		// Custom인 경우
		// 커스텀인 경우 문자열로 받아온다.
		
		else if(operatorCode === 32){
			console.log("Custom Start");
			operator.builtinOptionsType = 0;
			operator.builtinOPtions = null;

			const custom_name = InputjsonFile._attribute.name;
			const custom_key = InputjsonFile._attribute.keys;
			
			const opCodeIdx = operator.opcodeIndex;
			this._model.operatorCodes[opCodeIdx].customCode = custom_name;
			
			// flexbuffer로 인코딩 진행

			let fbb = flexbuffers.builder();
			fbb.startMap();
			for(const key of custom_key){
				fbb.addKey(key);
				const val = InputjsonFile._attribute[key];
				const val_type = InputjsonFile._attribute[key+"_type"]
				if(val_type === "bool"){
					if(val === "true"){
						fbb.add(true);
					}
					else{
						fbb.add(false);
					}
				}
				else if(val_type === "int"){
					console.log(Number(val));
					fbb.add(Number(val));
				}
				else{
					fbb.add(val);
				}
			}
			fbb.end();
			let res = fbb.finish();
			console.log(operator.customOptions)
			// ArrayBuffer -> Buffer -> Array 후 넣어줘야함.
			const buf = Buffer.alloc(res.byteLength);
			const view = new Uint8Array(res);
			for (let i = 0; i < buf.length; ++i) {
					buf[i] = view[i];
			}
			
			// buf는 res를 buf로 바꾼상태
			let res2 = Array.from(buf);
			operator.customOptions = res2;
			console.log(operator.customOptions)
		}
		
		return "success"
	  }
}
