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

import {assert} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {obtainWorkspaceRoots} from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {ConfigObj} from './ConfigObject';
import {Node, NodeType} from './OneExplorer';

export {
  BaseModelToCfgMap as _unit_test_BaseModelToCfgMap,
  CfgToCfgObjMap as _unit_test_CfgToCfgObjMap,
};

class CfgToCfgObjMap {
  private _map: Map<string, ConfigObj>;

  constructor() {
    this._map = new Map<string, ConfigObj>();
  }

  public init(cfgList: string[]) {
    cfgList.forEach(cfg => {
      const cfgObj = ConfigObj.createConfigObj(vscode.Uri.file(cfg));
      if (cfgObj) {
        this._map.set(cfg, cfgObj);
      }
    });
  }

  get size() {
    return this._map.size;
  }

  public get(path: string) {
    return this._map.get(path);
  }

  public reset(type: NodeType, path: string) {
    switch (type) {
      case NodeType.config:
        this._map.delete(path);
        break;
      case NodeType.baseModel:
      case NodeType.product:
      case NodeType.directory:
      default:
        assert.isOk(false, `Cannot reach here`);
        break;
    }
  }

  /**
   * Update the data when cfg file's path is changed or the content is changed.
   * @param type NodeType
   * @param path config path to update
   * @param newpath (optional) if exists, change the file path
   */
  public update(type: NodeType, path: string, newpath?: string) {
    switch (type) {
      case NodeType.config: {
        this._map.delete(path);

        if (newpath) {
          path = newpath;
        }
        const cfgObj = ConfigObj.createConfigObj(vscode.Uri.file(path));
        if (cfgObj) {
          this._map.set(path, cfgObj);
        }

        break;
      }
      case NodeType.baseModel:
      case NodeType.product:
      case NodeType.directory:
      default:
        assert.isOk(false, `Cannot reach here`);
        break;
    }
  }
}

class BaseModelToCfgMap {
  private _map: Map<string, string[]>;

  constructor() {
    this._map = new Map<string, string[]>();
  }

  public init(cfgList: string[], cfgToCfgObjMap: CfgToCfgObjMap) {
    cfgList.forEach(cfg => {
      const cfgObj = cfgToCfgObjMap.get(cfg);

      (cfgObj ? cfgObj.getBaseModelsExists : []).forEach(artifact => {
        this._map.get(artifact.path) ?
            this._map.set(artifact.path, this._map.get(artifact.path)!.concat([cfg])) :
            this._map.set(artifact.path, [cfg]);
      });
    });
  }

  get size() {
    return this._map.size;
  }

  public get(path: string) {
    return this._map.get(path);
  }

  public reset(type: NodeType, path: string) {
    switch (type) {
      case NodeType.baseModel:
        this._map.delete(path);
        break;
      case NodeType.config:
        this._map.forEach((cfgs, key, map) => {
          if (cfgs.includes(path)) {
            cfgs = cfgs.filter(cfg => cfg !== path);
            map.set(key, cfgs);
          }
        });
        break;
      case NodeType.product:
      case NodeType.directory:
      default:
        assert.isOk(false, `Cannot reach here`);
        break;
    }
  }

  public update(type: NodeType, oldpath: string, newpath: string) {
    switch (type) {
      case NodeType.baseModel: {
        const value = this._map.get(oldpath);

        if (!value) {
          return;
        }

        this._map.delete(oldpath);
        this._map.set(newpath, value);

        break;
      }
      case NodeType.config:
        this._map.forEach((cfgs, key, map) => {
          if (cfgs.includes(oldpath)) {
            cfgs = cfgs.map(cfg => (cfg === oldpath) ? newpath : cfg);
            map.set(key, cfgs);
          }
        });
        break;
      case NodeType.product:
      case NodeType.directory:
      default:
        assert.isOk(false, `Cannot reach here`);
        break;
    }
  }
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
   * @brief A map of all the path to nodes
   * @note _nodeMap only contains the nodes which have ever been shown in ONE Explorer view by
   * revealing the parent nodes. To get the unseen node from _nodeMap, _nodeMap needs to be
   * pre-built. Mind that it will slow down the extension to gather data about unseen nodes.
   *       Currently, only the two depths from those shown nodes are built.
   */
  private _nodeMap: Map<string, Node> = new Map<string, Node>();

  /**
   * @brief A map of ConfigObj (key: cfg path)
   */
  private _cfgToCfgObjMap: CfgToCfgObjMap;
  /**
   * @brief A map of BaseModel path to Cfg path
   */
  private _baseModelToCfgsMap: BaseModelToCfgMap;

  /**
   * Get the list of .cfg files within the workspace
   * @param root  the file or directory,
   *              which MUST exist in the file system
   */
  private _getCfgList(roots: string[] = obtainWorkspaceRoots()): string[] {
    /**
     * Returns an array of all the file names inside the root directory
     * @todo Check soft link
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
      return roots.map(root => readdirSyncRecursive(root).filter(val => val.endsWith('.cfg')))
          .reduce((prev, cur) => [...prev, ...cur]);
    } catch {
      Logger.error('OneExplorer', '_getCfgList()', 'called on not existing directory or file.');
      return [];
    }
  }

  private static _delete(node: Node) {
    const instance = OneStorage.get();
    instance._nodeMap.delete(node.path);

    switch (node.type) {
      case NodeType.baseModel:
        instance._baseModelToCfgsMap.reset(node.type, node.path);
        break;
      case NodeType.config:
        instance._baseModelToCfgsMap.reset(node.type, node.path);
        instance._cfgToCfgObjMap.reset(node.type, node.path);
        break;
      default:
        break;
    }
  }

  private constructor() {
    const cfgList = this._getCfgList();

    this._cfgToCfgObjMap = new CfgToCfgObjMap();
    this._cfgToCfgObjMap.init(cfgList);

    this._baseModelToCfgsMap = new BaseModelToCfgMap();
    this._baseModelToCfgsMap.init(cfgList, this._cfgToCfgObjMap);
  }

  private static _obj: OneStorage|undefined;

  /**
   * Get cfg lists which refers the base model path
   * @param baseModelPath
   * @return a list of cfg path or undefined
   *         An empty array is returned when
   *          (1) the path not exists
   *          (2) the path is not a base model file
   *          (3) the path is a lonely base model file
   */
  public static getCfgs(baseModelPath: string): string[]|undefined {
    return OneStorage.get()._baseModelToCfgsMap.get(baseModelPath);
  }

  /**
   * Get cfgObj from the map
   */
  public static getCfgObj(cfgPath: string): ConfigObj|undefined {
    return OneStorage.get()._cfgToCfgObjMap.get(cfgPath);
  }

  /**
   * Get cfgObj from the map
   */
  public static getNode(fsPath: string): Node|undefined {
    return OneStorage.get()._nodeMap.get(fsPath);
  }

  public static insert(node: Node) {
    // NOTE
    // Only _nodeMap is built by calling this function
    // _baseModelToCfgsMap and _cfgToCfgObjMap are built at constuctors
    OneStorage.get()._nodeMap.set(node.path, node);
  }

  /**
   * @brief Delete a node and its child recursively from OneStorage
   * @param node A node to reset. Reset all if not given.
   * @param recursive Reset the node and its children recursively
   */
  public static delete(node: Node, recursive: boolean = false) {
    const deleteRecursively = (node: Node) => {
      if (node.getChildren().length > 0) {
        node.getChildren().forEach(child => deleteRecursively(child));
      }
      this._delete(node);
    };

    recursive ? deleteRecursively(node) : this._delete(node);

    if (node.parent) {
      node.parent.resetChildren();
      node.parent.getChildren();
    }
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
