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
import {join} from 'path';

import {loadCfgFile, obtainWorkspaceRoot, RealPath} from '../../Utils/Helpers';

suite('Utils', function() {
  suite('Helpers', function() {
    suite('#obtainWorkspaceRoot()', function() {
      test('returns workspaceRoot as string', function() {
        const workspaceRoot: string|undefined = obtainWorkspaceRoot();
        if (!workspaceRoot) {
          assert.fail('Need workspace');
        }
        assert.isNotNull(workspaceRoot);
        assert.isString(workspaceRoot);
      });
    });
    suite('#loadCfgFile()', function() {
      test('returns cfgIni object', function() {
        const workspaceRoot: string|undefined = obtainWorkspaceRoot();
        if (!workspaceRoot) {
          assert.fail('Need workspace');
        }
        const cfgFile = join(workspaceRoot, 'res', 'samples', 'cfg', 'inception_v3.cfg');
        const cfgIni = loadCfgFile(cfgFile);
        assert.isNotNull(cfgIni);
        assert.strictEqual(cfgIni['onecc']['one-import-tf'], 'True');
        assert.strictEqual(cfgIni['onecc']['one-import-tflite'], 'False');
      });
    });

    suite('#createRealPath()', function() {
      test('create RealPath of system root directory', function() {
        let realPath = RealPath.createRealPath('/');
        assert.isObject<RealPath>(realPath!);
      });

      test('return null when path not exists', function() {
        let realPath = RealPath.createRealPath('/dummy/not/exists/here');
        assert.isNull(realPath);
      });
    });

    suite('#isEqual()', function() {
      test('compare practically the same paths', function() {
        const workspaceRoot = obtainWorkspaceRoot();
        let realPath0 = RealPath.createRealPath(`${workspaceRoot}`);
        let realPath1 = RealPath.createRealPath(`${workspaceRoot}/dummy/..`);

        assert.isNotNull(realPath0);
        assert.isNotNull(realPath1);
        assert.isTrue(RealPath.isEqual(realPath0!, realPath1!));
      });
    });

    suite('#isEqual()', function() {
      test('compare exactly the same paths', function() {
        let realPath0 = RealPath.createRealPath('/');
        let realPath1 = RealPath.createRealPath('/');

        assert.isNotNull(realPath0);
        assert.isNotNull(realPath1);
        assert.isTrue(RealPath.isEqual(realPath0!, realPath1!));
      });
    });
  });
});
