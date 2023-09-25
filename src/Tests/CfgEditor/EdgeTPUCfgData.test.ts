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

import { EdgeTpuCfgData } from "../../CfgEditor/EdgeTPUCfgData";

// NOTE
// sampleEdgeTpuCfgText and sampleEdgeTpuCfgText1 are the same.
// But others are different.
const sampleEdgeTpuCfgText = `
[edgetpu-compiler]
edgetpu-compile=True
edgetpu-profile=False

[edgetpu-compile]
input_path=/home/usr/ONE-vscode/res/modelDir/truediv/model.tflite
output_path=/home/usr/ONE-vscode/res/modelDir/truediv/model_edgetpu.tflite
`;

// eslint-disable-next-line no-unused-vars
const sampleEdgeTpuCfgText1 = `
[edgetpu-compile]
input_path=/home/usr/ONE-vscode/res/modelDir/truediv/model.tflite
output_path=/home/usr/ONE-vscode/res/modelDir/truediv/model_edgetpu.tflite

[edgetpu-compiler]
edgetpu-compile=True
edgetpu-profile=False
`;

const sampleEdgeTpuCfgText2 = `
[edgetpu-compiler]
edgetpu-compile=True
edgetpu-profile=False

[edgetpu-compile]
input_path=/home/usr/ONE-vscode/res/modelDir/truediv/model.tflite
output_path=/home/usr/ONE-vscode/res/modelDir/truediv/model_edgetpu.tflite
intermediate_tensors=opr1
show_operations=True
`;

const sampleEdgeTpuCfgText3 = `
[edgetpu-compiler]
edgetpu-compile=True
edgetpu-profile=False

[edgetpu-compile]
input_path=/home/usr/ONE-vscode/res/modelDir/truediv/model.tflite
output_path=/home/usr/ONE-vscode/res/modelDir/truediv/model_edgetpu.tflite
show_operations=True
search_delegate=True
delegate_search_step=1
`;

suite("EdgetpuCfgEditor", function () {
  suite("EdgetpuCfgData", function () {
    suite("#constructor()", function () {
      test("is constructed", function () {
        const data = new EdgeTpuCfgData();
        assert.instanceOf(data, EdgeTpuCfgData);
      });
    });

    suite("#setWithConfig()", function () {
      test("sets with decoded/parsed config param", function () {
        let data = new EdgeTpuCfgData();
        const cfg = ini.parse(sampleEdgeTpuCfgText);
        data.setWithConfig(cfg);
        const dataCfg = data.getAsConfig();
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
      });

      test("sets with decoded/parsed config param 2", function () {
        let data = new EdgeTpuCfgData();
        const cfg = ini.parse(sampleEdgeTpuCfgText2);
        data.setWithConfig(cfg);
        const dataCfg = data.getAsConfig();
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["intermediate_tensors"],
          cfg["edgetpu-compile"]["intermediate_tensors"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["show_operations"],
          cfg["edgetpu-compile"]["show_operations"]
        );
      });

      test("sets with decoded/parsed config param 3", function () {
        let data = new EdgeTpuCfgData();
        const cfg = ini.parse(sampleEdgeTpuCfgText3);
        data.setWithConfig(cfg);
        const dataCfg = data.getAsConfig();
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["show_operations"],
          cfg["edgetpu-compile"]["show_operations"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["search_delegate"],
          cfg["edgetpu-compile"]["search_delegate"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["delegate_search_step"],
          cfg["edgetpu-compile"]["delegate_search_step"]
        );
      });
    });

    suite("#setWithString()", function () {
      test("sets with encoded/stringified text param", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        const dataCfg = data.getAsConfig();
        const cfg = ini.parse(sampleEdgeTpuCfgText);
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
      });

      test("sets with encoded/stringified text param 2", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText2);
        const dataCfg = data.getAsConfig();
        const cfg = ini.parse(sampleEdgeTpuCfgText2);
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["intermediate_tensors"],
          cfg["edgetpu-compile"]["intermediate_tensors"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["show_operations"],
          cfg["edgetpu-compile"]["show_operations"]
        );
      });

      test("sets with encoded/stringified text param 3", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText3);
        const dataCfg = data.getAsConfig();
        const cfg = ini.parse(sampleEdgeTpuCfgText3);
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["show_operations"],
          cfg["edgetpu-compile"]["show_operations"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["search_delegate"],
          cfg["edgetpu-compile"]["search_delegate"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["delegate_search_step"],
          cfg["edgetpu-compile"]["delegate_search_step"]
        );
      });
    });

    suite("#getAsConfig()", function () {
      test("gets OneConfig decoded/parsed", function () {
        let data = new EdgeTpuCfgData();
        const cfg = ini.parse(sampleEdgeTpuCfgText);
        data.setWithConfig(cfg);
        const dataCfg = data.getAsConfig();
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
      });

      test("gets OneConfig decoded/parsed 2", function () {
        let data = new EdgeTpuCfgData();
        const cfg = ini.parse(sampleEdgeTpuCfgText2);
        data.setWithConfig(cfg);
        const dataCfg = data.getAsConfig();
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["intermediate_tensors"],
          cfg["edgetpu-compile"]["intermediate_tensors"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["show_operations"],
          cfg["edgetpu-compile"]["show_operations"]
        );
      });

      test("gets OneConfig decoded/parsed 3", function () {
        let data = new EdgeTpuCfgData();
        const cfg = ini.parse(sampleEdgeTpuCfgText3);
        data.setWithConfig(cfg);
        const dataCfg = data.getAsConfig();
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-compile"],
          cfg["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compiler"]["edgetpu-profile"],
          cfg["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["input_path"],
          cfg["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["output_path"],
          cfg["edgetpu-compile"]["output_path"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["show_operations"],
          cfg["edgetpu-compile"]["show_operations"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["search_delegate"],
          cfg["edgetpu-compile"]["search_delegate"]
        );
        assert.strictEqual(
          dataCfg["edgetpu-compile"]["delegate_search_step"],
          cfg["edgetpu-compile"]["delegate_search_step"]
        );
      });
    });

    suite("#getAsString()", function () {
      test("gets string encoded/stringified", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        const cfg1 = data.getAsConfig();

        const stringfied = data.getAsString();
        let data2 = new EdgeTpuCfgData();
        data2.setWithString(stringfied);
        const cfg2 = data2.getAsConfig();

        assert.strictEqual(
          cfg1["edgetpu-compiler"]["edgetpu-compile"],
          cfg2["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compiler"]["edgetpu-profile"],
          cfg2["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["input_path"],
          cfg2["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["output_path"],
          cfg2["edgetpu-compile"]["output_path"]
        );
      });

      test("gets string encoded/stringified 2", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        const cfg1 = data.getAsConfig();

        const stringfied = data.getAsString();
        let data2 = new EdgeTpuCfgData();
        data2.setWithString(stringfied);
        const cfg2 = data2.getAsConfig();

        assert.strictEqual(
          cfg1["edgetpu-compiler"]["edgetpu-compile"],
          cfg2["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compiler"]["edgetpu-profile"],
          cfg2["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["input_path"],
          cfg2["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["output_path"],
          cfg2["edgetpu-compile"]["output_path"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["intermediate_tensors"],
          cfg2["edgetpu-compile"]["intermediate_tensors"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["show_operations"],
          cfg2["edgetpu-compile"]["show_operations"]
        );
      });

      test("gets string encoded/stringified 3", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        const cfg1 = data.getAsConfig();

        const stringfied = data.getAsString();
        let data2 = new EdgeTpuCfgData();
        data2.setWithString(stringfied);
        const cfg2 = data2.getAsConfig();

        assert.strictEqual(
          cfg1["edgetpu-compiler"]["edgetpu-compile"],
          cfg2["edgetpu-compiler"]["edgetpu-compile"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compiler"]["edgetpu-profile"],
          cfg2["edgetpu-compiler"]["edgetpu-profile"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["input_path"],
          cfg2["edgetpu-compile"]["input_path"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["output_path"],
          cfg2["edgetpu-compile"]["output_path"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["show_operations"],
          cfg2["edgetpu-compile"]["show_operations"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["search_delegate"],
          cfg2["edgetpu-compile"]["search_delegate"]
        );
        assert.strictEqual(
          cfg1["edgetpu-compile"]["delegate_search_step"],
          cfg2["edgetpu-compile"]["delegate_search_step"]
        );
      });
    });

    suite("#updateSectionWithKeyValue()", function () {
      test("update key of section which already exists-1", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText2);
        data.updateSectionWithKeyValue(
          "edgetpu-compile",
          "intermediate_tensors",
          "opr1, opr2"
        );
        const cfg = data.getAsConfig();
        assert.strictEqual(
          cfg["edgetpu-compile"]["intermediate_tensors"],
          "opr1, opr2"
        );
      });
      test("update key of section which already exists-2", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText3);
        data.updateSectionWithKeyValue(
          "edgetpu-compile",
          "delegate_search_step",
          "3"
        );
        const cfg = data.getAsConfig();
        assert.strictEqual(cfg["edgetpu-compile"]["delegate_search_step"], "3");
      });
      test("update section which is not written", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        data.updateSectionWithKeyValue(
          "edgetpu-compile",
          "intermediate_tensors",
          "opr1, opr2"
        );
        const cfg = data.getAsConfig();
        assert.strictEqual(
          cfg["edgetpu-compile"]["intermediate_tensors"],
          "opr1, opr2"
        );
      });
    });

    suite("#updateSectionWithValue()", function () {
      test("update section of config with value encoded/stringified", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        const stringified: string = `
input_path=./inception_v3.tflite
output_path=./inception_v3_edgetpu.tflite
intermediate_tensors=opr1
show_operations=True
          `;
        data.updateSectionWithValue("edgetpu-compile", stringified);
        const cfg = data.getAsConfig();
        assert.strictEqual(
          cfg["edgetpu-compile"]["input_path"],
          "./inception_v3.tflite"
        );
        assert.strictEqual(
          cfg["edgetpu-compile"]["output_path"],
          "./inception_v3_edgetpu.tflite"
        );
        assert.strictEqual(
          cfg["edgetpu-compile"]["intermediate_tensors"],
          "opr1"
        );
        assert.strictEqual(cfg["edgetpu-compile"]["show_operations"], "True");
      });
    });

    suite("#isSame()", function () {
      test("is same to string encoded/stringified", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        const isSame: boolean = data.isSame(sampleEdgeTpuCfgText1);
        assert.isTrue(isSame);
      });
      test("is not same to string encoded/stringified", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        const isSame: boolean = data.isSame(sampleEdgeTpuCfgText2);
        assert.isNotTrue(isSame);
      });
      test("is not same to string encoded/stringified - 2", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        const isSame: boolean = data.isSame(sampleEdgeTpuCfgText3);
        assert.isNotTrue(isSame);
      });
    });

    suite("#sorted()", function () {
      test("sorts config", function () {
        let data = new EdgeTpuCfgData();
        data.setWithString(sampleEdgeTpuCfgText);
        data.sort();
        const isSame: boolean = data.isSame(sampleEdgeTpuCfgText1);
        assert.isTrue(isSame);
      });
    });
  });
});
