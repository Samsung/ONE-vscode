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
import {OneStorage} from '../../OneExplorer/OneStorage';

import {TestBuilder} from '../TestBuilder';

suite('OneExplorer', function() {
  suite('OneStorage', function() {
    let testBuilder: TestBuilder;

    setup(() => {
      testBuilder = new TestBuilder(this);
      testBuilder.setUp();
    });

    teardown(() => {
      testBuilder.tearDown();
    });

    suite('OneStorage', function() {
      suite('#getCfgs()', function() {
        test('A tflite file with a cfg', function() {
          const configName = 'model.cfg';
          const modelName = 'model.tflite';

          const content = `
[one-import-tflite]
input_path=${modelName}
        `;

          // Write a file inside temp directory
          testBuilder.writeFileSync(configName, content, 'workspace');
          testBuilder.writeFileSync(modelName, '', 'workspace');

          // Get file paths inside the temp directory
          const configPath = testBuilder.getPath(configName, 'workspace');
          const modelPath = testBuilder.getPath(modelName, 'workspace');

          // Validation
          {
            assert.isDefined(OneStorage.getCfgs(modelPath));
            assert.strictEqual(OneStorage.getCfgs(modelPath)!.length, 1);
            assert.strictEqual(OneStorage.getCfgs(modelPath)![0], configPath);
          }
        });

        test('NEG: Returns undefined for not existing path', function() {
          { assert.isUndefined(OneStorage.getCfgs('invalid/path')); }
        });

        test('NEG: Returns undefined for lonely base model file', function() {
          const modelName = 'model.tflite';

          testBuilder.writeFileSync(modelName, '', 'workspace');

          { assert.isUndefined(OneStorage.getCfgs('invalid/path')); }
        });

        test('NEG: Returns undefined for non-base-model files', function() {
          const modelName = 'model.circle';

          testBuilder.writeFileSync(modelName, '', 'workspace');

          const modelPath = testBuilder.getPath(modelName, 'workspace');
          { assert.isUndefined(OneStorage.getCfgs(modelPath)); }
        });
      });

      suite('#getCfgsObjs()', function() {
        test('A tflite file with a cfg', function() {
          const configName = 'model.cfg';
          const modelName = 'model.tflite';

          const content = `
[one-import-tflite]
input_path=${modelName}
        `;

          // Write a file inside temp directory
          testBuilder.writeFileSync(configName, content, 'workspace');
          testBuilder.writeFileSync(modelName, '', 'workspace');

          // Get file paths inside the temp directory
          const configPath = testBuilder.getPath(configName, 'workspace');
          const modelPath = testBuilder.getPath(modelName, 'workspace');

          // Validation
          {
            assert.isDefined(OneStorage.getCfgObj(configPath));
            assert.strictEqual(
                OneStorage.getCfgObj(configPath)!.getBaseModelsExists[0].path, modelPath);
          }
        });

        test('NEG: Returns nothing for not existing path', function() {
          { assert.notExists(OneStorage.getCfgObj('invalid/path')); }
        });

        test('NEG: Returns nothing for non-cfg files', function() {
          const modelName = 'model.circle';

          testBuilder.writeFileSync(modelName, '', 'workspace');

          const modelPath = testBuilder.getPath(modelName, 'workspace');
          { assert.notExists(OneStorage.getCfgObj(modelPath)); }
        });
      });

      suite('#reset()', function() {
        test('Call reset after the file system change', function() {
          const configName = 'model.cfg';

          const configPath = testBuilder.getPath(configName, 'workspace');

          { assert.isUndefined(OneStorage.getCfgObj(configPath)); }

          testBuilder.writeFileSync(configName, '', 'workspace');
          OneStorage.reset();

          { assert.isDefined(OneStorage.getCfgObj(configPath)); }
        });
      });
    });
  });
});
