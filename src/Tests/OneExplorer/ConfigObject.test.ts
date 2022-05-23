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
import * as vscode from 'vscode';
import {ConfigObj} from '../../OneExplorer/ConfigObject';

class TestBuilder {
  static testCount = 0;
  static testDirRoot: string = '/tmp/one-vscode.test/ConfigObject';
  testLabel: string|null = null;
  testDir: string|null = null;
  fileList: string[] = [];

  constructor(suiteName: string) {
    TestBuilder.testCount++;
    this.testLabel = `${suiteName}/${TestBuilder.testCount}`;
    this.testDir = `${TestBuilder.testDirRoot}/${suiteName}/${TestBuilder.testCount}`;
  }

  setUp() {
    try {
      if (fs.existsSync(this.testDir!)) {
        fs.rmdirSync(this.testDir!, {recursive: true});
      }

      fs.mkdirSync(this.testDir!, {recursive: true});
      console.log(`Test ${this.testLabel} - Start`);
    } catch (e) {
      console.error('Cannot create temporal directory for the test');
      throw e;
    }
  }

  getPath(fileName: string) {
    return `${this.testDir}/${fileName}`;
  }

  writeFileSync(fileName: string, content: string) {
    const filePath = `${this.testDir}/${fileName}`;

    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Test file is created (${filePath})`);
    } catch (e) {
      console.error('Cannot create temporal files for the test');
      throw e;
    }
  }

  tearDown() {
    try {
      fs.rmdirSync(this.testDir!, {recursive: true});
      console.log(`Test directory is removed successfully. (${this.testDir})`);
    } catch (e) {
      console.error('Cannot remove the test directory');
      throw e;
    } finally {
      console.log(`Test ${this.testLabel} - Done`);
    }
  }
};

suite('OneExplorer', function() {
  suite('ConfigObject', function() {
    let testBuilder: TestBuilder;
    setup(() => {
      testBuilder = new TestBuilder(`${this.title}`);
      testBuilder.setUp();
    });

    teardown(() => {
      testBuilder.tearDown();
    });

    suite('#createConfigObj()', function() {
      test('NEG: Returns null when file read failed', function() {
        const configObj =
            ConfigObj.createConfigObj(vscode.Uri.file('/tmp/one-vscode.test/invalid/path'));

        // Validation
        { assert.isNull(configObj); }
      });

      test('Returns parsed object', function() {
        const configName = 'model.cfg';
        const modelName = 'model.tflite';

        const content = `
[onecc]
one-import-tflite=True
[one-import-tflite]
input_path=${modelName}
        `;

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const modelPath = testBuilder.getPath(modelName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.derivedModels);

          assert.strictEqual(configObj!.obj.baseModels.length, 1);
          assert.strictEqual(configObj!.obj.derivedModels.length, 0);

          assert.strictEqual(configObj!.obj.baseModels[0].fsPath, modelPath);
        }
      });

      test('Returns parsed object with derivedModels', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const derivedModelName1 = 'model.circle';
        const derivedModelName2 = 'model.q8.circle';

        const content = `
[onecc]
one-import-tflite=True
one-quantize=True
[one-import-tflite]
input_path=${baseModelName}
output_path=${derivedModelName1}
[one-quantize]
input_path=${derivedModelName1}
output_path=${derivedModelName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const derivedModelPath1 = testBuilder.getPath(derivedModelName1);
        const derivedModelPath2 = testBuilder.getPath(derivedModelName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.derivedModels);

          assert.strictEqual(configObj!.obj.baseModels.length, 1);
          assert.strictEqual(configObj!.obj.derivedModels.length, 2);

          assert.strictEqual(configObj!.obj.baseModels[0].fsPath, baseModelPath);

          assert.isTrue(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                            .includes(derivedModelPath1));
          assert.isTrue(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                            .includes(derivedModelPath2));
        }
      });

      test('Parse config with detouring paths', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const derivedModelName1 = 'model.circle';
        const derivedModelName2 = 'model.q8.circle';

        // Detouring paths
        const content = `
[onecc]
one-import-tflite=True
one-quantize=True
[one-import-tflite]
input_path=dummy/dummy/../../${baseModelName}
output_path=dummy/dummy/../../${derivedModelName1}
[one-quantize]
input_path=${derivedModelName1}
output_path=dummy/dummy/../..//${derivedModelName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const derivedModelPath1 = testBuilder.getPath(derivedModelName1);
        const derivedModelPath2 = testBuilder.getPath(derivedModelName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.strictEqual(configObj!.obj.baseModels.length, 1);
          assert.strictEqual(configObj!.obj.derivedModels.length, 2);

          assert.strictEqual(configObj!.obj.baseModels[0].fsPath, baseModelPath);

          assert.isTrue(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                            .includes(derivedModelPath1));
          assert.isTrue(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                            .includes(derivedModelPath2));
        }
      });

      test('NEG: Parse config with detouring paths with faulty absolute path', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const derivedModelName1 = 'model.circle';
        const derivedModelName2 = 'model.q8.circle';

        // Detouring paths with faulty absolute path
        // NOTE that path starts with '/' will be interpreted as an absolute path
        const content = `
[onecc]
one-import-tflite=True
one-quantize=True
[one-import-tflite]
input_path=/dummy/dummy/../../${baseModelName}
output_path=/dummy/dummy/../../${derivedModelName1}
[one-quantize]
input_path=/${derivedModelName1}
output_path=/dummy/dummy/../..//${derivedModelName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const derivedModelPath1 = testBuilder.getPath(derivedModelName1);
        const derivedModelPath2 = testBuilder.getPath(derivedModelName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.strictEqual(configObj!.obj.baseModels.length, 1);
          assert.strictEqual(configObj!.obj.derivedModels.length, 2);

          assert.notStrictEqual(configObj!.obj.baseModels[0].fsPath, baseModelPath);

          assert.isFalse(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                             .includes(derivedModelPath1));
          assert.isFalse(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                             .includes(derivedModelPath2));
          ;
        }
      });


      test('Parse config with absolute paths', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const derivedModelName1 = 'model.circle';
        const derivedModelName2 = 'model.q8.circle';

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const derivedModelPath1 = testBuilder.getPath(derivedModelName1);
        const derivedModelPath2 = testBuilder.getPath(derivedModelName2);

        // Detouring paths
        const content = `
[onecc]
one-import-tflite=True
one-quantize=True
[one-import-tflite]
input_path=/${baseModelPath}
output_path=/${derivedModelPath1}
[one-quantize]
input_path=/${derivedModelPath1}
output_path=/${derivedModelPath2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);


        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.strictEqual(configObj!.obj.baseModels.length, 1);
          assert.strictEqual(configObj!.obj.derivedModels.length, 2);

          assert.strictEqual(
              configObj!.obj.baseModels[0].fsPath, baseModelPath,
              configObj!.obj.baseModels[0].fsPath);

          assert.isTrue(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                            .includes(derivedModelPath1));
          assert.isTrue(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                            .includes(derivedModelPath2));
        }
      });
    });
  });
});
