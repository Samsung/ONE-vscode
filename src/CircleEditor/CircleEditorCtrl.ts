import * as fs from 'fs';
import * as vscode from 'vscode';

import { Balloon } from '../Utils/Balloon';
import { getNonce } from '../Utils/external/Nonce';
import { BackendColor } from './BackendColor';

import * as flatbuffers from 'flatbuffers';
import * as circle from './circle_schema_generated';
import { KeyObject } from 'crypto';
import { endSlotTemplate, numberFieldTemplate } from '@microsoft/fast-foundation';

class CtrlStatus {
  public static readonly init = 0;
  public static readonly loading = 1;
  public static readonly ready = 2;
  public static readonly disposed = 3;
}

export class MessageDefs {
  // message command
  public static readonly alert = 'alert';
  public static readonly request = 'request';
  public static readonly response = 'response';
  public static readonly pageloaded = 'pageloaded';
  public static readonly loadmodel = 'loadmodel';
  public static readonly finishload = 'finishload';
  public static readonly reload = 'reload';
  public static readonly selection = 'selection';
  public static readonly backendColor = 'backendColor';
  public static readonly error = 'error';
  public static readonly colorTheme = 'colorTheme';
  // loadmodel type
  public static readonly modelpath = 'modelpath';
  public static readonly uint8array = 'uint8array';
  // selection
  public static readonly names = 'names';
  public static readonly tensors = 'tensors';
  // partiton of backends
  public static readonly partition = 'partition';

  //added by yuyeon
  public static readonly editAttribute = 'editAttribute';
  public static readonly editTensor = 'editTensor';
  public static readonly editBuffer = 'editBuffer';
  public static readonly testMessage = 'dd';
};

export interface CircleGraphEvent {
  onPageLoaded(): void;
  onSelection(names: string[], tensors: string[]): void;
  onStartLoadModel(): void;
  onFinishLoadModel(): void;
}

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

/* istanbul ignore next */
export class CircleGraphCtrl {

  //GUI 코드 경로로 수정해야 함
  protected static readonly folderMediaCircleGraph = 'media/CircleGraph';
  protected static readonly folderMediaCircleGraphExt = 'media/CircleGraph/external';
  protected static readonly folderExternal = 'external/';

  protected readonly _extensionUri: vscode.Uri;
  protected readonly _webview: vscode.Webview;
  protected _modelToLoad: string;
  protected _modelLength: number;
  protected _eventHandler: CircleGraphEvent | undefined;
  protected _selectionNames: string[] | undefined;
  protected _state: CtrlStatus;
  protected _viewMode: string;

  // HW 선언 변수
  protected _Circle : any;
  protected _CircleType : any;
  protected _NormalType : any;

  private _ctrlDisposables: vscode.Disposable[] = [];

  public constructor(extensionUri: vscode.Uri, webView: vscode.Webview) {
    this._extensionUri = extensionUri;
    this._webview = webView;
    this._modelToLoad = '';
    this._modelLength = 0;
    this._eventHandler = undefined;
    this._state = CtrlStatus.init;
    this._viewMode = 'viewer';
  }

  public initGraphCtrl(modelToLoad: string, notify: CircleGraphEvent | undefined) {
    this._webview.options = this.getWebviewOptions(this._extensionUri);
    this._modelToLoad = modelToLoad;
    this._modelLength = 0;
    this._eventHandler = notify;
    this._state = CtrlStatus.init;

    // HW
    let bytes = new Uint8Array(fs.readFileSync(this._modelToLoad));
    let buf = new flatbuffers.ByteBuffer(bytes);
    this._Circle = circle.Model.getRootAsModel(buf).unpack();
    this._CircleType  = {
      "TensorType" : circle.TensorType,
      "DimensionType" : circle.DimensionType,
      "Padding" : circle.Padding,
      "ActivationFunctionType" : circle.ActivationFunctionType,
      "LSHProjectionType" : circle.LSHProjectionType,
      "FullyConnectedOptionsWeightsFormat" : circle.FullyConnectedOptionsWeightsFormat,
      "LSTMKernelType" : circle.LSTMKernelType,
      "CombinerType" : circle.CombinerType,
      "MirrorPadMode" : circle.MirrorPadMode,
      "CustomOptionsFormat" : circle.CustomOptionsFormat,
      "DataFormat" : circle.DataFormat,
    }
    this._NormalType = {
      "int" : Int32Array,
      "bool" : Boolean,
      "float" : Float64Array,
      "int32" : Int32Array,
      "string" : String,
      "byte" : Int8Array,
      "ubyte" : Uint8Array,
      "uint" : Uint32Array,
    }

    this.registerEventHandlers();

    const thiz = this;
    vscode.workspace.onDidChangeConfiguration(e => {
      thiz.handleChangeConfiguration(e);
    });
  }

  public disposeGraphCtrl() {
    this._state = CtrlStatus.disposed;
    while (this._ctrlDisposables.length) {
      const x = this._ctrlDisposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  public isReady() {
    return this._state === CtrlStatus.ready;
  }

  public setMode(mode: string) {
    this._viewMode = mode;
  }

  /**
   * @brief set initial selection of nodes
   * @note  if called before loading, will be applied after load is finished
   */
  public setSelection(names: string[]) {
    this._selectionNames = names;

    if (this.isReady()) {
      this.applySelection();
    }
  }

  public setPartition(partition: any) {
    this._webview.postMessage({ command: MessageDefs.partition, partition: partition });
  }

  public sendBackendColor(backends: BackendColor[]) {
    this._webview.postMessage({ command: MessageDefs.backendColor, backends: backends });
  }

  public reloadModel() {
    this._webview.postMessage({ command: MessageDefs.reload });
  }

  // 버튼 누르면 호출
  private registerEventHandlers() {
    // Handle messages from the webview
    this._webview.onDidReceiveMessage(message => {
      console.log("register event handler 내부")
      this.handleReceiveMessage(message);
    }, null, this._ctrlDisposables);
  }

  // 메시지의 커맨드에 따라서
  protected handleReceiveMessage(message: any) {
    switch (message.command) {
      case MessageDefs.alert:
        Balloon.error(message.text);
        return;
      case MessageDefs.request:
        this.handleRequest(message.url, message.encoding);
        return;
      case MessageDefs.pageloaded:
        this.handlePageLoaded();
        break;
      case MessageDefs.loadmodel:
        this.handleLoadModel(parseInt(message.offset));  // to number
        return;
      case MessageDefs.finishload:
        this.handleFinishLoad();
        return;
      case MessageDefs.selection:
        this.handleSelection(message.names, message.tensors);
        return;
      //added here
      case MessageDefs.editAttribute:
        this.handleEditAttribute();
        return;
      case MessageDefs.editTensor:
        this.handleEditTensor(message.value);
        return;
      case MessageDefs.editBuffer:
        this.handleEditBuffer();
        return;
      case MessageDefs.testMessage:
        this.testHandler();
        return;
    }
  }

 protected testHandler() {

  try {
    console.log("test message received here");
    
    
  } catch (err: unknown) {
    this.handleLoadError(err);
  }

}
  //added handler functions for editing 
  protected handleEditAttribute() {

    try {
      //test용
      // const jsonBuffer  = require('/home/ssdc/TensorExam.json')
      const jsonBuffer  = require('/home/ssdc/AttributeExam.json')
      let temp = JSON.stringify(jsonBuffer);
      //

      let res = this.AttributeEdit(temp);
      console.log(res);
      // if(res === "error"){
      //   this.handleLoadError(res);
      // }
      //필요한 매개변수 붙여서 post message
      this._webview.postMessage({ command: MessageDefs.editAttribute });
    } catch (err: unknown) {
      this.handleLoadError(err);
    }

  }

  protected handleEditTensor(message : string) {

    try {
      //test용
      const jsonBuffer  = require('/home/ssdc/TensorExam.json')
      let temp = JSON.stringify(jsonBuffer);
      //

      let res = this.TensorEdit(temp);
      console.log(res);
      if(res === "error"){
        this.handleLoadError(res);
      }

      // 여기서 저장할지
      // 따로 할지 생각좀 해봐야지

      //필요한 매개변수 붙여서 post message
      this._webview.postMessage({ command: MessageDefs.editTensor });

      
    } catch (err: unknown) {
      this.handleLoadError(err);
    }

  }
  protected handleEditBuffer() {

    try {
      //필요한 매개변수 붙여서 post message
      this._webview.postMessage({ command: MessageDefs.editBuffer });
    } catch (err: unknown) {
      this.handleLoadError(err);
    }

  }



  protected handleChangeConfiguration(e: vscode.ConfigurationChangeEvent) {
    if (e.affectsConfiguration('workbench.colorTheme')) {
      if (this.isReady()) {
        this._webview.postMessage({ command: MessageDefs.colorTheme });
      }
    }
  }

  /**
   * @brief handleRequest will handle 'request()' from webview for local resource
   *        through message channel
   * @param url URL of the local resource file
   * @param encoding encoding of load local resource file
   */
  protected handleRequest(url: string, encoding: string) {
    // TODO check scheme
    const reqUrl = new URL(url);
    let filePath = vscode.Uri.joinPath(
      this._extensionUri, CircleGraphCtrl.folderMediaCircleGraph, reqUrl.pathname);
    if (!fs.existsSync(filePath.fsPath)) {
      filePath = vscode.Uri.joinPath(
        this._extensionUri, CircleGraphCtrl.folderMediaCircleGraphExt, reqUrl.pathname);
    }

    try {
      const fileData = fs.readFileSync(filePath.fsPath, { encoding: encoding, flag: 'r' });
      this._webview.postMessage({ command: MessageDefs.response, response: fileData });
    } catch (err) {
      this._webview.postMessage({ command: MessageDefs.error, response: '' });
    }
  }

  /**
   * @brief handleLoadModel will respond with 'loadmodel' message from WebView
   * @param offset offset of file WebView requested
   * @note  'offset' will start with 0 and then with offset of the model file
   */
  protected handleLoadModel(offset: number) {
    // TODO make this faster
    const sendPacketSize = 1024 * 1024 * 10;  // 10MB

    if (offset === 0) {
      this._state = CtrlStatus.loading;

      if (this._eventHandler) {
        this._eventHandler.onStartLoadModel();
      }
      // TODO add request for model path with separate command
      this.sendModelPath();

      try {
        const stats = fs.statSync(this._modelToLoad);
        this._modelLength = stats.size;

        if (this._modelLength <= sendPacketSize) {
          this.sendModelSingle();
        } else {
          this.sendModelMulti(sendPacketSize, offset);
        }
      } catch (err: unknown) {
        this.handleLoadError(err);
      }
    } else {
      const nextPacketSize = Math.min(this._modelLength - offset, sendPacketSize);
      try {
        this.sendModelMulti(nextPacketSize, offset);
      } catch (err: unknown) {
        this.handleLoadError(err);
      }
    }
  }

  /**
   * @brief handler for load is finished and graph is ready
   */
  protected handleFinishLoad() {
    this._state = CtrlStatus.ready;

    if (this._eventHandler) {
      this._eventHandler.onFinishLoadModel();
    }

    this.applySelection();
  }

  /**
   * @brief set selection for nodes in this._selectionNames if available
   */
  private applySelection() {
    if (this._selectionNames === undefined) {
      return;
    }
    if (this._state !== CtrlStatus.ready) {
      return;
    }

    this._webview.postMessage(
      { command: MessageDefs.selection, type: 'names', names: this._selectionNames });

    // cleanup
    this._selectionNames = undefined;
  }

  /**
   * @brief handlePageLoaded is called when window.load event is called
   */
  private handlePageLoaded() {
    if (this._eventHandler) {
      this._eventHandler.onPageLoaded();
    }
  }

  /**
   * @brief handleSelection will respond with 'selection' message from WebView
   * @param names containing tensor names of selected nodes
   * @param tensors containing tensor index of selected nodes
   * @note  selection information should be sent to user of this control
   */
  private handleSelection(names: string[], tensors: string[]) {
    if (this._eventHandler) {
      this._eventHandler.onSelection(names, tensors);
    }
  }

  private sendModelPath() {
    this._webview.postMessage(
      { command: MessageDefs.loadmodel, type: MessageDefs.modelpath, value: this._modelToLoad });
  }

  /**
   * @brief sendModelSingle will send model to WebView with single postMessage
   */
  private sendModelSingle() {
    const buffer = fs.readFileSync(this._modelToLoad);
    const modelData = new Uint8Array(buffer);
    this._webview.postMessage({
      command: MessageDefs.loadmodel,
      type: MessageDefs.uint8array,
      offset: 0,
      length: this._modelLength,
      total: this._modelLength,
      responseArray: modelData
    });
  }

  /**
   * @brief sendModelMulti will send model to WebView with multiple postMessage
   * @param packetSize size of packet in bytes to send with one postMessage
   * @param offset     position of the file where to begin with
   */
  private sendModelMulti(packetSize: number, offset: number) {
    fs.open(this._modelToLoad, 'r', (err, fd) => {
      if (err) {
        this._webview.postMessage(
          { command: MessageDefs.loadmodel, type: MessageDefs.error, responseErr: err.message });
        Balloon.error(err.message);
        return;
      }
      const buffer = Buffer.alloc(packetSize);
      fs.readSync(fd, buffer, 0, packetSize, offset);
      const modelData = new Uint8Array(buffer);

      this._webview.postMessage({
        command: MessageDefs.loadmodel,
        type: MessageDefs.uint8array,
        offset: offset,
        length: packetSize,
        total: this._modelLength,
        responseArray: modelData
      });
      fs.close(fd, (err) => { });
    });
  }

  private handleLoadError(err: unknown) {
    this._webview.postMessage({
      command: MessageDefs.loadmodel,
      type: MessageDefs.error,
    });
    if (err instanceof Error) {
      Balloon.error(err.message);
    } else {
      Balloon.error('Failed to load model');
    }
  }

  // 해당 html 내의 버튼을 클릭하면
  public getHtmlForWebview(webview: vscode.Webview) {

    const htmlPath = this.getMediaPath('index.html');

    let html =
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">F
        <title>Document</title>
    </head>
    
    <body>
      <button id="testBtn">클릭!</button><br>
      <input type="text" id="textBox"></input>
      <script>
        const vscode = acquireVsCodeApi();
        const testBtn = document.querySelector("#testBtn");
        const textBox = document.querySelector("#textBox");
        testBtn.addEventListener("click", e => {
            e.preventDefault();
            vscode.postMessage({
              type:"Attribute",
              command:"editAttribute",
              value: textBox.value,
            });
        });
      </script>
    </body>
    
    </html>`;


    // const htmlPath = this.getMediaPath('index.html');
    // let html = fs.readFileSync(htmlPath.fsPath, { encoding: 'utf-8' });

    // const nonce = getNonce();
    // html = html.replace(/\%nonce%/gi, nonce);
    // html = html.replace('%webview.cspSource%', webview.cspSource);
    // // necessary files from netron to work
    // html = this.updateUri(html, webview, '%view-grapher.css%', 'view-grapher.css');
    // html = this.updateUri(html, webview, '%view-sidebar.css%', 'view-sidebar.css');
    // html = this.updateExternalUri(html, webview, '%view-sidebar.js%', 'view-sidebar.js');
    // html = this.updateUri(html, webview, '%view-grapher.js%', 'view-grapher.js');
    // html = this.updateExternalUri(html, webview, '%dagre.js%', 'dagre.js');
    // html = this.updateExternalUri(html, webview, '%base.js%', 'base.js');
    // html = this.updateExternalUri(html, webview, '%text.js%', 'text.js');
    // html = this.updateExternalUri(html, webview, '%json.js%', 'json.js');
    // html = this.updateExternalUri(html, webview, '%xml.js%', 'xml.js');
    // html = this.updateExternalUri(html, webview, '%python.js%', 'python.js');
    // html = this.updateExternalUri(html, webview, '%protobuf.js%', 'protobuf.js');
    // html = this.updateExternalUri(html, webview, '%flatbuffers.js%', 'flatbuffers.js');
    // html = this.updateExternalUri(html, webview, '%flexbuffers.js%', 'flexbuffers.js');
    // html = this.updateExternalUri(html, webview, '%zip.js%', 'zip.js');
    // html = this.updateExternalUri(html, webview, '%gzip.js%', 'gzip.js');
    // html = this.updateExternalUri(html, webview, '%tar.js%', 'tar.js');
    // // for circle format
    // html = this.updateExternalUri(html, webview, '%circle.js%', 'circle.js');
    // html = this.updateExternalUri(html, webview, '%circle-schema.js%', 'circle-schema.js');
    // // modified for one-vscode
    // html = this.updateUri(html, webview, '%index.js%', 'index.js');
    // html = this.updateUri(html, webview, '%view.js%', 'view.js');
    // // viewMode
    // html = html.replace('%viewMode%', this._viewMode);

    return html;
  }

  private getMediaPath(file: string) {
    return vscode.Uri.joinPath(this._extensionUri, CircleGraphCtrl.folderMediaCircleGraph, file);
  }

  private updateExternalUri(
    html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, CircleGraphCtrl.folderExternal + replace);
    return html.replace(search, `${replaceUri}`);
  }

  private updateUri(html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, replace);
    return html.replace(search, `${replaceUri}`);
  }

  private getUriFromPath(webview: vscode.Webview, file: string) {
    const mediaPath = this.getMediaPath(file);
    const uriView = webview.asWebviewUri(mediaPath);
    return uriView;
  }

  private getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions
    & vscode.WebviewPanelOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,
      // And restrict the webview to only loading content from our extension's
      // 'media/CircleGraph' directory.
      localResourceRoots:
        [vscode.Uri.joinPath(extensionUri, CircleGraphCtrl.folderMediaCircleGraph)],

      // to prevent view to reload after loosing focus
      retainContextWhenHidden: true
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
    console.log(InputjsonFile._arguments.length);
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
      const EditTensor = this._Circle?.subgraphs[subgraph_Idx]?.tensors[Tensor_Idx];
      EditTensor.name = argname;
      //type은 enum참조   
      let Tensor_Type_number : any = circle.TensorType[Tensor_Type];
      EditTensor.type = Tensor_Type_number;
      EditTensor.shape = Tensor_Shape;
      if(Buffer_data !== null){
          // 버퍼 크기와 shape 크기가 다르면 에러 메시지를 보내주면 된다.
          const EditBuffer_Idx : number = EditTensor.buffer;
          this._Circle.buffers[EditBuffer_Idx].data = Buffer_data;
          return "error";
      }

    };

    // this.save();
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
    let operatorCode = 0;
    for(let i = -4; i <= 146; i++){
      let BuiltinOperatorKey = circle.BuiltinOperator[i];
      if(BuiltinOperatorKey === undefined) continue;
      BuiltinOperatorKey = circle.BuiltinOperator[i].replace('_','');
      BuiltinOperatorKey = BuiltinOperatorKey.toUpperCase();
      if(BuiltinOperatorKey === inputTypeName){
        // enum_val을 찾았으면 입력
        operatorCode = i;
        break;
      }
    }
    
    const operator = this._Circle.subgraphs[subgraph_Idx].operators[Operator_Idx];
    // 커스텀이 아닌경우
    // builtinOptionsType 수정
    operator.builtinOptionsType = BuiltinOptionsType[inputTypeOptionName];
    if(operatorCode != 32){ // builtinOptions
      if(operator.builtinOptions === null) return "error";
      const key = InputjsonFile._attribute.name;
      const value : string = InputjsonFile._attribute._value;
      const type : string = InputjsonFile._attribute._type;
      // 해당 타입에 접근해서 enum 값을 뽑아와야한다.
      
      // 현재는 type변경 없다고 생각하고 구현
      if(this._NormalType[type]=== undefined){
        // Circle Type 참조
        console.log(operator.builtinOptions[key])
        operator.builtinOptions[key] = this._CircleType[type][value];
        console.log(operator.builtinOptions[key])
        console.log(typeof(operator.builtinOptions[key]))
      }
      else{
        // 보여주는 타입을 그대로 띄워줌
        console.log(operator.builtinOptions[key])
        operator.builtinOptions[key] = this._NormalType[type](value);
        console.log(operator.builtinOptions[key])
        console.log(typeof(operator.builtinOptions[key]))
      }
      
      // opCodeIndex 변경 (type변경이 없다고 가정하면 생략)
      // operatorCode가 127 미만인 경우 OperatorCode.deprecated_builtin_code와 builtin Code같이 변경
      // 127이상이면 deprecated : 127, builtinCode는 해당 번호
      





      // operatorCode가 현재 operator가 가리키는 operatorCodes와 동일하지 않다면
      // for문으로 동일한 code를 찾고
      // code가 존재하면 해당 번호로 이동
      // 없으면 새로 생성 후 해당 번호로 이동
      // 타입변경 있는 경우
      // if(operatorCode !== this._Circle.operatorCodes[operator.opcodeIndex]){
      //   let EditNum : number = -1;
      //   for(const data of this._Circle.operatorCodes){
      //     if(data.deprecatedBuiltinCode === operatorCode){
      //       EditNum = data.deprecatedBuiltinCode;
      //       break;
      //     }
      //     else if(data.builtinCode === operatorCode){
      //       EditNum = data.builtinCode;
      //       break;
      //     }
      //   }
      //   // 있는 경우
      //   if(EditNum !== -1){
      //     operator.opcodeIndex = EditNum;
      //   }
      //   // 없으면 operatorCodes에 추가
      //   else{
      //     const pushData = {
      //       "deprecatedBuiltinCode" : 0,
      //       "customCode": null,
      //       "version": 1,
      //       "builtinCode": 0
      //     };
      //     pushData.builtinCode = operatorCode;
      //     if(pushData.builtinCode >= 127){
      //       pushData.deprecatedBuiltinCode = 127;
      //     }
      //     else{
      //       pushData.deprecatedBuiltinCode = pushData.builtinCode;
      //     }
      //     this._Circle.operatorCodes.pushData(pushData);
      //     EditNum = this._Circle.operatorCodes.length-1;
      //   }
      // }
      
      

      
      // opcodeIdx에 있는 deprecated나 built_in코드랑 같은게 있다면
      // 먼저 해당 정보를 수정
      
    }
    // 커스텀인 경우 문자열로 받아온다.
 



    // Custom인 경우

    // Custom이 아닌 경우
    
    return "success"
  }

  private save(){
    // 수정이 끝났으면 binary로 저장
    // 수정 후 새 버퍼 생성
    let fbb = new flatbuffers.Builder(1024);

    // 새 버퍼에 수정한 object 저장
    circle.Model.finishModelBuffer(fbb,this._Circle.pack(fbb));

    // 바이너리 파일로 저장
    fs.writeFileSync(this._modelToLoad, fbb.asUint8Array(), 'binary');

    console.log("저장 끝")
  }
}
