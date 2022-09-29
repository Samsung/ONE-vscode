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

import {ONEToolchain, ToolchainCompiler} from '../../../Backend/ONE/ONEToolchain';

const oneBackendName = 'ONE';

suite('Backend', function() {
  suite('ToolchainCompiler', function() {
    suite('#constructor()', function() {
      test('Create dummy ONEToolchain compiler', function(pass) {
        assert.doesNotThrow(() => new ToolchainCompiler());

        pass();
        assert.ok(true);
      });
    });

    // suite('#getToolchainTypes', function() {

    // });

    // suite('#getToolchains', function() {

    // });

    // suite('#getInstalledToolchains', function() {

    // });

    // suite('#prerequisitesForGetToolchains', function() {

    // });
  });

  suite('ONEToolchain', function() {
    suite('#constructor()', function() {
      test('Create dummy ONEToolchain backend', function(pass) {
        assert.doesNotThrow(() => new ONEToolchain());

        pass();
        assert.ok(true);
      });
    });

    suite('#name()', function() {
      test('returns backend name', function() {
        const oneBackend = new ONEToolchain();
        assert.strictEqual(oneBackend.name(), oneBackendName);
      });
    });

    // suite('#compiler()', function() {

    // });

    // suite('#executor()', function() {

    // });

    // suite('#executors()', function() {

    // });
  });
});
