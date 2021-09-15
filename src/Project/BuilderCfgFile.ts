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

import {EventEmitter} from 'events';
import * as vscode from 'vscode';

import {Balloon} from '../Utils/Balloon';
import * as helpers from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {BuilderJob} from './BuilderJob';

var path = require('path');

const K_BEGIN_IMPORT: string = 'beginImport';

const K_ONE_BUILD: string = 'one-build';
const K_ONECC: string = 'onecc';
const K_IMPORT_TF: string = 'one-import-tf';
const K_IMPORT_TFLITE: string = 'one-import-tflite';
const K_IMPORT_ONNX: string = 'one-import-onnx';
const K_IMPORT_BCQ: string = 'one-import-bcq';

/**
 * @brief onecc/one-build cfg importer
 */
export class BuilderCfgFile extends EventEmitter implements helpers.FileSelector {
  jobOwner: BuilderJob;
  logger: Logger;
  cfgFilePath: string;
  cfgFilename: string;

  constructor(jobOwner: BuilderJob, l: Logger) {
    super();
    this.jobOwner = jobOwner;
    this.logger = l;
    this.cfgFilePath = '';
    this.cfgFilename = '';

    this.on(K_BEGIN_IMPORT, this.onBeginImport);
  }

  private isItemTrue(item: string): boolean {
    if (item === 'True') {
      return true;
    }
    // TODO add check for true to sync with one-cmds
    return false;
  }

  private validateUniqueImport(cfgOne: any): boolean {
    let importCount = 0;

    this.logger.outputLine('Reading configuration...');
    if (this.isItemTrue(cfgOne[K_IMPORT_TF])) {
      this.logger.outputLine(K_IMPORT_TF + ' is True');
      importCount = importCount + 1;
    }
    if (this.isItemTrue(cfgOne[K_IMPORT_TFLITE])) {
      this.logger.outputLine(K_IMPORT_TFLITE + ' is True');
      importCount = importCount + 1;
    }
    if (this.isItemTrue(cfgOne[K_IMPORT_ONNX])) {
      this.logger.outputLine(K_IMPORT_ONNX + ' is True');
      importCount = importCount + 1;
    }
    if (this.isItemTrue(cfgOne[K_IMPORT_BCQ])) {
      this.logger.outputLine(K_IMPORT_BCQ + ' is True');
      importCount = importCount + 1;
    }
    return importCount === 1;
  }

  private validateCfg(cfgOne: any): boolean {
    if (!this.validateUniqueImport(cfgOne)) {
      return false;
    }
    // TODO add more validation

    return true;
  }

  private onBeginImport() {
    let cfgIni = helpers.loadCfgFile(this.cfgFilePath);
    if (cfgIni === undefined) {
      Balloon.error('Invalid cfg file');
      return;
    }
    this.cfgFilename = path.basename(this.cfgFilePath);

    // Search for onecc or one-build
    // NOTE cfg has fixed items and fixed order of jobs
    let cfgOne = cfgIni[K_ONECC];
    if (cfgOne === undefined) {
      cfgOne = cfgIni[K_ONE_BUILD];
    }
    // TODO warn if both onecc and one-build exist?
    if (cfgOne === undefined) {
      Balloon.error('Section \'' + K_ONECC + '\' or \'' + K_ONE_BUILD + '\' not found');
      return;
    }
    if (!this.validateCfg(cfgOne)) {
      Balloon.error('Invalid \'' + K_ONECC + '\' or \'' + K_ONE_BUILD + '\' section');
      return;
    }

    // TODO get import item

    // TODO add one-import
    // TODO add one-optimize
    // TODO add one-quantize
    // TODO add one-pack
    // TODO add one-codegen

    this.logger.outputLine('Done import configuration.');
  }

  // helpers.FileSelector implements
  public onFileSelected(fileUri: vscode.Uri|undefined): void {
    if (fileUri === undefined) {
      Balloon.error('Invalid file selecttion');
      return;
    }
    console.log('Selected file: ' + fileUri.fsPath);

    this.cfgFilePath = fileUri.fsPath;
    this.emit(K_BEGIN_IMPORT);
  }
}
