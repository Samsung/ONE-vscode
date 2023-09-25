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

import * as ini from "ini";
import { ICfgData } from "./ICfgData";

const sections = ["edgetpu-compiler", "edgetpu-compile", "edgetpu-profile"];

export class EdgeTpuCfgData implements ICfgData {
  private _edgeTpuConfig: any = undefined;

  constructor() {}

  getAsConfig(): any {
    return this._edgeTpuConfig;
  }

  getAsString(): string {
    return ini.stringify(this._edgeTpuConfig);
  }

  setWithConfig(cfg: any): void {
    this._edgeTpuConfig = cfg;
  }

  setWithString(text: string): void {
    this._edgeTpuConfig = ini.parse(text);
  }

  updateSectionWithKeyValue(section: string, key: string, value: string): void {
    if (this._edgeTpuConfig[section] === undefined) {
      this._edgeTpuConfig[section] = {};
    }

    if (this._edgeTpuConfig[section][key] === undefined) {
      this._edgeTpuConfig[section][key] = "";
    }
    this._edgeTpuConfig[section][key] = value;
  }

  updateSectionWithValue(section: string, value: string): void {
    // value should be encoded or stringfied
    this._edgeTpuConfig[section] = ini.parse(value);
  }

  isSame(textStringified: string): boolean {
    const iniDocument = ini.parse(textStringified);
    for (const [sectionName, section] of Object.entries(this._edgeTpuConfig)) {
      for (const [paramName, param] of Object.entries(section as any)) {
        if (
          iniDocument[sectionName] !== undefined &&
          iniDocument[sectionName][paramName] === param
        ) {
          continue;
        }
        return false;
      }
    }
    for (const [sectionName, section] of Object.entries(iniDocument)) {
      for (const [paramName, param] of Object.entries(section as any)) {
        if (
          this._edgeTpuConfig[sectionName] !== undefined &&
          this._edgeTpuConfig[sectionName][paramName] === param
        ) {
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
      if (this._edgeTpuConfig[section] !== undefined) {
        sorted[section] = this._edgeTpuConfig[section];
      }
    });
    this.setWithConfig(sorted);
  }
}
