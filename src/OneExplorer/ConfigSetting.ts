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

import * as path from "path";

import { Logger } from "../Utils/Logger";
import { Artifact, LocatorRunner } from "./ArtifactLocator";

/**
 * @brief A helper class for loading ConfigObject's logic dependent on the Backend.
 */
export abstract class ConfigSetting {
  static backendName = "ONE";
  static ext = ".cfg";

  baseModelsLocatorRunner: LocatorRunner;
  productsLocatorRunner: LocatorRunner;
  sections: { [key: string]: string };

  constructor() {
    this.baseModelsLocatorRunner = new LocatorRunner();
    this.productsLocatorRunner = new LocatorRunner();
    this.sections = {
      ".pb": "one-import-tf",
      ".tflite": "one-import-tflite",
      ".onnx": "one-import-onnx",
    };
  }

  public init(): void {
    this._initBaseModelsLocatorRunner();
    this._initProductsLocatorRunner();
  }

  /**
   * @brief A function for cases where output_path changes based on input_path
   *
   * @param newpath new input_path
   * @param rawObj raw config object
   * @param kSection key section to be updated
   *
   * Using onecc, this function do nothing.
   * Using EdgeTpu compiler, output_path is determined by input_path
   * @example input_path=model.tflite
   *          output_path=model_edgetpu.tflite
   */
  public abstract updateOutPath(
    newpath?: string,
    rawObj?: { [key: string]: any },
    kSection?: string
  ): void;

  /**
   * @brief Parse base models written in the ini object and return the absolute path.
   *
   * @param uri cfg uri is required to calculate absolute path
   *
   * ABOUT MULTIPLE BASE MODELS
   *
   * onecc doesn't support multiple base models.
   * However, OneExplorer will show the config node below multiple base models
   * to prevent a case that users cannot find their faulty config files on ONE explorer.
   *
   * TODO Move to backend
   */
  public parseBaseModels = (filePath: string, iniObj: object): Artifact[] => {
    const dir = path.dirname(filePath);

    let locatorRunner = this.baseModelsLocatorRunner;

    let artifacts: Artifact[] = locatorRunner.run(iniObj, dir);

    if (artifacts.length > 1) {
      // TODO Notify the error with a better UX
      // EX. put question mark next to the config icon
      Logger.debug(
        "OneExplorer",
        `There are multiple input models in the configuration(${filePath}).`
      );
    }
    if (artifacts.length === 0) {
      // TODO Notify the error with a better UX
      // EX. showing orphan nodes somewhere
      Logger.debug(
        "OneExplorer",
        `There is no input model in the configuration(${filePath}).`
      );
    }

    // Return as list of uri
    return artifacts;
  };

  /**
   * @brief Find derived models written in the ini object and return the absolute path.
   *
   * @param filePath cfg file path is required to calculate absolute path
   *
   * TODO Move to backend
   */
  public parseProducts = (filePath: string, iniObj: object): Artifact[] => {
    const dir = path.dirname(filePath);

    let locatorRunner = this.productsLocatorRunner;

    let artifacts: Artifact[] = locatorRunner.run(iniObj, dir);

    return artifacts;
  };

  /**
   * @brief init baseModelsLocatorRunner
   *
   * This method register list of ArtifactLocator parsed as baseModel
   */
  protected abstract _initBaseModelsLocatorRunner(): void;

  /**
   * @brief init baseModelsLocatorRunner
   *
   * This method register list of ArtifactLocator parsed as baseModel
   */
  protected abstract _initProductsLocatorRunner(): void;
}

/**
 * @brief Example class extends ConfigSetting
 */
export class ConfigSettingBase extends ConfigSetting {
  public updateOutPath(): void {
    throw new Error("Method not implemented.");
  }
  protected _initBaseModelsLocatorRunner(): void {
    throw new Error("Method not implemented.");
  }
  protected _initProductsLocatorRunner(): void {
    throw new Error("Method not implemented.");
  }
}
