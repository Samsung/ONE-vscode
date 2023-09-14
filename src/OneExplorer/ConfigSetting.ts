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

import { LocatorRunner } from "./ArtifactLocator";

export abstract class ConfigSetting {
  baseModelsLocatorRunner: LocatorRunner;
  productsLocatorRunner: LocatorRunner;
  // TODO: make sections for updateBaseModelField method

  constructor() {
    this.baseModelsLocatorRunner = new LocatorRunner();
    this.productsLocatorRunner = new LocatorRunner();
    this._init();
  }

  private _init(): void {
    this._initBaseModelsLocatorRunner();
    this._initProductsLocatorRunner();
  }

  protected abstract _initBaseModelsLocatorRunner(): void;
  protected abstract _initProductsLocatorRunner(): void;
}
