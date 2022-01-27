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

import {Job} from './Job';
import {JobBase} from './JobBase';
import {ToolArgs} from './ToolArgs';

export class JobOptimize extends JobBase {
  oO1?: boolean = undefined;                          // O1
  oConvertNchwToNhwc?: boolean = undefined;           // convert_nchw_to_nhwc
  oExpandBroadcastConst?: boolean = undefined;        // expand_broadcast_const
  oNchwToNhwcInputShape?: boolean = undefined;        // nchw_to_nhwc_input_shape
  oNchwToNhwcOutputShape?: boolean = undefined;       // nchw_to_nhwc_output_shape
  oFoldAddV2?: boolean = undefined;                   // fold_add_v2
  oFoldCast?: boolean = undefined;                    // fold_cast
  oFoldDequantize?: boolean = undefined;              // fold_dequantize
  oFoldDwconv?: boolean = undefined;                  // fold_dwconv
  oFoldSparseToDense?: boolean = undefined;           // fold_sparse_to_dense
  oForwardReshapeToUnaryop?: boolean = undefined;     // forward_reshape_to_unaryop
  oFuseAddWithTconv?: boolean = undefined;            // fuse_add_with_tconv
  oFuseAddWithFullyConnected?: boolean = undefined;   // fuse_add_with_fully_connected
  oFuseBatchnormWithConv?: boolean = undefined;       // fuse_batchnorm_with_conv
  oFuseBatchnormWithDwconv?: boolean = undefined;     // fuse_batchnorm_with_dwconv
  oFuseBatchnormWithTconv?: boolean = undefined;      // fuse_batchnorm_with_tconv
  oFuseBcq?: boolean = undefined;                     // fuse_bcq
  oFusePreactivationBatchnorm?: boolean = undefined;  // fuse_preactivation_batchnorm
  oFuseMeanWithMean?: boolean = undefined;            // fuse_mean_with_mean
  oFuseTransposeWithMean?: boolean = undefined;       // fuse_transpose_with_mean
  oMakeBatchnormGammaPositive?: boolean = undefined;  // make_batchnorm_gamma_positive
  oFuseActivationFunction?: boolean = undefined;      // fuse_activation_function
  oFuseInstnorm?: boolean = undefined;                // fuse_instnorm
  oReplaceCwMulAddWithDepthwiseConv?: boolean =
      undefined;                                         // replace_cw_mul_add_with_depthwise_conv
  oRemoveFakequant?: boolean = undefined;                // remove_fakequant
  oRemoveQuantdequant?: boolean = undefined;             // remove_quantdequant
  oRemoveRedundantReshape?: boolean = undefined;         // remove_redundant_reshape
  oRemoveRedundantTranspose?: boolean = undefined;       // remove_redundant_transpose
  oRemoveUnnecessaryReshape?: boolean = undefined;       // remove_unnecessary_reshape
  oRemoveUnnecessarySlice?: boolean = undefined;         // remove_unnecessary_slice
  oRemoveUnnecessaryStridedSlice?: boolean = undefined;  // remove_unnecessary_strided_slice
  oRemoveUnnecessarySplit?: boolean = undefined;         // remove_unnecessary_split
  oResolveCustomopAdd?: boolean = undefined;             // resolve_customop_add
  oResolveCustomopBatchmatmul?: boolean = undefined;     // resolve_customop_batchmatmul
  oResolveCustomopMatmul?: boolean = undefined;          // resolve_customop_matmul
  oResolveCustomopMaxPoolWithArgmax?: boolean = undefined;  // resolve_customop_max_pool_with_argmax
  oShuffleWeightTo16x1float32?: boolean = undefined;        // shuffle_weight_to_16x1float32
  oSubstitutePackToReshape?: boolean = undefined;           // substitute_pack_to_reshape
  oSubstitutePadv2ToPad?: boolean = undefined;              // substitute_padv2_to_pad
  oSubstituteSplitvToSplit?: boolean = undefined;           // substitute_splitv_to_split
  oSubstituteSqueezeToReshape?: boolean = undefined;        // substitute_squeeze_to_reshape
  oSubstituteStridedSliceToReshape?: boolean = undefined;   // substitute_strided_slice_to_reshape
  oSubstituteTransposeToReshape?: boolean = undefined;      // substitute_transpose_to_reshape
  oTransformMinMaxToRelu6?: boolean = undefined;            // transform_min_max_to_relu6
  oTransformMinReluToRelu6?: boolean = undefined;           // transform_min_relu_to_relu6
  // TODO sync with one-optimize options

  constructor() {
    super();
    this.jobType = Job.Type.tOptimize;
  }

  public get valid() {
    // TODO validate arguments;
    return true;
  }

  public get tool() {
    return 'one-optimize';
  }

  public get toolArgs() {
    let args = new ToolArgs();

    // mandatory arguments
    args.add('--input_path', this.inputPath);
    args.add('--output_path', this.outputPath);

    // add optimize options
    // clang-format off
    if (this.oO1) { args.push('--O1'); }
    if (this.oConvertNchwToNhwc) { args.push('--convert_nchw_to_nhwc'); }
    if (this.oExpandBroadcastConst) { args.push('--expand_broadcast_const'); }
    if (this.oNchwToNhwcInputShape) { args.push('--nchw_to_nhwc_input_shape'); }
    if (this.oNchwToNhwcOutputShape) { args.push('--nchw_to_nhwc_output_shape'); }
    if (this.oFoldAddV2) { args.push('--fold_add_v2'); }
    if (this.oFoldCast) { args.push('--fold_cast'); }
    if (this.oFoldDequantize) { args.push('--fold_dequantize'); }
    if (this.oFoldDwconv) { args.push('--fold_dwconv'); }
    if (this.oFoldSparseToDense) { args.push('--fold_sparse_to_dense'); }
    if (this.oForwardReshapeToUnaryop) { args.push('--forward_reshape_to_unaryop'); }
    if (this.oFuseAddWithTconv) { args.push('--fuse_add_with_tconv'); }
    if (this.oFuseAddWithFullyConnected) { args.push('--fuse_add_with_fully_connected'); }
    if (this.oFuseBatchnormWithConv) { args.push('--fuse_batchnorm_with_conv'); }
    if (this.oFuseBatchnormWithDwconv) { args.push('--fuse_batchnorm_with_dwconv'); }
    if (this.oFuseBatchnormWithTconv) { args.push('--fuse_batchnorm_with_tconv'); }
    if (this.oFuseBcq) { args.push('--fuse_bcq'); }
    if (this.oFusePreactivationBatchnorm) { args.push('--fuse_preactivation_batchnorm'); }
    if (this.oFuseMeanWithMean) { args.push('--fuse_mean_with_mean'); }
    if (this.oFuseTransposeWithMean) { args.push('--fuse_transpose_with_mean'); }
    if (this.oMakeBatchnormGammaPositive) { args.push('--make_batchnorm_gamma_positive'); }
    if (this.oFuseInstnorm) { args.push('--fuse_instnorm'); }
    if (this.oFuseActivationFunction) { args.push('--fuse_activation_function'); }
    if (this.oReplaceCwMulAddWithDepthwiseConv) { args.push('--replace_cw_mul_add_with_depthwise_conv'); }
    if (this.oRemoveFakequant) { args.push('--remove_fakequant'); }
    if (this.oRemoveQuantdequant) { args.push('--remove_quantdequant'); }
    if (this.oRemoveRedundantReshape) { args.push('--remove_redundant_reshape'); }
    if (this.oRemoveRedundantTranspose) { args.push('--remove_redundant_transpose'); }
    if (this.oRemoveUnnecessaryReshape) { args.push('--remove_unnecessary_reshape '); }
    if (this.oRemoveUnnecessarySlice) { args.push('--remove_unnecessary_slice'); }
    if (this.oRemoveUnnecessaryStridedSlice) { args.push('--remove_unnecessary_strided_slice'); }
    if (this.oRemoveUnnecessarySplit) { args.push('--remove_unnecessary_split'); }
    if (this.oResolveCustomopAdd) { args.push('--resolve_customop_add'); }
    if (this.oResolveCustomopBatchmatmul) { args.push('--resolve_customop_batchmatmul'); }
    if (this.oResolveCustomopMatmul) { args.push('--resolve_customop_matmul'); }
    if (this.oResolveCustomopMaxPoolWithArgmax) { args.push('--resolve_customop_max_pool_with_argmax'); }
    if (this.oShuffleWeightTo16x1float32) { args.push('--shuffle_weight_to_16x1float32'); }
    if (this.oSubstitutePackToReshape) { args.push('--substitute_pack_to_reshape'); }
    if (this.oSubstitutePadv2ToPad) { args.push('--substitute_padv2_to_pad'); }
    if (this.oSubstituteSplitvToSplit) { args.push('--substitute_splitv_to_split'); }
    if (this.oSubstituteSqueezeToReshape) { args.push('--substitute_squeeze_to_reshape'); }
    if (this.oSubstituteStridedSliceToReshape) { args.push('--substitute_strided_slice_to_reshape'); }
    if (this.oSubstituteTransposeToReshape) { args.push('--substitute_transpose_to_reshape'); }
    if (this.oTransformMinMaxToRelu6) { args.push('--transform_min_max_to_relu6'); }
    if (this.oTransformMinReluToRelu6) { args.push('--transform_min_relu_to_relu6'); }
    // clang-format on

    return args;
  }
}
