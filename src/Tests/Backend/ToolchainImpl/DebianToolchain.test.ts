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

import { ToolchainInfo } from "../../../Backend/Toolchain";
import {
  DebianArch,
  DebianRepo,
  DebianTool,
  DebianToolchain,
} from "../../../Backend/ToolchainImpl/DebianToolchain";
import { Version } from "../../../Backend/Version";

// NOTE
// The current ci of ONE-vscode is using the only ubuntu-20.04
// The tests are fitting its env
suite("Backend", function () {
  suite("ToolchainImpl", function () {
    suite("DebianTool", function () {
      // for Toolchain
      // Let's use `npm`
      const name = "npm";
      const desc = "npm toolchain";
      const version = new Version(6, 14, 4, "+ds-1ubuntu2");
      const info = new ToolchainInfo(name, desc, version);

      suite("#constructor()", function () {
        test("is contructed with values", function () {
          const uri = "http://archive.ubuntu.com/ubuntu";
          const dist = "foscal";
          const comp = "universe";
          const repo = new DebianRepo(uri, dist, comp);
          const arch = DebianArch.amd64;
          let dt = new DebianTool(info, repo, arch);
          assert.strictEqual(dt.info, info);
          assert.strictEqual(dt.repo, repo);
          assert.strictEqual(dt.arch, arch);
        });
      });

      suite("#install()", function () {
        test("Check install command", function () {
          let dt = new DebianTool(info);
          let cmd = dt.install();
          const expectedStr = `sudo aptitude install -o Aptitude::ProblemResolver::SolutionCost=100*canceled-actions,200*removals ${name}=${version.str()} -q -y`;
          assert.strictEqual(cmd.str(), expectedStr);
        });
      });

      suite("#uninstall()", function () {
        test("Check uninstall command", function () {
          let dt = new DebianTool(info);
          let cmd = dt.uninstall();
          const expectedStr = `sudo aptitude purge ${name} -q -y`;
          assert.strictEqual(cmd.str(), expectedStr);
        });
      });

      suite("#installed()", function () {
        test("Check installed command", function () {
          let dt = new DebianTool(info);
          let cmd = dt.installed();
          const expectedStr = `dpkg-query --show ${name}=${version.str()} && echo $?`;
          assert.strictEqual(cmd.str(), expectedStr);
        });
      });
    });

    suite("DebianToolchain", function () {
      // for Toolchain
      // Let's use `npm`
      const name = "npm";
      const desc = "npm toolchain";
      const version = new Version(6, 14, 4, "+ds-1ubuntu2");
      const info = new ToolchainInfo(name, desc, version);

      suite("#constructor()", function () {
        test("is contructed with values", function () {
          let dt = new DebianToolchain(info);
          assert.strictEqual(dt.info, info);
          assert.strictEqual(dt.tool.info, info);
        });
      });

      suite("#run()", function () {
        test("returns Commend with cfg", function () {
          let dt = new DebianToolchain(info);
          let cmd = dt.run("file.cfg");
          assert.strictEqual(cmd.length, 3);
          assert.deepStrictEqual(cmd[0], "onecc");
          assert.deepStrictEqual(cmd[1], "--config");
          assert.deepStrictEqual(cmd[2], "file.cfg");
        });
      });

      suite("#runInference()", function () {
        test("NEG: throws by dummy toolchain by runInference", function () {
          const toolchain = new DebianToolchain(info);
          assert.throw(() => toolchain.runInference(""));
        });
      });

      suite("#runProfile()", function () {
        test("NEG: throws in dummy toolchain by runProfile", function () {
          const toolchain = new DebianToolchain(info);
          assert.throw(() => toolchain.runProfile(""));
        });
      });

      suite("#runShow()", function () {
        test("NEG: throws in dummy toolchain by runShow", function () {
          const toolchain = new DebianToolchain(info);
          assert.throw(() => toolchain.runShow("", ""));
        });
      });
    });
  });
});
