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

import {BuilderJob} from '../Job/BuilderJob';
import {Balloon} from '../Utils/Balloon';
import * as helpers from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

import {JobCodegen} from './JobCodegen';
import {JobImportBCQ} from './JobImportBCQ';
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
// key for optimizations
// NOTE eslint-disable is used to use lower case as-is
/* eslint-disable */
const K_OPT_convert_nchw_to_nhwc: string = 'convert_nchw_to_nhwc';
const K_OPT_expand_broadcast_const: string = 'expand_broadcast_const';
const K_OPT_nchw_to_nhwc_input_shape: string = 'nchw_to_nhwc_input_shape';
const K_OPT_nchw_to_nhwc_output_shape: string = 'nchw_to_nhwc_output_shape';
const K_OPT_fold_add_v2: string = 'fold_add_v2';
const K_OPT_fold_cast: string = 'fold_cast';
const K_OPT_fold_dequantize: string = 'fold_dequantize';
const K_OPT_fold_dwconv: string = 'fold_dwconv';
const K_OPT_fold_sparse_to_dense: string = 'fold_sparse_to_dense';
const K_OPT_forward_reshape_to_unaryop: string = 'forward_reshape_to_unaryop';
const K_OPT_fuse_add_with_tconv: string = 'fuse_add_with_tconv';
const K_OPT_fuse_add_with_fully_connected: string = 'fuse_add_with_fully_connected';
const K_OPT_fuse_batchnorm_with_conv: string = 'fuse_batchnorm_with_conv';
const K_OPT_fuse_batchnorm_with_dwconv: string = 'fuse_batchnorm_with_dwconv';
const K_OPT_fuse_batchnorm_with_tconv: string = 'fuse_batchnorm_with_tconv';
const K_OPT_fuse_bcq: string = 'fuse_bcq';
const K_OPT_fuse_preactivation_batchnorm: string = 'fuse_preactivation_batchnorm';
const K_OPT_fuse_mean_with_mean: string = 'fuse_mean_with_mean';
const K_OPT_fuse_transpose_with_mean: string = 'fuse_transpose_with_mean';
const K_OPT_make_batchnorm_gamma_positive: string = 'make_batchnorm_gamma_positive';
const K_OPT_fuse_activation_function: string = 'fuse_activation_function';
const K_OPT_fuse_instnorm: string = 'fuse_instnorm';
const K_OPT_replace_cw_mul_add_with_depthwise_conv: string =
    'replace_cw_mul_add_with_depthwise_conv';
const K_OPT_remove_fakequant: string = 'remove_fakequant';
const K_OPT_remove_quantdequant: string = 'remove_quantdequant';
const K_OPT_remove_redundant_reshape: string = 'remove_redundant_reshape';
const K_OPT_remove_redundant_transpose: string = 'remove_redundant_transpose';
const K_OPT_remove_unnecessary_reshape: string = 'remove_unnecessary_reshape';
const K_OPT_remove_unnecessary_slice: string = 'remove_unnecessary_slice';
const K_OPT_remove_unnecessary_strided_slice: string = 'remove_unnecessary_strided_slice';
const K_OPT_remove_unnecessary_split: string = 'remove_unnecessary_split';
const K_OPT_resolve_customop_add: string = 'resolve_customop_add';
const K_OPT_resolve_customop_batchmatmul: string = 'resolve_customop_batchmatmul';
const K_OPT_resolve_customop_matmul: string = 'resolve_customop_matmul';
const K_OPT_resolve_customop_max_pool_with_argmax: string = 'resolve_customop_max_pool_with_argmax';
const K_OPT_shuffle_weight_to_16x1float32: string = 'shuffle_weight_to_16x1float32';
const K_OPT_substitute_pack_to_reshape: string = 'substitute_pack_to_reshape';
const K_OPT_substitute_padv2_to_pad: string = 'substitute_padv2_to_pad';
const K_OPT_substitute_splitv_to_split: string = 'substitute_splitv_to_split';
const K_OPT_substitute_squeeze_to_reshape: string = 'substitute_squeeze_to_reshape';
const K_OPT_substitute_strided_slice_to_reshape: string = 'substitute_strided_slice_to_reshape';
const K_OPT_substitute_transpose_to_reshape: string = 'substitute_transpose_to_reshape';
const K_OPT_transform_min_max_to_relu6: string = 'transform_min_max_to_relu6';
const K_OPT_transform_min_relu_to_relu6: string = 'transform_min_relu_to_relu6';
/* eslint-enable */

/**
 * @brief onecc/one-build cfg importer
 */
export class BuilderCfgFile extends EventEmitter implements helpers.FileSelector {
  tag = this.constructor.name;
  jobOwner: BuilderJob;
  cfgFilePath: string = '';
  cfgFilename: string = '';

  constructor(jobOwner: BuilderJob) {
    super();
    this.jobOwner = jobOwner;

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

    Logger.info(this.tag, 'importTF =', importTF);
    this.jobOwner.addJob(importTF);
    Logger.info(this.tag, 'Add Import: ' + inputModel);
  }

  private cfgImportTflite(prop: any) {
    let importTFlite = new JobImportTFLite();
    importTFlite.inputPath = prop[K_INPUT_PATH];
    importTFlite.outputPath = prop[K_OUTPUT_PATH];

    let inputModel = path.basename(importTFlite.inputPath);
    importTFlite.name = 'ImportTFlite ' + inputModel;

    Logger.debug(this.tag, 'importTFlite = ', importTFlite);
    this.jobOwner.addJob(importTFlite);
    Logger.info(this.tag, 'Add Import: ' + inputModel);
  }

  private cfgImportOnnx(prop: any) {
    let importONNX = new JobImportONNX();
    importONNX.inputPath = prop[K_INPUT_PATH];
    importONNX.outputPath = prop[K_OUTPUT_PATH];
    importONNX.inputArrays = prop[K_INPUT_ARRAYS];
    importONNX.outputArrays = prop[K_OUTPUT_ARRAYS];

    let inputModel = path.basename(importONNX.inputPath);
    importONNX.name = 'Import ' + inputModel;

    Logger.info(this.tag, 'importOnnx =', importONNX);
    this.jobOwner.addJob(importONNX);
    Logger.info(this.tag, 'Add Import: ' + inputModel);
  }

  private cfgImportBcq(prop: any) {
    let importBCQ = new JobImportBCQ();
    importBCQ.inputPath = prop[K_INPUT_PATH];
    importBCQ.outputPath = prop[K_OUTPUT_PATH];
    importBCQ.inputArrays = prop[K_INPUT_ARRAYS];
    importBCQ.outputArrays = prop[K_OUTPUT_ARRAYS];
    importBCQ.inputShapes = prop[K_INPUT_SHAPES];
    importBCQ.converterVersion = prop[K_CONVERTER_VERSION];

    let inputModel = path.basename(importBCQ.inputPath);
    importBCQ.name = 'ImportBCQ ' + inputModel;

    Logger.info(this.tag, 'importTF =', importBCQ);
    this.jobOwner.addJob(importBCQ);
    Logger.info(this.tag, 'Add Import: ' + inputModel);
  }

  private cfgOptimize(prop: any) {
    let optimize = new JobOptimize();
    optimize.inputPath = prop[K_INPUT_PATH];
    optimize.outputPath = prop[K_OUTPUT_PATH];

    optimize.oConvertNchwToNhwc = prop[K_OPT_convert_nchw_to_nhwc];
    optimize.oExpandBroadcastConst = prop[K_OPT_expand_broadcast_const];
    optimize.oNchwToNhwcInputShape = prop[K_OPT_nchw_to_nhwc_input_shape];
    optimize.oNchwToNhwcOutputShape = prop[K_OPT_nchw_to_nhwc_output_shape];
    optimize.oFoldAddV2 = prop[K_OPT_fold_add_v2];
    optimize.oFoldCast = prop[K_OPT_fold_cast];
    optimize.oFoldDequantize = prop[K_OPT_fold_dequantize];
    optimize.oFoldDwconv = prop[K_OPT_fold_dwconv];
    optimize.oFoldSparseToDense = prop[K_OPT_fold_sparse_to_dense];
    optimize.oForwardReshapeToUnaryop = prop[K_OPT_forward_reshape_to_unaryop];
    optimize.oFuseAddWithTconv = prop[K_OPT_fuse_add_with_tconv];
    optimize.oFuseAddWithFullyConnected = prop[K_OPT_fuse_add_with_fully_connected];
    optimize.oFuseBatchnormWithConv = prop[K_OPT_fuse_batchnorm_with_conv];
    optimize.oFuseBatchnormWithDwconv = prop[K_OPT_fuse_batchnorm_with_dwconv];
    optimize.oFuseBatchnormWithTconv = prop[K_OPT_fuse_batchnorm_with_tconv];
    optimize.oFuseBcq = prop[K_OPT_fuse_bcq];
    optimize.oFusePreactivationBatchnorm = prop[K_OPT_fuse_preactivation_batchnorm];
    optimize.oFuseMeanWithMean = prop[K_OPT_fuse_mean_with_mean];
    optimize.oFuseTransposeWithMean = prop[K_OPT_fuse_transpose_with_mean];
    optimize.oMakeBatchnormGammaPositive = prop[K_OPT_make_batchnorm_gamma_positive];
    optimize.oFuseActivationFunction = prop[K_OPT_fuse_activation_function];
    optimize.oFuseInstnorm = prop[K_OPT_fuse_instnorm];
    optimize.oReplaceCwMulAddWithDepthwiseConv = prop[K_OPT_replace_cw_mul_add_with_depthwise_conv];
    optimize.oRemoveFakequant = prop[K_OPT_remove_fakequant];
    optimize.oRemoveQuantdequant = prop[K_OPT_remove_quantdequant];
    optimize.oRemoveRedundantReshape = prop[K_OPT_remove_redundant_reshape];
    optimize.oRemoveRedundantTranspose = prop[K_OPT_remove_redundant_transpose];
    optimize.oRemoveUnnecessaryReshape = prop[K_OPT_remove_unnecessary_reshape];
    optimize.oRemoveUnnecessarySlice = prop[K_OPT_remove_unnecessary_slice];
    optimize.oRemoveUnnecessaryStridedSlice = prop[K_OPT_remove_unnecessary_strided_slice];
    optimize.oRemoveUnnecessarySplit = prop[K_OPT_remove_unnecessary_split];
    optimize.oResolveCustomopAdd = prop[K_OPT_resolve_customop_add];
    optimize.oResolveCustomopBatchmatmul = prop[K_OPT_resolve_customop_batchmatmul];
    optimize.oResolveCustomopMatmul = prop[K_OPT_resolve_customop_matmul];
    optimize.oResolveCustomopMaxPoolWithArgmax = prop[K_OPT_resolve_customop_max_pool_with_argmax];
    optimize.oShuffleWeightTo16x1float32 = prop[K_OPT_shuffle_weight_to_16x1float32];
    optimize.oSubstitutePackToReshape = prop[K_OPT_substitute_pack_to_reshape];
    optimize.oSubstitutePadv2ToPad = prop[K_OPT_substitute_padv2_to_pad];
    optimize.oSubstituteSplitvToSplit = prop[K_OPT_substitute_splitv_to_split];
    optimize.oSubstituteSqueezeToReshape = prop[K_OPT_substitute_squeeze_to_reshape];
    optimize.oSubstituteStridedSliceToReshape = prop[K_OPT_substitute_strided_slice_to_reshape];
    optimize.oSubstituteTransposeToReshape = prop[K_OPT_substitute_transpose_to_reshape];
    optimize.oTransformMinMaxToRelu6 = prop[K_OPT_transform_min_max_to_relu6];
    optimize.oTransformMinReluToRelu6 = prop[K_OPT_transform_min_relu_to_relu6];

    let inputModel = path.basename(optimize.inputPath);
    optimize.name = 'Optimize ' + inputModel;

    Logger.info(this.tag, 'optimize =', optimize);
    this.jobOwner.addJob(optimize);
    Logger.info(this.tag, 'Add Optimize: ' + inputModel);
  }

  private cfgQuantize(prop: any) {
    let quantize = new JobQuantize();
    quantize.inputPath = prop[K_INPUT_PATH];
    quantize.outputPath = prop[K_OUTPUT_PATH];

    let inputModel = path.basename(quantize.inputPath);
    quantize.name = 'Quantize ' + inputModel;

    Logger.info(this.tag, 'quantize =', quantize);
    this.jobOwner.addJob(quantize);
    Logger.info(this.tag, 'Add Quantize: ' + inputModel);
  }

  private cfgPack(prop: any) {
    let pack = new JobPack();
    pack.inputPath = prop[K_INPUT_PATH];
    pack.outputPath = prop[K_OUTPUT_PATH];

    let inputModel = path.basename(pack.inputPath);
    pack.name = 'Pack ' + inputModel;

    Logger.info(this.tag, 'pack =', pack);
    this.jobOwner.addJob(pack);
    Logger.info(this.tag, 'Add Pack: ' + inputModel);
  }

  private cfgCodegen(prop: any) {
    let codegen = new JobCodegen();
    codegen.backend = prop[K_BACKEND];
    codegen.command = prop[K_COMMAND];

    codegen.name = 'Codegen ' + codegen.backend;

    Logger.info(this.tag, 'Codegen =', codegen);
    this.jobOwner.addJob(codegen);
    Logger.info(this.tag, 'Add Codegen: ' + codegen.backend);
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

    Logger.info(this.tag, 'Reading configuration...');
    if (this.isItemTrue(cfgOne[K_IMPORT_TF])) {
      Logger.info(this.tag, K_IMPORT_TF + ' is True');
      importCount = importCount + 1;
    }
    if (this.isItemTrue(cfgOne[K_IMPORT_TFLITE])) {
      Logger.info(this.tag, K_IMPORT_TFLITE + ' is True');
      importCount = importCount + 1;
    }
    if (this.isItemTrue(cfgOne[K_IMPORT_ONNX])) {
      Logger.info(this.tag, K_IMPORT_ONNX + ' is True');
      importCount = importCount + 1;
    }
    if (this.isItemTrue(cfgOne[K_IMPORT_BCQ])) {
      Logger.info(this.tag, K_IMPORT_BCQ + ' is True');
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
      Logger.info(this.tag, 'getImportItem:', item);
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
    Logger.info(this.tag, 'Import:', itemJob);
    if (itemJob === K_IMPORT_TF) {
      let prop = cfgIni[itemJob];
      this.cfgImportTf(prop);
    } else if (itemJob === K_IMPORT_TFLITE) {
      let prop = cfgIni[itemJob];
      this.cfgImportTflite(prop);
    } else if (itemJob === K_IMPORT_ONNX) {
      let prop = cfgIni[itemJob];
      this.cfgImportOnnx(prop);
    } else if (itemJob === K_IMPORT_BCQ) {
      let prop = cfgIni[itemJob];
      this.cfgImportBcq(prop);
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

    Logger.info(this.tag, 'Done import configuration.');
    this.jobOwner.finishAdd();
  }

  // helpers.FileSelector implements
  public onFileSelected(fileUri: vscode.Uri|undefined): void {
    if (fileUri === undefined) {
      Balloon.error('Invalid file selection');
      return;
    }
    Logger.info(this.tag, 'Selected file: ' + fileUri.fsPath);

    this.jobOwner.clearJobs();
    this.cfgFilePath = fileUri.fsPath;
    this.emit(K_BEGIN_IMPORT);
  }
}
