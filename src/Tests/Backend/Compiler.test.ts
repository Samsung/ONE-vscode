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
import {CompilerBase} from '../../Backend/Compiler';

suite('Backend', function() {
  suite('CompilerBase', function() {
    suite('#constructor()', function() {
      test('Create dummy compiler', function(pass) {
        const compiler = new CompilerBase();

        pass();
        assert.ok(true);
      });
    });

    suite('#getInstalledToolchains()', function() {
      test('NEG: throw in dummy compiler base by getInstalledToolchains', function() {
        const compiler = new CompilerBase();
        assert.throw(() => compiler.getInstalledToolchains(''));
      });
    });

    suite('#getToolchainTypes()', function() {
      test('NEG: throw in dummy compiler base by getToolchainTypes', function() {
        const compiler = new CompilerBase();
        assert.throw(() => compiler.getToolchainTypes());
      });
    });

    suite('#getToolchains()', function() {
      test('NEG: throw in dummy compiler base by getToolchains', function() {
        const compiler = new CompilerBase();
        assert.throw(() => compiler.getToolchains('', 0, 0));
      });
    });

    suite('#prerequisitesForGetToolchains()', function() {
      test('NEG: throw in dummy compiler base by prerequisitesForGetToolchains', function() {
        const compiler = new CompilerBase();
        assert.throw(() => compiler.prerequisitesForGetToolchains());
      });
    });
  });
});
