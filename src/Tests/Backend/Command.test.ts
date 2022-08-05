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
import {Command} from '../../Backend/Command';

suite('Backend', function() {
  suite('Command', function() {
    suite('#constructor()', function() {
      test('is contructed with values', function() {
        const cmdStr: string = 'ls';
        const optionStrs: string[] = ['-lh', '~'];
        let cmd = new Command(cmdStr, optionStrs);
        assert.deepStrictEqual(cmd[0], cmdStr);
        assert.deepStrictEqual(cmd[1], optionStrs[0]);
        assert.deepStrictEqual(cmd[2], optionStrs[1]);
      });
    });

    suite('#strs()', function() {
      test('returns strings with values', function() {
        const cmdStr: string = 'ls';
        const optionStrs: string[] = ['-lh', '~'];
        const cmd = new Command(cmdStr, optionStrs);
        const actualStrs = cmd.strs();
        console.log(actualStrs);
        assert.strictEqual(actualStrs.length, 1 + optionStrs.length);
        assert.deepStrictEqual(actualStrs[0], cmdStr);
        assert.deepStrictEqual(actualStrs[1], optionStrs[0]);
        assert.deepStrictEqual(actualStrs[2], optionStrs[1]);
      });
    });

    suite('#str()', function() {
      test('returns a string with values', function() {
        const cmdStr: string = 'ls';
        const optionStrs: string[] = ['-lh', '~'];
        const cmd = new Command(cmdStr, optionStrs);
        let expectedStr = cmdStr;
        optionStrs.forEach(optionStr => {
          expectedStr += ' ' + optionStr;
        });
        assert.deepStrictEqual(cmd.str(), expectedStr);
      });
    });
  });
});
