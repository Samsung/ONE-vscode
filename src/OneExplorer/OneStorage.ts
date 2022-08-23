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
import * as path from 'path';
import * as vscode from 'vscode';

import {obtainWorkspaceRoot} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {ConfigObj} from './ConfigObject';

interface StringMap {
  [key: string]: string[];
}

interface ConfigObjMap {
  [key: string]: ConfigObj|null;
}

/**
 * A singleton storage class
 *
 * PURPOSE
 *
 * To build each 'Node' of OneTreeDataProvider,
 * it is neccessary to access the file system, read the files and build objects(ConfigObj, ...).
 * By keeping some file system information as data structure (list, map),
 * some duplicated works can be reduced.
 *
 * LIFE CYCLE
 *
 * The singleton is created when the first get() is called.
 * The object remains until OneStorage.reset() is called.
 * OneStorage.reset() is called by OneTreeDataProvider.refresh(), which is called on every file
 * system change within the repository.
 */
export class OneStorage {
  /**
   * A list of all cfg paths in the 'root' directory
   */
  private _cfgList: string[];
  /**
   * A map of ConfigObj (key: cfg path)
   */
  private _cfgToCfgObjMap: ConfigObjMap;
  /**
   * A map of BaseModel path to Cfg path
   */
  private _baseModelToCfgsMap: StringMap;

  /**
   * Get the list of .cfg files within the workspace
   * @param root  the file or directory,
   *              which MUST exist in the file system
   */
  private _getCfgList(root: string = obtainWorkspaceRoot()): string[] {
    /**
     * Returns every file inside directory
     * @todo Check soft link
     * @param root
     * @returns
     */
    const readdirSyncRecursive = (root: string): string[] => {
      if (fs.statSync(root).isFile()) {
        return [root];
      }

      let children: string[] = [];
      if (fs.statSync(root).isDirectory()) {
        fs.readdirSync(root).forEach(val => {
          children = children.concat(readdirSyncRecursive(path.join(root, val)));
        });
      }
      return children;
    };

    try {
      fs.statSync(root);
    } catch {
      Logger.error('OneExplorer', 'getCfgList', 'called on not existing directory or file.');
      return [];
    }

    return readdirSyncRecursive(root).filter(val => val.endsWith('.cfg'));
  }

  private _getCfgToCfgObjMap(cfgList: string[]): ConfigObjMap {
    let map: ConfigObjMap = {};

    cfgList.forEach(cfg => {
      map[cfg] = ConfigObj.createConfigObj(vscode.Uri.file(cfg));
    });

    return map;
  }

  private _getBaseModelToCfgsMap(cfgList: string[], cfgToCfgObjMap: ConfigObjMap): StringMap {
    let map: StringMap = {};

    cfgList.forEach(cfg => {
      const cfgObj = cfgToCfgObjMap[cfg];
      if (cfgObj) {
        cfgObj.getBaseModelsExists.forEach(baseModelArtifact => {
          if (!map[baseModelArtifact.path]) {
            map[baseModelArtifact.path] = [];
          }

          if (!map[baseModelArtifact.path].includes(cfg)) {
            map[baseModelArtifact.path].push(cfg);
          }
        });
      }
    });

    return map;
  }

  private constructor() {
    this._cfgList = this._getCfgList();
    this._cfgToCfgObjMap = this._getCfgToCfgObjMap(this._cfgList);
    this._baseModelToCfgsMap = this._getBaseModelToCfgsMap(this._cfgList, this._cfgToCfgObjMap);
  }

  private static _obj: OneStorage|undefined;

  /**
   * Get cfg lists which refers the base model path
   * @param baseModelPath
   * @return a list of cfg path or 'undefined'
   */
  public static getCfgs(baseModelPath: string): string[]|undefined {
    return OneStorage.get()._baseModelToCfgsMap[baseModelPath];
  }

  /**
   * Get cfgObj from the map
   */
  public static getCfgObj(cfgPath: string): ConfigObj|null {
    return OneStorage.get()._cfgToCfgObjMap[cfgPath];
  }

  /**
   * Get a singleton object
   */
  private static get(): OneStorage {
    if (!OneStorage._obj) {
      OneStorage._obj = new OneStorage;
    }
    return OneStorage._obj;
  }

  public static reset(): void {
    OneStorage._obj = undefined;
  }
}
