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
import { ToolArgs } from "../../Job/ToolArgs";

suite("Job", function () {
  suite("ToolArgs", function () {
    suite("#add()", function () {
      test("adds option without value", function () {
        let option = "option";
        let value = undefined;

        let toolArgs = new ToolArgs();
        toolArgs.add(option, value);

        let expected: Array<string> = [];
        assert.includeOrderedMembers(toolArgs, expected);
      });
      test("adds option and then value", function () {
        let option = "option";
        let value = "value";

        let toolArgs = new ToolArgs();
        toolArgs.add(option, value);

        let expected: Array<string> = [option, value];
        assert.includeOrderedMembers(toolArgs, expected);
      });
    });
  });
});
