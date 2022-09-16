"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
exports.__esModule = true;
var flatbuffers = require("flatbuffers");
var fs = require("fs");
var circle = require("./circle_schema_generated");
var bytes = new Uint8Array(fs.readFileSync('./test_onnx.circle'));
var buf = new flatbuffers.ByteBuffer(bytes);
var Circle = circle.Model.getRootAsModel(buf).unpack();
// Input Json 파일 받아오기 (GUI에서 Edit 수행 후 JSON으로 준다고 가정)
// EditTensor에 수정할 Tensor값 받아오는 과정
var InputjsonFile = require('./TensorExam.json');
// input부터
var InputTensor = InputjsonFile === null || InputjsonFile === void 0 ? void 0 : InputjsonFile._inputs;
//console.log(InputTensor)
for (var _i = 0, InputTensor_1 = InputTensor; _i < InputTensor_1.length; _i++) {
    var element = InputTensor_1[_i];
    // 정보 받아오기
    var name_1 = void 0;
    var subgraph_Idx = 0;
    var argname = void 0;
    var Tensor_Idx = void 0;
    var isVariable = false;
    var Tensor_Type = void 0;
    var Tensor_Shape = void 0;
    var Buffer_data = null;
    //console.log(element)
    name_1 = element === null || element === void 0 ? void 0 : element._name;
    if (((_a = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _a === void 0 ? void 0 : _a._initializer) === null) {
        argname = (_b = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _b === void 0 ? void 0 : _b._name;
        Tensor_Idx = Number((_c = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _c === void 0 ? void 0 : _c._location);
        Tensor_Type = (_e = (_d = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _d === void 0 ? void 0 : _d._type) === null || _e === void 0 ? void 0 : _e._dataType;
        Tensor_Shape = (_h = (_g = (_f = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _f === void 0 ? void 0 : _f._type) === null || _g === void 0 ? void 0 : _g._shape) === null || _h === void 0 ? void 0 : _h._dimensions;
    }
    else {
        var ini = (_j = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _j === void 0 ? void 0 : _j._initializer;
        argname = ini === null || ini === void 0 ? void 0 : ini._name;
        Tensor_Idx = Number(ini === null || ini === void 0 ? void 0 : ini._location);
        Tensor_Type = (_k = ini === null || ini === void 0 ? void 0 : ini._type) === null || _k === void 0 ? void 0 : _k._dataType;
        Tensor_Shape = (_l = ini === null || ini === void 0 ? void 0 : ini._type) === null || _l === void 0 ? void 0 : _l._shape._dimensions;
        if ((ini === null || ini === void 0 ? void 0 : ini._is_changed) === true) {
            Buffer_data = ini === null || ini === void 0 ? void 0 : ini._data;
        }
        isVariable = ini === null || ini === void 0 ? void 0 : ini._is_variable;
    }
    //enum화 시키기 위해서 대문자화 시켜야한다.
    Tensor_Type = Tensor_Type.toUpperCase();
    // 정보 갱신
    var EditTensor = (_m = Circle === null || Circle === void 0 ? void 0 : Circle.subgraphs[subgraph_Idx]) === null || _m === void 0 ? void 0 : _m.tensors[Tensor_Idx];
    EditTensor.name = argname;
    //type은 enum참조   
    var Tensor_Type_number = circle.TensorType[Tensor_Type];
    EditTensor.type = Tensor_Type_number;
    EditTensor.shape = Tensor_Shape;
    if (Buffer_data !== null) {
        // 버퍼 크기와 shape 크기가 다르면 에러 메시지를 보내주면 된다.
        var EditBuffer_Idx = EditTensor.buffer;
        Circle.buffers[EditBuffer_Idx].data = Buffer_data;
    }
}
;
// output
var OutputTensor = InputjsonFile === null || InputjsonFile === void 0 ? void 0 : InputjsonFile._outputs;
for (var _w = 0, OutputTensor_1 = OutputTensor; _w < OutputTensor_1.length; _w++) {
    var element = OutputTensor_1[_w];
    // 정보 받아오기
    var name_2 = void 0;
    var subgraph_Idx = 0;
    var argname = void 0;
    var Tensor_Idx = void 0;
    var Tensor_Type = void 0;
    var Tensor_Shape = void 0;
    name_2 = element === null || element === void 0 ? void 0 : element._name;
    argname = (_o = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _o === void 0 ? void 0 : _o._name;
    Tensor_Idx = Number((_p = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _p === void 0 ? void 0 : _p._location);
    Tensor_Type = (_r = (_q = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _q === void 0 ? void 0 : _q._type) === null || _r === void 0 ? void 0 : _r._dataType;
    Tensor_Shape = (_u = (_t = (_s = element === null || element === void 0 ? void 0 : element._arguments[0]) === null || _s === void 0 ? void 0 : _s._type) === null || _t === void 0 ? void 0 : _t._shape) === null || _u === void 0 ? void 0 : _u._dimensions;
    //enum화 시키기 위해서 대문자화 시켜야한다.
    Tensor_Type = Tensor_Type.toUpperCase();
    // 정보 갱신
    var EditTensor = (_v = Circle === null || Circle === void 0 ? void 0 : Circle.subgraphs[subgraph_Idx]) === null || _v === void 0 ? void 0 : _v.tensors[Tensor_Idx];
    EditTensor.name = argname;
    //type은 enum참조   
    var Tensor_Type_number = circle.TensorType[Tensor_Type];
    EditTensor.type = Tensor_Type_number;
    EditTensor.shape = Tensor_Shape;
}
;
// 수정이 끝났으면 binary로 저장
// 수정 후 새 버퍼 생성
var fbb = new flatbuffers.Builder(1024);
// 새 버퍼에 수정한 object 저장
circle.Model.finishModelBuffer(fbb, Circle.pack(fbb));
// 바이너리 파일로 저장
fs.writeFileSync('test.circle', fbb.asUint8Array(), 'binary');
