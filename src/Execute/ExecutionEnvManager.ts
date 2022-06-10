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

import {execSync} from 'child_process';
import * as vscode from 'vscode';

import {Command} from '../Backend/Command';
import {Executor} from '../Backend/Executor';
import {Balloon} from '../Utils/Balloon';

import * as Envs from './Envs/Envs';
import {ExecutionEnv} from './ExecutionEnv';

// This is a concept for connected device, which means local or remote.
// TODO Handle about remote case.
// Currently, only local case Handled.

interface ExectionEnvManager {
  runInference(envName: string, executor: Executor, modelPath: string): void;
  runProfile(envName: string, executor: Executor, modelPath: string): void;
  refreshExecutionEnv(): void;
}

class BaseEnvManager implements ExectionEnvManager {
  executionEnvs: Map<string, ExecutionEnv>;
  constructor() {
    this.executionEnvs = new Map<string, ExecutionEnv>();
  }
  runInference(envName: string, executor: Executor, modelPath: string): void {
    throw new Error('Method not implemented.');
  }
  runProfile(envName: string, executor: Executor, modelPath: string): void {
    throw new Error('Method not implemented.');
  }
  refreshExecutionEnv(): void {
    throw new Error('Method not implemented.');
  }
}

interface ExecutionEnvManagerMap {
  [key: string]: BaseEnvManager;
}

let globalManagerMap: ExecutionEnvManagerMap = {};
// This list will keep envTypes on it.
let envList = Object.values(Envs);

class LocalEnvManager extends BaseEnvManager {
  constructor() {
    super();
    for (let index = 0; index < envList.length; index++) {
      const getListCommand: Command = envList[index].getConnectableEnvs();
      const deviceList = execSync(getListCommand.str()).toString().split('\n');
      for (let idx = 0; idx < deviceList.length; idx++) {
        const element = deviceList[idx];
        if (element !== '') {
          this.executionEnvs.set(element, envList[index].getEnv(element));
        }
      }
    }
  }

  refreshExecutionEnv() {
    this.executionEnvs.clear();
    for (let index = 0; index < envList.length; index++) {
      const getListCommand: Command = envList[index].getConnectableEnvs();
      const deviceList = execSync(getListCommand.str()).toString().split('\n');
      for (let idx = 0; idx < deviceList.length; idx++) {
        const element = deviceList[idx];
        if (element !== '') {
          this.executionEnvs.set(element, envList[index].getEnv(element));
        }
      }
    }
  }
}

function addExecutionEnvManager(location: string, id?: string, ip?: string, passpath?: string) {
  // locataion will be both `local` or `remote`, it will be enum in next time.
  if (location === 'local') {
    if (Object.keys(globalManagerMap).includes('local')) {
      Balloon.error('Local Manager already added!');
      return;
    }
    globalManagerMap[location] = new LocalEnvManager();
  }
  // TODO: add implementaion about `remote` case
  else {
    throw Error('NYI: Currently, remote type not surpported.');
  }
}

function initExecutionEnvManager() {
  // if configuration file exist, do nothing.
  // else, create local env manager and save this as configuration file.
  let deviceConfigInfo =
      vscode.workspace.getConfiguration('one-vscode').get('targetDeviceInfo', {});
  if (!deviceConfigInfo) {
    addExecutionEnvManager('local');
    saveDeviceConfiguration();
  } else {
    // load from ExecutionEnv from configuration.
    loadDeviceConfiguration(deviceConfigInfo);
  }
}

function saveDeviceConfiguration() {
  let deviceListObject: any = {};
  for (const key in globalManagerMap) {
    if (Object.prototype.hasOwnProperty.call(globalManagerMap, key)) {
      const envManagerEnvs = globalManagerMap[key].executionEnvs;
      let envManagerObj: any = {};
      if (key !== 'local') {
        // TODO Add Handling code about remote case.
      }
      deviceListObject[key] = envManagerObj;
    }
  }
  vscode.workspace.getConfiguration('one-vscode')
      .update('targetDeviceInfo', deviceListObject, true);
}

function loadDeviceConfiguration(deviceConfigInfo: any) {
  globalManagerMap = {};
  const envManager = Object.keys(deviceConfigInfo);
  for (let index = 0; index < envManager.length; index++) {
    const managerName = envManager[index];
    if (managerName === 'local') {
      addExecutionEnvManager(managerName);
    } else {
      // TODO: Handle about remote case
    }
    let executeEnvsName = Object.keys(deviceConfigInfo[managerName]);
    for (let idx = 0; idx < executeEnvsName.length; idx++) {
      const envName = executeEnvsName[idx];
    }
  }
}

export {globalManagerMap, BaseEnvManager, addExecutionEnvManager, initExecutionEnvManager};
