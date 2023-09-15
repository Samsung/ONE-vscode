/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
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
  EdgeTPUCompiler,
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
intermediate_tensors=tensorName1,tensorName2
show_operations=True
min_runtime_version=14
search_delegate=True
delegate_search_step=4
`;

const relativeOutputPathcontent = `
[one-import-edgetpu]
input_path=./sample.tflite
output_path=./sample_edge_tpu.tflite
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

        const expectedStrs: string[] = [
          "edgetpu_compiler",
          "--out_dir",
          "/home/workspace/models",
          "--intermediate_tensors",
          "tensorName1,tensorName2",
          "--show_operations",
          "--min_runtime_version",
          "14",
          "--search_delegate",
          "--delegate_search_step",
          "4",
          "/home/workspace/models/sample.tflite",
        ];

        assert.deepEqual(cmd, expectedStrs);
      });

      test("returns Command with cfg containing relative input path", function () {
        testBuilder.writeFileSync("file.cfg", relativeOutputPathcontent);
        const cfgFilePath = testBuilder.getPath("file.cfg");

        const name = "EdgeTPU";
        const desc = "EdgeTPU Compiler";
        const version = new Version(0, 1, 0);
        const info = new ToolchainInfo(name, desc, version);
        let dt = new EdgeTPUDebianToolchain(info);
        let cmd = dt.run(cfgFilePath);

        const expectedStrs: string[] = [
          "edgetpu_compiler",
          "--out_dir",
          ".",
          "--intermediate_tensors",
          "tensorName1,tensorName2",
          "--show_operations",
          "--min_runtime_version",
          "14",
          "--search_delegate",
          "--delegate_search_step",
          "4",
          "./sample.tflite",
        ];

        assert.deepEqual(cmd, expectedStrs);
      });
    });
  });
});

suite("EdgeTPUCompiler", function () {
  suite("#parseVersion", function () {
    test("returns Version object from string version", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const version1 = edgeTPUCompiler.parseVersion("1.0.2~RC0");
      const version2 = new Version(1, 0, 2, "~RC0");
      assert.deepEqual(version1, version2);
    });
    test("returns Version object from string version without patch and option", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const version1 = edgeTPUCompiler.parseVersion("16.0");
      const version2 = new Version(16, 0);
      assert.deepEqual(version1, version2);
    });
    test("returns Version object from string version without option", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const version1 = edgeTPUCompiler.parseVersion("2.1.302470888");
      const version2 = new Version(2, 1, 302470888);
      assert.deepEqual(version1, version2);
    });
    test("returns Version object from string version without patch", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const version1 = edgeTPUCompiler.parseVersion("1.0-beta");
      const version2 = new Version(1, 0, 0, "-beta");
      assert.deepEqual(version1, version2);
    });
    test("NEG: check invalid version format without numbers", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      assert.throws(() => edgeTPUCompiler.parseVersion("a.b.c"));
    });
    test("NEG: check invalid version format with too many numbers", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      assert.throws(() => edgeTPUCompiler.parseVersion("1.2.3.4"));
    });
    test("NEG: check invalid version format with empty string", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      assert.throws(() => edgeTPUCompiler.parseVersion(""));
    });
  });
});
