import * as flatbuffers from 'flatbuffers';
import * as fs from "fs";
import * as circle from './circle_schema_generated';

let bytes = new Uint8Array(fs.readFileSync('./test.circle'));
let buf = new flatbuffers.ByteBuffer(bytes);

let Circle = circle.Model.getRootAsModel(buf).unpack();

const res = JSON.stringify(Circle);
// console.log(JSON.stringify(Circle));

// Json 파일로 저장
//fs.writeFileSync('test_onnx_deep_change_1.json', res)
fs.writeFileSync('test.json', res)
