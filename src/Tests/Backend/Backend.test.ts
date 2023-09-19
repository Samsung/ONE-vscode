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

import { API, globalBackendMap } from "../../Backend/API";
import { Backend } from "../../Backend/Backend";
import { OneBackend } from "../../Backend/One/OneToolchain";
import { gToolchainEnvMap } from "../../Toolchain/ToolchainEnv";
import { ToolchainManager } from "../../Backend/ToolchainManager";
import { Command } from "../../Backend/Command";
import { Toolchains } from "../../Backend/Toolchain";

const oneBackendName = "ONE";

// TODO: Move it to Mockup
const backendName = "Mockup";

class MockToolchainManager implements ToolchainManager {
  getToolchainTypes(): string[] {
    throw new Error("Method not implemented.");
  }
  getToolchains(
    _toolchainType: string,
    _start: number,
    _count: number
  ): Toolchains {
    throw new Error("Method not implemented.");
  }
  getInstalledToolchains(_toolchainType: string): Toolchains {
    throw new Error("Method not implemented.");
  }
  prerequisitesForGetToolchains(): Command {
    throw new Error("Method not implemented.");
  }
}

class BackendMockup implements Backend {
  name(): string {
    return backendName;
  }
  toolchainManager(): ToolchainManager {
    return new MockToolchainManager();
  }
  supportCompiler(): boolean {
    return true;
  }
  supportExecutor(): boolean {
    return true;
  }
}

suite("Backend", function () {
  suite("backendAPI", function () {
    test("registers a OneToolchain", function () {
      let oneBackend = new OneBackend();
      assert.strictEqual(Object.entries(globalBackendMap).length, 1);

      const entries = Object.entries(globalBackendMap);
      assert.strictEqual(entries.length, 1);
      // this runs once
      for (const [key, value] of entries) {
        assert.strictEqual(key, oneBackendName);
        assert.deepStrictEqual(value, oneBackend);
      }
    });
    test("registers a backend", function () {
      assert.strictEqual(Object.entries(globalBackendMap).length, 1);

      let backend = new BackendMockup();
      API.registerBackend(backend);

      const entries = Object.entries(globalBackendMap);
      assert.strictEqual(entries.length, 2);

      // this runs once
      for (const [key, value] of entries) {
        if (key !== oneBackendName) {
          assert.strictEqual(key, backendName);
          assert.deepStrictEqual(value, backend);
        }
      }
    });
  });

  teardown(function () {
    if (globalBackendMap[backendName] !== undefined) {
      delete globalBackendMap[backendName];
    }
    if (gToolchainEnvMap[backendName] !== undefined) {
      delete gToolchainEnvMap[backendName];
    }
  });
});
