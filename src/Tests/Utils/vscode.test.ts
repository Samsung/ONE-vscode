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

/**
 * NOTE This is for the purpose of testing the functions of the library
 * being provided and writing down how to use it, not testing the function
 * of this project.
 */

import * as vscode from "vscode";

import { assert } from "chai";
import { TestBuilder } from "../TestBuilder";

suite("vscode", function () {
  suite("workspace", function () {
    let testBuilder: TestBuilder;

    setup(() => {
      testBuilder = new TestBuilder(this);
      testBuilder.setUp();
    });

    suite("#workspaceEdit", async function () {
      testBuilder.writeFileSync("test.txt", `"A": "a"`);
      const uri = vscode.Uri.file(testBuilder.getPath("test.txt"));

      let document = await vscode.workspace.openTextDocument(uri);

      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        document.uri,
        new vscode.Range(0, 0, document.lineCount, 0),
        `"A":"b"`
      );

      await vscode.workspace.applyEdit(edit);
      await document.save();

      const newText: string = document.getText();
      const newCont = JSON.parse(newText);
      assert.strictEqual(newCont["A"], "b");
    });

    teardown(() => {
      testBuilder.tearDown();
    });
  });
});
