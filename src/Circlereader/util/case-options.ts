import { OptionsAttribute } from './options-attribute'
import { Operator } from '../circle-analysis/circle/operator';
import { NodeAttributes } from '../type/types';

export function caseOptions(opt_name: string, operator: Operator, model_attribute: Array<NodeAttributes>) {
    switch (opt_name) {
        case 'AddOptions':
            OptionsAttribute.getAddAttr(operator, model_attribute);
            break;
        case 'ArgMaxOptions':
            OptionsAttribute.getArgMaxAttr(operator, model_attribute);
            break;
        case 'ArgMinOptions':
            OptionsAttribute.getArgMinAttr(operator, model_attribute);
            break;
        case 'BCQFullyConnectedOptions':
            OptionsAttribute.getBCQFullyConnectedAttr(operator, model_attribute);
            break;
        case 'BCQGatherOptions':
            OptionsAttribute.getBCQGatherAttr(operator, model_attribute);
            break;
        case 'BatchMatMulOptions':
            OptionsAttribute.getBatchMatMulAttr(operator, model_attribute);
            break;
        case 'BidirectionalSequenceLSTMOptions':
            OptionsAttribute.getBidirectionalSequenceLSTMAttr(operator, model_attribute);
            break;
        case 'BidirectionalSequenceRNNOptions':
            OptionsAttribute.getBidirectionalSequenceRNNAttr(operator, model_attribute);
            break;
        case 'CallOptions':
            OptionsAttribute.getCallAttr(operator, model_attribute);
            break;
        case 'CastOptions':
            OptionsAttribute.getCastAttr(operator, model_attribute);
            break;
        case 'ConcatenationOptions':
            OptionsAttribute.getConcatenationAttr(operator, model_attribute);
            break;
        case 'Conv2DOptions':
            OptionsAttribute.getConv2DAttr(operator, model_attribute);
            break;
        case 'DepthToSpaceOptions':
            OptionsAttribute.getDepthToSpaceAttr(operator, model_attribute);
            break;
        case 'DepthwiseConv2DOptions':
            OptionsAttribute.getDepthWiseConv2DAttr(operator, model_attribute);
            break;
        case 'DivOptions':
            OptionsAttribute.getDivAttr(operator, model_attribute);
            break;
        case 'FakeQuantOptions':
            OptionsAttribute.getFakeQuantAttr(operator, model_attribute);
            break;
        case 'FullyConnectedOptions':
            OptionsAttribute.getFullyConnectedAttr(operator, model_attribute);
            break;
        case 'IfOptions':
            OptionsAttribute.getIFAttr(operator, model_attribute);
            break;
        case 'InstanceNormOptions':
            OptionsAttribute.getInstanceNormAttr(operator, model_attribute);
            break;
        case 'L2NormOptions':
            OptionsAttribute.getL2NormAttr(operator, model_attribute);
            break;
        case 'LSHProjectionOptions':
            OptionsAttribute.getLSHProjectionAttr(operator, model_attribute);
            break;
        case 'LSTMOptions':
            OptionsAttribute.getLSTMAttr(operator, model_attribute);
            break;
        case 'LeakyReluOptions':
            OptionsAttribute.getLeakyReluAttr(operator, model_attribute);
            break;
        case 'LocalResponseNormalizationOptions':
            OptionsAttribute.getLocalResponseNormalizationAttr(operator, model_attribute);
            break;
        case 'MirrorPadOptions':
            OptionsAttribute.getMirrorPadAttr(operator, model_attribute);
            break;
        case 'OneHotOptions':
            OptionsAttribute.getOneHotAttr(operator, model_attribute);
            break;
        case 'PackOptions':
            OptionsAttribute.getPackAttr(operator, model_attribute);
            break;
        case 'Pool2DOptions':
            OptionsAttribute.getPool2DAttr(operator, model_attribute);
            break;
        case 'RNNOptions':
            OptionsAttribute.getRNNAttr(operator, model_attribute);
            break;
        case 'ReducerOptions':
            OptionsAttribute.getReducerAttr(operator, model_attribute);
            break;
        case 'ReshapeOptions':
            OptionsAttribute.getReshapeAttr(operator, model_attribute);
            break;
        case 'ResizeBilinearOptions':
            OptionsAttribute.getResizeBilinearAttr(operator, model_attribute);
            break;
        case 'ResizeNearestNeighborOptions':
            OptionsAttribute.getResizeNearestNeighborAttr(operator, model_attribute);
            break;
        case 'ReverseSequenceOptions':
            OptionsAttribute.getReverseSequenceAttr(operator, model_attribute);
            break;
        case 'SVDFOptions':
            OptionsAttribute.getSVDFAttr(operator, model_attribute);
            break;
        case 'SequenceRNNOptions':
            OptionsAttribute.getSequenceRNNAttr(operator, model_attribute);
            break;
        case 'ShapeOptions':
            OptionsAttribute.getShapeAttr(operator, model_attribute);
            break;
        case 'SkipGramOptions':
            OptionsAttribute.getSkipGramAttr(operator, model_attribute);
            break;
        case 'SoftmaxOptions':
            OptionsAttribute.getSoftMaxAttr(operator, model_attribute);
            break;
        case 'SpaceToDepthOptions':
            OptionsAttribute.getSpaceToDepth(operator, model_attribute);
            break;
        case 'SparseToDenseOptions':
            OptionsAttribute.getSparseToDenseAttr(operator, model_attribute);
            break;
        case 'SplitOptions':
            OptionsAttribute.getSplitAttr(operator, model_attribute);
            break;
        case 'SqueezeOptions':
            OptionsAttribute.getSqueezeAttr(operator, model_attribute);
            break;
        case 'StridedSliceOptions':
            OptionsAttribute.getStridedSliceAttr(operator, model_attribute);
            break;
        case 'SubOptions':
            OptionsAttribute.getSubAttr(operator, model_attribute);
            break;
        case 'TransposeConvOptions':
            OptionsAttribute.getTransposeConvAttr(operator, model_attribute);
            break;
        case 'UnidirectionalSequenceLSTMOptions':
            OptionsAttribute.getUnidirectionalSequenceLSTMAttr(operator, model_attribute);
            break;
        case 'UniqueOptions':
            OptionsAttribute.getUniqueAttr(operator, model_attribute);
            break;
        case 'UnpackOptions':
            OptionsAttribute.getUnpackAttr(operator, model_attribute);
            break;
        case 'WhileOptions':
            OptionsAttribute.getWhileAttr(operator, model_attribute);
            break;
    }
}