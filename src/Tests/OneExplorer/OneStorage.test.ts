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

import {NodeType} from '../../OneExplorer/OneExplorer';
import {OneStorage} from '../../OneExplorer/OneStorage';
import {_unit_test_BaseModelToCfgMap as BaseModelToCfgMap, _unit_test_CfgToCfgObjMap as CfgToCfgObjMap} from '../../OneExplorer/OneStorage';
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

    suite('CfgToCfgObjMap', function() {
      suite('#constructor()', function() {
        test('does not throw', function() {
          assert.doesNotThrow(() => new CfgToCfgObjMap());
        });
      });

      suite('#init()', function() {
        test('NEG: with an empty cfglist', function() {
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          assert.doesNotThrow(() => {
            cfgToCfgObjMap.init([]);
          });
          assert.strictEqual(cfgToCfgObjMap.size, 0);
        });
        test('NEG: a falsy cfg list (not existing)', function() {
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          assert.doesNotThrow(() => {
            cfgToCfgObjMap.init(['not/existing/path']);
          });
          assert.isUndefined(cfgToCfgObjMap.get('not/existing/path'));
          assert.strictEqual(cfgToCfgObjMap.size, 0);
        });
      });

      suite('#get()', function() {
        test('NEG: empty path', function() {
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          cfgToCfgObjMap.init([]);
          assert.isUndefined(cfgToCfgObjMap.get(''));
          assert.strictEqual(cfgToCfgObjMap.size, 0);
        });

        test('NEG: invalid path', function() {
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          cfgToCfgObjMap.init([]);
          assert.isUndefined(cfgToCfgObjMap.get('invalid/path'));
          assert.strictEqual(cfgToCfgObjMap.size, 0);
        });

        test('existing path', function() {
          const configName = 'model.cfg';
          const configPath = testBuilder.getPath(configName, 'workspace');
          testBuilder.writeFileSync(configName, '', 'workspace');

          const cfgToCfgObjMap = new CfgToCfgObjMap();
          cfgToCfgObjMap.init([configPath]);

          assert.strictEqual(cfgToCfgObjMap.size, 1);
          assert.strictEqual(cfgToCfgObjMap.get(configPath)?.uri.fsPath, configPath);
        });
      });

      suite('#reset()', function() {
        test('existing path', function() {
          const configName = 'model.cfg';
          const configPath = testBuilder.getPath(configName, 'workspace');
          testBuilder.writeFileSync(configName, '', 'workspace');
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          cfgToCfgObjMap.init([configPath]);

          assert.strictEqual(cfgToCfgObjMap.size, 1);
          cfgToCfgObjMap.reset(NodeType.config, configPath);
          assert.strictEqual(cfgToCfgObjMap.size, 0);
        });
        test('NEG: not existing path', function() {
          const configName = 'model.cfg';
          const configPath = testBuilder.getPath(configName, 'workspace');
          // commented out : testBuilder.writeFileSync(configName, '', 'workspace');
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          cfgToCfgObjMap.init([configPath]);

          assert.strictEqual(cfgToCfgObjMap.size, 0);
          assert.doesNotThrow(() => {
            cfgToCfgObjMap.reset(NodeType.config, configPath);
          });
          assert.strictEqual(cfgToCfgObjMap.size, 0);
        });
      });

      suite('#update()', function() {
        test('existing path', function() {
          const configName = 'model.cfg';
          const configPath = testBuilder.getPath(configName, 'workspace');
          testBuilder.writeFileSync(configName, '', 'workspace');

          const cfgToCfgObjMap = new CfgToCfgObjMap();
          cfgToCfgObjMap.init([configPath]);

          const newConfigName = 'model.new.cfg';
          const newConfigPath = testBuilder.getPath(newConfigName, 'workspace');
          testBuilder.writeFileSync(newConfigName, '', 'workspace');

          assert.strictEqual(cfgToCfgObjMap.size, 1);
          cfgToCfgObjMap.update(NodeType.config, configPath, newConfigPath);
          assert.strictEqual(cfgToCfgObjMap.size, 1);
          assert.isUndefined(cfgToCfgObjMap.get(configPath));
          assert.isDefined(cfgToCfgObjMap.get(newConfigPath));
          assert.strictEqual(cfgToCfgObjMap.get(newConfigPath)?.uri.fsPath, newConfigPath);
        });

        test('NEG: not existing new path', function() {
          const configName = 'model.cfg';
          const configPath = testBuilder.getPath(configName, 'workspace');
          testBuilder.writeFileSync(configName, '', 'workspace');
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          cfgToCfgObjMap.init([configPath]);

          const newConfigName = 'model.new.cfg';
          const newConfigPath = testBuilder.getPath(newConfigName, 'workspace');
          // commented out : testBuilder.writeFileSync(newConfigPath, '', 'workspace');

          assert.strictEqual(cfgToCfgObjMap.size, 1);
          cfgToCfgObjMap.update(NodeType.config, configPath, newConfigPath);
          assert.strictEqual(cfgToCfgObjMap.size, 0);
        });

        test('NEG: not existing path', function() {
          const configName = 'model.cfg';
          const configPath = testBuilder.getPath(configName, 'workspace');
          // commented out : testBuilder.writeFileSync(configName, '', 'workspace');
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          cfgToCfgObjMap.init([configPath]);

          const newConfigName = 'model.new.cfg';
          const newConfigPath = testBuilder.getPath(configName, 'workspace');

          assert.strictEqual(cfgToCfgObjMap.size, 0);
          assert.doesNotThrow(() => {
            cfgToCfgObjMap.update(NodeType.config, configPath, newConfigName);
          });
          assert.strictEqual(cfgToCfgObjMap.size, 0);
          assert.isUndefined(cfgToCfgObjMap.get(configPath));
          assert.isUndefined(cfgToCfgObjMap.get(newConfigPath));
        });
      });
    });

    suite('BaseModelToCfgMap', function() {
      suite('#constructor()', function() {
        test('does not throw', function() {
          assert.doesNotThrow(() => new BaseModelToCfgMap());
        });
      });

      suite('#init()', function() {
        test('NEG: with an empty cfglist and cfgObjMap', function() {
          const baseModelToCfgMap = new BaseModelToCfgMap();
          assert.doesNotThrow(() => {
            baseModelToCfgMap.init([], new CfgToCfgObjMap());
          });
          assert.strictEqual(baseModelToCfgMap.size, 0);
        });
        test('NEG: falsy cfg list (not existing)', function() {
          const baseModelToCfgMap = new BaseModelToCfgMap();
          assert.doesNotThrow(() => {
            baseModelToCfgMap.init(['not/existing/path'], new CfgToCfgObjMap());
          });
          assert.isUndefined(baseModelToCfgMap.get('not/existing/path'));
          assert.strictEqual(baseModelToCfgMap.size, 0);
        });
      });

      suite('#get()', function() {
        test('NEG: empty path', function() {
          const baseModelToCfgMap = new BaseModelToCfgMap();
          baseModelToCfgMap.init([], new CfgToCfgObjMap());
          assert.isUndefined(baseModelToCfgMap.get(''));
          assert.strictEqual(baseModelToCfgMap.size, 0);
        });

        test('NEG: invalid path', function() {
          const baseModelToCfgMap = new BaseModelToCfgMap();
          baseModelToCfgMap.init([], new CfgToCfgObjMap());
          assert.isUndefined(baseModelToCfgMap.get('invalid/path'));
          assert.strictEqual(baseModelToCfgMap.size, 0);
        });

        test('existing path', function() {
          const model = testBuilder.getPath('model.tflite', 'workspace');
          const config = testBuilder.getPath('model.cfg', 'workspace');
          const content = `
[one-import-tflite]
input_path='model.tflite'
          `;

          testBuilder.writeFileSync('model.cfg', content, 'workspace');
          testBuilder.writeFileSync('model.tflite', '', 'workspace');

          const cfgList = [config];
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          const baseModelToCfgMap = new BaseModelToCfgMap();
          cfgToCfgObjMap.init(cfgList);
          baseModelToCfgMap.init(cfgList, cfgToCfgObjMap);

          assert.isDefined(baseModelToCfgMap.get(model));
          assert.strictEqual(baseModelToCfgMap.get(model)!.length, 1);
          assert.strictEqual(baseModelToCfgMap.get(model)![0], config);
          assert.strictEqual(baseModelToCfgMap.size, 1);
        });
      });

      suite('#reset()', function() {
        test('existing path', function() {
          const model = testBuilder.getPath('model.tflite', 'workspace');
          const config = testBuilder.getPath('model.cfg', 'workspace');
          const content = `
[one-import-tflite]
input_path='model.tflite'
          `;

          testBuilder.writeFileSync('model.cfg', content, 'workspace');
          testBuilder.writeFileSync('model.tflite', '', 'workspace');

          const cfgList = [config];
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          const baseModelToCfgMap = new BaseModelToCfgMap();
          cfgToCfgObjMap.init(cfgList);
          baseModelToCfgMap.init(cfgList, cfgToCfgObjMap);

          assert.isDefined(baseModelToCfgMap.get(model));
          assert.strictEqual(baseModelToCfgMap.get(model)!.length, 1);
          assert.strictEqual(baseModelToCfgMap.get(model)![0], config);
          assert.strictEqual(baseModelToCfgMap.size, 1);

          baseModelToCfgMap.reset(NodeType.config, config);

          assert.isDefined(baseModelToCfgMap.get(model));
          assert.strictEqual(baseModelToCfgMap.get(model)!.length, 0);
          assert.strictEqual(baseModelToCfgMap.size, 1);
        });
        test('NEG: not existing path', function() {
          const config = testBuilder.getPath('model.cfg', 'workspace');

          const cfgList = [config];
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          const baseModelToCfgMap = new BaseModelToCfgMap();
          cfgToCfgObjMap.init(cfgList);
          baseModelToCfgMap.init(cfgList, cfgToCfgObjMap);

          assert.strictEqual(baseModelToCfgMap.size, 0);
          assert.doesNotThrow(() => baseModelToCfgMap.reset(NodeType.config, config));
        });
      });

      suite('#update()', function() {
        test('config path', function() {
          const model = testBuilder.getPath('model.tflite', 'workspace');
          const config = testBuilder.getPath('model.cfg', 'workspace');

          const content = `
[one-import-tflite]
input_path='model.tflite'
          `;

          testBuilder.writeFileSync('model.cfg', content, 'workspace');
          testBuilder.writeFileSync('model.tflite', '', 'workspace');

          const cfgList = [config];
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          const baseModelToCfgMap = new BaseModelToCfgMap();
          cfgToCfgObjMap.init(cfgList);
          baseModelToCfgMap.init(cfgList, cfgToCfgObjMap);

          assert.isDefined(baseModelToCfgMap.get(model));
          assert.strictEqual(baseModelToCfgMap.get(model)!.length, 1);
          assert.strictEqual(baseModelToCfgMap.get(model)![0], config);
          assert.strictEqual(baseModelToCfgMap.size, 1);

          const newConfig = testBuilder.getPath('model.new.cfg', 'workspace');
          testBuilder.writeFileSync('model.new.cfg', content, 'workspace');

          baseModelToCfgMap.update(NodeType.config, config, newConfig);

          assert.isDefined(baseModelToCfgMap.get(model));
          assert.strictEqual(baseModelToCfgMap.get(model)!.length, 1);
          assert.strictEqual(baseModelToCfgMap.get(model)![0], newConfig);
          assert.strictEqual(baseModelToCfgMap.size, 1);
        });

        test('model and config names', function() {
          const content = `
[one-import-tflite]
input_path='model.tflite'
          `;

          const oldModel = testBuilder.getPath('model.tflite', 'workspace');
          const config = testBuilder.getPath('model.cfg', 'workspace');
          testBuilder.writeFileSync('model.cfg', content, 'workspace');
          testBuilder.writeFileSync('model.tflite', '', 'workspace');

          const cfgList = [config];
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          const baseModelToCfgMap = new BaseModelToCfgMap();
          cfgToCfgObjMap.init(cfgList);
          baseModelToCfgMap.init(cfgList, cfgToCfgObjMap);

          assert.strictEqual(baseModelToCfgMap.size, 1);
          assert.isDefined(baseModelToCfgMap.get(oldModel));
          assert.strictEqual(baseModelToCfgMap.get(oldModel)!.length, 1);
          assert.strictEqual(baseModelToCfgMap.get(oldModel)![0], config);

          const newModel = testBuilder.getPath('model.new.tflite', 'workspace');
          const newContent = `
  [one-import-tflite]
  input_path='model.new.tflite'
          `;

          testBuilder.writeFileSync('model.cfg', newContent, 'workspace');
          testBuilder.writeFileSync('model.new.tflite', '', 'workspace');

          baseModelToCfgMap.update(NodeType.baseModel, oldModel, newModel);

          assert.strictEqual(baseModelToCfgMap.size, 1);
          assert.isUndefined(baseModelToCfgMap.get(oldModel));
          assert.isDefined(baseModelToCfgMap.get(newModel));
          assert.strictEqual(baseModelToCfgMap.get(newModel)!.length, 1);
          assert.strictEqual(baseModelToCfgMap.get(newModel)![0], config);
        });

        test('NEG: not existing path', function() {
          const content = `
[one-import-tflite]
input_path='model.tflite'
          `;

          const model = testBuilder.getPath('model.tflite', 'workspace');
          const config = testBuilder.getPath('model.cfg', 'workspace');
          testBuilder.writeFileSync('model.cfg', content, 'workspace');
          testBuilder.writeFileSync('model.tflite', '', 'workspace');

          const cfgList = [config];
          const cfgToCfgObjMap = new CfgToCfgObjMap();
          const baseModelToCfgMap = new BaseModelToCfgMap();
          cfgToCfgObjMap.init(cfgList);
          baseModelToCfgMap.init(cfgList, cfgToCfgObjMap);

          assert.strictEqual(baseModelToCfgMap.size, 1);
          assert.isDefined(baseModelToCfgMap.get(model));
          assert.strictEqual(baseModelToCfgMap.get(model)!.length, 1);
          assert.strictEqual(baseModelToCfgMap.get(model)![0], config);

          assert.doesNotThrow(() => {
            baseModelToCfgMap.update(NodeType.config, config, '/invalid/path');
          });
          assert.strictEqual(cfgToCfgObjMap.size, 1);
        });
      });
    });
  });
});
