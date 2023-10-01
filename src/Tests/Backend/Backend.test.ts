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

import { API, BackendMap, globalBackendMap } from "../../Backend/API";
import { gToolchainEnvMap } from "../../Toolchain/ToolchainEnv";
import { Backend } from "../../Backend/Backend";
import { Compiler, CompilerBase } from "../../Backend/Compiler";
import { Executor, ExecutorBase } from "../../Backend/Executor";
import { OneToolchain } from "../../Backend/One/OneToolchain";
import { EdgeTPUToolchain } from "../../Backend/EdgeTPU/EdgeTPUToolchain";

const oneBackendName = "ONE";
const edgeTPUBackendName = "EdgeTPU";

// TODO: Move it to Mockup
const backendName = "Mockup";
class BackendMockup implements Backend {
  name(): string {
    return backendName;
  }
  compiler(): Compiler | undefined {
    return new CompilerBase();
  }

  executor(): Executor | undefined {
    return new ExecutorBase();
  }
  executors(): Executor[] {
    const exec = this.executor();
    if (exec) {
      return [exec];
    }
    return [];
  }
}

const expectedGlobalBackendMap: BackendMap = {};
expectedGlobalBackendMap[oneBackendName] = new OneToolchain();
expectedGlobalBackendMap[edgeTPUBackendName] = new EdgeTPUToolchain();

suite("Backend", function () {
  suite("backendAPI", function () {
    test("registers a OneToolchain", function () {
      const entries = Object.entries(globalBackendMap);
      assert.strictEqual(entries.length, 2);

      assert.deepStrictEqual(globalBackendMap, expectedGlobalBackendMap);
    });
    test("registers a backend", function () {
      assert.strictEqual(Object.entries(globalBackendMap).length, 1);

      let backend = new BackendMockup();
      API.registerBackend(backend);

      const entries = Object.entries(globalBackendMap);
      assert.strictEqual(entries.length, 3);

      assert.deepStrictEqual(backend, globalBackendMap[backend.name()]);

      if (gToolchainEnvMap[backend.name()] !== undefined) {
        delete gToolchainEnvMap[backend.name()];
      }

      if (globalBackendMap[backend.name()] !== undefined) {
        delete globalBackendMap[backend.name()];
      }

      assert.isUndefined(gToolchainEnvMap[backend.name()]);
      assert.isUndefined(globalBackendMap[backend.name()]);
    });
  });
});
