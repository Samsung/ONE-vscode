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

import * as fs from "fs";
import * as ini from "ini";
import * as path from "path";
import { TextEncoder } from "util";
import * as vscode from "vscode";

import { RealPath } from "../Utils/Helpers";
import { Logger } from "../Utils/Logger";

import { Artifact } from "./ArtifactLocator";
import { OneCfg, OneConfigSetting } from "./ConfigSettings/OneConfigSetting";
import { ConfigSetting } from "./ConfigSetting";

/**
 * Type for rawObj.
 * Expand for additional Backend's section value
 */
type Cfg = OneCfg;
type CfgKeys = keyof Cfg;

/**
 * Enum for what type of ConfigSetting that ConfigObject use
 */
enum CfgType {
  one,
}

/**
 * @brief A helper class to get parsed artifacts (baseModels, products)
 *        The paths in the artifacts are all resolved. (No '..' in the path)
 *
 * @usage Create Parsed Config Object
 *        (use a factory function `createConfigObj`)
 * ```
 * const configObj = createConfigObj(uri);
 *
 * const baseModels = configObj.getBaseModelsExists;
 * const products = configObj.getProductsExists;
 * ```
 */
export class ConfigObj {
  /**
   * source uri of config file
   */
  uri: vscode.Uri;

  /**
   * a raw ini object read from config file
   */
  rawObj: Cfg;

  /**
   * a parsed config object
   */
  obj: { baseModels: Artifact[]; products: Artifact[] };

  /**
   * type of config setting
   */
  configType: CfgType;

  get getBaseModels() {
    return this.obj.baseModels;
  }

  get getProducts() {
    return this.obj.products;
  }

  /**
   * @brief Returns only the baseModels which exists in file system
   */
  get getBaseModelsExists() {
    return this.obj.baseModels.filter((artifact) =>
      RealPath.exists(artifact.path)
    );
  }

  /**
   * @brief Returns only the products which exists in file system
   */
  get getProductsExists() {
    return this.obj.products.filter((artifact) =>
      RealPath.exists(artifact.path)
    );
  }

  /**
   * @brief Get absolute path
   * @param path Relative path of cfg file
   */
  getFullPath(relpath: string) {
    const abspath = path.resolve(path.dirname(this.uri.fsPath), relpath);
    return abspath;
  }

  /**
   * @brief Return true if the `baseModelPath` is included in `baseModels`
   */
  public isChildOf(baseModelPath: string): boolean {
    const found = this.obj.baseModels
      .map((artifact) => artifact.path)
      .find((path) => RealPath.areEqual(baseModelPath, path));

    return found ? true : false;
  }

  /**
   * @brief getter for config setting
   */
  public get configSetting(): ConfigSetting {
    let configSetting: ConfigSetting;
    switch (this.configType) {
      case CfgType.one:
      default:
        configSetting = new OneConfigSetting();
    }
    configSetting.init();

    return configSetting;
  }

  private constructor(uri: vscode.Uri, rawObj: Cfg) {
    this.uri = uri;
    this.rawObj = rawObj;
    this.configType = CfgType.one;

    // TODO: separate to init()
    const configSetting = this.configSetting;
    this.obj = {
      baseModels: configSetting.parseBaseModels(uri.fsPath, rawObj),
      products: configSetting.parseProducts(uri.fsPath, rawObj),
    };
  }

  public updateBaseModelField(
    oldpath: string,
    newpath: string
  ): Thenable<void> {
    const getSection = (name: string) => {
      const ext = path.extname(name);
      const sections = this.configSetting.sections;

      return sections[ext as keyof typeof sections];
    };

    const section: string = getSection(oldpath);
    const kSection: CfgKeys = section as keyof Cfg;

    if (
      this.rawObj[kSection] &&
      this.rawObj[kSection].input_path &&
      this.getFullPath(this.rawObj[kSection].input_path) === oldpath
    ) {
      this.rawObj[kSection].input_path = newpath;
    } else {
      Logger.warn(
        "ConfigObject",
        `Cannot update base model field: ${oldpath} not found`
      );
    }

    return vscode.workspace.fs.writeFile(
      this.uri,
      new TextEncoder().encode(ini.stringify(this.rawObj))
    );
  }

  /**
   * @brief A factory function to create ConfigObj for the given uri.
   *
   * @param uri
   * @returns `ConfObj` or
   *          `null`    if failed to open/parse into ini object
   */
  public static createConfigObj(uri: vscode.Uri) {
    const obj = this.importIni(uri.fsPath);
    if (!obj) {
      console.error(`Cannot open ${uri.fsPath}`);

      return null;
    }

    return new ConfigObj(uri, obj as Cfg);
  }

  /**
   * @brief Import an ini file
   *
   * @param filePath
   * @returns `object` if file read is successful, or `null` if file open has failed
   *
   */
  private static importIni(filePath: string): object | null {
    let configRaw: string;
    try {
      configRaw = fs.readFileSync(filePath, "utf-8");
    } catch (e) {
      console.error(e);
      return null;
    }

    // TODO check if toString() is required
    return ini.parse(configRaw.toString());
  }
}
