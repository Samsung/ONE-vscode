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
import {Artifact} from '../../OneExplorer/ArtifactLocator';

const rewire = require('rewire');
const _importIni = rewire('../../OneExplorer/ConfigObject').__get__('ConfigObj.importIni');
const _parseBaseModels = rewire('../../OneExplorer/ConfigObject').__get__('ConfigObj.parseBaseModels');

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

    suite('#importIni()', function(){
      test('NEG: Returns null when file read failed', function(){
        const imported = _importIni('/tmp/one-vscode.test/invalid/path');

        // Validation
        { assert.isNull(imported); }
      });
    });

    suite('#parseBaseModels()', function(){
      test('NEG: Return empty array when iniObj is empty', function(){
        const baseModels = _parseBaseModels("/", {});

        // Validation
        {
          assert.isArray(baseModels);
          assert.strictEqual(baseModels.length, 0);
        }
      });

      test('abcdef',function(){
        const iniObj = {
          "one-import-tflite":{
            "input_path": "model.tflite"
          }
        };

        const baseModels : Artifact[] = _parseBaseModels("/", iniObj);

        // Validation
        {
          assert.strictEqual(baseModels[0].path, "/model.tflite");
        }
      });
    });
    suite('#createConfigObj()', function() {
      test('NEG: Returns null when file read failed', function() {
        const configObj =
            ConfigObj.createConfigObj(vscode.Uri.file('/tmp/one-vscode.test/invalid/path'));

        // Validation
        { assert.isNull(configObj); }
      });

      test('NEG: Create config of a file without any valid content', function() {
        const configName = 'model.cfg';

        const content = `
        empty content
        `;

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);
          assert.isArray(configObj!.getBaseModels);
          assert.isArray(configObj!.getProducts);
          assert.isArray(configObj!.getBaseModelsExists);
          assert.isArray(configObj!.getProductsExists);

          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });


    suite('#Parse one-import-tflite section', function(){
      test('Basic', function() {
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
          assert.isArray(configObj!.obj.products);

          assert.strictEqual(configObj!.obj.baseModels.length, 1);
          assert.strictEqual(configObj!.obj.products.length, 0);

          assert.strictEqual(configObj!.obj.baseModels[0].path, modelPath);
        }
      });

      test('NEG: Unmatched section and model ext', function() {
        const configName = 'model.cfg';
        const modelName = 'model.tflite';

        // INJECTED DEFECT
        // [one-import-onnx] instead of [one-import-tflite]
        //
        // EXPECTED BEHAVIOR
        // model.tflite is not read into obj.baseModels[]
        const content = `
[onecc]
one-import-tflite=True
[one-import-onnx]
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
          assert.isArray(configObj!.obj.products);

          // Empty baseModels
          assert.strictEqual(configObj!.obj.baseModels.length, 0);
        }
      });

      test('NEG: Typo in a key input_path', function() {
        const configName = 'model.cfg';
        const modelName = 'model.tflite';

        // INJECTED DEFECT
        // inputs_path instead of input_path
        //
        // EXPECTED BEHAVIOR
        // model.tflite is not read into obj.baseModels[]
        const content = `
[onecc]
one-import-tflite=True
[one-import-tflite]
inputs_path=${modelName}
        `;

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          // Empty baseModels
          assert.strictEqual(configObj!.obj.baseModels.length, 0);
        }
      });

      test('NEG: Typo in a key output_path', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const productName = 'model.circle';

        // INJECTED DEFECT
        // outputs_path instead of output_path
        //
        // EXPECTED BEHAVIOR
        // model.circle is not parsed into obj.baseModels[]
        const content = `
[onecc]
one-import-tflite=True
one-quantize=True
[one-import-tflite]
input_path=${baseModelName}
output_path=${productName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const productPath = testBuilder.getPath(productName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.strictEqual(configObj!.obj.baseModels.length, 1);

          assert.strictEqual(configObj!.obj.baseModels[0].path, baseModelPath);
          
          // By typo in 'output_path', ${productName} is not parsed
          assert.isFalse(
              configObj!.obj.products.map(product => product.path).includes(productPath));
        }
      });

      test('Parse even when one-import-tflite set as False', function() {
        const configName = 'model.cfg';
        const modelName = 'model.tflite';

        // NOTE
        //
        // Even if the section is set as False,
        // The entries are parsed.
        const content = `
[onecc]
one-import-tflite=False
[one-import-tflite]
inputs_path=${modelName}
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
          assert.isArray(configObj!.obj.products);

          assert.strictEqual(configObj!.obj.baseModels.length, 1);
          assert.strictEqual(configObj!.obj.baseModels[0].path, modelPath);
        }
      });
    });
    
    suite('#Parse one-quantize section', function(){
      test('Basic', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const productName1 = 'model.circle';
        const productName2 = 'model.q8.circle';

        const content = `
[onecc]
one-import-tflite=True
one-quantize=True
[one-import-tflite]
input_path=${baseModelName}
output_path=${productName1}
[one-quantize]
input_path=${productName1}
output_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.strictEqual(configObj!.obj.baseModels.length, 1);

          assert.strictEqual(configObj!.obj.baseModels[0].path, baseModelPath);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
        }
      });

      test('NEG: Typo in output_path', function() {
        const configName = 'model.cfg';
        const productName1 = 'model.circle';
        const productName2 = 'model.q8.circle';

        // INJECTED DEFECT
        // outputs_path intead of output_path
        //
        // EXPECTED BEHAVIOR
        // model.q8.circle is not read into obj.childModels[]
        const content = `
[one-quantize]
input_path=${productName1}
outputs_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          // model.q8.circle is not included in products[]
          assert.isFalse(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
        }
      });

      test('NEG: Typo in output_path, one-import-tflite and one-quantize', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const productName1 = 'model.circle';
        const productName2 = 'model.q8.circle';

        // INJECTED DEFECT
        // outputs_path intead of output_path
        //
        // EXPECTED BEHAVIOR
        // model.circle IS READ into obj.childModels[] because of one-quantize's input_path
        // model.q8.circle is not read into obj.childModels[]
        const content = `
[one-import-tflite]
input_path=${baseModelName}
outputs_path=${productName1}
[one-quantize]
input_path=${productName1}
outputs_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.strictEqual(configObj!.obj.baseModels.length, 1);

          assert.strictEqual(configObj!.obj.baseModels[0].path, baseModelPath);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          // model.q8.circle is not included in products[]
          assert.isFalse(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
        }
      });

      test('Check *.log files', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const productName1 = 'model.circle';
        const productName2 = 'model.q8.circle';
        const productName3 = 'model.circle.log';
        const productName4 = 'model.q8.circle.log';

        const content = `
[one-import-tflite]
input_path=${baseModelName}
output_path=${productName1}
[one-quantize]
input_path=${productName1}
output_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);
        const productPath3 = testBuilder.getPath(productName3);
        const productPath4 = testBuilder.getPath(productName4);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.strictEqual(configObj!.obj.baseModels.length, 1);

          assert.strictEqual(configObj!.obj.baseModels[0].path, baseModelPath);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath3));
          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath4));
        }
      });

      test('Parse config with detouring paths', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const productName1 = 'model.circle';
        const productName2 = 'model.q8.circle';

        // Detouring paths
        const content = `
[one-import-tflite]
input_path=dummy/dummy/../../${baseModelName}
output_path=dummy/dummy/../../${productName1}
[one-quantize]
input_path=${productName1}
output_path=dummy/dummy/../..//${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.strictEqual(configObj!.obj.baseModels.length, 1);

          assert.strictEqual(configObj!.obj.baseModels[0].path, baseModelPath);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
        }
      });

      test('NEG: Parse config with detouring paths with faulty absolute path', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const productName1 = 'model.circle';
        const productName2 = 'model.q8.circle';

        // Detouring paths with faulty absolute path
        // NOTE that path starts with '/' will be interpreted as an absolute path
        const content = `
[one-import-tflite]
input_path=/dummy/dummy/../../${baseModelName}
output_path=/dummy/dummy/../../${productName1}
[one-quantize]
input_path=/${productName1}
output_path=/dummy/dummy/../..//${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.strictEqual(configObj!.obj.baseModels.length, 1);

          assert.notStrictEqual(configObj!.obj.baseModels[0].path, baseModelPath);

          assert.isFalse(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          assert.isFalse(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
          ;
        }
      });

      test('Parse config with absolute paths', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const productName1 = 'model.circle';
        const productName2 = 'model.q8.circle';

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const baseModelPath = testBuilder.getPath(baseModelName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);

        // Detouring paths
        const content = `
[one-import-tflite]
input_path=/${baseModelPath}
output_path=/${productPath1}
[one-quantize]
input_path=/${productPath1}
output_path=/${productPath2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);


        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.strictEqual(configObj!.obj.baseModels.length, 1);

          assert.strictEqual(
              configObj!.obj.baseModels[0].path, baseModelPath, configObj!.obj.baseModels[0].path);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
        }
      });
    });

    suite('#Parse one-optimize section', function(){
      test('Basic', function() {
        const configName = 'model.cfg';
        const productName1 = 'model.circle';
        const productName2 = 'model.opt.circle';

        const content = `
[one-optimize]
input_path=${productName1}
output_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
        }
      });

      test('NEG: Typo in output_path', function() {
        const configName = 'model.cfg';
        const productName1 = 'model.circle';
        const productName2 = 'model.opt.circle';

        // INJECTED DEFECT
        // outputs_path intead of output_path
        //
        // EXPECTED BEHAVIOR
        // model.opt.circle is not found into obj.childModels[]
        const content = `
[one-quantize]
input_path=${productName1}
outputs_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const productPath1 = testBuilder.getPath(productName1);
        const productPath2 = testBuilder.getPath(productName2);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(productPath1));
          // model.opt.circle is not included in products[]
          assert.isFalse(
              configObj!.obj.products.map(product => product.path).includes(productPath2));
        }
      });
    });

    suite('#Parse one-profile section', function(){
      test('Basic', function() {
        const configName = 'model.cfg';
        const traceName = 'trace.json';

        const content = `
[one-profile]
command=--save-chrome-trace ${traceName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const tracePath = testBuilder.getPath(traceName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.isTrue(
              configObj!.obj.products.map(product => product.path).includes(tracePath));
        }
      });

      test('NEG: unmatching ext (not .json)', function() {
        const configName = 'model.cfg';
        const traceName = 'trace.unexpected';

        const content = `
[one-profile]
command=--save-chrome-trace ${traceName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const tracePath = testBuilder.getPath(traceName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.isFalse(
              configObj!.obj.products.map(product => product.path).includes(tracePath));
        }
      });

      test(`NEG: Typo in a key 'command'`, function() {
        const configName = 'model.cfg';
        const traceName = 'trace.json';

        // INJECTED DEFECT
        // 'commands' intead of 'command'
        //
        // EXPECTED BEHAVIOR
        // trace.json not found
        const content = `
[one-profile]
command=--save-chrome-trace ${traceName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const tracePath = testBuilder.getPath(traceName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isNotNull(configObj);
          assert.isNotNull(configObj!.rawObj);
          assert.isNotNull(configObj!.obj);

          assert.isObject(configObj!.rawObj);
          assert.isObject(configObj!.obj);
          assert.isArray(configObj!.obj.baseModels);
          assert.isArray(configObj!.obj.products);

          assert.isFalse(
              configObj!.obj.products.map(product => product.path).includes(tracePath));
        }

      });
    });
  });
});
