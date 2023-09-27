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
import { Compiler, CompilerBase } from "../../Backend/Compiler";
import { Executor, ExecutorBase } from "../../Backend/Executor";
import { OneToolchain } from "../../Backend/One/OneToolchain";
import { gToolchainEnvMap } from "../../Toolchain/ToolchainEnv";

const oneBackendName = "ONE";

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

suite("Backend", function () {
  setup(function () {
    // TODO: provide delete function for backend, which recursively deleting toolchain and executors
    Object.keys(globalBackendMap).forEach(
      (key) => delete globalBackendMap[key]
    );
    Object.keys(gToolchainEnvMap).forEach(
      (key) => delete gToolchainEnvMap[key]
    );
  });

  suite("backendAPI", function () {
    test("registers a OneToolchain", function () {
      let oneBackend = new OneToolchain();
      API.registerBackend(oneBackend);

      const entries = Object.entries(globalBackendMap);
      assert.strictEqual(entries.length, 1);

      // this runs once
      for (const [key, value] of entries) {
        assert.strictEqual(key, oneBackendName);
        assert.deepStrictEqual(value, oneBackend);
      }
    });

    test("registers a backend", function () {
      let backend = new BackendMockup();
      API.registerBackend(backend);

      const entries = Object.entries(globalBackendMap);
      assert.strictEqual(entries.length, 1);

      // this runs once
      for (const [key, value] of entries) {
        assert.strictEqual(key, backendName);
        assert.deepStrictEqual(value, backend);
      }
    });
  });

  teardown(function () {
    // TODO: provide delete function for backend, which recursively deleting toolchain and executors
    Object.keys(globalBackendMap).forEach(
      (key) => delete globalBackendMap[key]
    );
    Object.keys(gToolchainEnvMap).forEach(
      (key) => delete gToolchainEnvMap[key]
    );
  });
});
