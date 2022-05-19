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

class TestFileBuilder {
  testDir: string = '/tmp/one-vscode.test/ConfigObject';
  fileList: string[] = [];

  constructor(testDir?: string) {
    if (testDir) {
      this.testDir = testDir;
    }

    try {
      if (!fs.existsSync(this.testDir)) {
        fs.mkdirSync(this.testDir, {recursive: true});
      }
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
      console.log('File creation succeeded!');
    } catch (e) {
      console.error('Cannot create temporal files for the test');
      throw e;
    };
  }

  destructor() {
    fs.rmdirSync(this.testDir, {recursive: true});
  }
};

suite('OneExplorer', function() {
  suite('ConfigObject', function() {
    suite('#createConfigObj()', function() {
      test('Returns null when file read failed', function() {
        const configObj =
            ConfigObj.createConfigObj(vscode.Uri.file('/tmp/one-vscode.test/invalid/path'));

        // Validation
        { assert.isNull(configObj); }
      });

      test('Returns parsed object', function() {
        const fileBuilder = new TestFileBuilder;

        const configName = 'model.cfg';
        const configPath = fileBuilder.getPath(configName);
        const modelName = 'model.tflite';
        const modelPath = fileBuilder.getPath(modelName);

        const content = `
[onecc]
one-import-tflite=True
[one-import-tflite]
input_path=${modelName}
        `;

        fileBuilder.writeFileSync(configName, content);

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
          assert.strictEqual(configObj!.obj.baseModels[0].fsPath, modelPath);
          assert.strictEqual(configObj!.obj.derivedModels.length, 0);
        }
      });

      test('Returns parsed object with derivedModels', function() {
        const fileBuilder = new TestFileBuilder;

        const configName = 'model.cfg';
        const configPath = fileBuilder.getPath(configName);
        const baseModelName = 'model.tflite';
        const baseModelPath = fileBuilder.getPath(baseModelName);
        const derivedModelName1 = 'model.circle';
        const derivedModelPath1 = fileBuilder.getPath(derivedModelName1);
        const derivedModelName2 = 'model.q8.circle';
        const derivedModelPath2 = fileBuilder.getPath(derivedModelName2);

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

        fileBuilder.writeFileSync(configName, content);

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

          console.log(configObj!.obj.baseModels);
          assert.strictEqual(configObj!.obj.baseModels.length, 1);
          assert.strictEqual(configObj!.obj.baseModels[0].fsPath, baseModelPath);
          assert.strictEqual(configObj!.obj.derivedModels.length, 2);

          assert.isTrue(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                            .includes(derivedModelPath1));
          assert.isTrue(configObj!.obj.derivedModels.map(derivedModel => derivedModel.fsPath)
                            .includes(derivedModelPath2));
        }
      });
    });
  });
});
