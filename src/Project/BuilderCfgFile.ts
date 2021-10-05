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
import {JobCodegen} from './JobCodegen';
import {JobImportONNX} from './JobImportONNX';
import {JobImportTF} from './JobImportTF';
import {JobImportTFLite} from './JobImportTFLite';
import {JobOptimize} from './JobOptimize';
import {JobPack} from './JobPack';
import {JobQuantize} from './JobQuantize';

var path = require('path');

const K_BEGIN_IMPORT: string = 'beginImport';

const K_ONE_BUILD: string = 'one-build';
const K_ONECC: string = 'onecc';
const K_IMPORT_TF: string = 'one-import-tf';
const K_IMPORT_TFLITE: string = 'one-import-tflite';
const K_IMPORT_ONNX: string = 'one-import-onnx';
const K_IMPORT_BCQ: string = 'one-import-bcq';
const K_OPTIMIZE: string = 'one-optimize';
const K_QUANTIZE: string = 'one-quantize';
const K_PACK: string = 'one-pack';
const K_CODEGEN: string = 'one-codegen';
// key for properties
const K_INPUT_PATH: string = 'input_path';
const K_OUTPUT_PATH: string = 'output_path';
const K_INPUT_ARRAYS: string = 'input_arrays';
const K_OUTPUT_ARRAYS: string = 'output_arrays';
const K_INPUT_SHAPES: string = 'input_shapes';
const K_CONVERTER_VERSION: string = 'converter_version';
const K_MODEL_FORMAT: string = 'model_format';
const K_SAVE_INTERMEDIATE: string = 'save_intermediate';
const K_BACKEND: string = 'backend';
const K_COMMAND: string = 'command';

/**
 * @brief onecc/one-build cfg importer
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

  private cfgImportTf(prop: any) {
    let importTF = new JobImportTF();
    importTF.inputPath = prop[K_INPUT_PATH];
    importTF.outputPath = prop[K_OUTPUT_PATH];
    importTF.inputArrays = prop[K_INPUT_ARRAYS];
    importTF.outputArrays = prop[K_OUTPUT_ARRAYS];
    importTF.inputShapes = prop[K_INPUT_SHAPES];
    importTF.converterVersion = prop[K_CONVERTER_VERSION];
    importTF.modelFormat = prop[K_MODEL_FORMAT];
    importTF.saveIntermediate = prop[K_SAVE_INTERMEDIATE];

    let inputModel = path.basename(importTF.inputPath);
    importTF.name = 'ImportTF ' + inputModel;

    console.log('importTF = ', importTF);
    this.jobOwner.addJob(importTF);
    this.logger.outputLine('Add Import: ' + inputModel);
  }

  private cfgImportTflite(prop: any) {
    let importTFlite = new JobImportTFLite();
    importTFlite.inputPath = prop[K_INPUT_PATH];
    importTFlite.outputPath = prop[K_OUTPUT_PATH];

    let inputModel = path.basename(importTFlite.inputPath);
    importTFlite.name = 'ImportTFlite ' + inputModel;

    console.log('importTFlite = ', importTFlite);
    this.jobOwner.addJob(importTFlite);
    this.logger.outputLine('Add Import: ' + inputModel);
  }

  private cfgImportOnnx(prop: any) {
    let importONNX = new JobImportONNX();
    importONNX.inputPath = prop[K_INPUT_PATH];
    importONNX.outputPath = prop[K_OUTPUT_PATH];
    importONNX.inputArrays = prop[K_INPUT_ARRAYS];
    importONNX.outputArrays = prop[K_OUTPUT_ARRAYS];

    let inputModel = path.basename(importONNX.inputPath);
    importONNX.name = 'Import ' + inputModel;

    console.log('importOnnx = ', importONNX);
    this.jobOwner.addJob(importONNX);
    this.logger.outputLine('Add Import: ' + inputModel);
  }

  private cfgOptimize(prop: any) {
    let optimize = new JobOptimize();
    optimize.inputPath = prop[K_INPUT_PATH];
    optimize.outputPath = prop[K_OUTPUT_PATH];

    let inputModel = path.basename(optimize.inputPath);
    optimize.name = 'Optimize ' + inputModel;

    console.log('optimize = ', optimize);
    this.jobOwner.addJob(optimize);
    this.logger.outputLine('Add Optimize: ' + inputModel);
  }

  private cfgQuantize(prop: any) {
    let quantize = new JobQuantize();
    quantize.inputPath = prop[K_INPUT_PATH];
    quantize.outputPath = prop[K_OUTPUT_PATH];

    let inputModel = path.basename(quantize.inputPath);
    quantize.name = 'Quantize ' + inputModel;

    console.log('quantize = ', quantize);
    this.jobOwner.addJob(quantize);
    this.logger.outputLine('Add Quantize: ' + inputModel);
  }

  private cfgPack(prop: any) {
    let pack = new JobPack();
    pack.inputPath = prop[K_INPUT_PATH];
    pack.outputPath = prop[K_OUTPUT_PATH];

    let inputModel = path.basename(pack.inputPath);
    pack.name = 'Pack ' + inputModel;

    console.log('pack = ', pack);
    this.jobOwner.addJob(pack);
    this.logger.outputLine('Add Pack: ' + inputModel);
  }

  private cfgCodegen(prop: any) {
    let codegen = new JobCodegen();
    codegen.backend = prop[K_BACKEND];
    codegen.command = prop[K_COMMAND];

    codegen.name = 'Codegen ' + codegen.backend;

    console.log('Codegen = ', codegen);
    this.jobOwner.addJob(codegen);
    this.logger.outputLine('Add Codegen: ' + codegen.backend);
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

  private getImportItem(cfgOne: any): string|undefined {
    let importItems = [K_IMPORT_TF, K_IMPORT_TFLITE, K_IMPORT_ONNX, K_IMPORT_BCQ];

    for (let item of importItems) {
      console.log('getImportItem:', item);
      if (this.isItemTrue(cfgOne[item])) {
        return item;
      }
    }
    return undefined;
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

    // Import
    let itemJob = this.getImportItem(cfgOne);
    if (itemJob === undefined) {
      Balloon.error('Invalid \'' + K_ONECC + '\' or \'' + K_ONE_BUILD + '\' section');
      return;
    }
    console.log('Import: ', itemJob);
    if (itemJob === K_IMPORT_TF) {
      let prop = cfgIni[itemJob];
      this.cfgImportTf(prop);
    } else if (itemJob === K_IMPORT_TFLITE) {
      let prop = cfgIni[itemJob];
      this.cfgImportTflite(prop);
    } else if (itemJob === K_IMPORT_ONNX) {
      let prop = cfgIni[itemJob];
      this.cfgImportOnnx(prop);
    }
    // TODO add other import jobs

    if (this.isItemTrue(cfgOne[K_OPTIMIZE])) {
      let prop = cfgIni[K_OPTIMIZE];
      this.cfgOptimize(prop);
    }
    if (this.isItemTrue(cfgOne[K_QUANTIZE])) {
      let prop = cfgIni[K_QUANTIZE];
      this.cfgQuantize(prop);
    }
    if (this.isItemTrue(cfgOne[K_PACK])) {
      let prop = cfgIni[K_PACK];
      this.cfgPack(prop);
    }
    if (this.isItemTrue(cfgOne[K_CODEGEN])) {
      let prop = cfgIni[K_CODEGEN];
      this.cfgCodegen(prop);
    }

    this.logger.outputLine('Done import configuration.');
    this.jobOwner.finishAdd();
  }

  // helpers.FileSelector implements
  public onFileSelected(fileUri: vscode.Uri|undefined): void {
    if (fileUri === undefined) {
      Balloon.error('Invalid file selection');
      return;
    }
    console.log('Selected file: ' + fileUri.fsPath);

    this.cfgFilePath = fileUri.fsPath;
    this.emit(K_BEGIN_IMPORT);
  }
}
