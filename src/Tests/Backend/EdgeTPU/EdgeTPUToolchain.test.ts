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

import { assert } from "chai";

import {
  EdgeTPUDebianToolchain,
} from "../../../Backend/EdgeTPU/EdgeTPUToolchain";
import { ToolchainInfo } from "../../../Backend/Toolchain";
import { Version } from "../../../Backend/Version";
import { TestBuilder } from "../../TestBuilder";

const content = `
[onecc]
one-import-tf=False
one-import-tflite=False
one-import-bcq=False
one-import-onnx=False
one-optimize=False
one-quantize=True
one-pack=False
one-codegen=False

[one-quantize]
input_path=./inception_v3_tflite.circle
output_path=./inception_v3_tflite.q8.circle
input_model_dtype=uint8

[one-import-edgetpu]
input_path=/home/workspace/models/sample.tflite
output_path=/home/workspace/models/sample_edge_tpu.tflite
help=True
intermediate_tensors=tensorName1,tensorName2
show_operations=True
min_runtime_version=14
search_delegate=True
delegate_search_step=4
`;

suite("Backend", function () {
  suite("EdgeTPUDebianToolchain", function () {
    let testBuilder: TestBuilder;

    setup(() => {
      testBuilder = new TestBuilder(this);
      testBuilder.setUp();
    });

    teardown(() => {
      testBuilder.tearDown();
    });

    suite("#run", function () {
      test("returns Command with cfg", function () {
        testBuilder.writeFileSync("file.cfg", content);
        const cfgFilePath = testBuilder.getPath("file.cfg");

        const name = "EdgeTPU";
        const desc = "EdgeTPU Compiler";
        const version = new Version(0, 1, 0);
        const info = new ToolchainInfo(name, desc, version);
        let dt = new EdgeTPUDebianToolchain(info);
        let cmd = dt.run(cfgFilePath);
        
        const expectedStrs: string[] = ["edgetpu_compiler", "--out_dir", "/home/workspace/models/sample_edge_tpu.tflite", "--help",
          "--intermediate_tensors", "tensorName1,tensorName2", "--show_operations", "--min_runtime_version", "14", "--search_delegate", "--delegate_search_step",
          "4", "/home/workspace/models/sample.tflite"];

        assert.deepEqual(cmd, expectedStrs);
      });
    });
  });
});