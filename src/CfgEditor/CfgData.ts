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

import * as ini from 'ini';

const sections = [
  'onecc', 'one-import-tf', 'one-import-tflite', 'one-import-bcq', 'one-import-onnx',
  'one-optimize', 'one-quantize', 'one-codegen', 'one-profile'
];

export class CfgData {
  private _oneConfig: any = undefined;

  constructor() {}

  getOneConfig(): any {
    return this._oneConfig;
  }

  getStringfied(): string {
    return ini.stringify(this._oneConfig);
  }

  updateWithParsedConfig(cfg: any): void {
    this._oneConfig = cfg;
  }

  updateWithStringifiedText(text: string): void {
    this._oneConfig = ini.parse(text);

    // TODO Separate handling deprecated elements
    // NOTE 'one-build' will be deprecated.
    //      Therefore, when only 'one-build' is used, it will be replaced to 'onecc'.
    if (this._oneConfig['onecc'] === undefined && this._oneConfig['one-build'] !== undefined) {
      this._oneConfig['onecc'] = ini.parse(ini.stringify(this._oneConfig['one-build']));
      delete this._oneConfig['one-build'];
    }
    // NOTE 'input_dtype' is deprecated.
    //      Therefore, when only 'input_dtype' is used, it will be replaced to 'onecc'.
    if (this._oneConfig['one-quantize']?.['input_dtype'] !== undefined) {
      if (this._oneConfig['one-quantize']['input_model_dtype'] === undefined) {
        this._oneConfig['one-quantize']['input_model_dtype'] =
            this._oneConfig['one-quantize']['input_dtype'];
      }
      delete this._oneConfig['one-quantize']['input_dtype'];
    }
  }

  setParam(section: string, param: string, value: string): void {
    if (this._oneConfig[section] === undefined) {
      this._oneConfig[section] = {};
    }
    if (this._oneConfig[section][param] === undefined) {
      this._oneConfig[section][param] = '';
    }
    this._oneConfig[section][param] = value;
  }

  setSection(section: string, paramStringified: string): void {
    this._oneConfig[section] = ini.parse(paramStringified);
  }

  isSame(textStringified: string): boolean {
    const iniDocument = ini.parse(textStringified);
    for (const [sectionName, section] of Object.entries(this._oneConfig)) {
      for (const [paramName, param] of Object.entries(section as any)) {
        if (iniDocument[sectionName] !== undefined &&
            iniDocument[sectionName][paramName] === param) {
          continue;
        }
        return false;
      }
    }
    for (const [sectionName, section] of Object.entries(iniDocument)) {
      for (const [paramName, param] of Object.entries(section as any)) {
        if (this._oneConfig[sectionName] !== undefined &&
            this._oneConfig[sectionName][paramName] === param) {
          continue;
        }
        return false;
      }
    }
    return true;
  }

  sort(): void {
    // cfg file is written along with the order of array elements
    let sorted: any = {};
    sections.forEach((section) => {
      if (this._oneConfig[section] !== undefined) {
        sorted[section] = this._oneConfig[section];
      }
    });
    this.updateWithParsedConfig(sorted);
  }
}
