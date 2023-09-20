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
import * as vscode from "vscode";

import {
  OneBackend,
  OneDebianToolchain,
  OneToolchainManager,
} from "../../../Backend/One/OneToolchain";
import { ToolchainInfo } from "../../../Backend/Toolchain";
import { Version } from "../../../Backend/Version";

const oneBackendName = "ONE";

suite("Backend", function () {
  suite("OneDebianToolchain", function () {
    suite("#run", function () {
      test("returns Commend with cfg", function () {
        const name = "onecc-docker";
        const desc = "On-device Neural Engine docker package";
        const version = new Version(0, 1, 0, "-0~202209280519~ubuntu18.04.1");
        const info = new ToolchainInfo(name, desc, version);
        let dt = new OneDebianToolchain(info);
        let cmd = dt.run("file.cfg");
        assert.strictEqual(cmd.length, 3);
        assert.deepStrictEqual(cmd[0], "onecc-docker");
        assert.deepStrictEqual(cmd[1], "-C");
        assert.deepStrictEqual(cmd[2], "file.cfg");
      });
    });
  });
});

suite("OneBackend", function () {
  suite("#constructor()", function () {
    test("Create OneBackend", function () {
      assert.doesNotThrow(() => new OneBackend());
    });
    test("name", function () {
      const oneBackend = new OneBackend();
      assert.strictEqual(oneBackend.name(), oneBackendName);
    });
  });

  suite("#toolchainManager()", function () {
    test("returns OneBackend's toolchainManager", function () {
      const oneBackend = new OneBackend();
      const toolchainManager = oneBackend.toolchainManager();
      assert.instanceOf(toolchainManager, OneToolchainManager);
    });
  });

  suite("#supportCompiler()", function () {
    test("supportCompiler", function () {
      const oneBackend = new OneBackend();
      assert.equal(oneBackend.supportCompiler(), true);
    });
  });

  suite("#supportExecutor()", function () {
    test("supportExecutor", function () {
      const oneBackend = new OneBackend();
      assert.equal(oneBackend.supportExecutor(), false);
    });
  });
});

suite("OneBackend ToolchainManager", function () {
  const oneBackend = new OneBackend();
  const toolchainManager = oneBackend.toolchainManager() as OneToolchainManager;

  suite("#getToolchainTypes", function () {
    test("returns OneBackend's type", function () {
      const toolchainTypes = toolchainManager.getToolchainTypes();
      assert.deepEqual(toolchainTypes, ["latest"]);
    });
  });

  suite("#parseVersion", function () {
    test("returns Version object from string version", function () {
      const version1 = toolchainManager.parseVersion("1.0.2~RC0");
      const version2 = new Version(1, 0, 2, "~RC0");
      assert.deepEqual(version1, version2);
    });
    test("returns Version object from string version only with major", function () {
      const version1 = toolchainManager.parseVersion("1");
      const version2 = new Version(1, 0, 0);
      assert.deepEqual(version1, version2);
    });
    test("returns Version object from string version without patch and option", function () {
      const version1 = toolchainManager.parseVersion("1.0");
      const version2 = new Version(1, 0, 0);
      assert.deepEqual(version1, version2);
    });
    test("returns Version object from string version without option", function () {
      const version1 = toolchainManager.parseVersion("1.0.2");
      const version2 = new Version(1, 0, 2);
      assert.deepEqual(version1, version2);
    });
    test("returns Version object from string version without minor", function () {
      const version1 = toolchainManager.parseVersion("1.0-beta");
      const version2 = new Version(1, 0, 0, "-beta");
      assert.deepEqual(version1, version2);
    });
    test("NEG: check invalid version format without numbers", function () {
      assert.throws(() => toolchainManager.parseVersion("a.b.c"));
    });
    test("NEG: check invalid version format with too many numbers", function () {
      assert.throws(() => toolchainManager.parseVersion("1.2.3.4"));
    });
    test("NEG: check invalid version format with empty string", function () {
      assert.throws(() => toolchainManager.parseVersion(""));
    });
  });

  suite("#getToolchains", function () {
    test("get toolchain list", function () {
      // No positive test for get toolchain list
      // To test this test case, prerequisites() function should be run first.
      // However this function needs root permission so it couldn't be executed.
      assert.isDefined(toolchainManager.getToolchains);
    });

    test("return empty toolchain array when count is 0", function () {
      const toolchainType = "latest";
      const start = 0;
      const count = 0;
      assert.deepStrictEqual(
        toolchainManager.getToolchains(toolchainType, start, count),
        []
      );
    });

    test("NEG: request wrong toolchain type", function () {
      const dummyToolchainType = "dummy";
      const start = 0;
      const count = 1;
      assert.throws(() =>
        toolchainManager.getToolchains(dummyToolchainType, start, count)
      );
    });

    test("NEG: request wrong start number", function () {
      const toolchainType = "latest";
      const start = -1;
      const count = 1;
      assert.throws(() =>
        toolchainManager.getToolchains(toolchainType, start, count)
      );
    });

    test("NEG: request wrong count number", function () {
      const toolchainType = "latest";
      const start = 0;
      const count = -1;
      assert.throws(() =>
        toolchainManager.getToolchains(toolchainType, start, count)
      );
    });
  });

  suite("#getInstalledToolchains", function () {
    test("get toolchain list", function () {
      // No positive test for get toolchain list
      // To test this test case, prerequisites() function should be run first.
      // However this function needs root permission so it couldn't be executed.
      assert.isDefined(toolchainManager.getInstalledToolchains);
    });

    test("NEG: request wrong toolchain type", function () {
      const dummyToolchainType = "dummy";
      assert.throws(() =>
        toolchainManager.getInstalledToolchains(dummyToolchainType)
      );
    });
  });

  suite("#prerequisitesForGetToolchains", function () {
    test("returns a command which executes a shell script for prerequisites", function () {
      const extensionId = "Samsung.one-vscode";
      const ext = vscode.extensions.getExtension(
        extensionId
      ) as vscode.Extension<any>;
      const scriptPath = vscode.Uri.joinPath(
        ext!.extensionUri,
        "script",
        "prerequisitesForGetToolchains.sh"
      ).fsPath;
      const cmd = `sudo /bin/sh ${scriptPath}`;
      assert.deepStrictEqual(
        toolchainManager.prerequisitesForGetToolchains().str(),
        cmd
      );
    });
  });
});
