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

export enum OptimizeId {
  oO1 = 1,                            // O1
  oConvertNchwToNhwc,                 // convert_nchw_to_nhwc
  oExpandBroadcastConst,              // expand_broadcast_const
  oNchwToNhwcInputShape,              // nchw_to_nhwc_input_shape
  oNchwToNhwcOutputShape,             // nchw_to_nhwc_output_shape
  oFoldAddV2,                         // fold_add_v2
  oFoldCast,                          // fold_cast
  oFoldDequantize,                    // fold_dequantize
  oFoldDwconv,                        // fold_dwconv
  oFoldSparseToDense,                 // fold_sparse_to_dense
  oForwardReshapeToUnaryop,           // forward_reshape_to_unaryop
  oFuseAddWithTconv,                  // fuse_add_with_tconv
  oFuseBatchnormWithConv,             // fuse_batchnorm_with_conv
  oFuseBatchnormWithDwconv,           // fuse_batchnorm_with_dwconv
  oFuseBatchnormWithTconv,            // fuse_batchnorm_with_tconv
  oFuseBcq,                           // fuse_bcq
  oFusePreactivationBatchnorm,        // fuse_preactivation_batchnorm
  oFuseMeanWithMean,                  // fuse_mean_with_mean
  oFuseTransposeWithMean,             // fuse_transpose_with_mean
  oMakeBatchnormGammaPositive,        // make_batchnorm_gamma_positive
  oFuseActivationFunction,            // fuse_activation_function
  oReplaceCwMulAddWithDepthwiseConv,  // replace_cw_mul_add_with_depthwise_conv
  oRemoveQuantdequant,                // remove_quantdequant
  oRemoveRedundantReshape,            // remove_redundant_reshape
  oRemoveRedundantTranspose,          // remove_redundant_transpose
  oRemoveUnnecessaryReshape,          // remove_unnecessary_reshape
  oRemoveUnnecessarySlice,            // remove_unnecessary_slice
  oRemoveUnnecessaryStridedSlice,     // remove_unnecessary_strided_slice
  oRemoveUnnecessarySplit,            // remove_unnecessary_split
  oResolveCustomopAdd,                // resolve_customop_add
  oResolveCustomopBatchmatmul,        // resolve_customop_batchmatmul
  oResolveCustomopMatmul,             // resolve_customop_matmul
  oResolveCustomopMaxPoolWithArgmax,  // resolve_customop_max_pool_with_argmax
  oShuffleWeightTo16x1float32,        // shuffle_weight_to_16x1float32
  oSubstitutePackToReshape,           // substitute_pack_to_reshape
  oSubstitutePadv2ToPad,              // substitute_padv2_to_pad
  oSubstituteSplitvToSplit,           // substitute_splitv_to_split
  oSubstituteSqueezeToReshape,        // substitute_squeeze_to_reshape
  oSubstituteStridedSliceToReshape,   // substitute_strided_slice_to_reshape
  oSubstituteTransposeToReshape,      // substitute_transpose_to_reshape
  oTransformMinMaxToRelu6,            // transform_min_max_to_relu6
  oTransformMinReluToRelu6,           // transform_min_relu_to_relu6
}

export class JobOptimize extends JobBase {
  oO1?: boolean = undefined;
  oConvertNchwToNhwc?: boolean = undefined;
  oExpandBroadcastConst?: boolean = undefined;
  oNchwToNhwcInputShape?: boolean = undefined;
  oNchwToNhwcOutputShape?: boolean = undefined;
  oFoldAddV2?: boolean = undefined;
  oFoldCast?: boolean = undefined;
  oFoldDequantize?: boolean = undefined;
  oFoldDwconv?: boolean = undefined;
  oFoldSparseToDense?: boolean = undefined;
  oForwardReshapeToUnaryop?: boolean = undefined;
  oFuseAddWithTconv?: boolean = undefined;
  oFuseBatchnormWithConv?: boolean = undefined;
  oFuseBatchnormWithDwconv?: boolean = undefined;
  oFuseBatchnormWithTconv?: boolean = undefined;
  oFuseBcq?: boolean = undefined;
  oFusePreactivationBatchnorm?: boolean = undefined;
  oFuseMeanWithMean?: boolean = undefined;
  oFuseTransposeWithMean?: boolean = undefined;
  oMakeBatchnormGammaPositive?: boolean = undefined;
  oFuseActivationFunction?: boolean = undefined;
  oReplaceCwMulAddWithDepthwiseConv?: boolean = undefined;
  oRemoveQuantdequant?: boolean = undefined;
  oRemoveRedundantReshape?: boolean = undefined;
  oRemoveRedundantTranspose?: boolean = undefined;
  oRemoveUnnecessaryReshape?: boolean = undefined;
  oRemoveUnnecessarySlice?: boolean = undefined;
  oRemoveUnnecessaryStridedSlice?: boolean = undefined;
  oRemoveUnnecessarySplit?: boolean = undefined;
  oResolveCustomopAdd?: boolean = undefined;
  oResolveCustomopBatchmatmul?: boolean = undefined;
  oResolveCustomopMatmul?: boolean = undefined;
  oResolveCustomopMaxPoolWithArgmax?: boolean = undefined;
  oShuffleWeightTo16x1float32?: boolean = undefined;
  oSubstitutePackToReshape?: boolean = undefined;
  oSubstitutePadv2ToPad?: boolean = undefined;
  oSubstituteSplitvToSplit?: boolean = undefined;
  oSubstituteSqueezeToReshape?: boolean = undefined;
  oSubstituteStridedSliceToReshape?: boolean = undefined;
  oSubstituteTransposeToReshape?: boolean = undefined;
  oTransformMinMaxToRelu6?: boolean = undefined;
  oTransformMinReluToRelu6?: boolean = undefined;
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
    if (this.oFuseBatchnormWithConv) { args.push('--fuse_batchnorm_with_conv'); }
    if (this.oFuseBatchnormWithDwconv) { args.push('--fuse_batchnorm_with_dwconv'); }
    if (this.oFuseBatchnormWithTconv) { args.push('--fuse_batchnorm_with_tconv'); }
    if (this.oFuseBcq) { args.push('--fuse_bcq'); }
    if (this.oFusePreactivationBatchnorm) { args.push('--fuse_preactivation_batchnorm'); }
    if (this.oFuseMeanWithMean) { args.push('--fuse_mean_with_mean'); }
    if (this.oFuseTransposeWithMean) { args.push('--fuse_transpose_with_mean'); }
    if (this.oMakeBatchnormGammaPositive) { args.push('--make_batchnorm_gamma_positive'); }
    if (this.oFuseActivationFunction) { args.push('--fuse_activation_function'); }
    if (this.oReplaceCwMulAddWithDepthwiseConv) { args.push('--replace_cw_mul_add_with_depthwise_conv'); }
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
