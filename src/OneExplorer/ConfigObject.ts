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
    baseModels = baseModels!.map(relpath => path.join(path.dirname(uri.fsPath), relpath));

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
    const derivedModelLocator = [
      {section: 'one-import-tf', key: 'output_path'},
      {section: 'one-import-tflite', key: 'output_path'},
      {section: 'one-import-onnx', key: 'output_path'},
      {section: 'one-import-bcq', key: 'output_path'},
      {section: 'one-optimize', key: 'input_path'},
      {section: 'one-optimize', key: 'output_path'},
      {section: 'one-quantize', key: 'input_path'},
      {section: 'one-quantize', key: 'output_path'},
      {
        section: 'one-codegen',
        key: 'command',
        filt: (str: string): string[] => {
          // TODO Get ext list from backend
          return str.split(' ').filter(
              e => path.extname(e) === '.tvn' || path.extname(e) === '.circle');
        }
      },
    ];

    let derivedModels: string[] = [];
    for (let loc of derivedModelLocator) {
      let confSection = iniObj[loc.section as keyof typeof iniObj];
      let confKey = confSection ?.[loc.key as keyof typeof iniObj] as string;
      if (confKey) {
        const greppedModels = loc.filt ? loc.filt(confKey) : [confKey];
        for (let model of greppedModels) {
          if (derivedModels.includes(model) === false) {
            derivedModels.push(model);
          }
        }
      }
    }

    // Get absolute paths by calculating from cfg file
    // '..' or '//' are resolved here
    derivedModels = derivedModels.map(relpath => path.join(path.dirname(uri.fsPath), relpath));

    // Remove duplicated entries
    derivedModels = [...new Set(derivedModels)];

    // Return as list of uri
    return derivedModels.map(abspath => vscode.Uri.file(abspath));
  };
};
