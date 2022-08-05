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
import {Version} from '../../Backend/Version';

suite('Backend', function() {
  suite('Version', function() {
    suite('#constructor()', function() {
      test('is contructed with values', function() {
        const major: number = 1;
        const minor: number = 0;
        const patch: number = 2;
        const option: string = '~220424nightly';
        const version = new Version(major, minor, patch, option);
        assert.isObject<Version>(version);
        assert.strictEqual(version.major, major);
        assert.strictEqual(version.minor, minor);
        assert.strictEqual(version.patch, patch);
        assert.deepStrictEqual(version.option, option);
      });
    });

    suite('#str()', function() {
      test('returns a string with values', function() {
        const major: number = 1;
        const minor: number = 0;
        const patch: number = 2;
        const option: string = '~220424nightly';
        const version = new Version(major, minor, patch, option);
        const expectedStr = `${major}.${minor}.${patch}${option}`;
        assert.deepStrictEqual(version.str(), expectedStr);
      });
    });

    suite('#equals()', function() {
      test('true', function() {
        const version1 = new Version(1, 0, 2, 'option');
        const version2 = new Version(1, 0, 2, 'option');
        assert.isTrue(version1.equals(version2));
        assert.isTrue(version2.equals(version1));
      });
      test('NEG: compare version without option', function() {
        const version1 = new Version(1, 0, 2, 'option');
        const version2 = new Version(1, 0, 2);
        assert.isFalse(version1.equals(version2));
        assert.isFalse(version2.equals(version1));
      });
      test('NEG: compare version without patch and option', function() {
        const version1 = new Version(1, 0, 2, 'option');
        const version2 = new Version(1, 0, undefined);
        assert.isFalse(version1.equals(version2));
        assert.isFalse(version2.equals(version1));
      });
      test('NEG: compare version only with major', function() {
        const version1 = new Version(1, 0, 2, 'option');
        const version2 = new Version(1, undefined, undefined);
        assert.isFalse(version1.equals(version2));
        assert.isFalse(version2.equals(version1));
      });
    });
  });
});
