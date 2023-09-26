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

import * as ini from "ini";
import { ICfgData } from "./ICfgData";
import { Sections } from "./Sections";

// NOTE: Why is not function overloadding used? Its maintain costs expensive.
// Compared to C++, TS supports function overloading very compilcated like
// class TSClass {
//   // declare function signatures to overload
//   set(sth: A);
//   set(sth: B);
//   // implementation is the only one
//   set(sth: unknown) {
//     if (sth isInstanceOf(A)) { ... }
//     else if (sth isInstanceOf(B)) { ... }
//   }
// }
//
export class CfgData extends ICfgData {
  constructor(cfg = undefined) {
    super(cfg, Sections.onecc);
  }

  setWithConfig(cfg: any): void {
    this.setConfig(cfg);
    this.resolveDeprecated();
  }

  setWithString(text: string): void {
    this.setConfig(ini.parse(text));
    this.resolveDeprecated();
  }

  private resolveDeprecated(): void {
    // NOTE 'one-build' will be deprecated.
    //      Therefore, when only 'one-build' is used, it will be replaced to 'onecc'.
    const config = this.getAsConfig();
    if (config["one-build"] !== undefined) {
      if (config["onecc"] === undefined) {
        config["onecc"] = ini.parse(ini.stringify(config["one-build"]));
      }
      delete config["one-build"];
    }

    // NOTE 'input_dtype' is deprecated.
    //      Therefore, when only 'input_dtype' is used, it will be replaced to 'onecc'.
    if (config["one-quantize"]?.["input_dtype"] !== undefined) {
      if (config["one-quantize"]["input_model_dtype"] === undefined) {
        config["one-quantize"]["input_model_dtype"] =
          config["one-quantize"]["input_dtype"];
      }
      delete config["one-quantize"]["input_dtype"];
    }
  }

  updateSectionWithKeyValue(section: string, key: string, value: string): void {
    const config = this.getAsConfig();
    if (config[section] === undefined) {
      config[section] = {};
    }
    if (config[section][key] === undefined) {
      config[section][key] = "";
    }
    config[section][key] = value;
    this.resolveDeprecated();
  }

  updateSectionWithValue(section: string, value: string): void {
    // value should be encoded or stringfied
    const config = this.getAsConfig();
    config[section] = ini.parse(value);
    this.resolveDeprecated();
  }
}
