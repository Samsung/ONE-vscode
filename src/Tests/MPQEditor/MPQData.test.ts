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
import { MPQData } from "../../MPQEditor/MPQData";

const defaultMPQText = `{
 "default_quantization_dtype": "uint8",
 "default_granularity": "channel",
 "layers": [],
 "model_path": "sample.circle"
}`;

suite("MPQData", function () {
  suite("#constructor()", function () {
    test("is constructed", function () {
      const data = new MPQData();
      assert.instanceOf(data, MPQData);
    });
  });
  suite("#setWithString()", function () {
    test("sets object with string and checks parsed params", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      const dataStr = data.getAsString();
      assert.strictEqual(dataStr, defaultMPQText);

      let dtype = data.getSection(MPQData._defQuantizationKey);
      assert.strictEqual(dtype, "uint8");

      data.setSection(MPQData._defQuantizationKey, "int16");
      dtype = data.getSection(MPQData._defQuantizationKey);
      assert.strictEqual(dtype, "int16");
    });

    test("NEG: set data with empty string", function () {
      let data = new MPQData();
      assert.throws(() => data.setWithString(""));
    });
  });

  suite("#setAllModelLayers", function () {
    test("set model layers", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      let allLayers = ["layer_1", "layer_2"];
      data.setAllModelLayers(allLayers);
      // layers should contain both layers
      const layers = data.getDefaultModelLayers();
      const index1 = layers?.findIndex((name) => name === "layer_1");
      const index2 = layers?.findIndex((name) => name === "layer_2");

      assert.isTrue(index1 !== -1);
      assert.isTrue(index2 !== -1);
    });

    test("NEG: set empty model layers", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      assert.throws(() => data.setAllModelLayers([]));
    });
  });

  suite("#addLayers", function () {
    test("add layers", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      let allLayers = ["layer_1", "layer_2"];
      data.setAllModelLayers(allLayers);

      // add specific layer
      data.addLayers(["layer_1"]);
      // so now default layers should contain only "layer_2"
      const layers = data.getDefaultModelLayers();
      const index1 = layers?.findIndex((name) => name === "layer_1");
      const index2 = layers?.findIndex((name) => name === "layer_2");

      assert.isTrue(index1 === -1);
      assert.isTrue(index2 !== -1);

      let cont = JSON.parse(data.getAsString());
      let layer = cont[MPQData._layersKey].find(
        (layer: any) => layer[MPQData._nameKey]
      );

      assert.strictEqual(layer["dtype"], "int16");
    });

    test("NEG: add invalid layers", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      let allLayers = ["layer_1"];
      data.setAllModelLayers(allLayers);
      assert.throws(() => data.addLayers(["layer_2"]));
    });
  });

  suite("#updateSectionOfLayer", function () {
    test("update section of the layer", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      let allLayers = ["layer_1"];
      data.setAllModelLayers(allLayers);
      // add specific layer
      data.addLayers(["layer_1"]);
      data.updateSectionOfLayer("layer_1", "dtype", "uint8");
      let cont = JSON.parse(data.getAsString());
      let layer = cont[MPQData._layersKey].find(
        (layer: any) => layer[MPQData._nameKey]
      );
      assert.strictEqual(layer["dtype"], "uint8");
    });

    test("NEG: update section of the default layer", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      let allLayers = ["layer_1"];
      data.setAllModelLayers(allLayers);
      // add specific layer
      data.addLayers(["layer_1"]);
      assert.throws(() =>
        data.updateSectionOfLayer("layer_2", "dtype", "uint8")
      );
    });
  });

  suite("#setLayersToDefault", function () {
    test("set layers to default", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      let allLayers = ["layer_1", "layer_2"];
      data.setAllModelLayers(allLayers);
      // add specific layer
      data.addLayers(["layer_1"]);

      data.setLayersToDefault(["layer_1"]);
      let layers = data.getDefaultModelLayers();
      let index1 = layers?.findIndex((name) => name === "layer_1");
      let index2 = layers?.findIndex((name) => name === "layer_2");
      assert.isTrue(index1 !== -1);
      assert.isTrue(index2 !== -1);
    });

    test("NEG: set layers to default", function () {
      let data = new MPQData();
      data.setWithString(defaultMPQText);
      let allLayers = ["layer_1", "layer_2"];
      data.setAllModelLayers(allLayers);
      // add specific layer
      data.addLayers(["layer_1"]);

      assert.throws(() => data.setLayersToDefault(["layer_2"]));
    });
  });
});
