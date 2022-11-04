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

import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * 'Artifact'
 * The collective term is and inclusive, it includes two types of files:
 * (1) Pre-existing files to run ONE config, a.k.a. base models (.tflite, .onnx, ...)
 * (2) Result files after running ONE config, a.k.a. products (.circle, .log, ...)
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
   *   input_path = "model.tflite"  <--- key: input_path
   *   output_path = "model.circle" <--- key: output_path
   *
   * EXAMPLE - imported object
   *
   * iniObj[one-import-tflite]['input_path'] === "model.tflite"
   * iniObj[one-import-tflite]['input_path'] === "model.circle"
   */
  public locate(iniObj: object, dir: string): string[] {
    assert.strictEqual(
        path.isAbsolute(dir), true, 'FIX CALLER: dir argument must be an absolute path');

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
}


// TODO Move to backend side with some modification
export class LocatorRunner {
  private artifactLocators: {artifactAttr: ArtifactAttr, locator: Locator}[] = [];

  /**
   * @brief A helper function to grep a filename ends with 'ext' within the given 'content' string.
   */
  public static searchWithExt = (ext: string, content: string): string[] => {
    assert.notStrictEqual(ext.length, 0, 'FIX CALLER: ext must not be an empty string');

    // Don't remove this. It's to prevent 'content.split is not a function' error.
    // TODO Find more straightforward way to resolve an error
    content = content + '';

    const fileNames = content.split(' ').filter(val => val.endsWith(ext));
    return fileNames;
  };

  /**
   * @brief A helper function to grep a filename following to 'option' ends with 'ext'
   * within the given 'content' string.
   * @return string[] But practically the array size is only one or none
   */
  public static searchWithCommandOption =
      (content: string, option: string, ext?: string): string[] => {
        assert.notStrictEqual(option.length, 0, 'FIX CALLER: option must not be an empty string');

        // Don't remove this. It's to prevent 'content.split is not a function' error.
        // TODO Find more straightforward way to resolve an error
        content = content + '';

        let fileName: string|undefined = content.split(' ').find((value, index, obj) => {
          return index > 0 && obj[index - 1] === option;
        });

        // Check if the searched filename has the given ext
        if (fileName && ext) {
          fileName = fileName.endsWith(ext) ? fileName : undefined;
        }

        return fileName ? [fileName] : [];
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
    assert.strictEqual(
        path.isAbsolute(dir), true, 'FIX CALLER: dir argument must be an absolute path');

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
