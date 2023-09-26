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

export abstract class ICfgData {
  //config can be undefined
  private _config: any;
  //section must be existed
  private _section!: string[];

  constructor(_config: any, _section: string[]) {
    this._config = _config;
    this._section = _section;
  }

  // sets data with object decoded or parsed
  abstract setWithConfig(cfg: any): void;
  // sets data with string encoded or stringfied
  abstract setWithString(text: string): void;
  abstract updateSectionWithKeyValue(
    section: string,
    key: string,
    value: string
  ): void;
  abstract updateSectionWithValue(section: string, value: string): void;

  // set cfgData's config
  // only child class can use this method
  protected setConfig(cfg: any): void {
    this._config = cfg;
  }

  // returns data decoded or parsed as object
  getAsConfig(): any {
    return this._config;
  }
  // returns data encoded or stringfied as string
  getAsString(): string {
    return ini.stringify(this._config);
  }

  isSame(textStringified: string): boolean {
    const iniDocument = ini.parse(textStringified);
    for (const [sectionName, section] of Object.entries(this._config)) {
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
          this._config[sectionName] !== undefined &&
          this._config[sectionName][paramName] === param
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
    this._section.forEach((section) => {
      if (this._config[section] !== undefined) {
        sorted[section] = this._config[section];
      }
    });
    this.setWithConfig(sorted);
  }
}
