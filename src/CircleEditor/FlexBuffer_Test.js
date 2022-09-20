"use strict";
exports.__esModule = true;
var flexbuffers = require("flatbuffers/js/flexbuffers");
// let customOptions : [
//     97, 100, 106, 95, 120, 0, 97, 100, 106, 95, 121, 0, 84, 0, 3, 3, 16,
//     11, 3, 1, 3, 0, 1, 0, 4, 104, 104, 6, 36, 1
//   ];
var fbb = flexbuffers.builder();
fbb.startMap();
fbb.addKey("adj_x");
fbb.add(true);
fbb.addKey("adj_y");
fbb.add(false);
fbb.addKey("T");
fbb.add(0);
fbb.end();
var result = fbb.finish();
console.log(result);
var ans = flexbuffers.toObject(result.buffer);
console.log(ans);
