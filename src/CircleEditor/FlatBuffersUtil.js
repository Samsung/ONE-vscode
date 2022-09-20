"use strict";
exports.__esModule = true;
exports.FlatBuffersUtil = void 0;
var flatbuffers = require("flatbuffers");
var Circle = require("./circle_schema_generated");
var fs = require("fs");
var FlatBuffersUtil = /** @class */ (function () {
    function FlatBuffersUtil(bytes) {
        this.ModelObj = this.loadModel(bytes);
    }
    FlatBuffersUtil.getFlatBuffersUtil = function (bytes) {
        if (this.Util != null) {
            return this.Util;
        }
        return new FlatBuffersUtil(bytes);
    };
    FlatBuffersUtil.prototype.loadModel = function (bytes) {
        //let bytes = new Uint8Array(await vscode.workspace.fs.readFile(uri));
        var buf = new flatbuffers.ByteBuffer(bytes);
        this.ModelObj = Circle.Model.getRootAsModel(buf).unpack();
        return this.ModelObj;
    };
    FlatBuffersUtil.prototype.saveModel = function () {
        var fbb = new flatbuffers.Builder(1024);
        Circle.Model.finishModelBuffer(fbb, this.ModelObj.pack(fbb));
        fs.writeFileSync('circleTest.circle', fbb.asUint8Array(), 'binary');
        return this.ModelObj;
    };
    return FlatBuffersUtil;
}());
exports.FlatBuffersUtil = FlatBuffersUtil;
