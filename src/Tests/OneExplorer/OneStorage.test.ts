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
import * as fs from 'fs';
import * as path from 'path';

import {OneStorage} from '../../OneExplorer/OneStorage';
import {obtainWorkspaceRoot} from '../../Utils/Helpers';


class TestBuilder {
  static testCount = 0;

  static rootInTemp: string = '/tmp/one-vscode.test/OneExplorer';
  static rootInWorkspace: string = `${obtainWorkspaceRoot()}/.one-vscode.test/OneExplorer`;
  dirInTemp: string;
  dirInWorkspace: string;

  testLabel: string;
  fileList: string[] = [];

  constructor(suiteName: string) {
    TestBuilder.testCount++;
    this.testLabel = `${suiteName}/${TestBuilder.testCount}`;
    this.dirInTemp = `${TestBuilder.rootInTemp}/${suiteName}/${TestBuilder.testCount}`;
    this.dirInWorkspace = `${TestBuilder.rootInWorkspace}/${suiteName}/${TestBuilder.testCount}`;
  }

  setUp() {
    try {
      if (fs.existsSync(this.dirInTemp)) {
        fs.rmdirSync(this.dirInTemp, {recursive: true});
      }

      if (fs.existsSync(this.dirInWorkspace)) {
        fs.rmdirSync(this.dirInWorkspace, {recursive: true});
      }

      fs.mkdirSync(this.dirInTemp, {recursive: true});
      fs.mkdirSync(this.dirInWorkspace, {recursive: true});
      console.log(`Test ${this.testLabel} - Start`);
    } catch (e) {
      console.error('Cannot create temporal directory for the test');
      throw e;
    }
  }

  getPath(fileName: string, tempOrWorkspace: string = 'temp') {
    if (tempOrWorkspace === 'temp') {
      return `${this.dirInTemp}/${fileName}`;
    } else if (tempOrWorkspace === 'workspace') {
      return `${this.dirInWorkspace}/${fileName}`;
    } else {
      throw Error('Invalid parameter');
    }
  }

  writeFileSync(fileName: string, content: string, tempOrWorkspace: string = 'temp') {
    const filePath = this.getPath(fileName, tempOrWorkspace);

    try {
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath));
      }
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Test file is created (${filePath})`);
    } catch (e) {
      console.error('Cannot create temporal files for the test');
      throw e;
    }
  }

  tearDown() {
    try {
      if (fs.existsSync(this.dirInTemp)) {
        fs.rmdirSync(this.dirInTemp, {recursive: true});
      }
      if (fs.existsSync(this.dirInTemp)) {
        fs.rmdirSync(this.dirInWorkspace, {recursive: true});
      }

    } catch (e) {
      // Do not throw to proceed the test
      console.error('Cannot remove the test directory');
    } finally {
      console.log(`Test ${this.testLabel} - Done`);
    }
  }

  static setUp() {
    try {
      if (fs.existsSync(TestBuilder.rootInTemp)) {
        fs.rmdirSync(TestBuilder.rootInTemp, {recursive: true});
      }
      if (fs.existsSync(TestBuilder.rootInWorkspace)) {
        fs.rmdirSync(TestBuilder.rootInWorkspace, {recursive: true});
      }

      fs.mkdirSync(TestBuilder.rootInTemp, {recursive: true});
      fs.mkdirSync(TestBuilder.rootInWorkspace, {recursive: true});
    } catch (e) {
      console.error('Cannot create temporal directory for the test');
      throw e;
    }
  }

  static tearDown() {
    try {
      fs.rmdirSync(TestBuilder.rootInTemp, {recursive: true});
      console.log(`Test directory is removed successfully. (${TestBuilder.rootInTemp})`);
      fs.rmdirSync(TestBuilder.rootInWorkspace, {recursive: true});
      console.log(
          `Test directory in worksp is removed successfully. (${TestBuilder.rootInWorkspace})`);
    } catch (e) {
      // Do not throw to proceed the test
      console.error('Cannot remove the test directory');
    } finally {
      console.log(`Removed ${TestBuilder.rootInTemp} and ${TestBuilder.rootInTemp}.`);
    }
  }
}

suite('OneExplorer', function() {
  suite('OneStorage', function() {
    let testBuilder: TestBuilder;
    setup(() => {
      testBuilder = new TestBuilder(`${this.title}`);
      testBuilder.setUp();
    });

    teardown(() => {
      testBuilder.tearDown();
    });

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
          assert.strictEqual(OneStorage.getCfgs(modelPath)?.length, 1);
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
          assert.strictEqual(OneStorage.getCfgObj(configPath)?.getBaseModelsExists[0].path, modelPath);
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
