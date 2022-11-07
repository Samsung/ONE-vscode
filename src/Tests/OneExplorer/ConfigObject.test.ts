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
import * as vscode from 'vscode';
import {ConfigObj} from '../../OneExplorer/ConfigObject';

import {TestBuilder} from '../TestBuilder';

suite('OneExplorer', function() {
  suite('ConfigObject', function() {
    let testBuilder: TestBuilder;

    setup(() => {
      testBuilder = new TestBuilder(this);
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
          assert.isArray(configObj!.getProducts);
          assert.isArray(configObj!.getBaseModels);
          assert.isArray(configObj!.getProducts);
          assert.isArray(configObj!.getBaseModelsExists);
          assert.isArray(configObj!.getProductsExists);

          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });

    suite('#one-import-onnx section', function() {
      test('Parse basic example with one-import-onnx', function() {
        const configName = 'model.cfg';
        const modelName = 'model.onnx';

        const content = `
[one-import-onnx]
input_path=${modelName}
        `;

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName, content);
        testBuilder.writeFileSync(modelName, '');

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const modelPath = testBuilder.getPath(modelName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.strictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(configObj!.isChildOf(modelPath));
          assert.isTrue(
              configObj!.getBaseModels.map(baseModel => baseModel.path).includes(modelPath));
          assert.isTrue(
              configObj!.getBaseModelsExists.map(baseModel => baseModel.path).includes(modelPath));
        }
      });

      test('NEG: Parse config with invalid ext with one-import-onnx', function() {
        const configName = 'model.cfg';
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.circle'
        const productName = 'model.rectangle';

        const content = `
[one-import-onnx]
output_path=${productName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });

    suite('#one-import-tflite section', function() {
      test('Parse basic example with one-import-tflite', function() {
        const configName = 'model.cfg';
        const modelName = 'model.tflite';

        const content = `
[one-import-tflite]
input_path=${modelName}
        `;

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName, content);
        testBuilder.writeFileSync(modelName, '');

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const modelPath = testBuilder.getPath(modelName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.strictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(configObj!.isChildOf(modelPath));
          assert.isTrue(
              configObj!.getBaseModels.map(baseModel => baseModel.path).includes(modelPath));
          assert.isTrue(
              configObj!.getBaseModelsExists.map(baseModel => baseModel.path).includes(modelPath));
        }
      });

      test('NEG: Parse config with invalid ext with one-import-tflite', function() {
        const configName = 'model.cfg';
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.circle'
        const productName1 = 'model.rectangle';
        const productName2 = 'model.opt.rectangle';

        const content = `
[one-import-tflite]
input_path=${productName1}
output_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });

    suite('#one-quantize section', function() {
      test('Parse basic example with one-quantize', function() {
        const configName = 'model.cfg';
        const baseModelName = 'model.tflite';
        const productName1 = 'model.circle';
        const productName2 = 'model.q8.circle';

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

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
              configObj!.getBaseModels.map(baseModel => baseModel.path).includes(baseModelPath));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath1));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath2));
        }
      });

      test('NEG: Parse config with invalid ext with one-quantize', function() {
        const configName = 'model.cfg';
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.circle'
        const productName1 = 'model.rectangle';
        const productName2 = 'model.opt.rectangle';

        const content = `
[one-quantize]
input_path=${productName1}
output_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
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
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
              configObj!.getBaseModels.map(baseModel => baseModel.path).includes(baseModelPath));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath1));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath2));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath3));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath4));
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
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
              configObj!.getBaseModels.map(baseModel => baseModel.path).includes(baseModelPath));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath1));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath2));
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
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.notStrictEqual(configObj!.getBaseModels[0].path, baseModelPath);
          assert.isFalse(
              configObj!.getProducts.map(product => product.path).includes(productPath1));
          assert.isFalse(
              configObj!.getProducts.map(product => product.path).includes(productPath2));
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
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.strictEqual(configObj!.getBaseModels[0].path, baseModelPath);
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath1));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath2));
        }
      });

      test('Parse config with exising paths', function() {
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
        testBuilder.writeFileSync(baseModelName, '');
        testBuilder.writeFileSync(productName1, '');
        testBuilder.writeFileSync(productName2, '');

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
              configObj!.getBaseModels.map(baseModel => baseModel.path).includes(baseModelPath));
          assert.isTrue(
              configObj!.getProductsExists.map(product => product.path).includes(productPath1));
          assert.isTrue(
              configObj!.getProductsExists.map(product => product.path).includes(productPath2));
        }
      });

      test('NEG: Parse config with non-exising paths', function() {
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
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.strictEqual(configObj!.getBaseModelsExists.length, 0);

          assert.notStrictEqual(configObj!.getProducts.length, 0);
          assert.strictEqual(configObj!.getBaseModelsExists.length, 0);
        }
      });
    });

    suite('#one-optimize section', function() {
      test('Parse basic example with one-optimize', function() {
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
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
              configObj!.getProducts.map(baseModel => baseModel.path).includes(productPath1));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath2));
        }
      });

      test('NEG: Parse config with invalid ext with one-optimize', function() {
        const configName = 'model.cfg';
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.circle'
        const productName1 = 'model.rectangle';
        const productName2 = 'model.opt.rectangle';

        const content = `
[one-optimize]
input_path=${productName1}
output_path=${productName2}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });

    suite('#one-codegen section', function() {
      test('Parse basic example with one-codegen', function() {
        const configName = 'model.cfg';
        const productName = 'model.tvn';

        const content = `
[one-codegen]
backend=dummy
command=${productName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const productPath = testBuilder.getPath(productName);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath));
        }
      });

      test('NEG: Parse config with invalid ext with one-codegen', function() {
        const configName = 'model.cfg';
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.tvn'
        const productName = 'model.rectangle';

        const content = `
[one-codegen]
backend=dummy
command=${productName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });

      test('Check extra files', function() {
        const configName = 'model.cfg';
        const productName = 'model.tvn';

        const extraName1 = 'model.tv2w';
        const extraName2 = 'model.tv2m';
        const extraName3 = 'model.tv2o';
        const extraName4 = 'model.tracealloc.json';

        const content = `
[one-codegen]
backend=dummy
command=--save-temps --save-allocations ${productName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const productPath = testBuilder.getPath(productName);
        const extra1Path = testBuilder.getPath(extraName1);
        const extra2Path = testBuilder.getPath(extraName2);
        const extra3Path = testBuilder.getPath(extraName3);
        const extra4Path = testBuilder.getPath(extraName4);

        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(productPath));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(extra1Path));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(extra2Path));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(extra3Path));
          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(extra4Path));
        }
      });
    });

    suite('#one-profile section', function() {
      test('Parse basic example with one-profile', function() {
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
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(configObj!.getProducts.map(product => product.path).includes(tracePath));
        }
      });

      test('NEG: Unmatching ext (not .json)', function() {
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
        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
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
commands=--save-chrome-trace ${traceName}
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);
        const configObj = ConfigObj.createConfigObj(vscode.Uri.file(configPath));

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });
  });
});
