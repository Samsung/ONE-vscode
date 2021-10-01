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

import {Operator} from '../circle-analysis/circle/operator';
import {NodeAttributes} from '../type/types';

import {OptionsAttribute} from './optionsAttribute';

export function setAttributesByOption(
    optName: string, operator: Operator, modelAttribute: Array<NodeAttributes>) {
  switch (optName) {
    case 'AddOptions':
      OptionsAttribute.getAddAttr(operator, modelAttribute);
      break;
    case 'ArgMaxOptions':
      OptionsAttribute.getArgMaxAttr(operator, modelAttribute);
      break;
    case 'ArgMinOptions':
      OptionsAttribute.getArgMinAttr(operator, modelAttribute);
      break;
    case 'BCQFullyConnectedOptions':
      OptionsAttribute.getBCQFullyConnectedAttr(operator, modelAttribute);
      break;
    case 'BCQGatherOptions':
      OptionsAttribute.getBCQGatherAttr(operator, modelAttribute);
      break;
    case 'BatchMatMulOptions':
      OptionsAttribute.getBatchMatMulAttr(operator, modelAttribute);
      break;
    case 'BidirectionalSequenceLSTMOptions':
      OptionsAttribute.getBidirectionalSequenceLSTMAttr(operator, modelAttribute);
      break;
    case 'BidirectionalSequenceRNNOptions':
      OptionsAttribute.getBidirectionalSequenceRNNAttr(operator, modelAttribute);
      break;
    case 'CallOptions':
      OptionsAttribute.getCallAttr(operator, modelAttribute);
      break;
    case 'CastOptions':
      OptionsAttribute.getCastAttr(operator, modelAttribute);
      break;
    case 'ConcatEmbeddingsOptions':
      OptionsAttribute.getConcatEmbeddingAttr(operator, modelAttribute);
      break;
    case 'ConcatenationOptions':
      OptionsAttribute.getConcatenationAttr(operator, modelAttribute);
      break;
    case 'Conv2DOptions':
      OptionsAttribute.getConv2DAttr(operator, modelAttribute);
      break;
    case 'DepthToSpaceOptions':
      OptionsAttribute.getDepthToSpaceAttr(operator, modelAttribute);
      break;
    case 'DepthwiseConv2DOptions':
      OptionsAttribute.getDepthWiseConv2DAttr(operator, modelAttribute);
      break;
    case 'DivOptions':
      OptionsAttribute.getDivAttr(operator, modelAttribute);
      break;
    case 'FakeQuantOptions':
      OptionsAttribute.getFakeQuantAttr(operator, modelAttribute);
      break;
    case 'FullyConnectedOptions':
      OptionsAttribute.getFullyConnectedAttr(operator, modelAttribute);
      break;
    case 'IfOptions':
      OptionsAttribute.getIFAttr(operator, modelAttribute);
      break;
    case 'InstanceNormOptions':
      OptionsAttribute.getInstanceNormAttr(operator, modelAttribute);
      break;
    case 'L2NormOptions':
      OptionsAttribute.getL2NormAttr(operator, modelAttribute);
      break;
    case 'LSHProjectionOptions':
      OptionsAttribute.getLSHProjectionAttr(operator, modelAttribute);
      break;
    case 'LSTMOptions':
      OptionsAttribute.getLSTMAttr(operator, modelAttribute);
      break;
    case 'LeakyReluOptions':
      OptionsAttribute.getLeakyReluAttr(operator, modelAttribute);
      break;
    case 'LocalResponseNormalizationOptions':
      OptionsAttribute.getLocalResponseNormalizationAttr(operator, modelAttribute);
      break;
    case 'MirrorPadOptions':
      OptionsAttribute.getMirrorPadAttr(operator, modelAttribute);
      break;
    case 'OneHotOptions':
      OptionsAttribute.getOneHotAttr(operator, modelAttribute);
      break;
    case 'PackOptions':
      OptionsAttribute.getPackAttr(operator, modelAttribute);
      break;
    case 'Pool2DOptions':
      OptionsAttribute.getPool2DAttr(operator, modelAttribute);
      break;
    case 'RNNOptions':
      OptionsAttribute.getRNNAttr(operator, modelAttribute);
      break;
    case 'ReducerOptions':
      OptionsAttribute.getReducerAttr(operator, modelAttribute);
      break;
    case 'ReshapeOptions':
      OptionsAttribute.getReshapeAttr(operator, modelAttribute);
      break;
    case 'ResizeBilinearOptions':
      OptionsAttribute.getResizeBilinearAttr(operator, modelAttribute);
      break;
    case 'ResizeNearestNeighborOptions':
      OptionsAttribute.getResizeNearestNeighborAttr(operator, modelAttribute);
      break;
    case 'ReverseSequenceOptions':
      OptionsAttribute.getReverseSequenceAttr(operator, modelAttribute);
      break;
    case 'SVDFOptions':
      OptionsAttribute.getSVDFAttr(operator, modelAttribute);
      break;
    case 'SequenceRNNOptions':
      OptionsAttribute.getSequenceRNNAttr(operator, modelAttribute);
      break;
    case 'ShapeOptions':
      OptionsAttribute.getShapeAttr(operator, modelAttribute);
      break;
    case 'SkipGramOptions':
      OptionsAttribute.getSkipGramAttr(operator, modelAttribute);
      break;
    case 'SoftmaxOptions':
      OptionsAttribute.getSoftMaxAttr(operator, modelAttribute);
      break;
    case 'SpaceToDepthOptions':
      OptionsAttribute.getSpaceToDepth(operator, modelAttribute);
      break;
    case 'SparseToDenseOptions':
      OptionsAttribute.getSparseToDenseAttr(operator, modelAttribute);
      break;
    case 'SplitOptions':
      OptionsAttribute.getSplitAttr(operator, modelAttribute);
      break;
    case 'SqueezeOptions':
      OptionsAttribute.getSqueezeAttr(operator, modelAttribute);
      break;
    case 'StridedSliceOptions':
      OptionsAttribute.getStridedSliceAttr(operator, modelAttribute);
      break;
    case 'SubOptions':
      OptionsAttribute.getSubAttr(operator, modelAttribute);
      break;
    case 'TransposeConvOptions':
      OptionsAttribute.getTransposeConvAttr(operator, modelAttribute);
      break;
    case 'UnidirectionalSequenceLSTMOptions':
      OptionsAttribute.getUnidirectionalSequenceLSTMAttr(operator, modelAttribute);
      break;
    case 'UniqueOptions':
      OptionsAttribute.getUniqueAttr(operator, modelAttribute);
      break;
    case 'UnpackOptions':
      OptionsAttribute.getUnpackAttr(operator, modelAttribute);
      break;
    case 'WhileOptions':
      OptionsAttribute.getWhileAttr(operator, modelAttribute);
      break;
    default:
      console.log('This option is not supported yet.');
      break;
  }
}
