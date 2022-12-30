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
import { Toolchain, ToolchainInfo } from "../../Backend/Toolchain";

suite("Backend", function () {
  suite("Toolchain", function () {
    const toolchainInfo = new ToolchainInfo("dummy", "dummy toolchain");

    suite("#constructor()", function () {
      test("Create dummy toolchain", function (pass) {
        assert.doesNotThrow(() => new Toolchain(toolchainInfo));

        pass();
        assert.ok(true);
      });
    });

    suite("#info", function () {
      test("Check dummy toolchain info", function () {
        const toolchain = new Toolchain(toolchainInfo);

        assert.strictEqual(toolchain.info.name, toolchainInfo.name);
        assert.strictEqual(
          toolchain.info.description,
          toolchainInfo.description
        );
      });
    });

    suite("#install()", function () {
      test("NEG: throws by dummy toolchain by install", function () {
        const toolchain = new Toolchain(toolchainInfo);
        assert.throw(() => toolchain.install());
      });
    });

    suite("#installed()", function () {
      test("NEG: throws in dummy toolchain by installed", function () {
        const toolchain = new Toolchain(toolchainInfo);
        assert.throw(() => toolchain.installed());
      });
    });

    suite("#run()", function () {
      test("NEG: throws in dummy toolchain by run", function () {
        const toolchain = new Toolchain(toolchainInfo);
        assert.throw(() => toolchain.run(""));
      });
    });

    suite("#uninstall()", function () {
      test("NEG: throws in dummy toolchain by uninstall", function () {
        const toolchain = new Toolchain(toolchainInfo);
        assert.throw(() => toolchain.uninstall());
      });
    });
  });
});
