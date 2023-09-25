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

import { LocatorRunner } from "../../../OneExplorer/ArtifactLocator";
import { OneConfigSetting } from "../../../OneExplorer/ConfigSettings/OneConfigSetting";

suite("OneExplorer", function () {
  suite("ConfigSettings", function () {
    suite("OneConfigSetting", function () {
      suite("#constructor", function () {
        test("Create one config setting", function () {
          assert.doesNotThrow(() => new OneConfigSetting());

          const configSetting = new OneConfigSetting();
          assert.isTrue(configSetting instanceof OneConfigSetting);
        });
      });

      suite("#init()", function () {
        test("init one config setting", function () {
          const configSetting = new OneConfigSetting();
          assert.isTrue(configSetting instanceof OneConfigSetting);

          assert.doesNotThrow(() => configSetting.init());
          assert.isTrue(
            configSetting.baseModelsLocatorRunner instanceof LocatorRunner
          );
          assert.isTrue(
            configSetting.productsLocatorRunner instanceof LocatorRunner
          );
        });
      });

      suite("#updateOutPath()", function () {
        test("one config setting does not change output_path", function () {
          const configSetting = new OneConfigSetting();
          assert.isTrue(configSetting instanceof OneConfigSetting);

          assert.doesNotThrow(() => configSetting.updateOutPath());
        });
      });
    });
  });
});
