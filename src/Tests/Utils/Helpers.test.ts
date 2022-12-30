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
import vscode from "vscode";

import {
  isOneExplorerTargetFile,
  obtainWorkspaceRoot,
  RealPath,
} from "../../Utils/Helpers";

suite("Utils", function () {
  suite("Helpers", function () {
    suite("#obtainWorkspaceRoot()", function () {
      test("returns workspaceRoot as string", function () {
        const workspaceRoot: string = obtainWorkspaceRoot();
        assert.isNotNull(workspaceRoot);
        assert.isString(workspaceRoot);
      });
    });

    suite("#createRealPath()", function () {
      test("create RealPath of system root directory", function () {
        let realPath = RealPath.createRealPath("/");
        assert.isObject<RealPath>(realPath!);
      });

      test("NEG: return null when path not exists", function () {
        let realPath = RealPath.createRealPath("/dummy/not/exists/here");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from root - 1", function () {
        let realPath = RealPath.createRealPath("/../dummy/");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from root - 2", function () {
        let realPath = RealPath.createRealPath("/../dummy/../dummy");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from root - 3", function () {
        let realPath = RealPath.createRealPath("/../dummy/.");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from root - 4", function () {
        let realPath = RealPath.createRealPath("/../../dummy/.");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from root - 5", function () {
        let realPath = RealPath.createRealPath("/../dummy/./.");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from home - 1", function () {
        let realPath = RealPath.createRealPath("~/../dummy/");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from home - 2", function () {
        let realPath = RealPath.createRealPath("~/../dummy/../dummy");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from home - 3", function () {
        let realPath = RealPath.createRealPath("~/../dummy/.");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from home - 4", function () {
        let realPath = RealPath.createRealPath("~/../../dummy/.");
        assert.isNull(realPath);
      });

      test("NEG: cannot create when rawpath includes invalid path from home - 5", function () {
        let realPath = RealPath.createRealPath("~/../dummy/./.");
        assert.isNull(realPath);
      });
    });

    suite("#equal()", function () {
      test("compare practically the same paths", function () {
        const workspaceRoot = obtainWorkspaceRoot();
        let realPath0 = RealPath.createRealPath(`${workspaceRoot}`);
        let realPath1 = RealPath.createRealPath(`${workspaceRoot}/dummy/..`);

        assert.isNotNull(realPath0);
        assert.isNotNull(realPath1);
        assert.isTrue(realPath0?.equal(realPath1!));
      });
    });

    suite("#areEqual()", function () {
      test("compare same paths", function () {
        assert.isTrue(RealPath.areEqual("/", "/"));
        assert.isTrue(RealPath.areEqual("/", "/dummy/.."));
      });

      test("NEG: compare not creatable paths from root - 1", function () {
        assert.isFalse(RealPath.areEqual("/dummy", "/dummy"));
      });

      test("NEG: compare not creatable paths from root - 2", function () {
        assert.isFalse(RealPath.areEqual("/dummy", "/dummy/../dummy"));
      });

      test("NEG: compare not creatable paths from root - 3", function () {
        assert.isFalse(RealPath.areEqual("/dummy", "/../dummy"));
      });

      test("NEG: compare not creatable paths from root - 4", function () {
        assert.isFalse(RealPath.areEqual("/dummy", "/./../dummy"));
      });

      test("NEG: compare not creatable paths from root - 5", function () {
        assert.isFalse(RealPath.areEqual("/dummy", "/./../dummy/./"));
      });

      test("NEG: compare not creatable paths from home - 1", function () {
        assert.isFalse(RealPath.areEqual("~/dummy", "~/dummy"));
      });

      test("NEG: compare not creatable paths from home - 2", function () {
        assert.isFalse(RealPath.areEqual("~/dummy", "~/dummy/../dummy"));
      });

      test("NEG: compare not creatable paths from home - 3", function () {
        assert.isFalse(RealPath.areEqual("~/dummy", "~/../dummy"));
      });

      test("NEG: compare not creatable paths from home - 4", function () {
        assert.isFalse(RealPath.areEqual("~/dummy", "~/./../dummy"));
      });

      test("NEG: compare not creatable paths from home - 5", function () {
        assert.isFalse(RealPath.areEqual("~/dummy", "~/./../dummy/./"));
      });
    });

    suite("#exists()", function () {
      test("check if the path exists", function () {
        assert.isFalse(RealPath.exists(undefined));
        assert.isFalse(RealPath.exists("/dummy/not/exist"));
        assert.isTrue(RealPath.exists("/"));
      });
    });

    suite("#isOneExplorerTargetFile()", function () {
      test("check if it is target file of OneExplorer", function () {
        assert.isTrue(isOneExplorerTargetFile(vscode.Uri.file("test.pb")));
        assert.isTrue(isOneExplorerTargetFile(vscode.Uri.file("test.onnx")));
        assert.isTrue(isOneExplorerTargetFile(vscode.Uri.file("test.tflite")));
        assert.isTrue(isOneExplorerTargetFile(vscode.Uri.file("test.circle")));
        assert.isTrue(isOneExplorerTargetFile(vscode.Uri.file("test.cfg")));
        assert.isTrue(isOneExplorerTargetFile(vscode.Uri.file("test.log")));
        assert.isFalse(isOneExplorerTargetFile(vscode.Uri.file("test.any")));
      });
      test("NEG: check empty path", function () {
        assert.isFalse(isOneExplorerTargetFile(vscode.Uri.file("")));
      });
      test("NEG: check directory", function () {
        assert.isFalse(isOneExplorerTargetFile(vscode.Uri.file(".onnx/")));
      });
      test("NEG: check a file without ext", function () {
        assert.isFalse(isOneExplorerTargetFile(vscode.Uri.file("onnx")));
      });
    });
  });
});
