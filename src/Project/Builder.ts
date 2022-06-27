/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as vscode from 'vscode';

import {Balloon} from '../Utils/Balloon';
import * as helpers from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {BuilderCfgFile} from './BuilderCfgFile';
import {BuilderJob} from './BuilderJob';
import {Job} from './Job';
import {WorkFlow} from './WorkFlow';

export class Builder implements BuilderJob {
  workFlow: WorkFlow;  // our build WorkFlow
  currentWorkspace: string = '';
  builderCfgFile: BuilderCfgFile;

  constructor() {
    this.workFlow = new WorkFlow();
    this.builderCfgFile = new BuilderCfgFile(this);
  }

  public init() {
    this.workFlow.clearJobs();
  }

  // BuilderJob implements
  public addJob(job: Job): void {
    this.workFlow.addJob(job);
  }

  public clearJobs(): void {
    this.init();
  }

  public finishAdd(): void {
    Logger.info('Builder', 'Done building WorkFlow: ', this.workFlow.jobs);
  }

  // called from user interface
  public build(context: vscode.ExtensionContext) {
    this.workFlow.start();
  }

  // called from user interface
  public import(context: vscode.ExtensionContext) {
    helpers.getImportCfgFilepath(this.builderCfgFile);
  }
}
