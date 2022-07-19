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

import * as fs from 'fs';
import * as ini from 'ini';
import * as path from 'path';
import * as vscode from 'vscode';

import {RealPath} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

/**
 * 'Artifact'
 * The collective term is and inclusive, it includes two types of files:
 * (1) Pre-existing files to run ONE config (base model)
 * (2) Result files after running ONE config (derived models, )
 */
export interface Artifact {
  /**
   * An artifact's attribute
   */
  attr: ArtifactAttr;

  /**
   * A full path in file system
   */
  path: string;
}

export interface ArtifactAttr {
  /**
   * ABOUT EXTENDED EXTENSION (WITH MULTIPLE PERIODS, *.extended.ext)
   *
   * Generally, file name extensions are defined from the last period.
   * Let's define 'extended file extension' with multiple periods.
   *
   * EXAMPLE
   *
   * (File name)          model.opt.circle.log
   * (Extension)          .log
   * (Extended Extension) .circle.log OR opt.circle.log (selective)
   */
  ext: string;

  /**
   * An icon for the artifact
   *
   * If not set, it is set by OneExplorer Node.
   */
  icon?: vscode.ThemeIcon;

  /**
   * A openViewType for the artifact
   *
   * It is used as an argument for 'vscode.openWith' command
   * to open the file with specified editor.
   *
   * If not set, it is set by OneExplorer Node.
   * If 'default'(string), open with text editor
   *
   * @reference vscode.openWith
   */
  openViewType?: string;

  /**
   * Hidden from the default view.
   * The status can be unhide by command
   */
  canHide?: boolean;
}

/**
 * 'Locator' is to grep matching paths inside Ini Object
 */
export class Locator {
  /**
   * The section of ini to find the targetted file
   * If not given, locator searches the whole section
   */
  section?: string;

  /**
   * The key inside section to find the targetted file
   * If not given, locator searches the whole key
   */
  key?: string;

  /**
   * @brief A mapper function to map a value to filenames
   * @param value: Object[section][key]
   * @return an array of searched string
   */
  mapper: (value: string) => string[];

  /**
   * @param mapper A mapper function to map 'obj[section][key]' to filenames
   * @param section (optional) if not given, locator searches the whole section
   * @param key (optional) if not given, locator searches the whole key
   */
  constructor(mapper: (value: string) => string[], section?: string, key?: string) {
    this.section = section;
    this.key = key;
    this.mapper = mapper;
  }

  /**
   * @brief Locate paths inside iniObj[this.section][this.key] using 'this.mapper'
   *
   * @param iniObj a parsed ini object
   * @param dir a directory of ini file
   * @returns an array of file path, without any duplication in the list
   *
   * EXAMPLE - file
   *
   * [one-import-tflite]            <--- section: "one-import-tflite"
   *   input_file = "model.tflite"  <--- key: input_file
   *   output_file = "model.circle" <--- key: output_file
   *
   * EXAMPLE - imported object
   *
   * iniObj[one-import-tflite]['input_file'] === "model.tflite"
   * iniObj[one-import-tflite]['input_file'] === "model.circle"
   */
  public locate(iniObj: object, dir: string): string[] {
    // Get file names from iniObj
    const getFileNames = (): string[] => {
      let fileNames: string[] = [];

      // If a section not given, search all sections
      const sections = this.section ? [this.section] : Object.keys(iniObj);

      // Find valid iniObj[section] as object
      const sectionObjs: object[] = sections.filter(section => (section in iniObj))
                                        .map(section => iniObj[section as keyof typeof iniObj]);

      sectionObjs.forEach(sectionObj => {
        // If a key not given, search all keys
        const keys: string[] = this.key ? [this.key] : Object.keys(sectionObj);

        // Find valid sectionObj[key] as string
        const keyStrs = keys.filter(key => (key in sectionObj))
                            .map(key => sectionObj[key as keyof typeof iniObj])
                            // NOTE keyObj may be a type of object.
                            // Currently one config file doesn't define a ini file level more deeper
                            // Let's filter them out.
                            .filter(keyObj => typeof keyObj === 'string');

        // Get filename
        keyStrs.map(value => this.mapper(value)).forEach((fileName: string[]) => {
          fileNames = fileNames.concat(fileName);
        });
      });

      return fileNames;
    };

    // Get file paths by joining dir
    const getFilePaths = (fileNames: string[]): string[] => {
      let filePaths: string[] = [];
      fileNames.forEach((fileName) => {
        // In path, '..' or '//' are resolved here
        const filePath = path.resolve(dir, fileName);

        filePaths.push(filePath);
      });

      return filePaths;
    };

    // Get file names
    let fileNames: string[] = getFileNames();

    // Get file paths by joining directory path
    let filePaths: string[] = getFilePaths(fileNames);

    // Remove duplication in filePaths
    filePaths = [...new Set(filePaths)];

    return filePaths;
  }
};


// TODO Move to backend side with some modification
export class LocatorRunner {
  private artifactLocators: {artifactAttr: ArtifactAttr, locator: Locator}[] = [];

  /**
   * @brief A helper function to grep a filename ends with 'ext' within the given 'content' string.
   */
  public static searchWithExt = (ext: string, content: string): string[] => {
    // Don't remove this. It's to prevent 'content.split is not a function' error.
    // TODO Find more straightforward way to resolve an error
    content = content + '';

    const fileNames = content.split(' ').filter(val => val.endsWith(ext));
    return fileNames;
  };

  public register(artifactLocator: {artifactAttr: ArtifactAttr, locator: Locator}) {
    this.artifactLocators.push(artifactLocator);
  }

  /**
   * @brief Run registered locators
   *
   * @returns Artifact[] with paths
   */
  public run(iniObj: object, dir: string): Artifact[] {
    let artifacts: Artifact[] = [];

    // Get Artifacts with {type, ext, path}
    this.artifactLocators.forEach(({artifactAttr, locator}) => {
      let filePaths: string[] = locator.locate(iniObj, dir);
      filePaths.forEach(filePath => {
        let artifact: Artifact = {attr: artifactAttr, path: filePath};
        artifacts.push(artifact);
      });
    });

    return artifacts;
  }
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
  rawObj: object;

  /**
   * a parsed config object
   */
  obj: {
    baseModels: Artifact[],
    products: Artifact[],
  };

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
    return this.obj.baseModels.filter(artifact => RealPath.exists(artifact.path));
  }

  /**
   * @brief Returns only the products which exists in file system
   */
  get getProductsExists() {
    return this.obj.products.filter(artifact => RealPath.exists(artifact.path));
  }

  /**
   * @brief Return true if the `baseModelPath` is included in `baseModels`
   */
  public isChildOf(baseModelPath: string): boolean {
    const found = this.obj.baseModels.map(artifact => artifact.path)
                      .find(path => RealPath.areEqual(baseModelPath, path));

    return found ? true : false;
  }

  private constructor(uri: vscode.Uri, rawObj: object) {
    this.uri = uri;
    this.rawObj = rawObj;
    this.obj = {
      baseModels: ConfigObj.parseBaseModels(uri.fsPath, rawObj),
      products: ConfigObj.parseProducts(uri.fsPath, rawObj)
    };
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

    return new ConfigObj(uri, obj);
  }

  /**
   * @brief Import an ini file
   *
   * @param filePath
   * @returns `object` if file read is successful, or `null` if file open has failed
   *
   */
  private static importIni(filePath: string): object|null {
    let configRaw: string;
    try {
      configRaw = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      console.error(e);
      return null;
    }

    // TODO check if toString() is required
    return ini.parse(configRaw.toString());
  }

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
   */
  private static parseBaseModels = (filePath: string, iniObj: object): Artifact[] => {
    const dir = path.dirname(filePath);

    let locatorRunner = new LocatorRunner();

    locatorRunner.register({
      artifactAttr: {ext: '.tflite', icon: new vscode.ThemeIcon('symbol-variable')},
      locator: new Locator((value: string) => LocatorRunner.searchWithExt('.tflite', value))
    });

    locatorRunner.register({
      artifactAttr: {ext: '.pb', icon: new vscode.ThemeIcon('symbol-variable')},
      locator: new Locator((value: string) => LocatorRunner.searchWithExt('.pb', value))
    });

    locatorRunner.register({
      artifactAttr: {ext: '.onnx', icon: new vscode.ThemeIcon('symbol-variable')},
      locator: new Locator((value: string) => LocatorRunner.searchWithExt('.onnx', value))
    });

    let artifacts: Artifact[] = locatorRunner.run(iniObj, dir);

    if (artifacts.length > 1) {
      // TODO Notify the error with a better UX
      // EX. put question mark next to the config icon
      Logger.warn(
          'OneExplorer', `There are multiple input models in the configuration(${filePath}).`);
    }
    if (artifacts.length === 0) {
      // TODO Notify the error with a better UX
      // EX. showing orphan nodes somewhere
      Logger.warn('OneExplorer', `There is no input model in the configuration(${filePath}).`);
    }

    // Return as list of uri
    return artifacts;
  };

  /**
   * @brief Find derived models written in the ini object and return the absolute path.
   *
   * @param filePath cfg file path is required to calculate absolute path
   */
  private static parseProducts = (filePath: string, iniObj: object): Artifact[] => {
    const dir = path.dirname(filePath);

    let locatorRunner = new LocatorRunner();

    locatorRunner.register({
      artifactAttr: {ext: '.circle', icon: new vscode.ThemeIcon('symbol-variable')},
      locator: new Locator((value: string) => LocatorRunner.searchWithExt('.circle', value))
    });

    locatorRunner.register({
      artifactAttr: {ext: '.tvn', icon: new vscode.ThemeIcon('symbol-variable')},
      locator: new Locator((value: string) => LocatorRunner.searchWithExt('.tvn', value))
    });

    locatorRunner.register({
      // 'default' view type is 'text editor' (vscode.openWith)
      artifactAttr:
          {ext: '.circle.log', openViewType: 'default', icon: vscode.ThemeIcon.File, canHide: true},
      locator: new Locator((value: string) => {
        return LocatorRunner.searchWithExt('.circle', value)
            .map(filepath => filepath.replace('.circle', '.circle.log'));
      })
    });

    let artifacts: Artifact[] = locatorRunner.run(iniObj, dir);

    return artifacts;
  };
};
