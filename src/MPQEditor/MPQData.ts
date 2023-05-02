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

export class MPQData {
  private _content: any;
  private _allModelLayers: string[] | undefined; // all model layers
  private _defaultModelLayers?: string[]; // layers that will be quantized by default
  private _visqPath: string = ""; // empty means no visqData is provided

  static _layersKey: string = "layers";
  static _nameKey: string = "name";
  static _defQuantizationKey: string = "default_quantization_dtype";
  static _defGranularityKey: string = "default_granularity";

  constructor() {}

  // returns data encoded or stringfied as string
  getAsString(): string {
    return JSON.stringify(this._content, null, " ");
  }

  // construct object from JSON string
  setWithString(text: string) {
    this._content = JSON.parse(text);
  }

  // set section (parameter) for default quantization
  setSection(section: string, value: string) {
    this._content[section] = value;
  }

  // read section of default quantization
  getSection(key: string): string {
    return this._content[key].toString();
  }

  // set all model layers, which make up the model
  setAllModelLayers(modelLayers: string[]) {
    if (!modelLayers || modelLayers.length < 1) {
      throw Error("Invalid model layers");
    }

    this._allModelLayers = modelLayers.filter((name) => name.length > 0);
    this.filterDefaultModelLayersByContent();
  }

  // add layers to layers with specific quantization parameters
  addLayers(names: string[]): void {
    if (names.length < 1) {
      return;
    }

    const otherQuantization =
      this._content[MPQData._defQuantizationKey] === "uint8"
        ? "int16"
        : "uint8";
    let quantization = Array<string>(names.length);
    quantization.fill(otherQuantization);
    let granularity = Array<string>(names.length);
    granularity.fill(this._content[MPQData._defGranularityKey]);
    this.setLayersSections(names, quantization, granularity);
  }

  // get layers, which will be quantized by default
  getDefaultModelLayers(): string[] | undefined {
    return this._defaultModelLayers;
  }

  // get layers, which will NOT be qauntized by default
  getLayers(): string[] {
    return this._content[MPQData._layersKey].map(
      (item: any) => item[MPQData._nameKey]
    );
  }

  // update section(quantization parameter) of nondefault layer
  updateSectionOfLayer(name: string, section: string, value: string) {
    let layer = this._content[MPQData._layersKey].find(
      (x: any) => x["name"] === name
    );
    if (layer) {
      layer[section] = value;
    } else {
      throw Error("Invalid layer name");
    }
  }

  // set layers to be quantized by default
  setLayersToDefault(names: any) {
    names.forEach((name: any) => {
      let foundIndex = this._content[MPQData._layersKey].findIndex(
        (x: any) => x["name"] === name
      );
      if (foundIndex > -1) {
        this._content[MPQData._layersKey].splice(foundIndex, 1);
      } else {
        throw Error("Invalid layer name");
      }
    });
    this.filterDefaultModelLayersByContent();
  }

  setLayers(names: string[]) {
    let layersToAdd = Array<string>();
    let layersToDefault = Array<string>();
    this._content[MPQData._layersKey].forEach((layer: any) => {
      let foundIndex = names.findIndex(
        (name: string) => name === layer[MPQData._nameKey]
      );
      if (foundIndex < 0) {
        // name to default
        layersToDefault.push(layer["name"]);
      }
    });
    names.forEach((name: any) => {
      let foundIndex = this._content[MPQData._layersKey].findIndex(
        (x: any) => x[MPQData._nameKey] === name
      );
      if (foundIndex < 0) {
        // name to add
        layersToAdd.push(name);
      }
    });
    this.setLayersToDefault(layersToDefault);
    this.addLayers(layersToAdd);

    return layersToAdd;
  }

  get visqPath(): string {
    return this._visqPath;
  }

  set visqPath(path: string) {
    this._visqPath = path;
  }

  private filterDefaultModelLayersByContent() {
    let layers = this.getLayers();
    this._defaultModelLayers = this._allModelLayers?.filter(
      (name) =>
        layers.find((filterName: string) => name === filterName) === undefined
    );
  }

  private setLayersSections(
    names: string[],
    quantization: string[],
    granularity: string[]
  ) {
    if (!(MPQData._layersKey in this._content)) {
      this._content[MPQData._layersKey] = [];
    }

    for (let i = 0; i < names.length; i++) {
      // check layer validity
      if (!this._allModelLayers?.find((x: string) => x === names[i])) {
        throw Error("Invalid layer name");
      }

      let layer = {
        name: names[i],
        dtype: quantization[i],
        granularity: granularity[i],
      };
      this._content[MPQData._layersKey].push(layer);
    }
    this.filterDefaultModelLayersByContent();
  }
}
