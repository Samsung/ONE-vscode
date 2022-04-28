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

import {EventEmitter} from 'events';
import * as vscode from 'vscode';
import {Command} from '../Backend/Command';

import {Balloon} from '../Utils/Balloon';
import * as helpers from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {BuilderJob} from './BuilderJob';
import {JobConfig} from './JobConfig';

var path = require('path');

const K_BEGIN_IMPORT: string = 'beginImport';

/**
 * @brief cfg importer
 */
export class BuilderCfgFile extends EventEmitter implements helpers.FileSelector {
  jobOwner: BuilderJob;
  logger: Logger;
  cfgFilePath: string = '';
  cfgFilename: string = '';

  constructor(jobOwner: BuilderJob, l: Logger) {
    super();
    this.jobOwner = jobOwner;
    this.logger = l;

    this.on(K_BEGIN_IMPORT, this.onBeginImport);
  }

  private onBeginImport() {
    let cfgIni = helpers.loadCfgFile(this.cfgFilePath);
    if (cfgIni === undefined) {
      Balloon.error('Invalid cfg file');
      return;
    }
    this.cfgFilename = path.basename(this.cfgFilePath);

    console.log('cfgFilePath = ', this.cfgFilePath);
    let cmd = new Command('onecc', ['--config', this.cfgFilePath]);
    let job = new JobConfig(cmd);
    this.jobOwner.addJob(job);
    this.logger.outputLine('Done config configuration.');
    this.jobOwner.finishAdd();
  }

  // helpers.FileSelector implements
  public onFileSelected(fileUri: vscode.Uri|undefined): void {
    if (fileUri === undefined) {
      Balloon.error('Invalid file selection');
      return;
    }
    console.log('Selected file: ' + fileUri.fsPath);

    this.jobOwner.clearJobs();
    this.cfgFilePath = fileUri.fsPath;
    this.emit(K_BEGIN_IMPORT);
  }
}
