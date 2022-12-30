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

import { generateHash } from "../../Utils/Hash";
import { TestBuilder } from "../TestBuilder";

suite("Utils", function () {
  suite("Hash", function () {
    let testBuilder: TestBuilder;
    setup(() => {
      testBuilder = new TestBuilder(this);
      testBuilder.setUp();
    });

    teardown(() => {
      testBuilder.tearDown();
    });

    suite("#generateHash()", function () {
      test("generate a file hash", async function () {
        const exampleName = "example.txt";
        const examplePath = testBuilder.getPath(exampleName);
        testBuilder.writeFileSync(exampleName, "This is an example text file.");

        const hash = await generateHash(vscode.Uri.file(examplePath));
        assert.isString(hash);
        assert.strictEqual(
          hash,
          "f95fa5b0700b1a7cf6551a87b777faae0fdf3b824ee1a2def87e7631940e006c"
        );
      });

      test("NEG: generate non-existing file hash", function (pass) {
        const notExistingPath = testBuilder.getPath("non-existing");
        generateHash(vscode.Uri.file(notExistingPath)).catch(() => {
          pass();
          assert.ok(true);
        });
      });
    });
  });
});
