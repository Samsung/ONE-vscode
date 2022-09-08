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
import {ExecutorBase} from '../../Backend/Executor';

suite('Backend', function() {
  suite('ExecutorBase', function() {
    suite('#constructor()', function() {
      test('Create dummy executor', function(pass) {
        assert.doesNotThrow(() => new ExecutorBase());

        pass();
        assert.ok(true);
      });
    });

    suite('#name()', function() {
      test('NEG: throws by dummy executor base by name', function() {
        const executor = new ExecutorBase();
        assert.throw(() => executor.name());
      });
    });

    suite('#getExecutableExt()', function() {
      test('NEG: throws in dummy executor base by getExecutableExt', function() {
        const executor = new ExecutorBase();
        assert.throw(() => executor.getExecutableExt());
      });
    });

    suite('#require()', function() {
      test('NEG: throws in dummy executor base by require', function() {
        const executor = new ExecutorBase();
        assert.throw(() => executor.require());
      });
    });

    suite('#runInference()', function() {
      test('NEG: throws in dummy executor base by runInference', function() {
        const executor = new ExecutorBase();
        assert.throw(() => executor.runInference(''));
      });
    });

    suite('#toolchains()', function() {
      test('NEG: throws in dummy executor base by toolchains', function() {
        const executor = new ExecutorBase();
        assert.throw(() => executor.toolchains());
      });
    });
  });
});
