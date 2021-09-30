import * as flatbuffers from 'flatbuffers';
import { NodeAttributes } from '../type/types';
import { Operator } from '../circle-analysis/circle/operator';
import { AddOptions } from '../circle-analysis/circle/add-options';
import { ArgMaxOptions } from '../circle-analysis/circle/arg-max-options';
import { ArgMinOptions } from '../circle-analysis/circle/arg-min-options';
import { BCQFullyConnectedOptions } from '../circle-analysis/circle/b-c-q-fully-connected-options';
import { BCQGatherOptions } from '../circle-analysis/circle/b-c-q-gather-options';
import { BatchMatMulOptions } from '../circle-analysis/circle/batch-mat-mul-options';
import { BidirectionalSequenceLSTMOptions } from '../circle-analysis/circle/bidirectional-sequence-l-s-t-m-options';
import { BidirectionalSequenceRNNOptions } from '../circle-analysis/circle/bidirectional-sequence-r-n-n-options';
import { CallOptions } from '../circle-analysis/circle/call-options';
import { CastOptions } from '../circle-analysis/circle/cast-options';
import { ConcatenationOptions } from '../circle-analysis/circle/concatenation-options';
import { ConcatEmbeddingsOptions } from '../circle-analysis/circle/concat-embeddings-options'
import { Conv2DOptions } from '../circle-analysis/circle/conv2-d-options';
import { DepthToSpaceOptions } from '../circle-analysis/circle/depth-to-space-options';
import { DepthwiseConv2DOptions } from '../circle-analysis/circle/depthwise-conv2-d-options';
import { DivOptions } from '../circle-analysis/circle/div-options';
import { FakeQuantOptions } from '../circle-analysis/circle/fake-quant-options';
import { FullyConnectedOptions } from '../circle-analysis/circle/fully-connected-options';
import { IfOptions } from '../circle-analysis/circle/if-options';
import { InstanceNormOptions } from '../circle-analysis/circle/instance-norm-options';
import { L2NormOptions } from '../circle-analysis/circle/l2-norm-options';
import { LSHProjectionOptions } from '../circle-analysis/circle/l-s-h-projection-options';
import { LSTMOptions } from '../circle-analysis/circle/l-s-t-m-options';
import { LeakyReluOptions } from '../circle-analysis/circle/leaky-relu-options';
import { LocalResponseNormalizationOptions } from '../circle-analysis/circle/local-response-normalization-options';
import { MirrorPadOptions } from '../circle-analysis/circle/mirror-pad-options';
import { OneHotOptions } from '../circle-analysis/circle/one-hot-options';
import { PackOptions } from '../circle-analysis/circle/pack-options';
import { Pool2DOptions } from '../circle-analysis/circle/pool2-d-options';
import { RNNOptions } from '../circle-analysis/circle/r-n-n-options';
import { ReducerOptions } from '../circle-analysis/circle/reducer-options';
import { ReshapeOptions } from '../circle-analysis/circle/reshape-options';
import { ResizeBilinearOptions } from '../circle-analysis/circle/resize-bilinear-options';
import { ResizeNearestNeighborOptions } from '../circle-analysis/circle/resize-nearest-neighbor-options';
import { ReverseSequenceOptions } from '../circle-analysis/circle/reverse-sequence-options';
import { SVDFOptions } from '../circle-analysis/circle/s-v-d-f-options';
import { SequenceRNNOptions } from '../circle-analysis/circle/sequence-r-n-n-options';
import { ShapeOptions } from '../circle-analysis/circle/shape-options';
import { SkipGramOptions } from '../circle-analysis/circle/skip-gram-options';
import { SoftmaxOptions } from '../circle-analysis/circle/softmax-options';
import { SpaceToDepthOptions } from '../circle-analysis/circle/space-to-depth-options';
import { SparseToDenseOptions } from '../circle-analysis/circle/sparse-to-dense-options';
import { SplitOptions } from '../circle-analysis/circle/split-options';
import { SqueezeOptions } from '../circle-analysis/circle/squeeze-options';
import { StridedSliceOptions } from '../circle-analysis/circle/strided-slice-options';
import { SubOptions } from '../circle-analysis/circle/sub-options';
import { TransposeConvOptions } from '../circle-analysis/circle/transpose-conv-options';
import { UnidirectionalSequenceLSTMOptions } from '../circle-analysis/circle/unidirectional-sequence-l-s-t-m-options';
import { UniqueOptions } from '../circle-analysis/circle/unique-options';
import { UnpackOptions } from '../circle-analysis/circle/unpack-options';
import { WhileOptions } from '../circle-analysis/circle/while-options';
import { Padding } from '../circle-analysis/circle/padding'
import { ActivationFunctionType } from '../circle-analysis/circle/activation-function-type'
import { LSHProjectionType } from '../circle-analysis/circle/l-s-h-projection-type';
import { FullyConnectedOptionsWeightsFormat } from '../circle-analysis/circle/fully-connected-options-weights-format'
import { LSTMKernelType } from '../circle-analysis/circle/l-s-t-m-kernel-type';
import { TensorType } from '../circle-analysis/circle/tensor-type';
import { MirrorPadMode } from '../circle-analysis/circle/mirror-pad-mode';

export class OptionsAttribute {
    
    static getConv2DAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let conv2DOpt = new Conv2DOptions();
        conv2DOpt = operator.builtinOptions<flatbuffers.Table>(conv2DOpt);
        
        attributes.push({ attribute: 'dialtaion_h_factor', value: conv2DOpt.dilationHFactor() });
        attributes.push({ attribute: 'dialtaion_w_factor', value: conv2DOpt.dilationWFactor() });
        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[conv2DOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'padding', value: Padding[conv2DOpt.padding()] });
        attributes.push({ attribute: 'stride_h', value: conv2DOpt.strideH() });
        attributes.push({ attribute: 'stride_w', value: conv2DOpt.strideW() });
    }

    static getDepthWiseConv2DAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let depthWiseConv2DOpt = new DepthwiseConv2DOptions();
        depthWiseConv2DOpt = operator.builtinOptions<flatbuffers.Table>(depthWiseConv2DOpt);

        attributes.push({ attribute: 'dialtaion_h_factor', value: depthWiseConv2DOpt.dilationHFactor() });
        attributes.push({ attribute: 'dialtaion_w_factor', value: depthWiseConv2DOpt.dilationWFactor() });
        attributes.push({ attribute: 'depth_multiplier', value: depthWiseConv2DOpt.depthMultiplier() });
        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[depthWiseConv2DOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'padding', value: Padding[depthWiseConv2DOpt.padding()] });
        attributes.push({ attribute: 'stride_h', value: depthWiseConv2DOpt.strideH() });
        attributes.push({ attribute: 'stride_w', value: depthWiseConv2DOpt.strideW() });
    }

    static getConcatEmbeddingAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let concatEmbaddingOpt = new ConcatEmbeddingsOptions();
        concatEmbaddingOpt = operator.builtinOptions<flatbuffers.Table>(concatEmbaddingOpt);
        
        let numChannelLength = concatEmbaddingOpt.numChannels();
        let embeddingDimPerChannelLength = concatEmbaddingOpt.embeddingDimPerChannelLength();

        attributes.push({ attribute: 'num_channel_length', value: numChannelLength });

        for (let i = 0; i < numChannelLength; i++) {
            attributes.push({ attribute: 'num_column_per_channel_' + i, value: concatEmbaddingOpt.numColumnsPerChannel(i) });
        }

        attributes.push({ attribute: 'num_columns_per_channel_array', value: concatEmbaddingOpt.numColumnsPerChannelArray() });

        attributes.push({ attribute: 'embedding_dim_per_channel_length', value: embeddingDimPerChannelLength });

        for (let i = 0; i < embeddingDimPerChannelLength; i++) {
            attributes.push({ attribute: 'embedding_dim_per_channel_' + i, value: concatEmbaddingOpt.embeddingDimPerChannel(i) });
        }

        attributes.push({ attribute: 'embedding_dim_per_channel_array', value: concatEmbaddingOpt.embeddingDimPerChannelArray() });
    }

    static getLSHProjectionAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let LSHProjectionOpt = new LSHProjectionOptions();
        LSHProjectionOpt = operator.builtinOptions<flatbuffers.Table>(LSHProjectionOpt);

        attributes.push({ attribute: 'filter_height', value: LSHProjectionType[LSHProjectionOpt.type()] });
    }

    static getPool2DAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let pool2DOpt = new Pool2DOptions();
        pool2DOpt = operator.builtinOptions<flatbuffers.Table>(pool2DOpt);

        attributes.push({ attribute: 'filter_height', value: pool2DOpt.filterHeight() });
        attributes.push({ attribute: 'filter_width', value: pool2DOpt.filterWidth() });
        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[pool2DOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'padding', value: Padding[pool2DOpt.padding()] });
        attributes.push({ attribute: 'stride_h', value: pool2DOpt.strideH() });
        attributes.push({ attribute: 'stride_w', value: pool2DOpt.strideW() });
    }

    static getSVDFAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let SVDFOpt = new SVDFOptions();
        SVDFOpt = operator.builtinOptions<flatbuffers.Table>(SVDFOpt);

        attributes.push({ attribute: 'rank', value: SVDFOpt.rank() });
        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[SVDFOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'asymmetric_quantize_input', value: SVDFOpt.asymmetricQuantizeInputs() });
    }

    static getRNNAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let RNNOpt = new RNNOptions();
        RNNOpt = operator.builtinOptions<flatbuffers.Table>(RNNOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[RNNOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'asymmetric_quantize_input', value: RNNOpt.asymmetricQuantizeInputs() });
    }

    static getFullyConnectedAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let fullyConnectedOpt = new FullyConnectedOptions();
        fullyConnectedOpt = operator.builtinOptions<flatbuffers.Table>(fullyConnectedOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[fullyConnectedOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'fully_connected_options_weights_format', value: FullyConnectedOptionsWeightsFormat[fullyConnectedOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'keep_num_dims', value: fullyConnectedOpt.keepNumDims() });
        attributes.push({ attribute: 'asymmetric_quantize_inputs', value: fullyConnectedOpt.asymmetricQuantizeInputs() });
    }

    static getSoftMaxAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let softMaxOpt = new SoftmaxOptions();
        softMaxOpt = operator.builtinOptions<flatbuffers.Table>(softMaxOpt);

        attributes.push({ attribute: 'beta', value: softMaxOpt.beta() });
    }

    static getConcatenationAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let concatenationOpt = new ConcatenationOptions();
        concatenationOpt = operator.builtinOptions<flatbuffers.Table>(concatenationOpt);

        attributes.push({ attribute: 'axis', value: concatenationOpt.axis() });
        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[concatenationOpt.fusedActivationFunction()] });
    }

    static getAddAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let addOpt = new AddOptions();
        addOpt = operator.builtinOptions<flatbuffers.Table>(addOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[addOpt.fusedActivationFunction()] });
    }

    static getL2NormAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let L2NormOpt = new L2NormOptions();
        L2NormOpt = operator.builtinOptions<flatbuffers.Table>(L2NormOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[L2NormOpt.fusedActivationFunction()] });
    }

    static getLocalResponseNormalizationAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let localResponseNomalizationOpt = new LocalResponseNormalizationOptions();
        localResponseNomalizationOpt = operator.builtinOptions<flatbuffers.Table>(localResponseNomalizationOpt);

        attributes.push({ attribute: 'radius', value: localResponseNomalizationOpt.radius() });
        attributes.push({ attribute: 'bias', value: localResponseNomalizationOpt.bias() });
        attributes.push({ attribute: 'alpha', value: localResponseNomalizationOpt.alpha() });
        attributes.push({ attribute: 'beta', value: localResponseNomalizationOpt.beta() });
    }

    static getLSTMAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let LSTMOpt = new LSTMOptions();
        LSTMOpt = operator.builtinOptions<flatbuffers.Table>(LSTMOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[LSTMOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'cell_clip', value: LSTMOpt.cellClip() });
        attributes.push({ attribute: 'proj_clip', value: LSTMOpt.projClip() });
        attributes.push({ attribute: 'kernel_type', value: LSTMKernelType[LSTMOpt.projClip()] });
        attributes.push({ attribute: 'asymmetric_quantize_inputs', value: LSTMOpt.asymmetricQuantizeInputs() });
    }

    static getResizeBilinearAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let resizeBilinearOpt = new ResizeBilinearOptions();
        resizeBilinearOpt = operator.builtinOptions<flatbuffers.Table>(resizeBilinearOpt);
        
        attributes.push({ attribute: 'align_corners', value: resizeBilinearOpt.alignCorners() });
        attributes.push({ attribute: 'half_pixel_centers', value: resizeBilinearOpt.halfPixelCenters() });
    }

    static getCallAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let callOpt = new CallOptions();
        callOpt = operator.builtinOptions<flatbuffers.Table>(callOpt);

        attributes.push({ attribute: 'subgraph', value: callOpt.subgraph() });
    }

    static getReshapeAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let reshapeOpt = new ReshapeOptions();
        reshapeOpt = operator.builtinOptions<flatbuffers.Table>(reshapeOpt);

        let newShapeLength = reshapeOpt.newShapeLength();
        attributes.push({ attribute: 'new_shape_length', value: newShapeLength });

        for (let i = 0; i < newShapeLength; i++) {
            attributes.push({ attribute: 'new_shape_' + i, value: reshapeOpt.newShape(i) });
        }

        attributes.push({ attribute: 'new_shape_array', value: reshapeOpt.newShapeArray() })
    }

    static getSkipGramAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let skipGramOpt = new SkipGramOptions();
        skipGramOpt = operator.builtinOptions<flatbuffers.Table>(skipGramOpt);

        attributes.push({ attribute: 'ngram_size', value: skipGramOpt.ngramSize() });
        attributes.push({ attribute: 'max_skip_size', value: skipGramOpt.maxSkipSize() });
        attributes.push({ attribute: 'include_all_ngrams', value: skipGramOpt.includeAllNgrams() });
    }
    
    static getSpaceToDepth(operator: Operator, attributes: Array<NodeAttributes>) {
        let spaceToDepthOpt = new SpaceToDepthOptions();
        spaceToDepthOpt = operator.builtinOptions<flatbuffers.Table>(spaceToDepthOpt);

        attributes.push({ attribute: 'block_size', value: spaceToDepthOpt.blockSize() });
    }

    static getReducerAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let reducerOpt = new ReducerOptions();
        reducerOpt = operator.builtinOptions<flatbuffers.Table>(reducerOpt);

        attributes.push({ attribute: 'keep_dims', value: reducerOpt.keepDims() });
    }

    static getSubAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let subOpt = new SubOptions();
        subOpt = operator.builtinOptions<flatbuffers.Table>(subOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[subOpt.fusedActivationFunction()] });
    }

    static getDivAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let divOpt = new DivOptions();
        divOpt = operator.builtinOptions<flatbuffers.Table>(divOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[divOpt.fusedActivationFunction()] });
    }

    static getSqueezeAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let squeezeOpt = new SqueezeOptions();
        squeezeOpt = operator.builtinOptions<flatbuffers.Table>(squeezeOpt);

        let squeezeDimsLength = squeezeOpt.squeezeDimsLength();
        attributes.push({ attribute: 'squeeze_dims_length', value: squeezeDimsLength });

        for (let i = 0; i < squeezeDimsLength; i++) {
            attributes.push({ attribute: 'squeeze_dims_' + i, value: squeezeOpt.squeezeDims(i) });
        }

        attributes.push({ attribute: 'squeeze_dims_array', value: squeezeOpt.squeezeDimsArray() })
    }

    static getSequenceRNNAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let sequenceRNNOpt = new SequenceRNNOptions();
        sequenceRNNOpt = operator.builtinOptions<flatbuffers.Table>(sequenceRNNOpt);

        attributes.push({ attribute: 'time_major', value: sequenceRNNOpt.timeMajor() });
        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[sequenceRNNOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'asymmetric_quantize_inputs', value: sequenceRNNOpt.asymmetricQuantizeInputs() });
    }

    static getStridedSliceAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let strideSliceOpt = new StridedSliceOptions();
        strideSliceOpt = operator.builtinOptions<flatbuffers.Table>(strideSliceOpt);

        attributes.push({ attribute: 'begin_mask', value: strideSliceOpt.beginMask() });
        attributes.push({ attribute: 'end_mask', value: strideSliceOpt.endMask() });
        attributes.push({ attribute: 'ellipsis_mask', value: strideSliceOpt.ellipsisMask() });
        attributes.push({ attribute: 'new_axis_mask', value: strideSliceOpt.newAxisMask() });
        attributes.push({ attribute: 'shrink_axis_mask', value: strideSliceOpt.shrinkAxisMask() });
    }

    static getSplitAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let splitOptions = new SplitOptions();
        splitOptions = operator.builtinOptions<flatbuffers.Table>(splitOptions);

        attributes.push({ attribute: 'num_splits', value: splitOptions.numSplits() });
    }

    static getCastAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let castOpt = new CastOptions();
        castOpt = operator.builtinOptions<flatbuffers.Table>(castOpt);

        attributes.push({ attribute: 'in_data_type', value: TensorType[castOpt.inDataType()] });
        attributes.push({ attribute: 'out_data_type', value: TensorType[castOpt.outDataType()] });
    }

    static getArgMaxAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let argMaxOpt = new ArgMaxOptions();
        argMaxOpt = operator.builtinOptions<flatbuffers.Table>(argMaxOpt);

        attributes.push({ attribute: 'output_type', value: TensorType[argMaxOpt.outputType()] });
    }

    static getTransposeConvAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let transposeConvOpt = new TransposeConvOptions();
        transposeConvOpt = operator.builtinOptions<flatbuffers.Table>(transposeConvOpt);

        attributes.push({ attribute: 'padding', value: Padding[transposeConvOpt.padding()] });
        attributes.push({ attribute: 'stride_h', value: transposeConvOpt.strideH() });
        attributes.push({ attribute: 'stride_w', value: transposeConvOpt.strideW() });
    }

    static getSparseToDenseAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let sparseToDenseOpt = new SparseToDenseOptions();
        sparseToDenseOpt = operator.builtinOptions<flatbuffers.Table>(sparseToDenseOpt);

        attributes.push({ attribute: 'validate_indices', value: sparseToDenseOpt.validateIndices() });
    }

    static getShapeAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let shapeOpt = new ShapeOptions();
        shapeOpt = operator.builtinOptions<flatbuffers.Table>(shapeOpt);

        attributes.push({ attribute: 'out_type', value: TensorType[shapeOpt.outType()] });
    }

    static getArgMinAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let argMinOpt = new ArgMinOptions();
        argMinOpt = operator.builtinOptions<flatbuffers.Table>(argMinOpt);

        attributes.push({ attribute: 'output_type', value: TensorType[argMinOpt.outputType()] });
    }

    static getFakeQuantAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let fakeQuanOpt = new FakeQuantOptions();
        fakeQuanOpt = operator.builtinOptions<flatbuffers.Table>(fakeQuanOpt);

        attributes.push({ attribute: 'min', value: fakeQuanOpt.min() });
        attributes.push({ attribute: 'max', value: fakeQuanOpt.max() });
        attributes.push({ attribute: 'num_bits', value: fakeQuanOpt.numBits() });
        attributes.push({ attribute: 'narrow_range', value: fakeQuanOpt.narrowRange() });
    }

    static getPackAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let packOpt = new PackOptions();
        packOpt = operator.builtinOptions<flatbuffers.Table>(packOpt);

        attributes.push({ attribute: 'values_count', value: packOpt.valuesCount() });
        attributes.push({ attribute: 'axis', value: packOpt.axis() });
    }

    static getOneHotAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let oneHotOpt = new OneHotOptions();
        oneHotOpt = operator.builtinOptions<flatbuffers.Table>(oneHotOpt);

        attributes.push({ attribute: 'axis', value: oneHotOpt.axis() });
    }

    static getUnpackAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let unpackOpt = new UnpackOptions();
        unpackOpt = operator.builtinOptions<flatbuffers.Table>(unpackOpt);

        attributes.push({ attribute: 'num', value: unpackOpt.num() });
        attributes.push({ attribute: 'axis', value: unpackOpt.axis() });
    }

    static getBidirectionalSequenceLSTMAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let bidirectionalSequenceLSTMOpt = new BidirectionalSequenceLSTMOptions();
        bidirectionalSequenceLSTMOpt = operator.builtinOptions<flatbuffers.Table>(bidirectionalSequenceLSTMOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[bidirectionalSequenceLSTMOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'cell_clip', value: bidirectionalSequenceLSTMOpt.cellClip() });
        attributes.push({ attribute: 'proj_clip', value: bidirectionalSequenceLSTMOpt.projClip() });
        attributes.push({ attribute: 'merge_outputs', value: bidirectionalSequenceLSTMOpt.mergeOutputs() });
        attributes.push({ attribute: 'time_major', value: bidirectionalSequenceLSTMOpt.timeMajor() });
        attributes.push({ attribute: 'asymmetric_quantize_inputs', value: bidirectionalSequenceLSTMOpt.asymmetricQuantizeInputs() });
    }

    static getBidirectionalSequenceRNNAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let bidirectionalSequenceRNNOpt = new BidirectionalSequenceRNNOptions();
        bidirectionalSequenceRNNOpt = operator.builtinOptions<flatbuffers.Table>(bidirectionalSequenceRNNOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[bidirectionalSequenceRNNOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'merge_outputs', value: bidirectionalSequenceRNNOpt.mergeOutputs() });
        attributes.push({ attribute: 'time_major', value: bidirectionalSequenceRNNOpt.timeMajor() });
        attributes.push({ attribute: 'asymmetric_quantize_inputs', value: bidirectionalSequenceRNNOpt.asymmetricQuantizeInputs() });
    }

    static getUnidirectionalSequenceLSTMAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let unidirectionalSequenceLSTMOpt = new UnidirectionalSequenceLSTMOptions();
        unidirectionalSequenceLSTMOpt = operator.builtinOptions<flatbuffers.Table>(unidirectionalSequenceLSTMOpt);

        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[unidirectionalSequenceLSTMOpt.fusedActivationFunction()] });
        attributes.push({ attribute: 'cell_clip', value: unidirectionalSequenceLSTMOpt.cellClip() });
        attributes.push({ attribute: 'proj_clip', value: unidirectionalSequenceLSTMOpt.projClip() });
        attributes.push({ attribute: 'time_major', value: unidirectionalSequenceLSTMOpt.timeMajor() });
        attributes.push({ attribute: 'asymmetric_quantize_inputs', value: unidirectionalSequenceLSTMOpt.asymmetricQuantizeInputs() });
    }

    static getResizeNearestNeighborAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let resizeNearesNeighborOpt = new ResizeNearestNeighborOptions();
        resizeNearesNeighborOpt = operator.builtinOptions<flatbuffers.Table>(resizeNearesNeighborOpt);

        attributes.push({ attribute: 'align_corners', value: resizeNearesNeighborOpt.alignCorners() });
    }

    static getLeakyReluAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let leakyReluOpt = new LeakyReluOptions();
        leakyReluOpt = operator.builtinOptions<flatbuffers.Table>(leakyReluOpt);

        attributes.push({ attribute: 'alpha', value: leakyReluOpt.alpha() });
    }

    static getMirrorPadAttr(operator: Operator, attributes: Array<NodeAttributes>) {
        let mirrorPadOpt = new MirrorPadOptions();
        mirrorPadOpt = operator.builtinOptions<flatbuffers.Table>(mirrorPadOpt);

        attributes.push({ attribute: 'mode', value: MirrorPadMode[mirrorPadOpt.mode()] });
    }

    static getUniqueAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let uniqueOpt = new UniqueOptions();
        uniqueOpt = operator.builtinOptions<flatbuffers.Table>(uniqueOpt);

        attributes.push({ attribute: 'idx_out_type', value: uniqueOpt.idxOutType() });
    }
    
    static getReverseSequenceAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let reverseSequenceOpt = new ReverseSequenceOptions();
        reverseSequenceOpt = operator.builtinOptions<flatbuffers.Table>(reverseSequenceOpt);

        attributes.push({ attribute: 'seq_dim', value: reverseSequenceOpt.seqDim() });
        attributes.push({ attribute: 'batch_bim', value: reverseSequenceOpt.batchDim() });
    }

    static getIFAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let ifOpt = new IfOptions();
        ifOpt = operator.builtinOptions<flatbuffers.Table>(ifOpt);

        attributes.push({ attribute: 'then_subgraph_index', value: ifOpt.thenSubgraphIndex() });
        attributes.push({ attribute: 'else_subgraph_index', value: ifOpt.elseSubgraphIndex() });
    }

    static getWhileAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let whileOpt = new WhileOptions();
        whileOpt = operator.builtinOptions<flatbuffers.Table>(whileOpt);

        attributes.push({ attribute: 'cond_subgraph_index', value: whileOpt.condSubgraphIndex() });
        attributes.push({ attribute: 'body_subgraph_index', value: whileOpt.bodySubgraphIndex() });
    }

    static getDepthToSpaceAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let depthToSpaceOpt = new DepthToSpaceOptions();
        depthToSpaceOpt = operator.builtinOptions<flatbuffers.Table>(depthToSpaceOpt);

        attributes.push({ attribute: 'block_size', value: depthToSpaceOpt.blockSize() });
    }

    static getBatchMatMulAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let batchMatMulOpt = new BatchMatMulOptions();
        batchMatMulOpt = operator.builtinOptions<flatbuffers.Table>(batchMatMulOpt);

        attributes.push({ attribute: 'adjoint_lhs', value: batchMatMulOpt.adjointLhs() });
        attributes.push({ attribute: 'adjoint_rhs', value: batchMatMulOpt.adjointRhs() });
    }

    static getBCQGatherAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let BCQGatherOpt = new BCQGatherOptions();
        BCQGatherOpt = operator.builtinOptions<flatbuffers.Table>(BCQGatherOpt);

        attributes.push({ attribute: 'input_hidden_size', value: BCQGatherOpt.inputHiddenSize() });
        attributes.push({ attribute: 'axis', value: BCQGatherOpt.axis() });
    }

    static getBCQFullyConnectedAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let BCQFullyConnectedOpt = new BCQFullyConnectedOptions();
        BCQFullyConnectedOpt = operator.builtinOptions<flatbuffers.Table>(BCQFullyConnectedOpt);

        attributes.push({ attribute: 'weights_hidden_size', value: BCQFullyConnectedOpt.weightsHiddenSize() });
        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[BCQFullyConnectedOpt.fusedActivationFunction()] });
    }

    static getInstanceNormAttr(operator: Operator , attributes: Array<NodeAttributes>) {
        let instanceNormOpt = new InstanceNormOptions();
        instanceNormOpt = operator.builtinOptions<flatbuffers.Table>(instanceNormOpt);

        attributes.push({ attribute: 'epsilon', value: instanceNormOpt.epsilon() });
        attributes.push({ attribute: 'fused_activation_function', value: ActivationFunctionType[instanceNormOpt.fusedActivationFunction()] });
    }
}