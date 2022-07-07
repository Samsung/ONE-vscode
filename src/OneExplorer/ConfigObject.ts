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

/**
 * 'Artifact' means includes
 *   - existing files to run ONE config (base model)
 *   - result files after running ONE config (derived models, )
 */
interface Artifact {
  /**
   * An artifact's type
   */
  type: string;

  /**
   * A file extension
   */
  ext: string;

  /**
   * A full path in file system
   */
  path?: string
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
   * A mapper function to map a value to filenames
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
   * Locate paths inside iniObj[this.section][this.key] using 'this.mapper'.
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

      const sections = this.section ? [this.section] : Object.keys(iniObj);
      const sectionObjs = sections.map(section => iniObj[section as keyof typeof iniObj]);

      sectionObjs.forEach(sectionObj => {
        const keys: string[] = this.key ? [this.key] : Object.keys(sectionObj);

        keys.forEach(key => {
          const value: string = sectionObj[key as keyof typeof iniObj];
          fileNames = fileNames.concat(this.mapper(value));
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
  private artifactLocators: {artifact: Artifact, locator: Locator}[] = [];

  /**
   * A helper function to grep a filename ends with 'ext' within the given 'content' string.
   */
  public static searchWithExt = (ext: string, content: string): string[] => {
    // Don't remove this. It's to prevent 'content.split is not a function' error.
    // TODO Find more straightforward way to resolve an error
    content = content + '';

    const fileNames = content.split(' ').filter(val => val.endsWith(ext));
    return fileNames;
  };

  constructor() {
    this.artifactLocators.push({
      artifact: {type: 'circle', ext: '.circle'},
      locator: new Locator((value: string) => LocatorRunner.searchWithExt('.circle', value))
    });

    this.artifactLocators.push({
      artifact: {type: 'tvn', ext: '.tvn'},
      locator: new Locator((value: string) => LocatorRunner.searchWithExt('.tvn', value))
    });
  }

  /**
   * Run registered locators
   * @param iniObj
   * @param dir
   * @returns Artifact[] with paths
   */
  public run(iniObj: object, dir: string): Artifact[] {
    let artifacts: Artifact[] = [];

    // Get Artifacts with {type, ext, path}
    this.artifactLocators.forEach(({artifact, locator}) => {
      let filePaths: string[] = locator.locate(iniObj, dir);
      filePaths.map(filePath => {
        // Clone this.artifact
        let newArtifact: Artifact = Object.assign({}, artifact);
        newArtifact.path = filePath;
        artifacts.push(newArtifact);
      });
    });

    return artifacts;
  }
}

/**
 * @brief Parsed .cfg file into an 'obj' which contains fields such as
 *        'baseModels' or 'derivedModels'
 *        The returned paths are all resolved. (No '..' in the path)
 *
 * @usage Direct Parse
 * ```
 * const {baseModels, derivedModels} = configObj.parse(uri);
 * ```
 *
 * @usage Create Parsed Config Object
 *        (use a factory function `createConfigObj`)
 * ```
 * const configObj = createConfigObj(uri);
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
    baseModels: vscode.Uri[],
    derivedModels: vscode.Uri[],
    // TODO: Add more fields
  };

  private constructor(uri: vscode.Uri, rawObj: object) {
    this.uri = uri;
    this.rawObj = rawObj;
    this.obj = {
      baseModels: ConfigObj.parseBaseModels(uri, rawObj),
      derivedModels: ConfigObj.parseDerivedModels(uri, rawObj)
    };
  }

  /**
   * A simple parse function with directly `ConfigObj.obj` fields after parsing
   * without keeping an ConfigObj instance.
   *
   * @param uri
   * @returns `{baseModels, derivedModels}` or
   *          `null` if failed to open/parse into ini object
  }
   */
  public static parse(uri: vscode.Uri): {baseModels: vscode.Uri[],
                                         derivedModels: vscode.Uri[]}|null {
    const cfgObj = this.createConfigObj(uri);

    if (!cfgObj) {
      return null;
    }

    return cfgObj.obj;
  }

  /**
   * A factory function to create ConfigObj for the given uri.
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
   * Import an ini file
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
   * Parse base models written in the ini object and return the absolute path.
   *
   * @param uri cfg uri is required to calculate absolute path
   * ABOUT MULTIPLE BASE MODELS
   * onecc doesn't support multiple base models.
   * However, OneExplorer will show the config node below multiple base models
   * to prevent a case that users cannot find their faulty config files on ONE explorer.
   */
  private static parseBaseModels = (uri: vscode.Uri, iniObj: object): vscode.Uri[] => {
    let baseModels: string[] = [];

    // TODO Get ext list from backend
    for (const ext of ['tflite', 'pb', 'onnx']) {
      let confSection = iniObj[`one-import-${ext}` as keyof typeof iniObj];
      let confKey = confSection ?.['input_path' as keyof typeof iniObj] as string;
      if (confKey) {
        baseModels.push(confKey);
      }
    }

    // Get absolute paths by calculating from cfg file
    // '..' or '//' are resolved here
    baseModels = baseModels!.map(relpath => path.resolve(path.dirname(uri.fsPath), relpath));

    // Remove duplicated entries
    baseModels = [...new Set(baseModels)];

    if (baseModels.length > 1) {
      // TODO Notify the error with a better UX
      // EX. put question mark next to the config icon
      console.warn(`Warning: There are multiple input models in the configuration. (path: ${uri})`);
    }

    if (baseModels.length === 0) {
      // TODO Notify the error with a better UX
      // EX. showing orphan nodes somewhere
      console.warn(`Warning: There is no input model in the configuration. (path: ${uri})`);
    }

    // Return as list of uri
    return baseModels.map(abspath => vscode.Uri.file(abspath));
  };

  /**
   * Find derived models written in the ini object and return the absolute path.
   *
   * @param uri cfg uri is required to calculate absolute path
   */
  private static parseDerivedModels = (uri: vscode.Uri, iniObj: object): vscode.Uri[] => {
    let artifacts: Artifact[] = (new LocatorRunner).run(iniObj, path.dirname(uri.fsPath));

    // Return as list of uri
    return artifacts.map(artifact => vscode.Uri.file(artifact.path!));
  };
};
