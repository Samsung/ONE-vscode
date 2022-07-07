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
 * 'ArtifactLocator' is to find artifact's absolute path
 */
export class ArtifactLocator {
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
   * (optional)
   * A search function to find the file in a space-seperated word sequence
   *
   * If undefined, locator searches with 'ext' within the given ['section']['key'] field.
   * Refer to `this.searchEndsWithExt`
   */
  search: (arg: string) => string[];

  /**
   * A target artifact
   */
  artifact: Artifact;

  /**
   * A default search function
   * @param content [this.section][this.key] value
   * @returns string file name array
   */
  private searchEndsWithExt = (content: string): string[] => {
    // Don't remove this. It's to prevent an 'content.cplit is not a function' error.
    // TODO Find more straightforward way to resolve an error
    content = content + '';

    const fileNames = content.split(' ').filter(val => val.endsWith(this.artifact.ext));
    return fileNames;
  };

  /**
   * @param artifact
   * @param section if not given, locator searches the whole section
   * @param key if not given, locator searches the whole key
   * @param search if not given, locator searches with 'artifact.ext' within the given
   *     ['section']['key'] field.
   */
  constructor(
      artifact: Artifact, section?: string, key?: string, search?: (arg: string) => string[]) {
    this.artifact = artifact;
    this.section = section;
    this.key = key;

    this.search = search ? search : this.searchEndsWithExt;
  }

  /**
   * Search a file path with 'this.artifact.ext' inside iniObj[this.section][this.key] or using
   * 'this.search'.
   * @param iniObj
   * @returns
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
  public run(iniObj: object, dir: string): Artifact[] {
    let ret: Artifact[] = [];

    const getFileNames = (): string[] => {
      let fileNames: string[] = [];

      const sections = this.section ? [this.section] : Object.keys(iniObj);
      const sectionObjs = sections.map(section => iniObj[section as keyof typeof iniObj]);

      sectionObjs.forEach(sectionObj => {
        const keys: string[] = this.key ? [this.key] : Object.keys(sectionObj);

        keys.forEach(key => {
          const content: string = sectionObj[key as keyof typeof iniObj];
          fileNames = fileNames.concat(this.search(content));
        });
      });

      return fileNames;
    };

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

    // Remove duplicated fileNames
    filePaths = [...new Set(filePaths)];

    filePaths.forEach(filePath => {
      // Clone this.artifact
      let artifact: Artifact = Object.assign({}, this.artifact);

      artifact.path = filePath;
      ret.push(artifact);
    });

    return ret;
  }
};

export class ArtifactLocatorRunner {
  private locators: ArtifactLocator[] = [];

  // Registor a locator
  public register(locator: ArtifactLocator): void {
    this.locators.push(locator);
  }

  // TODO Move to each backend
  constructor() {
    this.locators.push(new ArtifactLocator({type: 'circle', ext: '.circle'}));
    this.locators.push(new ArtifactLocator({type: 'tvn', ext: '.tvn'}));
  }

  /**
   * Runs registered locator runners which parses iniObj and find the fileNames
   * @param iniObj
   * @param dir
   * @returns Artifact[] where each of and Artifact.path is filled
   */
  public run(iniObj: object, dir: string): Artifact[] {
    let artifacts: Artifact[] = [];

    // Get Artifacts with {type, ext, path}
    for (let loc of this.locators) {
      artifacts = artifacts.concat(loc.run(iniObj, dir));
    }

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
    let artifacts: Artifact[] = (new ArtifactLocatorRunner).run(iniObj, path.dirname(uri.fsPath));

    // Return as list of uri
    return artifacts.map(artifact => vscode.Uri.file(artifact.path!));
  };
};
