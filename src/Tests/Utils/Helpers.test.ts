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

import {loadCfgFile, obtainWorkspaceRoot} from '../../Utils/Helpers';

suite('Utils', function() {
  suite('Helpers', function() {
    suite('#obtainWorkspaceRoot()', function() {
      test('returns workspaceRoot as string', function() {
        const workspaceRoot: string = obtainWorkspaceRoot();
        assert.isNotNull(workspaceRoot);
        assert.isString(workspaceRoot);
      });
    });
    suite('#loadCfgFile()', function() {
      test('returns cfgIni object', function() {
        const workspaceRoot: string = obtainWorkspaceRoot();
        const cfgFile = join(workspaceRoot, 'res', 'samples', 'cfg', 'inception_v3.cfg');
        const cfgIni = loadCfgFile(cfgFile);
        assert.isNotNull(cfgIni);
        assert.strictEqual(cfgIni['onecc']['one-import-tf'], 'True');
        assert.strictEqual(cfgIni['onecc']['one-import-tflite'], 'False');
      });
    });
  });
});
