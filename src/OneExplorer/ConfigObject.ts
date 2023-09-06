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

import { Artifact, Locator, LocatorRunner } from "./ArtifactLocator";

type Cfg = {
  "one-import-tflite": CfgOneImportTflite;
  "one-import-onnx": CfgOneImportOnnx;
  "one-import-tf": CfgOneImportTf;
};
type CfgKeys = keyof Cfg;

// TODO Update
type CfgOneImportTflite = any;
type CfgOneImportOnnx = any;
type CfgOneImportTf = any;

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

  private constructor(uri: vscode.Uri, rawObj: Cfg) {
    this.uri = uri;
    this.rawObj = rawObj;
    this.obj = {
      baseModels: ConfigObj.parseBaseModels(uri.fsPath, rawObj),
      products: ConfigObj.parseProducts(uri.fsPath, rawObj),
    };
  }

  public updateBaseModelField(
    oldpath: string,
    newpath: string
  ): Thenable<void> {
    const getSection = (name: string) => {
      const ext = path.extname(name);
      const sections = {
        ".pb": "one-import-tf",
        ".tflite": "one-import-tflite",
        ".onnx": "one-import-onnx",
      };

      return sections[ext as keyof typeof sections];
    };

    const section: string = getSection(oldpath);
    const kSection: CfgKeys = section as keyof Cfg;

    if (
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
  private static parseBaseModels = (
    filePath: string,
    iniObj: object
  ): Artifact[] => {
    const dir = path.dirname(filePath);

    let locatorRunner = new LocatorRunner();

    locatorRunner.register({
      artifactAttr: {
        ext: ".tflite",
        icon: new vscode.ThemeIcon("symbol-variable"),
      },
      locator: new Locator((value: string) => {
        value += "";
        const filterd = value
          .split(" ")
          .filter((val) => !val.endsWith("_edgetpu.tflite"));
        value = filterd.join(" ");
        return LocatorRunner.searchWithExt(".tflite", value);
      }),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".pb",
        icon: new vscode.ThemeIcon("symbol-variable"),
      },
      locator: new Locator((value: string) =>
        LocatorRunner.searchWithExt(".pb", value)
      ),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".onnx",
        icon: new vscode.ThemeIcon("symbol-variable"),
      },
      locator: new Locator((value: string) =>
        LocatorRunner.searchWithExt(".onnx", value)
      ),
    });

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
  private static parseProducts = (
    filePath: string,
    iniObj: object
  ): Artifact[] => {
    const dir = path.dirname(filePath);

    let locatorRunner = new LocatorRunner();

    /**
     * ABOUT ORDERING
     *
     * The registration order determines the order in the tree view
     */

    // NOTE
    // Shows <model>_edgetpu.tflite
    // <model>_edgetpu.tflite generated by <model>.tflite is product type
    locatorRunner.register({
      artifactAttr: {
        ext: ".tflite",
        icon: new vscode.ThemeIcon("symbol-variable"),
      },
      locator: new Locator((value: string) => {
        value += "";
        const filterd = value
          .split(" ")
          .filter((val) => val.endsWith("_edgetpu.tflite"));
        value = filterd.join(" ");
        return LocatorRunner.searchWithExt(".tflite", value);
      }),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".circle",
        icon: new vscode.ThemeIcon("symbol-variable"),
        openViewType: "one.viewer.circle",
      },
      locator: new Locator((value: string) =>
        LocatorRunner.searchWithExt(".circle", value)
      ),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".tvn",
        icon: new vscode.ThemeIcon("symbol-variable"),
      },
      locator: new Locator((value: string) =>
        LocatorRunner.searchWithExt(".tvn", value)
      ),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".tracealloc.json",
        icon: new vscode.ThemeIcon("graph"),
        openViewType: "one.viewer.mondrian",
        canHide: true,
      },
      locator: new Locator((value: string) => {
        return LocatorRunner.searchWithExt(".tvn", value).map((filepath) =>
          filepath.replace(".tvn", ".tracealloc.json")
        );
      }),
    });

    // NOTE
    // Shows <model>.trace.json
    // REQUIRES: <model>.tvn be written in the config file.
    // This rule is added to show a trace.json file generated by `one.toolchain.profileModel` command.
    locatorRunner.register({
      artifactAttr: {
        ext: ".trace.json",
        icon: new vscode.ThemeIcon("graph"),
        openViewType: "one.editor.jsonTracer",
        canHide: true,
      },
      locator: new Locator((value: string) => {
        return LocatorRunner.searchWithExt(".tvn", value).map((filepath) =>
          filepath.replace(".tvn", ".trace.json")
        );
      }),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".json",
        icon: new vscode.ThemeIcon("graph"),
        openViewType: "one.editor.jsonTracer",
        canHide: true,
      },
      locator: new Locator(
        (value: string) => {
          return LocatorRunner.searchWithCommandOption(
            value,
            "--save-chrome-trace",
            ".json"
          );
        },
        "one-profile",
        "command"
      ),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".tv2m",
        icon: new vscode.ThemeIcon("symbol-method"),
        canHide: true,
      },
      locator: new Locator((value: string) => {
        return LocatorRunner.searchWithExt(".tvn", value).map((filepath) =>
          filepath.replace(".tvn", ".tv2m")
        );
      }),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".tv2o",
        icon: new vscode.ThemeIcon("symbol-method"),
        canHide: true,
      },
      locator: new Locator((value: string) => {
        return LocatorRunner.searchWithExt(".tvn", value).map((filepath) =>
          filepath.replace(".tvn", ".tv2o")
        );
      }),
    });

    locatorRunner.register({
      artifactAttr: {
        ext: ".tv2w",
        icon: new vscode.ThemeIcon("symbol-method"),
        canHide: true,
      },
      locator: new Locator((value: string) => {
        return LocatorRunner.searchWithExt(".tvn", value).map((filepath) =>
          filepath.replace(".tvn", ".tv2w")
        );
      }),
    });

    locatorRunner.register({
      // 'default' view type is 'text editor' (vscode.openWith)
      artifactAttr: {
        ext: ".circle.log",
        openViewType: "default",
        icon: vscode.ThemeIcon.File,
        canHide: true,
      },
      locator: new Locator((value: string) => {
        return LocatorRunner.searchWithExt(".circle", value).map((filepath) =>
          filepath.replace(".circle", ".circle.log")
        );
      }),
    });

    locatorRunner.register({
      // 'default' view type is 'text editor' (vscode.openWith)
      artifactAttr: {
        ext: ".tflite.log",
        openViewType: "default",
        icon: vscode.ThemeIcon.File,
        canHide: true,
      },
      locator: new Locator((value: string) => {
        value += "";
        const filterd = value
          .split(" ")
          .filter((val) => val.endsWith("_edgetpu.tflite"));
        value = filterd.join(" ");
        return LocatorRunner.searchWithExt(".tflite", value).map((filepath) =>
          filepath.replace(".tflite", ".tflite.log")
        );
      }),
    });

    /**
     * When you add a new product type, please append the ext type to
     * OneTreeDataProvider.fileWatcher too, to prevent a bug.
     *
     * TODO Provide better structure to remove this extra work
     */

    let artifacts: Artifact[] = locatorRunner.run(iniObj, dir);

    return artifacts;
  };
}
