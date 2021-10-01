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

// TODO Add empty options as comment

import * as flatbuffers from 'flatbuffers';
import {ActivationFunctionType} from '../circle-analysis/circle/activation-function-type';
import {AddOptions} from '../circle-analysis/circle/add-options';
import {ArgMaxOptions} from '../circle-analysis/circle/arg-max-options';
import {ArgMinOptions} from '../circle-analysis/circle/arg-min-options';
import {BCQFullyConnectedOptions} from '../circle-analysis/circle/b-c-q-fully-connected-options';
import {BCQGatherOptions} from '../circle-analysis/circle/b-c-q-gather-options';
import {BatchMatMulOptions} from '../circle-analysis/circle/batch-mat-mul-options';
import {BidirectionalSequenceLSTMOptions} from '../circle-analysis/circle/bidirectional-sequence-l-s-t-m-options';
import {BidirectionalSequenceRNNOptions} from '../circle-analysis/circle/bidirectional-sequence-r-n-n-options';
import {CallOptions} from '../circle-analysis/circle/call-options';
import {CastOptions} from '../circle-analysis/circle/cast-options';
import {ConcatEmbeddingsOptions} from '../circle-analysis/circle/concat-embeddings-options';
import {ConcatenationOptions} from '../circle-analysis/circle/concatenation-options';
import {Conv2DOptions} from '../circle-analysis/circle/conv2-d-options';
import {DepthToSpaceOptions} from '../circle-analysis/circle/depth-to-space-options';
import {DepthwiseConv2DOptions} from '../circle-analysis/circle/depthwise-conv2-d-options';
import {DivOptions} from '../circle-analysis/circle/div-options';
import {FakeQuantOptions} from '../circle-analysis/circle/fake-quant-options';
import {FullyConnectedOptions} from '../circle-analysis/circle/fully-connected-options';
import {FullyConnectedOptionsWeightsFormat} from '../circle-analysis/circle/fully-connected-options-weights-format';
import {IfOptions} from '../circle-analysis/circle/if-options';
import {InstanceNormOptions} from '../circle-analysis/circle/instance-norm-options';
import {LSHProjectionOptions} from '../circle-analysis/circle/l-s-h-projection-options';
import {LSHProjectionType} from '../circle-analysis/circle/l-s-h-projection-type';
import {LSTMKernelType} from '../circle-analysis/circle/l-s-t-m-kernel-type';
import {LSTMOptions} from '../circle-analysis/circle/l-s-t-m-options';
import {L2NormOptions} from '../circle-analysis/circle/l2-norm-options';
import {LeakyReluOptions} from '../circle-analysis/circle/leaky-relu-options';
import {LocalResponseNormalizationOptions} from '../circle-analysis/circle/local-response-normalization-options';
import {MirrorPadMode} from '../circle-analysis/circle/mirror-pad-mode';
import {MirrorPadOptions} from '../circle-analysis/circle/mirror-pad-options';
import {OneHotOptions} from '../circle-analysis/circle/one-hot-options';
import {Operator} from '../circle-analysis/circle/operator';
import {PackOptions} from '../circle-analysis/circle/pack-options';
import {Padding} from '../circle-analysis/circle/padding';
import {Pool2DOptions} from '../circle-analysis/circle/pool2-d-options';
import {RNNOptions} from '../circle-analysis/circle/r-n-n-options';
import {ReducerOptions} from '../circle-analysis/circle/reducer-options';
import {ReshapeOptions} from '../circle-analysis/circle/reshape-options';
import {ResizeBilinearOptions} from '../circle-analysis/circle/resize-bilinear-options';
import {ResizeNearestNeighborOptions} from '../circle-analysis/circle/resize-nearest-neighbor-options';
import {ReverseSequenceOptions} from '../circle-analysis/circle/reverse-sequence-options';
import {SVDFOptions} from '../circle-analysis/circle/s-v-d-f-options';
import {SequenceRNNOptions} from '../circle-analysis/circle/sequence-r-n-n-options';
import {ShapeOptions} from '../circle-analysis/circle/shape-options';
import {SkipGramOptions} from '../circle-analysis/circle/skip-gram-options';
import {SoftmaxOptions} from '../circle-analysis/circle/softmax-options';
import {SpaceToDepthOptions} from '../circle-analysis/circle/space-to-depth-options';
import {SparseToDenseOptions} from '../circle-analysis/circle/sparse-to-dense-options';
import {SplitOptions} from '../circle-analysis/circle/split-options';
import {SqueezeOptions} from '../circle-analysis/circle/squeeze-options';
import {StridedSliceOptions} from '../circle-analysis/circle/strided-slice-options';
import {SubOptions} from '../circle-analysis/circle/sub-options';
import {TensorType} from '../circle-analysis/circle/tensor-type';
import {TransposeConvOptions} from '../circle-analysis/circle/transpose-conv-options';
import {UnidirectionalSequenceLSTMOptions} from '../circle-analysis/circle/unidirectional-sequence-l-s-t-m-options';
import {UniqueOptions} from '../circle-analysis/circle/unique-options';
import {UnpackOptions} from '../circle-analysis/circle/unpack-options';
import {WhileOptions} from '../circle-analysis/circle/while-options';
import {NodeAttributes} from '../type/types';

export class OptionsAttribute {
  static getConv2DAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let conv2DOpt = new Conv2DOptions();
    conv2DOpt = operator.builtinOptions<flatbuffers.Table>(conv2DOpt);

    attributes.push({attribute: 'dilationHFactor', value: conv2DOpt.dilationHFactor()});
    attributes.push({attribute: 'dilationWFactor', value: conv2DOpt.dilationWFactor()});
    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[conv2DOpt.fusedActivationFunction()]
    });
    attributes.push({attribute: 'padding', value: Padding[conv2DOpt.padding()]});
    attributes.push({attribute: 'strideH', value: conv2DOpt.strideH()});
    attributes.push({attribute: 'strideW', value: conv2DOpt.strideW()});
  }

  static getDepthWiseConv2DAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let depthWiseConv2DOpt = new DepthwiseConv2DOptions();
    depthWiseConv2DOpt = operator.builtinOptions<flatbuffers.Table>(depthWiseConv2DOpt);

    attributes.push({attribute: 'dilationHFactor', value: depthWiseConv2DOpt.dilationHFactor()});
    attributes.push({attribute: 'dilationWFactor', value: depthWiseConv2DOpt.dilationWFactor()});
    attributes.push({attribute: 'depthMultiplier', value: depthWiseConv2DOpt.depthMultiplier()});
    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[depthWiseConv2DOpt.fusedActivationFunction()]
    });
    attributes.push({attribute: 'padding', value: Padding[depthWiseConv2DOpt.padding()]});
    attributes.push({attribute: 'strideH', value: depthWiseConv2DOpt.strideH()});
    attributes.push({attribute: 'strideW', value: depthWiseConv2DOpt.strideW()});
  }

  static getConcatEmbeddingAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let concatEmbaddingOpt = new ConcatEmbeddingsOptions();
    concatEmbaddingOpt = operator.builtinOptions<flatbuffers.Table>(concatEmbaddingOpt);

    attributes.push({attribute: 'numChannels', value: concatEmbaddingOpt.numChannels()});

    attributes.push({
      attribute: 'numColumnsPerChannelArray',
      value: concatEmbaddingOpt.numColumnsPerChannelArray()
    });

    attributes.push({
      attribute: 'embeddingDimPerChannelArray',
      value: concatEmbaddingOpt.embeddingDimPerChannelArray()
    });
  }

  static getLSHProjectionAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let lshProjectionOpt = new LSHProjectionOptions();
    lshProjectionOpt = operator.builtinOptions<flatbuffers.Table>(lshProjectionOpt);

    attributes.push({attribute: 'type', value: LSHProjectionType[lshProjectionOpt.type()]});
  }

  static getPool2DAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let pool2DOpt = new Pool2DOptions();
    pool2DOpt = operator.builtinOptions<flatbuffers.Table>(pool2DOpt);

    attributes.push({attribute: 'filterHeight', value: pool2DOpt.filterHeight()});
    attributes.push({attribute: 'filterWidth', value: pool2DOpt.filterWidth()});
    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[pool2DOpt.fusedActivationFunction()]
    });
    attributes.push({attribute: 'padding', value: Padding[pool2DOpt.padding()]});
    attributes.push({attribute: 'strideH', value: pool2DOpt.strideH()});
    attributes.push({attribute: 'strideW', value: pool2DOpt.strideW()});
  }

  static getSVDFAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let svdfOpt = new SVDFOptions();
    svdfOpt = operator.builtinOptions<flatbuffers.Table>(svdfOpt);

    attributes.push({attribute: 'rank', value: svdfOpt.rank()});
    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[svdfOpt.fusedActivationFunction()]
    });
    attributes.push(
        {attribute: 'asymmetricQuantizeInputs', value: svdfOpt.asymmetricQuantizeInputs()});
  }

  static getRNNAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let rnnOpt = new RNNOptions();
    rnnOpt = operator.builtinOptions<flatbuffers.Table>(rnnOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[rnnOpt.fusedActivationFunction()]
    });
    attributes.push(
        {attribute: 'asymmetricQuantizeInputs', value: rnnOpt.asymmetricQuantizeInputs()});
  }

  static getFullyConnectedAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let fullyConnectedOpt = new FullyConnectedOptions();
    fullyConnectedOpt = operator.builtinOptions<flatbuffers.Table>(fullyConnectedOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[fullyConnectedOpt.fusedActivationFunction()]
    });
    attributes.push({
      attribute: 'weightsFormat',
      value: FullyConnectedOptionsWeightsFormat[fullyConnectedOpt.weightsFormat()]
    });
    attributes.push({attribute: 'keepNumDims', value: fullyConnectedOpt.keepNumDims()});
    attributes.push({
      attribute: 'asymmetricQuantizeInputs',
      value: fullyConnectedOpt.asymmetricQuantizeInputs()
    });
  }

  static getSoftMaxAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let softMaxOpt = new SoftmaxOptions();
    softMaxOpt = operator.builtinOptions<flatbuffers.Table>(softMaxOpt);

    attributes.push({attribute: 'beta', value: softMaxOpt.beta()});
  }

  static getConcatenationAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let concatenationOpt = new ConcatenationOptions();
    concatenationOpt = operator.builtinOptions<flatbuffers.Table>(concatenationOpt);

    attributes.push({attribute: 'axis', value: concatenationOpt.axis()});
    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[concatenationOpt.fusedActivationFunction()]
    });
  }

  static getAddAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let addOpt = new AddOptions();
    addOpt = operator.builtinOptions<flatbuffers.Table>(addOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[addOpt.fusedActivationFunction()]
    });
  }

  static getL2NormAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let l2NormOpt = new L2NormOptions();
    l2NormOpt = operator.builtinOptions<flatbuffers.Table>(l2NormOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[l2NormOpt.fusedActivationFunction()]
    });
  }

  static getLocalResponseNormalizationAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let localResponseNomalizationOpt = new LocalResponseNormalizationOptions();
    localResponseNomalizationOpt =
        operator.builtinOptions<flatbuffers.Table>(localResponseNomalizationOpt);

    attributes.push({attribute: 'radius', value: localResponseNomalizationOpt.radius()});
    attributes.push({attribute: 'bias', value: localResponseNomalizationOpt.bias()});
    attributes.push({attribute: 'alpha', value: localResponseNomalizationOpt.alpha()});
    attributes.push({attribute: 'beta', value: localResponseNomalizationOpt.beta()});
  }

  static getLSTMAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let lstmOpt = new LSTMOptions();
    lstmOpt = operator.builtinOptions<flatbuffers.Table>(lstmOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[lstmOpt.fusedActivationFunction()]
    });
    attributes.push({attribute: 'cellClip', value: lstmOpt.cellClip()});
    attributes.push({attribute: 'projClip', value: lstmOpt.projClip()});
    attributes.push({attribute: 'kernelType', value: LSTMKernelType[lstmOpt.kernelType()]});
    attributes.push(
        {attribute: 'asymmetricQuantizeInputs', value: lstmOpt.asymmetricQuantizeInputs()});
  }

  static getResizeBilinearAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let resizeBilinearOpt = new ResizeBilinearOptions();
    resizeBilinearOpt = operator.builtinOptions<flatbuffers.Table>(resizeBilinearOpt);

    attributes.push({attribute: 'alignCorners', value: resizeBilinearOpt.alignCorners()});
    attributes.push({attribute: 'halfPixelCenters', value: resizeBilinearOpt.halfPixelCenters()});
  }

  static getCallAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let callOpt = new CallOptions();
    callOpt = operator.builtinOptions<flatbuffers.Table>(callOpt);

    attributes.push({attribute: 'subgraph', value: callOpt.subgraph()});
  }

  static getReshapeAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let reshapeOpt = new ReshapeOptions();
    reshapeOpt = operator.builtinOptions<flatbuffers.Table>(reshapeOpt);

    attributes.push({attribute: 'newShapeArray', value: reshapeOpt.newShapeArray()});
  }

  static getSkipGramAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let skipGramOpt = new SkipGramOptions();
    skipGramOpt = operator.builtinOptions<flatbuffers.Table>(skipGramOpt);

    attributes.push({attribute: 'ngramSize', value: skipGramOpt.ngramSize()});
    attributes.push({attribute: 'maxSkipSize', value: skipGramOpt.maxSkipSize()});
    attributes.push({attribute: 'includeAllNgrams', value: skipGramOpt.includeAllNgrams()});
  }

  static getSpaceToDepth(operator: Operator, attributes: Array<NodeAttributes>) {
    let spaceToDepthOpt = new SpaceToDepthOptions();
    spaceToDepthOpt = operator.builtinOptions<flatbuffers.Table>(spaceToDepthOpt);

    attributes.push({attribute: 'blockSize', value: spaceToDepthOpt.blockSize()});
  }

  static getReducerAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let reducerOpt = new ReducerOptions();
    reducerOpt = operator.builtinOptions<flatbuffers.Table>(reducerOpt);

    attributes.push({attribute: 'keepDims', value: reducerOpt.keepDims()});
  }

  static getSubAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let subOpt = new SubOptions();
    subOpt = operator.builtinOptions<flatbuffers.Table>(subOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[subOpt.fusedActivationFunction()]
    });
  }

  static getDivAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let divOpt = new DivOptions();
    divOpt = operator.builtinOptions<flatbuffers.Table>(divOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[divOpt.fusedActivationFunction()]
    });
  }

  static getSqueezeAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let squeezeOpt = new SqueezeOptions();
    squeezeOpt = operator.builtinOptions<flatbuffers.Table>(squeezeOpt);

    attributes.push({attribute: 'squeezeDimsArray', value: squeezeOpt.squeezeDimsArray()});
  }

  static getSequenceRNNAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let sequenceRNNOpt = new SequenceRNNOptions();
    sequenceRNNOpt = operator.builtinOptions<flatbuffers.Table>(sequenceRNNOpt);

    attributes.push({attribute: 'timeMajor', value: sequenceRNNOpt.timeMajor()});
    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[sequenceRNNOpt.fusedActivationFunction()]
    });
    attributes.push(
        {attribute: 'asymmetricQuantizeInputs', value: sequenceRNNOpt.asymmetricQuantizeInputs()});
  }

  static getStridedSliceAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let strideSliceOpt = new StridedSliceOptions();
    strideSliceOpt = operator.builtinOptions<flatbuffers.Table>(strideSliceOpt);

    attributes.push({attribute: 'beginMask', value: strideSliceOpt.beginMask()});
    attributes.push({attribute: 'endMask', value: strideSliceOpt.endMask()});
    attributes.push({attribute: 'ellipsisMask', value: strideSliceOpt.ellipsisMask()});
    attributes.push({attribute: 'newAxisMask', value: strideSliceOpt.newAxisMask()});
    attributes.push({attribute: 'shrinkAxisMask', value: strideSliceOpt.shrinkAxisMask()});
  }

  static getSplitAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let splitOptions = new SplitOptions();
    splitOptions = operator.builtinOptions<flatbuffers.Table>(splitOptions);

    attributes.push({attribute: 'numSplits', value: splitOptions.numSplits()});
  }

  static getCastAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let castOpt = new CastOptions();
    castOpt = operator.builtinOptions<flatbuffers.Table>(castOpt);

    attributes.push({attribute: 'inDataType', value: TensorType[castOpt.inDataType()]});
    attributes.push({attribute: 'outDataType', value: TensorType[castOpt.outDataType()]});
  }

  static getArgMaxAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let argMaxOpt = new ArgMaxOptions();
    argMaxOpt = operator.builtinOptions<flatbuffers.Table>(argMaxOpt);

    attributes.push({attribute: 'outputType', value: TensorType[argMaxOpt.outputType()]});
  }

  static getTransposeConvAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let transposeConvOpt = new TransposeConvOptions();
    transposeConvOpt = operator.builtinOptions<flatbuffers.Table>(transposeConvOpt);

    attributes.push({attribute: 'padding', value: Padding[transposeConvOpt.padding()]});
    attributes.push({attribute: 'strideH', value: transposeConvOpt.strideH()});
    attributes.push({attribute: 'strideW', value: transposeConvOpt.strideW()});
  }

  static getSparseToDenseAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let sparseToDenseOpt = new SparseToDenseOptions();
    sparseToDenseOpt = operator.builtinOptions<flatbuffers.Table>(sparseToDenseOpt);

    attributes.push({attribute: 'validateIndices', value: sparseToDenseOpt.validateIndices()});
  }

  static getShapeAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let shapeOpt = new ShapeOptions();
    shapeOpt = operator.builtinOptions<flatbuffers.Table>(shapeOpt);

    attributes.push({attribute: 'outType', value: TensorType[shapeOpt.outType()]});
  }

  static getArgMinAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let argMinOpt = new ArgMinOptions();
    argMinOpt = operator.builtinOptions<flatbuffers.Table>(argMinOpt);

    attributes.push({attribute: 'outputType', value: TensorType[argMinOpt.outputType()]});
  }

  static getFakeQuantAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let fakeQuanOpt = new FakeQuantOptions();
    fakeQuanOpt = operator.builtinOptions<flatbuffers.Table>(fakeQuanOpt);

    attributes.push({attribute: 'min', value: fakeQuanOpt.min()});
    attributes.push({attribute: 'max', value: fakeQuanOpt.max()});
    attributes.push({attribute: 'numBits', value: fakeQuanOpt.numBits()});
    attributes.push({attribute: 'narrowRange', value: fakeQuanOpt.narrowRange()});
  }

  static getPackAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let packOpt = new PackOptions();
    packOpt = operator.builtinOptions<flatbuffers.Table>(packOpt);

    attributes.push({attribute: 'valuesCount', value: packOpt.valuesCount()});
    attributes.push({attribute: 'axis', value: packOpt.axis()});
  }

  static getOneHotAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let oneHotOpt = new OneHotOptions();
    oneHotOpt = operator.builtinOptions<flatbuffers.Table>(oneHotOpt);

    attributes.push({attribute: 'axis', value: oneHotOpt.axis()});
  }

  static getUnpackAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let unpackOpt = new UnpackOptions();
    unpackOpt = operator.builtinOptions<flatbuffers.Table>(unpackOpt);

    attributes.push({attribute: 'num', value: unpackOpt.num()});
    attributes.push({attribute: 'axis', value: unpackOpt.axis()});
  }

  static getBidirectionalSequenceLSTMAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let bidirectionalSequenceLSTMOpt = new BidirectionalSequenceLSTMOptions();
    bidirectionalSequenceLSTMOpt =
        operator.builtinOptions<flatbuffers.Table>(bidirectionalSequenceLSTMOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[bidirectionalSequenceLSTMOpt.fusedActivationFunction()]
    });
    attributes.push({attribute: 'cellClip', value: bidirectionalSequenceLSTMOpt.cellClip()});
    attributes.push({attribute: 'projClip', value: bidirectionalSequenceLSTMOpt.projClip()});
    attributes.push(
        {attribute: 'mergeOutputs', value: bidirectionalSequenceLSTMOpt.mergeOutputs()});
    attributes.push({attribute: 'timeMajor', value: bidirectionalSequenceLSTMOpt.timeMajor()});
    attributes.push({
      attribute: 'asymmetricQuantizeInputs',
      value: bidirectionalSequenceLSTMOpt.asymmetricQuantizeInputs()
    });
  }

  static getBidirectionalSequenceRNNAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let bidirectionalSequenceRNNOpt = new BidirectionalSequenceRNNOptions();
    bidirectionalSequenceRNNOpt =
        operator.builtinOptions<flatbuffers.Table>(bidirectionalSequenceRNNOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[bidirectionalSequenceRNNOpt.fusedActivationFunction()]
    });
    attributes.push({attribute: 'mergeOutputs', value: bidirectionalSequenceRNNOpt.mergeOutputs()});
    attributes.push({attribute: 'timeMajor', value: bidirectionalSequenceRNNOpt.timeMajor()});
    attributes.push({
      attribute: 'asymmetricQuantizeInputs',
      value: bidirectionalSequenceRNNOpt.asymmetricQuantizeInputs()
    });
  }

  static getUnidirectionalSequenceLSTMAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let unidirectionalSequenceLSTMOpt = new UnidirectionalSequenceLSTMOptions();
    unidirectionalSequenceLSTMOpt =
        operator.builtinOptions<flatbuffers.Table>(unidirectionalSequenceLSTMOpt);

    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[unidirectionalSequenceLSTMOpt.fusedActivationFunction()]
    });
    attributes.push({attribute: 'cellClip', value: unidirectionalSequenceLSTMOpt.cellClip()});
    attributes.push({attribute: 'projClip', value: unidirectionalSequenceLSTMOpt.projClip()});
    attributes.push({attribute: 'timeMajor', value: unidirectionalSequenceLSTMOpt.timeMajor()});
    attributes.push({
      attribute: 'asymmetricQuantizeInputs',
      value: unidirectionalSequenceLSTMOpt.asymmetricQuantizeInputs()
    });
  }

  static getResizeNearestNeighborAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let resizeNearesNeighborOpt = new ResizeNearestNeighborOptions();
    resizeNearesNeighborOpt = operator.builtinOptions<flatbuffers.Table>(resizeNearesNeighborOpt);

    attributes.push({attribute: 'alignCorners', value: resizeNearesNeighborOpt.alignCorners()});
  }

  static getLeakyReluAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let leakyReluOpt = new LeakyReluOptions();
    leakyReluOpt = operator.builtinOptions<flatbuffers.Table>(leakyReluOpt);

    attributes.push({attribute: 'alpha', value: leakyReluOpt.alpha()});
  }

  static getMirrorPadAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let mirrorPadOpt = new MirrorPadOptions();
    mirrorPadOpt = operator.builtinOptions<flatbuffers.Table>(mirrorPadOpt);

    attributes.push({attribute: 'mode', value: MirrorPadMode[mirrorPadOpt.mode()]});
  }

  static getUniqueAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let uniqueOpt = new UniqueOptions();
    uniqueOpt = operator.builtinOptions<flatbuffers.Table>(uniqueOpt);

    attributes.push({attribute: 'idxOutType', value: uniqueOpt.idxOutType()});
  }

  static getReverseSequenceAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let reverseSequenceOpt = new ReverseSequenceOptions();
    reverseSequenceOpt = operator.builtinOptions<flatbuffers.Table>(reverseSequenceOpt);

    attributes.push({attribute: 'seqDim', value: reverseSequenceOpt.seqDim()});
    attributes.push({attribute: 'batchBim', value: reverseSequenceOpt.batchDim()});
  }

  static getIFAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let ifOpt = new IfOptions();
    ifOpt = operator.builtinOptions<flatbuffers.Table>(ifOpt);

    attributes.push({attribute: 'thenSubgraphIndex', value: ifOpt.thenSubgraphIndex()});
    attributes.push({attribute: 'elseSubgraphIndex', value: ifOpt.elseSubgraphIndex()});
  }

  static getWhileAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let whileOpt = new WhileOptions();
    whileOpt = operator.builtinOptions<flatbuffers.Table>(whileOpt);

    attributes.push({attribute: 'condSubgraphIndex', value: whileOpt.condSubgraphIndex()});
    attributes.push({attribute: 'bodySubgraphIndex', value: whileOpt.bodySubgraphIndex()});
  }

  static getDepthToSpaceAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let depthToSpaceOpt = new DepthToSpaceOptions();
    depthToSpaceOpt = operator.builtinOptions<flatbuffers.Table>(depthToSpaceOpt);

    attributes.push({attribute: 'blockSize', value: depthToSpaceOpt.blockSize()});
  }

  static getBatchMatMulAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let batchMatMulOpt = new BatchMatMulOptions();
    batchMatMulOpt = operator.builtinOptions<flatbuffers.Table>(batchMatMulOpt);

    attributes.push({attribute: 'adjointLhs', value: batchMatMulOpt.adjointLhs()});
    attributes.push({attribute: 'adjointRhs', value: batchMatMulOpt.adjointRhs()});
  }

  static getBCQGatherAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let bcqGatherOpt = new BCQGatherOptions();
    bcqGatherOpt = operator.builtinOptions<flatbuffers.Table>(bcqGatherOpt);

    attributes.push({attribute: 'inputHiddenSize', value: bcqGatherOpt.inputHiddenSize()});
    attributes.push({attribute: 'axis', value: bcqGatherOpt.axis()});
  }

  static getBCQFullyConnectedAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let bcqFullyConnectedOpt = new BCQFullyConnectedOptions();
    bcqFullyConnectedOpt = operator.builtinOptions<flatbuffers.Table>(bcqFullyConnectedOpt);

    attributes.push(
        {attribute: 'weightsHiddenSize', value: bcqFullyConnectedOpt.weightsHiddenSize()});
    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[bcqFullyConnectedOpt.fusedActivationFunction()]
    });
  }

  static getInstanceNormAttr(operator: Operator, attributes: Array<NodeAttributes>) {
    let instanceNormOpt = new InstanceNormOptions();
    instanceNormOpt = operator.builtinOptions<flatbuffers.Table>(instanceNormOpt);

    attributes.push({attribute: 'epsilon', value: instanceNormOpt.epsilon()});
    attributes.push({
      attribute: 'fusedActivationFunction',
      value: ActivationFunctionType[instanceNormOpt.fusedActivationFunction()]
    });
  }
}
