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
import * as vscode from "vscode";

import {
  EdgeTPUCompiler,
  EdgeTPUDebianToolchain,
} from "../../../Backend/EdgeTPU/EdgeTPUToolchain";
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

suite("EdgeTPUCompiler", function () {
  suite("#constructor()", function () {
    test("Create EdgeTPUToolchain compiler", function (pass) {
      assert.doesNotThrow(() => new EdgeTPUCompiler());

      pass();
      assert.ok(true);
    });
  });

  suite("#getToolchainTypes", function () {
    test("returns EdgeTPUCompiler's type", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const toolchainTypes = edgeTPUCompiler.getToolchainTypes();
      assert.deepEqual(toolchainTypes, ["latest"]);
    });
  });

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
      const version2 = new Version(16, 0, undefined);
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

  suite("#getToolchains", function () {
    test("get toolchain list", function () {
      // No positive test for get toolchain list
      // To test this test case, prerequisites() function should be run first.
      // However this function needs root permission so it couldn't be executed.
      const edgeTPUCompiler = new EdgeTPUCompiler();
      assert.isDefined(edgeTPUCompiler.getToolchainTypes);
    });

    test("return empty toolchain array when count is 0", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const toolchainType = "latest";
      const start = 0;
      const count = 0;
      assert.deepStrictEqual(
        edgeTPUCompiler.getToolchains(toolchainType, start, count),
        []
      );
    });

    test("NEG: request wrong toolchain type", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const dummyToolchainType = "dummy";
      const start = 0;
      const count = 1;
      assert.throws(() =>
        edgeTPUCompiler.getToolchains(dummyToolchainType, start, count)
      );
    });

    test("NEG: request wrong start number", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const toolchainType = "latest";
      const start = -1;
      const count = 1;
      assert.throws(() =>
        edgeTPUCompiler.getToolchains(toolchainType, start, count)
      );
    });

    test("NEG: request wrong count number", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const toolchainType = "latest";
      const start = 0;
      const count = -1;
      assert.throws(() =>
        edgeTPUCompiler.getToolchains(toolchainType, start, count)
      );
    });
  });

  suite("#getInstalledToolchains", function () {
    test("get toolchain list", function () {
      // No positive test for get toolchain list
      // To test this test case, prerequisites() function should be run first.
      // However this function needs root permission so it couldn't be executed.
      const edgeTPUCompiler = new EdgeTPUCompiler();
      assert.isDefined(edgeTPUCompiler.getInstalledToolchains);
    });

    test("NEG: request wrong toolchain type", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const dummyToolchainType = "dummy";
      assert.throws(() =>
        edgeTPUCompiler.getInstalledToolchains(dummyToolchainType)
      );
    });
  });

  suite("#prerequisitesForGetToolchains", function () {
    test("returns a command which executes a shell script for prerequisites", function () {
      const edgeTPUCompiler = new EdgeTPUCompiler();
      const extensionId = "Samsung.one-vscode";
      const ext = vscode.extensions.getExtension(
        extensionId
      ) as vscode.Extension<any>;
      const scriptPath = vscode.Uri.joinPath(
        ext!.extensionUri,
        "script",
        "prerequisitesForGetEdgeTPUToolchain.sh"
      ).fsPath;
      const cmd = `sudo /bin/sh ${scriptPath}`;
      assert.deepStrictEqual(
        edgeTPUCompiler.prerequisitesForGetToolchains().str(),
        cmd
      );
    });
  });
});
