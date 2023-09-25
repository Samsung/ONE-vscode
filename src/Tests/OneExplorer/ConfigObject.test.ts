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

import { assert } from "chai";
import * as vscode from "vscode";
import { ConfigObj } from "../../OneExplorer/ConfigObject";

import { TestBuilder } from "../TestBuilder";
import { OneConfigSetting } from "../../OneExplorer/ConfigSettings/OneConfigSetting";

suite("OneExplorer", function () {
  suite("ConfigObject", function () {
    let testBuilder: TestBuilder;

    setup(() => {
      testBuilder = new TestBuilder(this);
      testBuilder.setUp();
    });

    suite("#createConfigObj()", function () {
      test("NEG: Returns null when file read failed", function () {
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file("/tmp/one-vscode.test/invalid/path")
        );

        // Validation
        {
          assert.isNull(configObj);
        }
      });

      test("NEG: Create config of a file without any valid content", function () {
        const content = `
        empty content
        `;

        // Write a file inside temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

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

    suite("#configSetting", function () {
      test("Get one config setting with .cfg file", function () {
        const configName = "model.cfg";

        const content = `
`;

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName, content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validate
        {
          assert.isDefined(configObj);
          assert.isTrue(configObj!.configSetting instanceof OneConfigSetting);
        }
      });
    });

    suite("#one-import-onnx section", function () {
      test("Parse basic example with one-import-onnx", function () {
        // Write a file inside temp directory
        testBuilder.writeFileSync(
          "model.cfg",
          `
[one-import-onnx]
input_path=model.onnx
                `
        );
        testBuilder.writeFileSync("model.onnx", "");

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const modelPath = testBuilder.getPath("model.onnx");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.strictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(configObj!.isChildOf(modelPath));
          assert.isTrue(
            configObj!.getBaseModels
              .map((baseModel) => baseModel.path)
              .includes(modelPath)
          );
          assert.isTrue(
            configObj!.getBaseModelsExists
              .map((baseModel) => baseModel.path)
              .includes(modelPath)
          );
        }
      });

      test("NEG: Parse config with invalid ext with one-import-onnx", function () {
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.circle'
        const content = `
[one-import-onnx]
output_path=model.rectangle`;
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });

    suite("#one-import-tflite section", function () {
      test("Parse basic example with one-import-tflite", function () {
        const content = `
[one-import-tflite]
input_path=model.tflite
        `;

        // Write a file inside temp directory
        testBuilder.writeFileSync("model.cfg", content);
        testBuilder.writeFileSync("model.tflite", "");

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const modelPath = testBuilder.getPath("model.tflite");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.strictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(configObj!.isChildOf(modelPath));
          assert.isTrue(
            configObj!.getBaseModels
              .map((baseModel) => baseModel.path)
              .includes(modelPath)
          );
          assert.isTrue(
            configObj!.getBaseModelsExists
              .map((baseModel) => baseModel.path)
              .includes(modelPath)
          );
        }
      });

      test("NEG: Parse wrong format ini file", function () {
        const content = `
  [one-import-tflite]
  input_path=model.tflite
        `;

        // Write a file inside temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });

      test("NEG: Parse config with invalid ext with one-import-tflite", function () {
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.circle'
        const content = `
[one-import-tflite]
input_path=model.rectangle
output_path=model.opt.rectangle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });

    suite("#one-quantize section", function () {
      test("Parse basic example with one-quantize", function () {
        const content = `
[one-import-tflite]
input_path=model.tflite
output_path=model.circle
[one-quantize]
input_path=model.circle
output_path=model.q8.circle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const baseModelPath = testBuilder.getPath("model.tflite");
        const productPath1 = testBuilder.getPath("model.circle");
        const productPath2 = testBuilder.getPath("model.q8.circle");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
            configObj!.getBaseModels
              .map((baseModel) => baseModel.path)
              .includes(baseModelPath)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath1)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath2)
          );
        }
      });

      test("NEG: Parse config with invalid ext with one-quantize", function () {
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.circle'
        const content = `
[one-quantize]
input_path=model.rectangle
output_path=model.opt.rectangle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });

      test("Check *.log files", function () {
        const content = `
[one-import-tflite]
input_path=model.tflite
output_path=model.circle
[one-quantize]
input_path=model.circle
output_path=model.q8.circle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const baseModelPath = testBuilder.getPath("model.tflite");
        const productPath1 = testBuilder.getPath("model.circle");
        const productPath2 = testBuilder.getPath("model.q8.circle");
        const productPath3 = testBuilder.getPath("model.circle.log");
        const productPath4 = testBuilder.getPath("model.q8.circle.log");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
            configObj!.getBaseModels
              .map((baseModel) => baseModel.path)
              .includes(baseModelPath)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath1)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath2)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath3)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath4)
          );
        }
      });

      test("Parse config with detouring paths", function () {
        // Detouring paths
        const content = `
[one-import-tflite]
input_path=dummy/dummy/../../model.tflite
output_path=dummy/dummy/../../model.circle
[one-quantize]
input_path=model.circle
output_path=dummy/dummy/../../model.q8.circle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const baseModelPath = testBuilder.getPath("model.tflite");
        const productPath1 = testBuilder.getPath("model.circle");
        const productPath2 = testBuilder.getPath("model.q8.circle");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
            configObj!.getBaseModels
              .map((baseModel) => baseModel.path)
              .includes(baseModelPath)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath1)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath2)
          );
        }
      });

      test("NEG: Parse config with detouring paths with faulty absolute path", function () {
        // Detouring paths with faulty absolute path
        // NOTE that path starts with '/' will be interpreted as an absolute path
        const content = `
[one-import-tflite]
input_path=/dummy/dummy/../../model.tflite
output_path=/dummy/dummy/../../model.circle
[one-quantize]
input_path=/model.circle
output_path=/dummy/dummy/../../model.q8.circle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const baseModelPath = testBuilder.getPath("model.tflite");
        const productPath1 = testBuilder.getPath("model.circle");
        const productPath2 = testBuilder.getPath("model.q8.circle");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.notStrictEqual(
            configObj!.getBaseModels[0].path,
            baseModelPath
          );
          assert.isFalse(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath1)
          );
          assert.isFalse(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath2)
          );
        }
      });

      test("Parse config with absolute paths", function () {
        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const baseModelPath = testBuilder.getPath("model.tflite");
        const productPath1 = testBuilder.getPath("model.circle");
        const productPath2 = testBuilder.getPath("model.q8.circle");

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
        testBuilder.writeFileSync("model.cfg", content);

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.strictEqual(configObj!.getBaseModels[0].path, baseModelPath);
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath1)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath2)
          );
        }
      });

      test("Parse config with existing paths", function () {
        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const baseModelPath = testBuilder.getPath("model.tflite");
        const productPath1 = testBuilder.getPath("model.circle");
        const productPath2 = testBuilder.getPath("model.q8.circle");

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
        testBuilder.writeFileSync("model.cfg", content);
        testBuilder.writeFileSync("model.tflite", "");
        testBuilder.writeFileSync("model.circle", "");
        testBuilder.writeFileSync("model.q8.circle", "");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 1);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
            configObj!.getBaseModels
              .map((baseModel) => baseModel.path)
              .includes(baseModelPath)
          );
          assert.isTrue(
            configObj!.getProductsExists
              .map((product) => product.path)
              .includes(productPath1)
          );
          assert.isTrue(
            configObj!.getProductsExists
              .map((product) => product.path)
              .includes(productPath2)
          );
        }
      });

      test("NEG: Parse config with non-exising paths", function () {
        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const baseModelPath = testBuilder.getPath("model.tflite");
        const productPath1 = testBuilder.getPath("model.circle");
        const productPath2 = testBuilder.getPath("model.q8.circle");

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
        testBuilder.writeFileSync("model.cfg", content);

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

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

    suite("#one-optimize section", function () {
      test("Parse basic example with one-optimize", function () {
        const content = `
[one-optimize]
input_path=model.circle
output_path=model.opt.circle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const productPath1 = testBuilder.getPath("model.circle");
        const productPath2 = testBuilder.getPath("model.opt.circle");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
            configObj!.getProducts
              .map((baseModel) => baseModel.path)
              .includes(productPath1)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath2)
          );
        }
      });

      test("NEG: Parse config with invalid ext with one-optimize", function () {
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.circle'
        const content = `
[one-optimize]
input_path=model.rectangle
output_path=model.opt.rectangle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });

    suite("#one-codegen section", function () {
      test("Parse basic example with one-codegen", function () {
        const content = `
[one-codegen]
backend=dummy
command=model.tvn
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const productPath = testBuilder.getPath("model.tvn");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath)
          );
        }
      });

      test("NEG: Parse config with invalid ext with one-codegen", function () {
        // ERROR INJECTION
        // Invalid ext '.rectangle' instead of '.tvn'
        const content = `
[one-codegen]
backend=dummy
command=model.rectangle
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });

      test("Check extra files", function () {
        const content = `
[one-codegen]
backend=dummy
command=--save-temps --save-allocations model.tvn
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const productPath = testBuilder.getPath("model.tvn");
        const extra1Path = testBuilder.getPath("model.tv2w");
        const extra2Path = testBuilder.getPath("model.tv2m");
        const extra3Path = testBuilder.getPath("model.tv2o");
        const extra4Path = testBuilder.getPath("model.tracealloc.json");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(productPath)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(extra1Path)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(extra2Path)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(extra3Path)
          );
          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(extra4Path)
          );
        }
      });
    });

    suite("#one-profile section", function () {
      test("Parse basic example with one-profile", function () {
        const content = `
[one-profile]
command=--save-chrome-trace trace.json
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const tracePath = testBuilder.getPath("trace.json");

        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.notStrictEqual(configObj!.getProducts.length, 0);

          assert.isTrue(
            configObj!.getProducts
              .map((product) => product.path)
              .includes(tracePath)
          );
        }
      });

      test("NEG: Un-matching ext (not .json)", function () {
        const content = `
[one-profile]
command=--save-chrome-trace trace.unexpected
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });

      test(`NEG: Typo in a key 'command'`, function () {
        // INJECTED DEFECT
        // 'commands' intead of 'command'
        //
        // EXPECTED BEHAVIOR
        // trace.json not found
        const content = `
[one-profile]
commands=--save-chrome-trace trace.json
        `;

        // Write a file inside a temp directory
        testBuilder.writeFileSync("model.cfg", content);

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath("model.cfg");
        const configObj = ConfigObj.createConfigObj(
          vscode.Uri.file(configPath)
        );

        // Validation
        {
          assert.isDefined(configObj);
          assert.strictEqual(configObj!.getBaseModels.length, 0);
          assert.strictEqual(configObj!.getProducts.length, 0);
        }
      });
    });

    teardown(() => {
      testBuilder.tearDown();
    });
  });
});
