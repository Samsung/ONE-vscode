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
import * as ini from "ini";

import { LocatorRunner } from "../../../OneExplorer/ArtifactLocator";
import { EdgeTpuConfigSetting } from "../../../OneExplorer/ConfigSettings/EdgeTpuConfigSetting";

suite("OneExplorer", function () {
  suite("ConfigSettings", function () {
    suite("EdgeTpuConfigSetting", function () {
      suite("#constructor", function () {
        test("Create one config setting", function () {
          assert.doesNotThrow(() => new EdgeTpuConfigSetting());

          const configSetting = new EdgeTpuConfigSetting();
          assert.isTrue(configSetting instanceof EdgeTpuConfigSetting);
        });
      });

      suite("#init()", function () {
        test("init one config setting", function () {
          const configSetting = new EdgeTpuConfigSetting();
          assert.isTrue(configSetting instanceof EdgeTpuConfigSetting);

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
        test("edgetpu config setting change output_path by adding postfix(_edgetpu) to new_path", function () {
          const inputPath = "model.tflite";
          const outputPath = "model_edgetpu.tflite";
          const kSection = "edgetpu-compile";
          const edgetpucfg = `
[edgetpu-compile]
input_path=${inputPath}
          `;
          const rawObj = ini.parse(edgetpucfg);

          const configSetting = new EdgeTpuConfigSetting();
          assert.isTrue(configSetting instanceof EdgeTpuConfigSetting);

          assert.doesNotThrow(() =>
            configSetting.updateOutPath(inputPath, rawObj, kSection)
          );
          console.log(rawObj);
          assert.isDefined(rawObj["edgetpu-compile"].output_path);
          assert.equal(outputPath, rawObj["edgetpu-compile"].output_path);
        });
      });
    });
  });
});
