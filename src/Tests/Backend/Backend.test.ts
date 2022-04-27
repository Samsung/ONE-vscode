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

import {Backend} from '../../Backend/API';
import {backendRegistrationApi, globalBackendMap} from '../../Backend/Backend';
import {Compiler, CompilerBase} from '../../Backend/Compiler';
import {Executor, ExecutorBase} from '../../Backend/Executor';

class BackendMockup implements Backend {
  name(): string {
    return 'Mockup';
  }
  compiler(): Compiler|undefined {
    return new CompilerBase();
  }

  executor(): Executor|undefined {
    return new ExecutorBase();
  }
};

suite('Backend', function() {
  suite('backendRegistrationApi', function() {
    test('registers a backend', function() {
      let registrationAPI = backendRegistrationApi();

      assert.strictEqual(Object.entries(globalBackendMap).length, 0);

      let backend = new BackendMockup();
      registrationAPI.registerBackend(backend);

      const entries = Object.entries(globalBackendMap);
      assert.strictEqual(entries.length, 1);
      // this runs once
      for (const [key, value] of entries) {
        assert.strictEqual(key, 'Mockup');
        assert.deepStrictEqual(value, backend);
      }
    });
  });
});
