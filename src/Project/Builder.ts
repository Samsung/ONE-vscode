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

import {JobImportTF} from './JobImportTF';
import {JobOptimize} from './JobOptimize';
import {JobQuantize} from './JobQuantize';
import {WorkFlow} from './WorkFlow';

export class Builder {
  logger: Logger;
  workFlow: WorkFlow;  // our build WorkFlow
  currentWorkspace: string;

  constructor(l: Logger) {
    this.logger = l;
    this.workFlow = new WorkFlow(l);
    this.currentWorkspace = '';
  }

  // TODO import .cfg file to BuildFlow

  public init() {
    // temporary initial build jobs for testing
    {
      // import-tf
      let importTF = new JobImportTF();
      importTF.name = 'ImportTF inception_v3.pb';
      importTF.inputPath = './inception_v3.pb';
      importTF.outputPath = './inception_v3.circle';
      importTF.inputArrays = 'input';
      importTF.outputArrays = 'InceptionV3/Predictions/Reshape_1';
      importTF.inputShapes = '1,299,299,3';
      importTF.converterVersion = 'v1';

      this.workFlow.addJob(importTF);
    }

    {
      // optimize
      let optimize = new JobOptimize();
      optimize.name = 'Optimize inception_v3.circle';
      optimize.inputPath = './inception_v3.circle';
      optimize.outputPath = './inception_v3.opt.circle';
      this.workFlow.addJob(optimize);
    }

    {
      // quantize
      let quantize = new JobQuantize();
      quantize.name = 'Quantize inception_v3.circle';
      quantize.inputPath = './inception_v3.opt.circle';
      quantize.outputPath = './inception_v3.opt.q8.circle';
      this.workFlow.addJob(quantize);
    }
  }

  // called from user interface
  public build(context: vscode.ExtensionContext) {
    try {
      this.currentWorkspace = helpers.obtainWorkspaceRoot();
    } catch (e: unknown) {
      let errmsg = 'Failed to obtain workspace root';
      if (e instanceof Error) {
        errmsg = e.message;
      }
      // TODO add more type for e if changed in obtainWorkspaceRoot
      Balloon.error(errmsg);
      return;
    }

    this.workFlow.start(this.currentWorkspace);
  }
}
