import * as flatbuffers from 'flatbuffers';
import * as fs from "fs";
import * as circle from './circle_schema_generated';



function TensorChange(msg : string){
    let bytes = new Uint8Array(fs.readFileSync('./test_onnx.circle'));
    let buf = new flatbuffers.ByteBuffer(bytes);

    let Circle = circle.Model.getRootAsModel(buf).unpack();

    // Input Json 파일 받아오기 (GUI에서 Edit 수행 후 JSON으로 준다고 가정)
    // EditTensor에 수정할 Tensor값 받아오는 과정
    console.log(msg);
    //const InputjsonFile = require('./TensorExam.json')
    const InputjsonFile = JSON.parse(msg);
    // input부터
    const InputTensor = InputjsonFile?._inputs;

    for (const element of InputTensor) {
        // 정보 받아오기
        let name;
        let subgraph_Idx : number = 0 ;
        let argname : string;
        let Tensor_Idx : number;
        let isVariable : boolean= false;
        let Tensor_Type;
        let Tensor_Shape;
        let Buffer_data = null;

        name = element?._name;
        if(element?._arguments[0]?._initializer === null){
            argname = element?._arguments[0]?._name;
            Tensor_Idx = Number(element?._arguments[0]?._location);
            Tensor_Type = element?._arguments[0]?._type?._dataType;
            Tensor_Shape = element?._arguments[0]?._type?._shape?._dimensions;
        }
        else{
            let ini = element?._arguments[0]?._initializer;
            argname = ini?._name;
            Tensor_Idx = Number(ini?._location);
            Tensor_Type = ini?._type?._dataType;
            Tensor_Shape = ini?._type?._shape._dimensions;
            if(ini?._is_changed === true){
                Buffer_data = ini?._data;
            }
            isVariable = ini?._is_variable;
        }
        //enum화 시키기 위해서 대문자화 시켜야한다.
        Tensor_Type = Tensor_Type.toUpperCase();

        // 정보 갱신
        const EditTensor = Circle?.subgraphs[subgraph_Idx]?.tensors[Tensor_Idx];
        EditTensor.name = argname;
        //type은 enum참조   
        let Tensor_Type_number : any = circle.TensorType[Tensor_Type];
        EditTensor.type = Tensor_Type_number;
        EditTensor.shape = Tensor_Shape;
        if(Buffer_data !== null){
            // 버퍼 크기와 shape 크기가 다르면 에러 메시지를 보내주면 된다.
            const EditBuffer_Idx : number = EditTensor.buffer;
            Circle.buffers[EditBuffer_Idx].data = Buffer_data;
            return "error";
        }
    };

    // output
    const OutputTensor = InputjsonFile?._outputs;
    for (const element of OutputTensor) {
        // 정보 받아오기
        let name;
        let subgraph_Idx : number = 0 ;
        let argname : string;
        let Tensor_Idx : number;
        let Tensor_Type;
        let Tensor_Shape;
        name = element?._name;
        
        argname = element?._arguments[0]?._name;
        Tensor_Idx = Number(element?._arguments[0]?._location);
        Tensor_Type = element?._arguments[0]?._type?._dataType;
        Tensor_Shape = element?._arguments[0]?._type?._shape?._dimensions;
        
        //enum화 시키기 위해서 대문자화 시켜야한다.
        Tensor_Type = Tensor_Type.toUpperCase();

        // 정보 갱신
        const EditTensor = Circle?.subgraphs[subgraph_Idx]?.tensors[Tensor_Idx];
        EditTensor.name = argname;
        //type은 enum참조   
        let Tensor_Type_number : any = circle.TensorType[Tensor_Type];
        EditTensor.type = Tensor_Type_number;
        EditTensor.shape = Tensor_Shape;

    };

    // 수정이 끝났으면 binary로 저장
    // 수정 후 새 버퍼 생성
    let fbb = new flatbuffers.Builder(1024);

    // 새 버퍼에 수정한 object 저장
    circle.Model.finishModelBuffer(fbb,Circle.pack(fbb));

    // 바이너리 파일로 저장
    fs.writeFileSync('test.circle', fbb.asUint8Array(), 'binary');
    return "success";
}