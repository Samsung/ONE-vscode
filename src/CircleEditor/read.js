"use strict";
exports.__esModule = true;
var flatbuffers = require("flatbuffers");
var fs = require("fs");
var circle = require("./circle_schema_generated");
var bytes = new Uint8Array(fs.readFileSync('./test.circle'));
var buf = new flatbuffers.ByteBuffer(bytes);
var Circle = circle.Model.getRootAsModel(buf).unpack();
var res = JSON.stringify(Circle);
// console.log(JSON.stringify(Circle));
// Json 파일로 저장
//fs.writeFileSync('test_onnx_deep_change_1.json', res)
fs.writeFileSync('test.json', res);
