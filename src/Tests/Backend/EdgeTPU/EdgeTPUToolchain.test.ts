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

import { EdgeTPUDebianToolchain } from "../../../Backend/EdgeTPU/EdgeTPUToolchain";
import { ToolchainInfo } from "../../../Backend/Toolchain";
import { Version } from "../../../Backend/Version";
import { TestBuilder } from "../../TestBuilder";

const content = `
[edgetpu-compile]
input_path=/home/workspace/models/sample.tflite
output_path=/home/workspace/models/sample_edge_tpu.tflite
intermediate_tensors=tensorName1,tensorName2
show_operations=True
min_runtime_version=14
search_delegate=True
delegate_search_step=4
`;

const relativeOutputPathcontent = `
[edgetpu-compile]
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
