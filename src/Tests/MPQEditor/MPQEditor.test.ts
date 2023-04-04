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
  });
});
