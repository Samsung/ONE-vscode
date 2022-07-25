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

import {assert} from 'chai';

import {backendRegistrationApi, globalBackendMap, globalExecutorArray} from '../../Backend/API';
import {Backend} from '../../Backend/Backend';
import {Compiler, CompilerBase} from '../../Backend/Compiler';
import {Executor, ExecutorBase} from '../../Backend/Executor';
import {gToolchainEnvMap} from '../../Toolchain/ToolchainEnv';

// TODO: Move it to Mockup
const backendName = 'Mockup';
class BackendMockup implements Backend {
  executor: ExecutorMockup;
  constructor(executor: ExecutorMockup) {
    this.executor = executor;
  }
  name(): string {
    return backendName;
  }
  compiler(): Compiler|undefined {
    return new CompilerBase();
  }

  executors(): Executor[]|undefined {
    return [this.executor];
  }
}

const executorName = 'Mockup';
class ExecutorMockup extends ExecutorBase {
  name(): string {
    return executorName;
  }
}

suite('Backend', function() {
  suite('backendRegistrationApi', function() {
    test('registers a backend', function() {
      let registrationAPI = backendRegistrationApi();

      assert.strictEqual(Object.entries(globalBackendMap).length, 0);
      assert.strictEqual(globalExecutorArray.length, 0);

      let executor = new ExecutorMockup();
      let backend = new BackendMockup(executor);
      registrationAPI.registerBackend(backend);

      const entries = Object.entries(globalBackendMap);
      assert.strictEqual(entries.length, 1);
      // this runs once
      for (const [key, value] of entries) {
        assert.strictEqual(key, backendName);
        assert.deepStrictEqual(value, backend);
      }
      assert.strictEqual(globalExecutorArray.length, 1);
      assert.strictEqual(globalExecutorArray[0], executor);
    });
  });

  teardown(function() {
    if (globalBackendMap[backendName] !== undefined) {
      delete globalBackendMap[backendName];
    }
    if (gToolchainEnvMap[backendName] !== undefined) {
      delete gToolchainEnvMap[backendName];
    }
    while (globalExecutorArray.length > 0) {
      globalExecutorArray.pop();
    }
  });
});
