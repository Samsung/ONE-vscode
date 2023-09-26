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
import { Sections } from "./Sections";

export class EdgeTpuCfgData extends ICfgData {
  constructor(cfg = undefined) {
    super(cfg, Sections.edgetpu);
  }

  setWithConfig(cfg: any): void {
    this.setConfig(cfg);
  }

  setWithString(text: string): void {
    this.setConfig(ini.parse(text));
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
  }

  updateSectionWithValue(section: string, value: string): void {
    // value should be encoded or stringfied
    const config = this.getAsConfig();
    config[section] = ini.parse(value);
  }
}
