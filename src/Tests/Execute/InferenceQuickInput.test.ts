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

import {InferenceQuickInput} from '../../Execute/InferenceQuickInput';

suite('Execute', function() {
    // NOTE: InferenceQuickInput has a role for QuickInput
    // However, we cannot test the ui until now
    // Therefore, we focus on testing things not ui
  suite('InferenceQuickInput', function() {


    suite('#constructor()', function() {
      test('is constructed', function() {
        let quickInput = new InferenceQuickInput();
        assert.instanceOf(quickInput, InferenceQuickInput);
      });
    });

    suite('#getBackend()', function() {
      test('throw error when backend is undefined', function() {
        let quickInput = new InferenceQuickInput();
        assert.throw(() => {quickInput.getBackend();});
      });
    });

    suite('#getModelPath()', function() {
        test('throw error when modelPath is undefined', function() {
            let quickInput = new InferenceQuickInput();
        assert.throw(() => {quickInput.getModelPath();});
      });
    });

    suite('#getInputSpec()', function() {
        test('throw error when inputSpec is undefined', function() {
            let quickInput = new InferenceQuickInput();
        assert.throw(() => {quickInput.getInputSpec();});
      });
    });

    suite('#getError()', function() {
      test('returns error', function() {
        let quickInput = new InferenceQuickInput();
        assert.strictEqual(quickInput.getError(), undefined);
      });
    });

    suite('#getAllBackendNames()', function() {
      test('', function() {

      });
    });

    suite('#getQuickPickItems()', function() {
      test('', function() {

      });
    });

    suite('#getBackendFromGlobal()', function() {
      test('', function() {

      });
    });

    suite('#getFilter()', function() {
      test('', function() {

      });
    });

    suite('#getInputSpecKeys()', function() {
      test('', function() {

      });
    });
  });
});
