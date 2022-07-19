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

import {getNonce} from '../../../Utils/external/Nonce';

suite('Utils', function() {
  suite('Nonce', function() {
    suite('#getNonce()', function() {
      test('returns nonce as string', function() {
        const nonceValue: string = getNonce();
        assert.isNotNull(nonceValue);
        assert.isString(nonceValue);
      });
    });
  });
});
