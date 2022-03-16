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

import * as chai from 'chai';
import {Job} from '../../Project/Job';
import {JobOptimize} from '../../Project/JobOptimize';

const assert = chai.assert;

suite('Project', function() {
  suite('JobOptimize', function() {
    suite('#contructor()', function() {
      test('is contructed with jobtype', function() {
        let job = new JobOptimize();
        assert.strictEqual(job.jobType, Job.Type.tOptimize);
      });
    });
    suite('#valid()', function() {
      test('returns true always', function() {
        let job = new JobOptimize();
        assert.isTrue(job.valid);
      });
    });
    suite('#tool()', function() {
      test('returns toolname as string', function() {
        let job = new JobOptimize();
        let toolName = 'one-optimize';
        assert.strictEqual(job.tool, toolName);
      });
    });
    suite('#toolArgs()', function() {
      test('returns args as ToolArgs', function() {
        let inputPath = 'input_path';
        let outputPath = 'output_path';

        let oO1: boolean = true;                          // O1
        let oConvertNchwToNhwc: boolean = true;           // convert_nchw_to_nhwc
        let oExpandBroadcastConst: boolean = true;        // expand_broadcast_const
        let oNchwToNhwcInputShape: boolean = true;        // nchw_to_nhwc_input_shape
        let oNchwToNhwcOutputShape: boolean = true;       // nchw_to_nhwc_output_shape
        let oFoldAddV2: boolean = true;                   // fold_add_v2
        let oFoldCast: boolean = true;                    // fold_cast
        let oFoldDequantize: boolean = true;              // fold_dequantize
        let oFoldDwconv: boolean = true;                  // fold_dwconv
        let oFoldSparseToDense: boolean = true;           // fold_sparse_to_dense
        let oForwardReshapeToUnaryop: boolean = true;     // forward_reshape_to_unaryop
        let oFuseAddWithTconv: boolean = true;            // fuse_add_with_tconv
        let oFuseAddWithFullyConnected: boolean = true;   // fuse_add_with_fully_connected
        let oFuseBatchnormWithConv: boolean = true;       // fuse_batchnorm_with_conv
        let oFuseBatchnormWithDwconv: boolean = true;     // fuse_batchnorm_with_dwconv
        let oFuseBatchnormWithTconv: boolean = true;      // fuse_batchnorm_with_tconv
        let oFuseBcq: boolean = true;                     // fuse_bcq
        let oFusePreactivationBatchnorm: boolean = true;  // fuse_preactivation_batchnorm
        let oFuseMeanWithMean: boolean = true;            // fuse_mean_with_mean
        let oFuseTransposeWithMean: boolean = true;       // fuse_transpose_with_mean
        let oMakeBatchnormGammaPositive: boolean = true;  // make_batchnorm_gamma_positive
        let oFuseActivationFunction: boolean = true;      // fuse_activation_function
        let oFuseInstnorm: boolean = true;                // fuse_instnorm
        let oReplaceCwMulAddWithDepthwiseConv: boolean =
            true;                                       // replace_cw_mul_add_with_depthwise_conv
        let oRemoveFakequant: boolean = true;           // remove_fakequant
        let oRemoveQuantdequant: boolean = true;        // remove_quantdequant
        let oRemoveRedundantReshape: boolean = true;    // remove_redundant_reshape
        let oRemoveRedundantTranspose: boolean = true;  // remove_redundant_transpose
        let oRemoveUnnecessaryReshape: boolean = true;  // remove_unnecessary_reshape
        let oRemoveUnnecessarySlice: boolean = true;    // remove_unnecessary_slice
        let oRemoveUnnecessaryStridedSlice: boolean = true;  // remove_unnecessary_strided_slice
        let oRemoveUnnecessarySplit: boolean = true;         // remove_unnecessary_split
        let oResolveCustomopAdd: boolean = true;             // resolve_customop_add
        let oResolveCustomopBatchmatmul: boolean = true;     // resolve_customop_batchmatmul
        let oResolveCustomopMatmul: boolean = true;          // resolve_customop_matmul
        let oResolveCustomopMaxPoolWithArgmax: boolean =
            true;                                         // resolve_customop_max_pool_with_argmax
        let oShuffleWeightTo16x1float32: boolean = true;  // shuffle_weight_to_16x1float32
        let oSubstitutePackToReshape: boolean = true;     // substitute_pack_to_reshape
        let oSubstitutePadv2ToPad: boolean = true;        // substitute_padv2_to_pad
        let oSubstituteSplitvToSplit: boolean = true;     // substitute_splitv_to_split
        let oSubstituteSqueezeToReshape: boolean = true;  // substitute_squeeze_to_reshape
        let oSubstituteStridedSliceToReshape: boolean =
            true;                                           // substitute_strided_slice_to_reshape
        let oSubstituteTransposeToReshape: boolean = true;  // substitute_transpose_to_reshape
        let oTransformMinMaxToRelu6: boolean = true;        // transform_min_max_to_relu6
        let oTransformMinReluToRelu6: boolean = true;       // transform_min_relu_to_relu6
        // TODO sync with one-optimize options

        let job = new JobOptimize();
        // mandatory
        job.inputPath = inputPath;
        job.outputPath = outputPath;
        // add optimize options
        job.oO1 = oO1;
        job.oConvertNchwToNhwc = oConvertNchwToNhwc;
        job.oExpandBroadcastConst = oExpandBroadcastConst;
        job.oNchwToNhwcInputShape = oNchwToNhwcInputShape;
        job.oNchwToNhwcOutputShape = oNchwToNhwcOutputShape;
        job.oFoldAddV2 = oFoldAddV2;
        job.oFoldCast = oFoldCast;
        job.oFoldDequantize = oFoldDequantize;
        job.oFoldDwconv = oFoldDwconv;
        job.oFoldSparseToDense = oFoldSparseToDense;
        job.oForwardReshapeToUnaryop = oForwardReshapeToUnaryop;
        job.oFuseAddWithTconv = oFuseAddWithTconv;
        job.oFuseAddWithFullyConnected = oFuseAddWithFullyConnected;
        job.oFuseBatchnormWithConv = oFuseBatchnormWithConv;
        job.oFuseBatchnormWithDwconv = oFuseBatchnormWithDwconv;
        job.oFuseBatchnormWithTconv = oFuseBatchnormWithTconv;
        job.oFuseBcq = oFuseBcq;
        job.oFusePreactivationBatchnorm = oFusePreactivationBatchnorm;
        job.oFuseMeanWithMean = oFuseMeanWithMean;
        job.oFuseTransposeWithMean = oFuseTransposeWithMean;
        job.oMakeBatchnormGammaPositive = oMakeBatchnormGammaPositive;
        job.oFuseActivationFunction = oFuseActivationFunction;
        job.oFuseInstnorm = oFuseInstnorm;
        job.oReplaceCwMulAddWithDepthwiseConv = oReplaceCwMulAddWithDepthwiseConv;
        job.oRemoveFakequant = oRemoveFakequant;
        job.oRemoveQuantdequant = oRemoveQuantdequant;
        job.oRemoveRedundantReshape = oRemoveRedundantReshape;
        job.oRemoveRedundantTranspose = oRemoveRedundantTranspose;
        job.oRemoveUnnecessaryReshape = oRemoveUnnecessaryReshape;
        job.oRemoveUnnecessarySlice = oRemoveUnnecessarySlice;
        job.oRemoveUnnecessaryStridedSlice = oRemoveUnnecessaryStridedSlice;
        job.oRemoveUnnecessarySplit = oRemoveUnnecessarySplit;
        job.oResolveCustomopAdd = oResolveCustomopAdd;
        job.oResolveCustomopBatchmatmul = oResolveCustomopBatchmatmul;
        job.oResolveCustomopMatmul = oResolveCustomopMatmul;
        job.oResolveCustomopMaxPoolWithArgmax = oResolveCustomopMaxPoolWithArgmax;
        job.oShuffleWeightTo16x1float32 = oShuffleWeightTo16x1float32;
        job.oSubstitutePackToReshape = oSubstitutePackToReshape;
        job.oSubstitutePadv2ToPad = oSubstitutePadv2ToPad;
        job.oSubstituteSplitvToSplit = oSubstituteSplitvToSplit;
        job.oSubstituteSqueezeToReshape = oSubstituteSqueezeToReshape;
        job.oSubstituteStridedSliceToReshape = oSubstituteStridedSliceToReshape;
        job.oSubstituteTransposeToReshape = oSubstituteTransposeToReshape;
        job.oTransformMinMaxToRelu6 = oTransformMinMaxToRelu6;
        job.oTransformMinReluToRelu6 = oTransformMinReluToRelu6;
        assert.isTrue(job.valid);

        let expected: Array<string> = [
          '--input_path',
          inputPath,
          '--output_path',
          outputPath,
          '--O1',
          '--convert_nchw_to_nhwc',
          '--expand_broadcast_const',
          '--nchw_to_nhwc_input_shape',
          '--nchw_to_nhwc_output_shape',
          '--fold_add_v2',
          '--fold_cast',
          '--fold_dequantize',
          '--fold_dwconv',
          '--fold_sparse_to_dense',
          '--forward_reshape_to_unaryop',
          '--fuse_add_with_tconv',
          '--fuse_add_with_fully_connected',
          '--fuse_batchnorm_with_conv',
          '--fuse_batchnorm_with_dwconv',
          '--fuse_batchnorm_with_tconv',
          '--fuse_bcq',
          '--fuse_preactivation_batchnorm',
          '--fuse_mean_with_mean',
          '--fuse_transpose_with_mean',
          '--make_batchnorm_gamma_positive',
          '--fuse_instnorm',
          '--fuse_activation_function',
          '--replace_cw_mul_add_with_depthwise_conv',
          '--remove_fakequant',
          '--remove_quantdequant',
          '--remove_redundant_reshape',
          '--remove_redundant_transpose',
          '--remove_unnecessary_reshape',
          '--remove_unnecessary_slice',
          '--remove_unnecessary_strided_slice',
          '--remove_unnecessary_split',
          '--resolve_customop_add',
          '--resolve_customop_batchmatmul',
          '--resolve_customop_matmul',
          '--resolve_customop_max_pool_with_argmax',
          '--shuffle_weight_to_16x1float32',
          '--substitute_pack_to_reshape',
          '--substitute_padv2_to_pad',
          '--substitute_splitv_to_split',
          '--substitute_squeeze_to_reshape',
          '--substitute_strided_slice_to_reshape',
          '--substitute_transpose_to_reshape',
          '--transform_min_max_to_relu6',
          '--transform_min_relu_to_relu6',
        ];
        let args = job.toolArgs;
        assert.includeOrderedMembers(args, expected);
      });
    });
  });
});
