/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { assert } from "chai";
import { MPQEditorProvider } from "../../MPQEditor/MPQEditor";
import { TestBuilder } from "../TestBuilder";

suite("MPQEditor", function () {
  suite("MPQEditorProvider", function () {
    let testBuilder: TestBuilder;

    setup(() => {
      testBuilder = new TestBuilder(this);
      testBuilder.setUp();
    });

    teardown(() => {
      testBuilder.tearDown();
    });

    suite("#validateMPQName", function () {
      test("test validateMPQName", function () {
        const dirPath: string = testBuilder.dirInTemp;
        const mpqName: string = "model-test-validateMPQName.mpq.json";

        const retValue = MPQEditorProvider.validateMPQName(dirPath, mpqName);
        assert.isUndefined(retValue);
      });

      test("NEG: test validateMPQName which exists", function () {
        const dirPath: string = testBuilder.dirInTemp;
        const mpqName: string =
          "model-test-validateMPQName_NEG_EXISTS.mpq.json";
        const content = `empty content`;

        testBuilder.writeFileSync(mpqName, content);
        const retValue = MPQEditorProvider.validateMPQName(dirPath, mpqName);
        assert.isDefined(retValue);
      });

      test("NEG: test validateMPQName with wrong extension", function () {
        const dirPath: string = testBuilder.dirInTemp;
        const mpqName: string = "model-test-validateMPQName_NEG_EXT.json";

        const retValue = MPQEditorProvider.validateMPQName(dirPath, mpqName);
        assert.isDefined(retValue);
      });
    });

    suite("#findMPQName", function () {
      test("test findMPQName", function () {
        const baseMPQName: string = "model";
        const dirPath: string = testBuilder.dirInTemp;

        const content = `
            empty content
            `;

        let targetNames: string[] = [
          "model.mpq.json",
          "model(1).mpq.json",
          "model(2).mpq.json",
          "model(3).mpq.json",
        ];

        for (let i = 0; i < targetNames.length; i++) {
          // Get file paths inside the temp directory
          const mpqName = MPQEditorProvider.findMPQName(baseMPQName, dirPath);
          assert.isDefined(mpqName);
          assert.strictEqual(mpqName, targetNames[i]);

          // create dummy mpq.json file
          testBuilder.writeFileSync(mpqName!, content);
        }
      });

      test("NEG: findMPQName throws on empty string", function () {
        const dirPath: string = testBuilder.dirInTemp;
        assert.throws(() => MPQEditorProvider.findMPQName("", dirPath));
      });
    });

    suite("#createDefaultMPQ", function () {
      test("test createDefaultMPQ", function () {
        // create dummy mpq.json file
        const dirPath: string = testBuilder.dirInTemp;
        const mpqName: string = "model-test-createMPQ.mpq.json";
        const circleName: string = "model-test-createMPQ.circle";
        MPQEditorProvider.createDefaultMPQ(mpqName, dirPath, circleName).then(
          (uri) => {
            assert.isTrue(uri !== undefined);
            const mpqPath: string = path.join(dirPath, mpqName);
            assert.isTrue(fs.existsSync(mpqPath));
            const contents: string = fs.readFileSync(mpqPath, "utf-8");
            const cont: any = JSON.parse(contents);
            assert.strictEqual(cont["default_quantization_dtype"], "uint8");
            assert.strictEqual(cont["default_granularity"], "channel");
            assert.strictEqual(cont["model_path"], circleName);
          }
        );
      });
      test("NEG: test createDefaultMPQ on exsisting file", function () {
        // create dummy mpq.json file
        const dirPath: string = testBuilder.dirInTemp;
        const mpqName: string = "model-test-createMPQ_NEG.mpq.json";
        const circleName: string = "model-test-createMPQ_NEG.circle";

        const content = `empty content`;
        testBuilder.writeFileSync(mpqName, content);

        MPQEditorProvider.createDefaultMPQ(mpqName, dirPath, circleName).then(
          (uri) => {
            assert.isTrue(uri === undefined);
          }
        );
      });
    });

    suite("#updateDocumentBy", function () {
      test("update document by", async function () {
        const dirPath: string = testBuilder.dirInTemp;
        const mpqName: string = "model-test-updateDocumentBy.mpq.json";
        const circleName: string = "model-test-updateDocumentBy.circle";

        const uri = await MPQEditorProvider.createDefaultMPQ(
          mpqName,
          dirPath,
          circleName
        );
        assert.isTrue(uri !== undefined);

        let document = await vscode.workspace.openTextDocument(uri!);

        const newJson = `{"default_quantization_dtype": "int16",
          "default_granularity": "layer",
          "layers": [],
          "model_path": "sample_1.circle"}`;

        await MPQEditorProvider.updateDocumentBy(document, newJson);

        document.save();
        const newJsonText: string = document.getText();
        const newCont = JSON.parse(newJsonText);
        assert.strictEqual(newCont["default_quantization_dtype"], "int16");
        assert.strictEqual(newCont["default_granularity"], "layer");
        assert.strictEqual(newCont["model_path"], "sample_1.circle");
      });
    });
  });
});
