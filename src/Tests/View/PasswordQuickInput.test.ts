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

import {containsNonAscii} from '../../View/PasswordQuickInput';


suite('View', function() {
  suite('PasswordQuickInput', function() {
    suite('#containsNonAscii()', function() {
      test('basics', function() {
        const strWithAlphabets = 'abcdefghijkABCDEFGHIJK';
        assert.isNotTrue(containsNonAscii(strWithAlphabets));

        const strWithNum = '0123456789';
        assert.isNotTrue(containsNonAscii(strWithNum));

        const strWithSpecialChar = '\n\t\r!@#$%^&*(){}[]\\';
        assert.isNotTrue(containsNonAscii(strWithSpecialChar));

        const strWithHan = '헬로';
        assert.isTrue(containsNonAscii(strWithHan));
      });
    });
  });
});
