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

import {_unit_test_logStr} from '../../Utils/Logger';

suite('Utils', function() {
  suite('Logger', function() {
    suite('#__logStr', function() {
      test('normal', function() {
        // One message
        {
          const severity = 'info';
          const tag = 'unit_test';
          const msg = 'one_message';
          const actual = _unit_test_logStr(severity, tag, msg);
          assert.isTrue(actual.includes(`[${severity}]`));
          assert.isTrue(actual.includes(`[${tag}]`));
          assert.isTrue(actual.endsWith(msg));
        }
        {
          // two msgs
          const severity = 'info';
          const tag = 'unit_test';
          const msg1 = 'one_message';
          const msg2 = 'two_message';
          const actual = _unit_test_logStr(severity, tag, msg1, msg2);
          assert.isTrue(actual.includes(`[${severity}]`));
          assert.isTrue(actual.includes(`[${tag}]`));
          assert.isTrue(actual.endsWith(`${msg1} ${msg2}`));
        }
        {
          // multiple msgs with number
          class Foo {
            constructor(public bar: number) { /* empty */
            }
          }
          const severity = 'info';
          const tag = 'unit_test';
          const msg1 = 'one_message';
          const msg2 = 1234;
          const msg3 = new Foo(10);
          const msg4 = new RangeError('exceed!');
          const actual = _unit_test_logStr(severity, tag, msg1, msg2, msg3, msg4);
          /*
          [8/3/2022, 12:29:23 PM][unit_test][info] one_message 1234
          Foo: {"bar":10}
          Error was thrown:
          - name: Error
          - message: one_error
          */
          assert.isTrue(actual.includes(`[${severity}]`));
          assert.isTrue(actual.includes(`[${tag}]`));
          assert.isTrue(actual.includes(`${msg1}`));
          assert.isTrue(actual.includes(`${msg2}`));
          assert.isTrue(actual.includes(`Foo`));
          assert.isTrue(actual.includes(`"bar":10`));
          assert.isTrue(actual.includes(`RangeError`));
          assert.isTrue(actual.includes(`exceed!`));
        }
      });

      test('NEG: no msg', function() {
        const severity = 'info';
        const tag = 'unit_test';
        const actual = _unit_test_logStr(severity, tag);
        assert.equal(actual, '');
      });
    });
  });
});
