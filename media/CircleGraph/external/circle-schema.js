var cir_root = flatbuffers.get('circle');

cir_root.circle = cir_root.circle || {};

cir_root.circle.TensorType = {
    FLOAT32: 0,
    FLOAT16: 1,
    INT32: 2,
    UINT8: 3,
    INT64: 4,
    STRING: 5,
    BOOL: 6,
    INT16: 7,
    COMPLEX64: 8,
    INT8: 9,
    FLOAT64: 10,
    COMPLEX128: 11,
    UINT64: 12,
    RESOURCE: 13,
    VARIANT: 14,
    UINT32: 15,
    UINT16: 16,
    INT4: 17
};

cir_root.circle.CustomQuantization = class CustomQuantization {

    static decode(reader, position) {
        const $ = new cir_root.circle.CustomQuantization();
        $.custom = reader.typedArray(position, 4, Uint8Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.CustomQuantization();
        $.custom = reader.typedArray(json.custom, Uint8Array);
        return $;
    }
};

cir_root.circle.QuantizationDetails = class {

    static decode(reader, position, type) {
        switch (type) {
            case 1: return cir_root.circle.CustomQuantization.decode(reader, position);
            default: return undefined;
        }
    }

    static decodeText(reader, json, type) {
        switch (type) {
            case 'CustomQuantization': return cir_root.circle.CustomQuantization.decodeText(reader, json);
            default: return undefined;
        }
    }
};

cir_root.circle.QuantizationParameters = class QuantizationParameters {

    static decode(reader, position) {
        const $ = new cir_root.circle.QuantizationParameters();
        $.min = reader.typedArray(position, 4, Float32Array);
        $.max = reader.typedArray(position, 6, Float32Array);
        $.scale = reader.typedArray(position, 8, Float32Array);
        $.zero_point = reader.int64s_(position, 10);
        $.details = reader.union(position, 12, cir_root.circle.QuantizationDetails.decode);
        $.quantized_dimension = reader.int32_(position, 16, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.QuantizationParameters();
        $.min = reader.typedArray(json.min, Float32Array);
        $.max = reader.typedArray(json.max, Float32Array);
        $.scale = reader.typedArray(json.scale, Float32Array);
        $.zero_point = reader.array(json.zero_point);
        $.details = cir_root.circle.QuantizationDetails.decodeText(reader, json.details, json.details_type);
        $.quantized_dimension = reader.value(json.quantized_dimension, 0);
        return $;
    }
};

cir_root.circle.DimensionType = {
    DENSE: 0,
    SPARSE_CSR: 1
};

cir_root.circle.Int32Vector = class Int32Vector {

    static decode(reader, position) {
        const $ = new cir_root.circle.Int32Vector();
        $.values = reader.typedArray(position, 4, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Int32Vector();
        $.values = reader.typedArray(json.values, Int32Array);
        return $;
    }
};

cir_root.circle.Uint16Vector = class Uint16Vector {

    static decode(reader, position) {
        const $ = new cir_root.circle.Uint16Vector();
        $.values = reader.typedArray(position, 4, Uint16Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Uint16Vector();
        $.values = reader.typedArray(json.values, Uint16Array);
        return $;
    }
};

cir_root.circle.Uint8Vector = class Uint8Vector {

    static decode(reader, position) {
        const $ = new cir_root.circle.Uint8Vector();
        $.values = reader.typedArray(position, 4, Uint8Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Uint8Vector();
        $.values = reader.typedArray(json.values, Uint8Array);
        return $;
    }
};

cir_root.circle.SparseIndexVector = class {

    static decode(reader, position, type) {
        switch (type) {
            case 1: return cir_root.circle.Int32Vector.decode(reader, position);
            case 2: return cir_root.circle.Uint16Vector.decode(reader, position);
            case 3: return cir_root.circle.Uint8Vector.decode(reader, position);
            default: return undefined;
        }
    }

    static decodeText(reader, json, type) {
        switch (type) {
            case 'Int32Vector': return cir_root.circle.Int32Vector.decodeText(reader, json);
            case 'Uint16Vector': return cir_root.circle.Uint16Vector.decodeText(reader, json);
            case 'Uint8Vector': return cir_root.circle.Uint8Vector.decodeText(reader, json);
            default: return undefined;
        }
    }
};

cir_root.circle.DimensionMetadata = class DimensionMetadata {

    static decode(reader, position) {
        const $ = new cir_root.circle.DimensionMetadata();
        $.format = reader.int8_(position, 4, 0);
        $.dense_size = reader.int32_(position, 6, 0);
        $.array_segments = reader.union(position, 8, cir_root.circle.SparseIndexVector.decode);
        $.array_indices = reader.union(position, 12, cir_root.circle.SparseIndexVector.decode);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.DimensionMetadata();
        $.format = cir_root.circle.DimensionType[json.format];
        $.dense_size = reader.value(json.dense_size, 0);
        $.array_segments = cir_root.circle.SparseIndexVector.decodeText(reader, json.array_segments, json.array_segments_type);
        $.array_indices = cir_root.circle.SparseIndexVector.decodeText(reader, json.array_indices, json.array_indices_type);
        return $;
    }
};

cir_root.circle.SparsityParameters = class SparsityParameters {

    static decode(reader, position) {
        const $ = new cir_root.circle.SparsityParameters();
        $.traversal_order = reader.typedArray(position, 4, Int32Array);
        $.block_map = reader.typedArray(position, 6, Int32Array);
        $.dim_metadata = reader.tableArray(position, 8, cir_root.circle.DimensionMetadata.decode);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SparsityParameters();
        $.traversal_order = reader.typedArray(json.traversal_order, Int32Array);
        $.block_map = reader.typedArray(json.block_map, Int32Array);
        $.dim_metadata = reader.objectArray(json.dim_metadata, cir_root.circle.DimensionMetadata.decodeText);
        return $;
    }
};

cir_root.circle.VariantSubType = class VariantSubType {

    static decode(reader, position) {
        const $ = new cir_root.circle.VariantSubType();
        $.shape = reader.typedArray(position, 4, Int32Array);
        $.type = reader.int8_(position, 6, 0);
        $.has_rank = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.VariantSubType();
        $.shape = reader.typedArray(json.shape, Int32Array);
        $.type = cir_root.circle.TensorType[json.type];
        $.has_rank = reader.value(json.has_rank, false);
        return $;
    }
};

cir_root.circle.Tensor = class Tensor {

    static decode(reader, position) {
        const $ = new cir_root.circle.Tensor();
        $.shape = reader.typedArray(position, 4, Int32Array);
        $.type = reader.int8_(position, 6, 0);
        $.buffer = reader.uint32_(position, 8, 0);
        $.name = reader.string_(position, 10, null);
        $.quantization = reader.table(position, 12, cir_root.circle.QuantizationParameters.decode);
        $.is_variable = reader.bool_(position, 14, false);
        $.sparsity = reader.table(position, 16, cir_root.circle.SparsityParameters.decode);
        $.shape_signature = reader.typedArray(position, 18, Int32Array);
        $.has_rank = reader.bool_(position, 20, false);
        $.variant_tensors = reader.tableArray(position, 22, cir_root.circle.VariantSubType.decode);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Tensor();
        $.shape = reader.typedArray(json.shape, Int32Array);
        $.type = cir_root.circle.TensorType[json.type];
        $.buffer = reader.value(json.buffer, 0);
        $.name = reader.value(json.name, null);
        $.quantization = reader.object(json.quantization, cir_root.circle.QuantizationParameters.decodeText);
        $.is_variable = reader.value(json.is_variable, false);
        $.sparsity = reader.object(json.sparsity, cir_root.circle.SparsityParameters.decodeText);
        $.shape_signature = reader.typedArray(json.shape_signature, Int32Array);
        $.has_rank = reader.value(json.has_rank, false);
        $.variant_tensors = reader.objectArray(json.variant_tensors, cir_root.circle.VariantSubType.decodeText);
        return $;
    }
};

cir_root.circle.BuiltinOperator = {
    BCQ_GATHER: -4,
    BCQ_FULLY_CONNECTED: -3,
    INSTANCE_NORM: -2,
    ADD: 0,
    AVERAGE_POOL_2D: 1,
    CONCATENATION: 2,
    CONV_2D: 3,
    DEPTHWISE_CONV_2D: 4,
    DEPTH_TO_SPACE: 5,
    DEQUANTIZE: 6,
    EMBEDDING_LOOKUP: 7,
    FLOOR: 8,
    FULLY_CONNECTED: 9,
    HASHTABLE_LOOKUP: 10,
    L2_NORMALIZATION: 11,
    L2_POOL_2D: 12,
    LOCAL_RESPONSE_NORMALIZATION: 13,
    LOGISTIC: 14,
    LSH_PROJECTION: 15,
    LSTM: 16,
    MAX_POOL_2D: 17,
    MUL: 18,
    RELU: 19,
    RELU_N1_TO_1: 20,
    RELU6: 21,
    RESHAPE: 22,
    RESIZE_BILINEAR: 23,
    RNN: 24,
    SOFTMAX: 25,
    SPACE_TO_DEPTH: 26,
    SVDF: 27,
    TANH: 28,
    CONCAT_EMBEDDINGS: 29,
    SKIP_GRAM: 30,
    CALL: 31,
    CUSTOM: 32,
    EMBEDDING_LOOKUP_SPARSE: 33,
    PAD: 34,
    UNIDIRECTIONAL_SEQUENCE_RNN: 35,
    GATHER: 36,
    BATCH_TO_SPACE_ND: 37,
    SPACE_TO_BATCH_ND: 38,
    TRANSPOSE: 39,
    MEAN: 40,
    SUB: 41,
    DIV: 42,
    SQUEEZE: 43,
    UNIDIRECTIONAL_SEQUENCE_LSTM: 44,
    STRIDED_SLICE: 45,
    BIDIRECTIONAL_SEQUENCE_RNN: 46,
    EXP: 47,
    TOPK_V2: 48,
    SPLIT: 49,
    LOG_SOFTMAX: 50,
    DELEGATE: 51,
    BIDIRECTIONAL_SEQUENCE_LSTM: 52,
    CAST: 53,
    PRELU: 54,
    MAXIMUM: 55,
    ARG_MAX: 56,
    MINIMUM: 57,
    LESS: 58,
    NEG: 59,
    PADV2: 60,
    GREATER: 61,
    GREATER_EQUAL: 62,
    LESS_EQUAL: 63,
    SELECT: 64,
    SLICE: 65,
    SIN: 66,
    TRANSPOSE_CONV: 67,
    SPARSE_TO_DENSE: 68,
    TILE: 69,
    EXPAND_DIMS: 70,
    EQUAL: 71,
    NOT_EQUAL: 72,
    LOG: 73,
    SUM: 74,
    SQRT: 75,
    RSQRT: 76,
    SHAPE: 77,
    POW: 78,
    ARG_MIN: 79,
    FAKE_QUANT: 80,
    REDUCE_PROD: 81,
    REDUCE_MAX: 82,
    PACK: 83,
    LOGICAL_OR: 84,
    ONE_HOT: 85,
    LOGICAL_AND: 86,
    LOGICAL_NOT: 87,
    UNPACK: 88,
    REDUCE_MIN: 89,
    FLOOR_DIV: 90,
    REDUCE_ANY: 91,
    SQUARE: 92,
    ZEROS_LIKE: 93,
    FILL: 94,
    FLOOR_MOD: 95,
    RANGE: 96,
    RESIZE_NEAREST_NEIGHBOR: 97,
    LEAKY_RELU: 98,
    SQUARED_DIFFERENCE: 99,
    MIRROR_PAD: 100,
    ABS: 101,
    SPLIT_V: 102,
    UNIQUE: 103,
    CEIL: 104,
    REVERSE_V2: 105,
    ADD_N: 106,
    GATHER_ND: 107,
    COS: 108,
    WHERE: 109,
    RANK: 110,
    ELU: 111,
    REVERSE_SEQUENCE: 112,
    MATRIX_DIAG: 113,
    QUANTIZE: 114,
    MATRIX_SET_DIAG: 115,
    ROUND: 116,
    HARD_SWISH: 117,
    IF: 118,
    WHILE: 119,
    NON_MAX_SUPPRESSION_V4: 120,
    NON_MAX_SUPPRESSION_V5: 121,
    SCATTER_ND: 122,
    SELECT_V2: 123,
    DENSIFY: 124,
    SEGMENT_SUM: 125,
    BATCH_MATMUL: 126,
    PLACEHOLDER_FOR_GREATER_OP_CODES: 127,
    CUMSUM: 128,
    CALL_ONCE: 129,
    BROADCAST_TO: 130,
    RFFT2D: 131,
    CONV_3D: 132,
    IMAG: 133,
    REAL: 134,
    COMPLEX_ABS: 135,
    HASHTABLE: 136,
    HASHTABLE_FIND: 137,
    HASHTABLE_IMPORT: 138,
    HASHTABLE_SIZE: 139,
    REDUCE_ALL: 140,
    CONV_3D_TRANSPOSE: 141,
    VAR_HANDLE: 142,
    READ_VARIABLE: 143,
    ASSIGN_VARIABLE: 144,
    BROADCAST_ARGS: 145,
    RANDOM_STANDARD_NORMAL: 146,
    BUCKETIZE: 147,
    RANDOM_UNIFORM: 148,
    MULTINOMIAL: 149,
    GELU: 150,
    DYNAMIC_UPDATE_SLICE: 151,
    RELU_0_TO_1: 152,
    UNSORTED_SEGMENT_PROD: 153,
    UNSORTED_SEGMENT_MAX: 154,
    UNSORTED_SEGMENT_SUM: 155,
    ATAN2: 156,
    UNSORTED_SEGMENT_MIN: 157,
    SIGN: 158,
    BITCAST: 159,
    BITWISE_XOR: 160,
    RIGHT_SHIFT: 161
};

cir_root.circle.BuiltinOptions = class {

    static decode(reader, position, type) {
        switch (type) {
            case 1: return cir_root.circle.Conv2DOptions.decode(reader, position);
            case 2: return cir_root.circle.DepthwiseConv2DOptions.decode(reader, position);
            case 3: return cir_root.circle.ConcatEmbeddingsOptions.decode(reader, position);
            case 4: return cir_root.circle.LSHProjectionOptions.decode(reader, position);
            case 5: return cir_root.circle.Pool2DOptions.decode(reader, position);
            case 6: return cir_root.circle.SVDFOptions.decode(reader, position);
            case 7: return cir_root.circle.RNNOptions.decode(reader, position);
            case 8: return cir_root.circle.FullyConnectedOptions.decode(reader, position);
            case 9: return cir_root.circle.SoftmaxOptions.decode(reader, position);
            case 10: return cir_root.circle.ConcatenationOptions.decode(reader, position);
            case 11: return cir_root.circle.AddOptions.decode(reader, position);
            case 12: return cir_root.circle.L2NormOptions.decode(reader, position);
            case 13: return cir_root.circle.LocalResponseNormalizationOptions.decode(reader, position);
            case 14: return cir_root.circle.LSTMOptions.decode(reader, position);
            case 15: return cir_root.circle.ResizeBilinearOptions.decode(reader, position);
            case 16: return cir_root.circle.CallOptions.decode(reader, position);
            case 17: return cir_root.circle.ReshapeOptions.decode(reader, position);
            case 18: return cir_root.circle.SkipGramOptions.decode(reader, position);
            case 19: return cir_root.circle.SpaceToDepthOptions.decode(reader, position);
            case 20: return cir_root.circle.EmbeddingLookupSparseOptions.decode(reader, position);
            case 21: return cir_root.circle.MulOptions.decode(reader, position);
            case 22: return cir_root.circle.PadOptions.decode(reader, position);
            case 23: return cir_root.circle.GatherOptions.decode(reader, position);
            case 24: return cir_root.circle.BatchToSpaceNDOptions.decode(reader, position);
            case 25: return cir_root.circle.SpaceToBatchNDOptions.decode(reader, position);
            case 26: return cir_root.circle.TransposeOptions.decode(reader, position);
            case 27: return cir_root.circle.ReducerOptions.decode(reader, position);
            case 28: return cir_root.circle.SubOptions.decode(reader, position);
            case 29: return cir_root.circle.DivOptions.decode(reader, position);
            case 30: return cir_root.circle.SqueezeOptions.decode(reader, position);
            case 31: return cir_root.circle.SequenceRNNOptions.decode(reader, position);
            case 32: return cir_root.circle.StridedSliceOptions.decode(reader, position);
            case 33: return cir_root.circle.ExpOptions.decode(reader, position);
            case 34: return cir_root.circle.TopKV2Options.decode(reader, position);
            case 35: return cir_root.circle.SplitOptions.decode(reader, position);
            case 36: return cir_root.circle.LogSoftmaxOptions.decode(reader, position);
            case 37: return cir_root.circle.CastOptions.decode(reader, position);
            case 38: return cir_root.circle.DequantizeOptions.decode(reader, position);
            case 39: return cir_root.circle.MaximumMinimumOptions.decode(reader, position);
            case 40: return cir_root.circle.ArgMaxOptions.decode(reader, position);
            case 41: return cir_root.circle.LessOptions.decode(reader, position);
            case 42: return cir_root.circle.NegOptions.decode(reader, position);
            case 43: return cir_root.circle.PadV2Options.decode(reader, position);
            case 44: return cir_root.circle.GreaterOptions.decode(reader, position);
            case 45: return cir_root.circle.GreaterEqualOptions.decode(reader, position);
            case 46: return cir_root.circle.LessEqualOptions.decode(reader, position);
            case 47: return cir_root.circle.SelectOptions.decode(reader, position);
            case 48: return cir_root.circle.SliceOptions.decode(reader, position);
            case 49: return cir_root.circle.TransposeConvOptions.decode(reader, position);
            case 50: return cir_root.circle.SparseToDenseOptions.decode(reader, position);
            case 51: return cir_root.circle.TileOptions.decode(reader, position);
            case 52: return cir_root.circle.ExpandDimsOptions.decode(reader, position);
            case 53: return cir_root.circle.EqualOptions.decode(reader, position);
            case 54: return cir_root.circle.NotEqualOptions.decode(reader, position);
            case 55: return cir_root.circle.ShapeOptions.decode(reader, position);
            case 56: return cir_root.circle.PowOptions.decode(reader, position);
            case 57: return cir_root.circle.ArgMinOptions.decode(reader, position);
            case 58: return cir_root.circle.FakeQuantOptions.decode(reader, position);
            case 59: return cir_root.circle.PackOptions.decode(reader, position);
            case 60: return cir_root.circle.LogicalOrOptions.decode(reader, position);
            case 61: return cir_root.circle.OneHotOptions.decode(reader, position);
            case 62: return cir_root.circle.LogicalAndOptions.decode(reader, position);
            case 63: return cir_root.circle.LogicalNotOptions.decode(reader, position);
            case 64: return cir_root.circle.UnpackOptions.decode(reader, position);
            case 65: return cir_root.circle.FloorDivOptions.decode(reader, position);
            case 66: return cir_root.circle.SquareOptions.decode(reader, position);
            case 67: return cir_root.circle.ZerosLikeOptions.decode(reader, position);
            case 68: return cir_root.circle.FillOptions.decode(reader, position);
            case 69: return cir_root.circle.BidirectionalSequenceLSTMOptions.decode(reader, position);
            case 70: return cir_root.circle.BidirectionalSequenceRNNOptions.decode(reader, position);
            case 71: return cir_root.circle.UnidirectionalSequenceLSTMOptions.decode(reader, position);
            case 72: return cir_root.circle.FloorModOptions.decode(reader, position);
            case 73: return cir_root.circle.RangeOptions.decode(reader, position);
            case 74: return cir_root.circle.ResizeNearestNeighborOptions.decode(reader, position);
            case 75: return cir_root.circle.LeakyReluOptions.decode(reader, position);
            case 76: return cir_root.circle.SquaredDifferenceOptions.decode(reader, position);
            case 77: return cir_root.circle.MirrorPadOptions.decode(reader, position);
            case 78: return cir_root.circle.AbsOptions.decode(reader, position);
            case 79: return cir_root.circle.SplitVOptions.decode(reader, position);
            case 80: return cir_root.circle.UniqueOptions.decode(reader, position);
            case 81: return cir_root.circle.ReverseV2Options.decode(reader, position);
            case 82: return cir_root.circle.AddNOptions.decode(reader, position);
            case 83: return cir_root.circle.GatherNdOptions.decode(reader, position);
            case 84: return cir_root.circle.CosOptions.decode(reader, position);
            case 85: return cir_root.circle.WhereOptions.decode(reader, position);
            case 86: return cir_root.circle.RankOptions.decode(reader, position);
            case 87: return cir_root.circle.ReverseSequenceOptions.decode(reader, position);
            case 88: return cir_root.circle.MatrixDiagOptions.decode(reader, position);
            case 89: return cir_root.circle.QuantizeOptions.decode(reader, position);
            case 90: return cir_root.circle.MatrixSetDiagOptions.decode(reader, position);
            case 91: return cir_root.circle.HardSwishOptions.decode(reader, position);
            case 92: return cir_root.circle.IfOptions.decode(reader, position);
            case 93: return cir_root.circle.WhileOptions.decode(reader, position);
            case 94: return cir_root.circle.DepthToSpaceOptions.decode(reader, position);
            case 95: return cir_root.circle.NonMaxSuppressionV4Options.decode(reader, position);
            case 96: return cir_root.circle.NonMaxSuppressionV5Options.decode(reader, position);
            case 97: return cir_root.circle.ScatterNdOptions.decode(reader, position);
            case 98: return cir_root.circle.SelectV2Options.decode(reader, position);
            case 99: return cir_root.circle.DensifyOptions.decode(reader, position);
            case 100: return cir_root.circle.SegmentSumOptions.decode(reader, position);
            case 101: return cir_root.circle.BatchMatMulOptions.decode(reader, position);
            case 102: return cir_root.circle.CumsumOptions.decode(reader, position);
            case 103: return cir_root.circle.CallOnceOptions.decode(reader, position);
            case 104: return cir_root.circle.BroadcastToOptions.decode(reader, position);
            case 105: return cir_root.circle.Rfft2dOptions.decode(reader, position);
            case 106: return cir_root.circle.Conv3DOptions.decode(reader, position);
            case 107: return cir_root.circle.HashtableOptions.decode(reader, position);
            case 108: return cir_root.circle.HashtableFindOptions.decode(reader, position);
            case 109: return cir_root.circle.HashtableImportOptions.decode(reader, position);
            case 110: return cir_root.circle.HashtableSizeOptions.decode(reader, position);
            case 111: return cir_root.circle.VarHandleOptions.decode(reader, position);
            case 112: return cir_root.circle.ReadVariableOptions.decode(reader, position);
            case 113: return cir_root.circle.AssignVariableOptions.decode(reader, position);
            case 114: return cir_root.circle.RandomOptions.decode(reader, position);
            case 115: return cir_root.circle.BucketizeOptions.decode(reader, position);
            case 116: return cir_root.circle.GeluOptions.decode(reader, position);
            case 117: return cir_root.circle.DynamicUpdateSliceOptions.decode(reader, position);
            case 118: return cir_root.circle.UnsortedSegmentProdOptions.decode(reader, position);
            case 119: return cir_root.circle.UnsortedSegmentMaxOptions.decode(reader, position);
            case 120: return cir_root.circle.UnsortedSegmentMinOptions.decode(reader, position);
            case 121: return cir_root.circle.UnsortedSegmentSumOptions.decode(reader, position);
            case 122: return cir_root.circle.ATan2Options.decode(reader, position);
            case 123: return cir_root.circle.SignOptions.decode(reader, position);
            case 124: return cir_root.circle.BitcastOptions.decode(reader, position);
            case 125: return cir_root.circle.BitwiseXorOptions.decode(reader, position);
            case 126: return cir_root.circle.RightShiftOptions.decode(reader, position);
            case 252: return cir_root.circle.BCQGatherOptions.decode(reader, position);
            case 253: return cir_root.circle.BCQFullyConnectedOptions.decode(reader, position);
            case 254: return cir_root.circle.InstanceNormOptions.decode(reader, position);
            default: return undefined;
        }
    }

    static decodeText(reader, json, type) {
        switch (type) {
            case 'Conv2DOptions': return cir_root.circle.Conv2DOptions.decodeText(reader, json);
            case 'DepthwiseConv2DOptions': return cir_root.circle.DepthwiseConv2DOptions.decodeText(reader, json);
            case 'ConcatEmbeddingsOptions': return cir_root.circle.ConcatEmbeddingsOptions.decodeText(reader, json);
            case 'LSHProjectionOptions': return cir_root.circle.LSHProjectionOptions.decodeText(reader, json);
            case 'Pool2DOptions': return cir_root.circle.Pool2DOptions.decodeText(reader, json);
            case 'SVDFOptions': return cir_root.circle.SVDFOptions.decodeText(reader, json);
            case 'RNNOptions': return cir_root.circle.RNNOptions.decodeText(reader, json);
            case 'FullyConnectedOptions': return cir_root.circle.FullyConnectedOptions.decodeText(reader, json);
            case 'SoftmaxOptions': return cir_root.circle.SoftmaxOptions.decodeText(reader, json);
            case 'ConcatenationOptions': return cir_root.circle.ConcatenationOptions.decodeText(reader, json);
            case 'AddOptions': return cir_root.circle.AddOptions.decodeText(reader, json);
            case 'L2NormOptions': return cir_root.circle.L2NormOptions.decodeText(reader, json);
            case 'LocalResponseNormalizationOptions': return cir_root.circle.LocalResponseNormalizationOptions.decodeText(reader, json);
            case 'LSTMOptions': return cir_root.circle.LSTMOptions.decodeText(reader, json);
            case 'ResizeBilinearOptions': return cir_root.circle.ResizeBilinearOptions.decodeText(reader, json);
            case 'CallOptions': return cir_root.circle.CallOptions.decodeText(reader, json);
            case 'ReshapeOptions': return cir_root.circle.ReshapeOptions.decodeText(reader, json);
            case 'SkipGramOptions': return cir_root.circle.SkipGramOptions.decodeText(reader, json);
            case 'SpaceToDepthOptions': return cir_root.circle.SpaceToDepthOptions.decodeText(reader, json);
            case 'EmbeddingLookupSparseOptions': return cir_root.circle.EmbeddingLookupSparseOptions.decodeText(reader, json);
            case 'MulOptions': return cir_root.circle.MulOptions.decodeText(reader, json);
            case 'PadOptions': return cir_root.circle.PadOptions.decodeText(reader, json);
            case 'GatherOptions': return cir_root.circle.GatherOptions.decodeText(reader, json);
            case 'BatchToSpaceNDOptions': return cir_root.circle.BatchToSpaceNDOptions.decodeText(reader, json);
            case 'SpaceToBatchNDOptions': return cir_root.circle.SpaceToBatchNDOptions.decodeText(reader, json);
            case 'TransposeOptions': return cir_root.circle.TransposeOptions.decodeText(reader, json);
            case 'ReducerOptions': return cir_root.circle.ReducerOptions.decodeText(reader, json);
            case 'SubOptions': return cir_root.circle.SubOptions.decodeText(reader, json);
            case 'DivOptions': return cir_root.circle.DivOptions.decodeText(reader, json);
            case 'SqueezeOptions': return cir_root.circle.SqueezeOptions.decodeText(reader, json);
            case 'SequenceRNNOptions': return cir_root.circle.SequenceRNNOptions.decodeText(reader, json);
            case 'StridedSliceOptions': return cir_root.circle.StridedSliceOptions.decodeText(reader, json);
            case 'ExpOptions': return cir_root.circle.ExpOptions.decodeText(reader, json);
            case 'TopKV2Options': return cir_root.circle.TopKV2Options.decodeText(reader, json);
            case 'SplitOptions': return cir_root.circle.SplitOptions.decodeText(reader, json);
            case 'LogSoftmaxOptions': return cir_root.circle.LogSoftmaxOptions.decodeText(reader, json);
            case 'CastOptions': return cir_root.circle.CastOptions.decodeText(reader, json);
            case 'DequantizeOptions': return cir_root.circle.DequantizeOptions.decodeText(reader, json);
            case 'MaximumMinimumOptions': return cir_root.circle.MaximumMinimumOptions.decodeText(reader, json);
            case 'ArgMaxOptions': return cir_root.circle.ArgMaxOptions.decodeText(reader, json);
            case 'LessOptions': return cir_root.circle.LessOptions.decodeText(reader, json);
            case 'NegOptions': return cir_root.circle.NegOptions.decodeText(reader, json);
            case 'PadV2Options': return cir_root.circle.PadV2Options.decodeText(reader, json);
            case 'GreaterOptions': return cir_root.circle.GreaterOptions.decodeText(reader, json);
            case 'GreaterEqualOptions': return cir_root.circle.GreaterEqualOptions.decodeText(reader, json);
            case 'LessEqualOptions': return cir_root.circle.LessEqualOptions.decodeText(reader, json);
            case 'SelectOptions': return cir_root.circle.SelectOptions.decodeText(reader, json);
            case 'SliceOptions': return cir_root.circle.SliceOptions.decodeText(reader, json);
            case 'TransposeConvOptions': return cir_root.circle.TransposeConvOptions.decodeText(reader, json);
            case 'SparseToDenseOptions': return cir_root.circle.SparseToDenseOptions.decodeText(reader, json);
            case 'TileOptions': return cir_root.circle.TileOptions.decodeText(reader, json);
            case 'ExpandDimsOptions': return cir_root.circle.ExpandDimsOptions.decodeText(reader, json);
            case 'EqualOptions': return cir_root.circle.EqualOptions.decodeText(reader, json);
            case 'NotEqualOptions': return cir_root.circle.NotEqualOptions.decodeText(reader, json);
            case 'ShapeOptions': return cir_root.circle.ShapeOptions.decodeText(reader, json);
            case 'PowOptions': return cir_root.circle.PowOptions.decodeText(reader, json);
            case 'ArgMinOptions': return cir_root.circle.ArgMinOptions.decodeText(reader, json);
            case 'FakeQuantOptions': return cir_root.circle.FakeQuantOptions.decodeText(reader, json);
            case 'PackOptions': return cir_root.circle.PackOptions.decodeText(reader, json);
            case 'LogicalOrOptions': return cir_root.circle.LogicalOrOptions.decodeText(reader, json);
            case 'OneHotOptions': return cir_root.circle.OneHotOptions.decodeText(reader, json);
            case 'LogicalAndOptions': return cir_root.circle.LogicalAndOptions.decodeText(reader, json);
            case 'LogicalNotOptions': return cir_root.circle.LogicalNotOptions.decodeText(reader, json);
            case 'UnpackOptions': return cir_root.circle.UnpackOptions.decodeText(reader, json);
            case 'FloorDivOptions': return cir_root.circle.FloorDivOptions.decodeText(reader, json);
            case 'SquareOptions': return cir_root.circle.SquareOptions.decodeText(reader, json);
            case 'ZerosLikeOptions': return cir_root.circle.ZerosLikeOptions.decodeText(reader, json);
            case 'FillOptions': return cir_root.circle.FillOptions.decodeText(reader, json);
            case 'BidirectionalSequenceLSTMOptions': return cir_root.circle.BidirectionalSequenceLSTMOptions.decodeText(reader, json);
            case 'BidirectionalSequenceRNNOptions': return cir_root.circle.BidirectionalSequenceRNNOptions.decodeText(reader, json);
            case 'UnidirectionalSequenceLSTMOptions': return cir_root.circle.UnidirectionalSequenceLSTMOptions.decodeText(reader, json);
            case 'FloorModOptions': return cir_root.circle.FloorModOptions.decodeText(reader, json);
            case 'RangeOptions': return cir_root.circle.RangeOptions.decodeText(reader, json);
            case 'ResizeNearestNeighborOptions': return cir_root.circle.ResizeNearestNeighborOptions.decodeText(reader, json);
            case 'LeakyReluOptions': return cir_root.circle.LeakyReluOptions.decodeText(reader, json);
            case 'SquaredDifferenceOptions': return cir_root.circle.SquaredDifferenceOptions.decodeText(reader, json);
            case 'MirrorPadOptions': return cir_root.circle.MirrorPadOptions.decodeText(reader, json);
            case 'AbsOptions': return cir_root.circle.AbsOptions.decodeText(reader, json);
            case 'SplitVOptions': return cir_root.circle.SplitVOptions.decodeText(reader, json);
            case 'UniqueOptions': return cir_root.circle.UniqueOptions.decodeText(reader, json);
            case 'ReverseV2Options': return cir_root.circle.ReverseV2Options.decodeText(reader, json);
            case 'AddNOptions': return cir_root.circle.AddNOptions.decodeText(reader, json);
            case 'GatherNdOptions': return cir_root.circle.GatherNdOptions.decodeText(reader, json);
            case 'CosOptions': return cir_root.circle.CosOptions.decodeText(reader, json);
            case 'WhereOptions': return cir_root.circle.WhereOptions.decodeText(reader, json);
            case 'RankOptions': return cir_root.circle.RankOptions.decodeText(reader, json);
            case 'ReverseSequenceOptions': return cir_root.circle.ReverseSequenceOptions.decodeText(reader, json);
            case 'MatrixDiagOptions': return cir_root.circle.MatrixDiagOptions.decodeText(reader, json);
            case 'QuantizeOptions': return cir_root.circle.QuantizeOptions.decodeText(reader, json);
            case 'MatrixSetDiagOptions': return cir_root.circle.MatrixSetDiagOptions.decodeText(reader, json);
            case 'HardSwishOptions': return cir_root.circle.HardSwishOptions.decodeText(reader, json);
            case 'IfOptions': return cir_root.circle.IfOptions.decodeText(reader, json);
            case 'WhileOptions': return cir_root.circle.WhileOptions.decodeText(reader, json);
            case 'DepthToSpaceOptions': return cir_root.circle.DepthToSpaceOptions.decodeText(reader, json);
            case 'NonMaxSuppressionV4Options': return cir_root.circle.NonMaxSuppressionV4Options.decodeText(reader, json);
            case 'NonMaxSuppressionV5Options': return cir_root.circle.NonMaxSuppressionV5Options.decodeText(reader, json);
            case 'ScatterNdOptions': return cir_root.circle.ScatterNdOptions.decodeText(reader, json);
            case 'SelectV2Options': return cir_root.circle.SelectV2Options.decodeText(reader, json);
            case 'DensifyOptions': return cir_root.circle.DensifyOptions.decodeText(reader, json);
            case 'SegmentSumOptions': return cir_root.circle.SegmentSumOptions.decodeText(reader, json);
            case 'BatchMatMulOptions': return cir_root.circle.BatchMatMulOptions.decodeText(reader, json);
            case 'CumsumOptions': return cir_root.circle.CumsumOptions.decodeText(reader, json);
            case 'CallOnceOptions': return cir_root.circle.CallOnceOptions.decodeText(reader, json);
            case 'BroadcastToOptions': return cir_root.circle.BroadcastToOptions.decodeText(reader, json);
            case 'Rfft2dOptions': return cir_root.circle.Rfft2dOptions.decodeText(reader, json);
            case 'Conv3DOptions': return cir_root.circle.Conv3DOptions.decodeText(reader, json);
            case 'HashtableOptions': return cir_root.circle.HashtableOptions.decodeText(reader, json);
            case 'HashtableFindOptions': return cir_root.circle.HashtableFindOptions.decodeText(reader, json);
            case 'HashtableImportOptions': return cir_root.circle.HashtableImportOptions.decodeText(reader, json);
            case 'HashtableSizeOptions': return cir_root.circle.HashtableSizeOptions.decodeText(reader, json);
            case 'VarHandleOptions': return cir_root.circle.VarHandleOptions.decodeText(reader, json);
            case 'ReadVariableOptions': return cir_root.circle.ReadVariableOptions.decodeText(reader, json);
            case 'AssignVariableOptions': return cir_root.circle.AssignVariableOptions.decodeText(reader, json);
            case 'RandomOptions': return cir_root.circle.RandomOptions.decodeText(reader, json);
            case 'BucketizeOptions': return cir_root.circle.BucketizeOptions.decodeText(reader, json);
            case 'GeluOptions': return cir_root.circle.GeluOptions.decodeText(reader, json);
            case 'DynamicUpdateSliceOptions': return cir_root.circle.DynamicUpdateSliceOptions.decodeText(reader, json);
            case 'UnsortedSegmentProdOptions': return cir_root.circle.UnsortedSegmentProdOptions.decodeText(reader, json);
            case 'UnsortedSegmentMaxOptions': return cir_root.circle.UnsortedSegmentMaxOptions.decodeText(reader, json);
            case 'UnsortedSegmentMinOptions': return cir_root.circle.UnsortedSegmentMinOptions.decodeText(reader, json);
            case 'UnsortedSegmentSumOptions': return cir_root.circle.UnsortedSegmentSumOptions.decodeText(reader, json);
            case 'ATan2Options': return cir_root.circle.ATan2Options.decodeText(reader, json);
            case 'SignOptions': return cir_root.circle.SignOptions.decodeText(reader, json);
            case 'BitcastOptions': return cir_root.circle.BitcastOptions.decodeText(reader, json);
            case 'BitwiseXorOptions': return cir_root.circle.BitwiseXorOptions.decodeText(reader, json);
            case 'RightShiftOptions': return cir_root.circle.RightShiftOptions.decodeText(reader, json);
            case 'BCQGatherOptions': return cir_root.circle.BCQGatherOptions.decodeText(reader, json);
            case 'BCQFullyConnectedOptions': return cir_root.circle.BCQFullyConnectedOptions.decodeText(reader, json);
            case 'InstanceNormOptions': return cir_root.circle.InstanceNormOptions.decodeText(reader, json);
            default: return undefined;
        }
    }
};

cir_root.circle.Padding = {
    SAME: 0,
    VALID: 1
};

cir_root.circle.ActivationFunctionType = {
    NONE: 0,
    RELU: 1,
    RELU_N1_TO_1: 2,
    RELU6: 3,
    TANH: 4,
    SIGN_BIT: 5
};

cir_root.circle.Conv2DOptions = class Conv2DOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.Conv2DOptions();
        $.padding = reader.int8_(position, 4, 0);
        $.stride_w = reader.int32_(position, 6, 0);
        $.stride_h = reader.int32_(position, 8, 0);
        $.fused_activation_function = reader.int8_(position, 10, 0);
        $.dilation_w_factor = reader.int32_(position, 12, 1);
        $.dilation_h_factor = reader.int32_(position, 14, 1);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Conv2DOptions();
        $.padding = cir_root.circle.Padding[json.padding];
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.dilation_w_factor = reader.value(json.dilation_w_factor, 1);
        $.dilation_h_factor = reader.value(json.dilation_h_factor, 1);
        return $;
    }
};

cir_root.circle.Conv3DOptions = class Conv3DOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.Conv3DOptions();
        $.padding = reader.int8_(position, 4, 0);
        $.stride_d = reader.int32_(position, 6, 0);
        $.stride_w = reader.int32_(position, 8, 0);
        $.stride_h = reader.int32_(position, 10, 0);
        $.fused_activation_function = reader.int8_(position, 12, 0);
        $.dilation_d_factor = reader.int32_(position, 14, 1);
        $.dilation_w_factor = reader.int32_(position, 16, 1);
        $.dilation_h_factor = reader.int32_(position, 18, 1);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Conv3DOptions();
        $.padding = cir_root.circle.Padding[json.padding];
        $.stride_d = reader.value(json.stride_d, 0);
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.dilation_d_factor = reader.value(json.dilation_d_factor, 1);
        $.dilation_w_factor = reader.value(json.dilation_w_factor, 1);
        $.dilation_h_factor = reader.value(json.dilation_h_factor, 1);
        return $;
    }
};

cir_root.circle.Pool2DOptions = class Pool2DOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.Pool2DOptions();
        $.padding = reader.int8_(position, 4, 0);
        $.stride_w = reader.int32_(position, 6, 0);
        $.stride_h = reader.int32_(position, 8, 0);
        $.filter_width = reader.int32_(position, 10, 0);
        $.filter_height = reader.int32_(position, 12, 0);
        $.fused_activation_function = reader.int8_(position, 14, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Pool2DOptions();
        $.padding = cir_root.circle.Padding[json.padding];
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.filter_width = reader.value(json.filter_width, 0);
        $.filter_height = reader.value(json.filter_height, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

cir_root.circle.DepthwiseConv2DOptions = class DepthwiseConv2DOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.DepthwiseConv2DOptions();
        $.padding = reader.int8_(position, 4, 0);
        $.stride_w = reader.int32_(position, 6, 0);
        $.stride_h = reader.int32_(position, 8, 0);
        $.depth_multiplier = reader.int32_(position, 10, 0);
        $.fused_activation_function = reader.int8_(position, 12, 0);
        $.dilation_w_factor = reader.int32_(position, 14, 1);
        $.dilation_h_factor = reader.int32_(position, 16, 1);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.DepthwiseConv2DOptions();
        $.padding = cir_root.circle.Padding[json.padding];
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.depth_multiplier = reader.value(json.depth_multiplier, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.dilation_w_factor = reader.value(json.dilation_w_factor, 1);
        $.dilation_h_factor = reader.value(json.dilation_h_factor, 1);
        return $;
    }
};

cir_root.circle.ConcatEmbeddingsOptions = class ConcatEmbeddingsOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ConcatEmbeddingsOptions();
        $.num_channels = reader.int32_(position, 4, 0);
        $.num_columns_per_channel = reader.typedArray(position, 6, Int32Array);
        $.embedding_dim_per_channel = reader.typedArray(position, 8, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ConcatEmbeddingsOptions();
        $.num_channels = reader.value(json.num_channels, 0);
        $.num_columns_per_channel = reader.typedArray(json.num_columns_per_channel, Int32Array);
        $.embedding_dim_per_channel = reader.typedArray(json.embedding_dim_per_channel, Int32Array);
        return $;
    }
};

cir_root.circle.LSHProjectionType = {
    UNKNOWN: 0,
    SPARSE: 1,
    DENSE: 2
};

cir_root.circle.LSHProjectionOptions = class LSHProjectionOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.LSHProjectionOptions();
        $.type = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.LSHProjectionOptions();
        $.type = cir_root.circle.LSHProjectionType[json.type];
        return $;
    }
};

cir_root.circle.SVDFOptions = class SVDFOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SVDFOptions();
        $.rank = reader.int32_(position, 4, 0);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        $.asymmetric_quantize_inputs = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SVDFOptions();
        $.rank = reader.value(json.rank, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

cir_root.circle.RNNOptions = class RNNOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.RNNOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.asymmetric_quantize_inputs = reader.bool_(position, 6, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.RNNOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

cir_root.circle.SequenceRNNOptions = class SequenceRNNOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SequenceRNNOptions();
        $.time_major = reader.bool_(position, 4, false);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        $.asymmetric_quantize_inputs = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SequenceRNNOptions();
        $.time_major = reader.value(json.time_major, false);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

cir_root.circle.BidirectionalSequenceRNNOptions = class BidirectionalSequenceRNNOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.BidirectionalSequenceRNNOptions();
        $.time_major = reader.bool_(position, 4, false);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        $.merge_outputs = reader.bool_(position, 8, false);
        $.asymmetric_quantize_inputs = reader.bool_(position, 10, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.BidirectionalSequenceRNNOptions();
        $.time_major = reader.value(json.time_major, false);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.merge_outputs = reader.value(json.merge_outputs, false);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

cir_root.circle.FullyConnectedOptionsWeightsFormat = {
    DEFAULT: 0,
    SHUFFLED4x16INT8: 1,
    SHUFFLED16x1FLOAT32: 127
};

cir_root.circle.FullyConnectedOptions = class FullyConnectedOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.FullyConnectedOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.weights_format = reader.int8_(position, 6, 0);
        $.keep_num_dims = reader.bool_(position, 8, false);
        $.asymmetric_quantize_inputs = reader.bool_(position, 10, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.FullyConnectedOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.weights_format = cir_root.circle.FullyConnectedOptionsWeightsFormat[json.weights_format];
        $.keep_num_dims = reader.value(json.keep_num_dims, false);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

cir_root.circle.SoftmaxOptions = class SoftmaxOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SoftmaxOptions();
        $.beta = reader.float32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SoftmaxOptions();
        $.beta = reader.value(json.beta, 0);
        return $;
    }
};

cir_root.circle.ConcatenationOptions = class ConcatenationOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ConcatenationOptions();
        $.axis = reader.int32_(position, 4, 0);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ConcatenationOptions();
        $.axis = reader.value(json.axis, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

cir_root.circle.AddOptions = class AddOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.AddOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.pot_scale_int16 = reader.bool_(position, 6, true);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.AddOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.pot_scale_int16 = reader.value(json.pot_scale_int16, true);
        return $;
    }
};

cir_root.circle.MulOptions = class MulOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.MulOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.MulOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

cir_root.circle.L2NormOptions = class L2NormOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.L2NormOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.L2NormOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

cir_root.circle.LocalResponseNormalizationOptions = class LocalResponseNormalizationOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.LocalResponseNormalizationOptions();
        $.radius = reader.int32_(position, 4, 0);
        $.bias = reader.float32_(position, 6, 0);
        $.alpha = reader.float32_(position, 8, 0);
        $.beta = reader.float32_(position, 10, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.LocalResponseNormalizationOptions();
        $.radius = reader.value(json.radius, 0);
        $.bias = reader.value(json.bias, 0);
        $.alpha = reader.value(json.alpha, 0);
        $.beta = reader.value(json.beta, 0);
        return $;
    }
};

cir_root.circle.LSTMKernelType = {
    FULL: 0,
    BASIC: 1
};

cir_root.circle.LSTMOptions = class LSTMOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.LSTMOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.cell_clip = reader.float32_(position, 6, 0);
        $.proj_clip = reader.float32_(position, 8, 0);
        $.kernel_type = reader.int8_(position, 10, 0);
        $.asymmetric_quantize_inputs = reader.bool_(position, 12, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.LSTMOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.cell_clip = reader.value(json.cell_clip, 0);
        $.proj_clip = reader.value(json.proj_clip, 0);
        $.kernel_type = cir_root.circle.LSTMKernelType[json.kernel_type];
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

cir_root.circle.UnidirectionalSequenceLSTMOptions = class UnidirectionalSequenceLSTMOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.UnidirectionalSequenceLSTMOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.cell_clip = reader.float32_(position, 6, 0);
        $.proj_clip = reader.float32_(position, 8, 0);
        $.time_major = reader.bool_(position, 10, false);
        $.asymmetric_quantize_inputs = reader.bool_(position, 12, false);
        $.diagonal_recurrent_tensors = reader.bool_(position, 14, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.UnidirectionalSequenceLSTMOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.cell_clip = reader.value(json.cell_clip, 0);
        $.proj_clip = reader.value(json.proj_clip, 0);
        $.time_major = reader.value(json.time_major, false);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        $.diagonal_recurrent_tensors = reader.value(json.diagonal_recurrent_tensors, false);
        return $;
    }
};

cir_root.circle.BidirectionalSequenceLSTMOptions = class BidirectionalSequenceLSTMOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.BidirectionalSequenceLSTMOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.cell_clip = reader.float32_(position, 6, 0);
        $.proj_clip = reader.float32_(position, 8, 0);
        $.merge_outputs = reader.bool_(position, 10, false);
        $.time_major = reader.bool_(position, 12, true);
        $.asymmetric_quantize_inputs = reader.bool_(position, 14, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.BidirectionalSequenceLSTMOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.cell_clip = reader.value(json.cell_clip, 0);
        $.proj_clip = reader.value(json.proj_clip, 0);
        $.merge_outputs = reader.value(json.merge_outputs, false);
        $.time_major = reader.value(json.time_major, true);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

cir_root.circle.ResizeBilinearOptions = class ResizeBilinearOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ResizeBilinearOptions();
        $.new_height = reader.int32_(position, 4, 0);
        $.new_width = reader.int32_(position, 6, 0);
        $.align_corners = reader.bool_(position, 8, false);
        $.half_pixel_centers = reader.bool_(position, 10, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ResizeBilinearOptions();
        $.new_height = reader.value(json.new_height, 0);
        $.new_width = reader.value(json.new_width, 0);
        $.align_corners = reader.value(json.align_corners, false);
        $.half_pixel_centers = reader.value(json.half_pixel_centers, false);
        return $;
    }
};

cir_root.circle.ResizeNearestNeighborOptions = class ResizeNearestNeighborOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ResizeNearestNeighborOptions();
        $.align_corners = reader.bool_(position, 4, false);
        $.half_pixel_centers = reader.bool_(position, 6, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ResizeNearestNeighborOptions();
        $.align_corners = reader.value(json.align_corners, false);
        $.half_pixel_centers = reader.value(json.half_pixel_centers, false);
        return $;
    }
};

cir_root.circle.CallOptions = class CallOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.CallOptions();
        $.subgraph = reader.uint32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.CallOptions();
        $.subgraph = reader.value(json.subgraph, 0);
        return $;
    }
};

cir_root.circle.PadOptions = class PadOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.PadOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.PadOptions();
        return $;
    }
};

cir_root.circle.PadV2Options = class PadV2Options {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.PadV2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.PadV2Options();
        return $;
    }
};

cir_root.circle.ReshapeOptions = class ReshapeOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ReshapeOptions();
        $.new_shape = reader.typedArray(position, 4, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ReshapeOptions();
        $.new_shape = reader.typedArray(json.new_shape, Int32Array);
        return $;
    }
};

cir_root.circle.SpaceToBatchNDOptions = class SpaceToBatchNDOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.SpaceToBatchNDOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.SpaceToBatchNDOptions();
        return $;
    }
};

cir_root.circle.BatchToSpaceNDOptions = class BatchToSpaceNDOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.BatchToSpaceNDOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.BatchToSpaceNDOptions();
        return $;
    }
};

cir_root.circle.SkipGramOptions = class SkipGramOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SkipGramOptions();
        $.ngram_size = reader.int32_(position, 4, 0);
        $.max_skip_size = reader.int32_(position, 6, 0);
        $.include_all_ngrams = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SkipGramOptions();
        $.ngram_size = reader.value(json.ngram_size, 0);
        $.max_skip_size = reader.value(json.max_skip_size, 0);
        $.include_all_ngrams = reader.value(json.include_all_ngrams, false);
        return $;
    }
};

cir_root.circle.SpaceToDepthOptions = class SpaceToDepthOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SpaceToDepthOptions();
        $.block_size = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SpaceToDepthOptions();
        $.block_size = reader.value(json.block_size, 0);
        return $;
    }
};

cir_root.circle.DepthToSpaceOptions = class DepthToSpaceOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.DepthToSpaceOptions();
        $.block_size = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.DepthToSpaceOptions();
        $.block_size = reader.value(json.block_size, 0);
        return $;
    }
};

cir_root.circle.SubOptions = class SubOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SubOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.pot_scale_int16 = reader.bool_(position, 6, true);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SubOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        $.pot_scale_int16 = reader.value(json.pot_scale_int16, true);
        return $;
    }
};

cir_root.circle.DivOptions = class DivOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.DivOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.DivOptions();
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

cir_root.circle.TopKV2Options = class TopKV2Options {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.TopKV2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.TopKV2Options();
        return $;
    }
};

cir_root.circle.CombinerType = {
    SUM: 0,
    MEAN: 1,
    SQRTN: 2
};

cir_root.circle.EmbeddingLookupSparseOptions = class EmbeddingLookupSparseOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.EmbeddingLookupSparseOptions();
        $.combiner = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.EmbeddingLookupSparseOptions();
        $.combiner = cir_root.circle.CombinerType[json.combiner];
        return $;
    }
};

cir_root.circle.GatherOptions = class GatherOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.GatherOptions();
        $.axis = reader.int32_(position, 4, 0);
        $.batch_dims = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.GatherOptions();
        $.axis = reader.value(json.axis, 0);
        $.batch_dims = reader.value(json.batch_dims, 0);
        return $;
    }
};

cir_root.circle.TransposeOptions = class TransposeOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.TransposeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.TransposeOptions();
        return $;
    }
};

cir_root.circle.ExpOptions = class ExpOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.ExpOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.ExpOptions();
        return $;
    }
};

cir_root.circle.CosOptions = class CosOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.CosOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.CosOptions();
        return $;
    }
};

cir_root.circle.ReducerOptions = class ReducerOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ReducerOptions();
        $.keep_dims = reader.bool_(position, 4, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ReducerOptions();
        $.keep_dims = reader.value(json.keep_dims, false);
        return $;
    }
};

cir_root.circle.SqueezeOptions = class SqueezeOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SqueezeOptions();
        $.squeeze_dims = reader.typedArray(position, 4, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SqueezeOptions();
        $.squeeze_dims = reader.typedArray(json.squeeze_dims, Int32Array);
        return $;
    }
};

cir_root.circle.SplitOptions = class SplitOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SplitOptions();
        $.num_splits = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SplitOptions();
        $.num_splits = reader.value(json.num_splits, 0);
        return $;
    }
};

cir_root.circle.SplitVOptions = class SplitVOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SplitVOptions();
        $.num_splits = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SplitVOptions();
        $.num_splits = reader.value(json.num_splits, 0);
        return $;
    }
};

cir_root.circle.StridedSliceOptions = class StridedSliceOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.StridedSliceOptions();
        $.begin_mask = reader.int32_(position, 4, 0);
        $.end_mask = reader.int32_(position, 6, 0);
        $.ellipsis_mask = reader.int32_(position, 8, 0);
        $.new_axis_mask = reader.int32_(position, 10, 0);
        $.shrink_axis_mask = reader.int32_(position, 12, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.StridedSliceOptions();
        $.begin_mask = reader.value(json.begin_mask, 0);
        $.end_mask = reader.value(json.end_mask, 0);
        $.ellipsis_mask = reader.value(json.ellipsis_mask, 0);
        $.new_axis_mask = reader.value(json.new_axis_mask, 0);
        $.shrink_axis_mask = reader.value(json.shrink_axis_mask, 0);
        return $;
    }
};

cir_root.circle.LogSoftmaxOptions = class LogSoftmaxOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.LogSoftmaxOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.LogSoftmaxOptions();
        return $;
    }
};

cir_root.circle.CastOptions = class CastOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.CastOptions();
        $.in_data_type = reader.int8_(position, 4, 0);
        $.out_data_type = reader.int8_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.CastOptions();
        $.in_data_type = cir_root.circle.TensorType[json.in_data_type];
        $.out_data_type = cir_root.circle.TensorType[json.out_data_type];
        return $;
    }
};

cir_root.circle.DequantizeOptions = class DequantizeOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.DequantizeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.DequantizeOptions();
        return $;
    }
};

cir_root.circle.MaximumMinimumOptions = class MaximumMinimumOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.MaximumMinimumOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.MaximumMinimumOptions();
        return $;
    }
};

cir_root.circle.TileOptions = class TileOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.TileOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.TileOptions();
        return $;
    }
};

cir_root.circle.ArgMaxOptions = class ArgMaxOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ArgMaxOptions();
        $.output_type = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ArgMaxOptions();
        $.output_type = cir_root.circle.TensorType[json.output_type];
        return $;
    }
};

cir_root.circle.ArgMinOptions = class ArgMinOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ArgMinOptions();
        $.output_type = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ArgMinOptions();
        $.output_type = cir_root.circle.TensorType[json.output_type];
        return $;
    }
};

cir_root.circle.GreaterOptions = class GreaterOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.GreaterOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.GreaterOptions();
        return $;
    }
};

cir_root.circle.GreaterEqualOptions = class GreaterEqualOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.GreaterEqualOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.GreaterEqualOptions();
        return $;
    }
};

cir_root.circle.LessOptions = class LessOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.LessOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.LessOptions();
        return $;
    }
};

cir_root.circle.LessEqualOptions = class LessEqualOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.LessEqualOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.LessEqualOptions();
        return $;
    }
};

cir_root.circle.NegOptions = class NegOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.NegOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.NegOptions();
        return $;
    }
};

cir_root.circle.SelectOptions = class SelectOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.SelectOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.SelectOptions();
        return $;
    }
};

cir_root.circle.SliceOptions = class SliceOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.SliceOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.SliceOptions();
        return $;
    }
};

cir_root.circle.TransposeConvOptions = class TransposeConvOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.TransposeConvOptions();
        $.padding = reader.int8_(position, 4, 0);
        $.stride_w = reader.int32_(position, 6, 0);
        $.stride_h = reader.int32_(position, 8, 0);
        $.fused_activation_function = reader.int8_(position, 10, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.TransposeConvOptions();
        $.padding = cir_root.circle.Padding[json.padding];
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

cir_root.circle.ExpandDimsOptions = class ExpandDimsOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.ExpandDimsOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.ExpandDimsOptions();
        return $;
    }
};

cir_root.circle.SparseToDenseOptions = class SparseToDenseOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.SparseToDenseOptions();
        $.validate_indices = reader.bool_(position, 4, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SparseToDenseOptions();
        $.validate_indices = reader.value(json.validate_indices, false);
        return $;
    }
};

cir_root.circle.EqualOptions = class EqualOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.EqualOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.EqualOptions();
        return $;
    }
};

cir_root.circle.NotEqualOptions = class NotEqualOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.NotEqualOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.NotEqualOptions();
        return $;
    }
};

cir_root.circle.ShapeOptions = class ShapeOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ShapeOptions();
        $.out_type = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ShapeOptions();
        $.out_type = cir_root.circle.TensorType[json.out_type];
        return $;
    }
};

cir_root.circle.RankOptions = class RankOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.RankOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.RankOptions();
        return $;
    }
};

cir_root.circle.PowOptions = class PowOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.PowOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.PowOptions();
        return $;
    }
};

cir_root.circle.FakeQuantOptions = class FakeQuantOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.FakeQuantOptions();
        $.min = reader.float32_(position, 4, 0);
        $.max = reader.float32_(position, 6, 0);
        $.num_bits = reader.int32_(position, 8, 0);
        $.narrow_range = reader.bool_(position, 10, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.FakeQuantOptions();
        $.min = reader.value(json.min, 0);
        $.max = reader.value(json.max, 0);
        $.num_bits = reader.value(json.num_bits, 0);
        $.narrow_range = reader.value(json.narrow_range, false);
        return $;
    }
};

cir_root.circle.PackOptions = class PackOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.PackOptions();
        $.values_count = reader.int32_(position, 4, 0);
        $.axis = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.PackOptions();
        $.values_count = reader.value(json.values_count, 0);
        $.axis = reader.value(json.axis, 0);
        return $;
    }
};

cir_root.circle.LogicalOrOptions = class LogicalOrOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.LogicalOrOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.LogicalOrOptions();
        return $;
    }
};

cir_root.circle.OneHotOptions = class OneHotOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.OneHotOptions();
        $.axis = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.OneHotOptions();
        $.axis = reader.value(json.axis, 0);
        return $;
    }
};

cir_root.circle.AbsOptions = class AbsOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.AbsOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.AbsOptions();
        return $;
    }
};

cir_root.circle.HardSwishOptions = class HardSwishOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.HardSwishOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.HardSwishOptions();
        return $;
    }
};

cir_root.circle.LogicalAndOptions = class LogicalAndOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.LogicalAndOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.LogicalAndOptions();
        return $;
    }
};

cir_root.circle.LogicalNotOptions = class LogicalNotOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.LogicalNotOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.LogicalNotOptions();
        return $;
    }
};

cir_root.circle.UnpackOptions = class UnpackOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.UnpackOptions();
        $.num = reader.int32_(position, 4, 0);
        $.axis = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.UnpackOptions();
        $.num = reader.value(json.num, 0);
        $.axis = reader.value(json.axis, 0);
        return $;
    }
};

cir_root.circle.FloorDivOptions = class FloorDivOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.FloorDivOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.FloorDivOptions();
        return $;
    }
};

cir_root.circle.SquareOptions = class SquareOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.SquareOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.SquareOptions();
        return $;
    }
};

cir_root.circle.ZerosLikeOptions = class ZerosLikeOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.ZerosLikeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.ZerosLikeOptions();
        return $;
    }
};

cir_root.circle.FillOptions = class FillOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.FillOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.FillOptions();
        return $;
    }
};

cir_root.circle.FloorModOptions = class FloorModOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.FloorModOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.FloorModOptions();
        return $;
    }
};

cir_root.circle.RangeOptions = class RangeOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.RangeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.RangeOptions();
        return $;
    }
};

cir_root.circle.LeakyReluOptions = class LeakyReluOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.LeakyReluOptions();
        $.alpha = reader.float32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.LeakyReluOptions();
        $.alpha = reader.value(json.alpha, 0);
        return $;
    }
};

cir_root.circle.SquaredDifferenceOptions = class SquaredDifferenceOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.SquaredDifferenceOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.SquaredDifferenceOptions();
        return $;
    }
};

cir_root.circle.MirrorPadMode = {
    REFLECT: 0,
    SYMMETRIC: 1
};

cir_root.circle.MirrorPadOptions = class MirrorPadOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.MirrorPadOptions();
        $.mode = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.MirrorPadOptions();
        $.mode = cir_root.circle.MirrorPadMode[json.mode];
        return $;
    }
};

cir_root.circle.UniqueOptions = class UniqueOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.UniqueOptions();
        $.idx_out_type = reader.int8_(position, 4, 2);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.UniqueOptions();
        $.idx_out_type = cir_root.circle.TensorType[json.idx_out_type];
        return $;
    }
};

cir_root.circle.ReverseV2Options = class ReverseV2Options {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.ReverseV2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.ReverseV2Options();
        return $;
    }
};

cir_root.circle.AddNOptions = class AddNOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.AddNOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.AddNOptions();
        return $;
    }
};

cir_root.circle.GatherNdOptions = class GatherNdOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.GatherNdOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.GatherNdOptions();
        return $;
    }
};

cir_root.circle.WhereOptions = class WhereOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.WhereOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.WhereOptions();
        return $;
    }
};

cir_root.circle.ReverseSequenceOptions = class ReverseSequenceOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.ReverseSequenceOptions();
        $.seq_dim = reader.int32_(position, 4, 0);
        $.batch_dim = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.ReverseSequenceOptions();
        $.seq_dim = reader.value(json.seq_dim, 0);
        $.batch_dim = reader.value(json.batch_dim, 0);
        return $;
    }
};

cir_root.circle.MatrixDiagOptions = class MatrixDiagOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.MatrixDiagOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.MatrixDiagOptions();
        return $;
    }
};

cir_root.circle.QuantizeOptions = class QuantizeOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.QuantizeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.QuantizeOptions();
        return $;
    }
};

cir_root.circle.MatrixSetDiagOptions = class MatrixSetDiagOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.MatrixSetDiagOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.MatrixSetDiagOptions();
        return $;
    }
};

cir_root.circle.IfOptions = class IfOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.IfOptions();
        $.then_subgraph_index = reader.int32_(position, 4, 0);
        $.else_subgraph_index = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.IfOptions();
        $.then_subgraph_index = reader.value(json.then_subgraph_index, 0);
        $.else_subgraph_index = reader.value(json.else_subgraph_index, 0);
        return $;
    }
};

cir_root.circle.CallOnceOptions = class CallOnceOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.CallOnceOptions();
        $.init_subgraph_index = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.CallOnceOptions();
        $.init_subgraph_index = reader.value(json.init_subgraph_index, 0);
        return $;
    }
};

cir_root.circle.WhileOptions = class WhileOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.WhileOptions();
        $.cond_subgraph_index = reader.int32_(position, 4, 0);
        $.body_subgraph_index = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.WhileOptions();
        $.cond_subgraph_index = reader.value(json.cond_subgraph_index, 0);
        $.body_subgraph_index = reader.value(json.body_subgraph_index, 0);
        return $;
    }
};

cir_root.circle.NonMaxSuppressionV4Options = class NonMaxSuppressionV4Options {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.NonMaxSuppressionV4Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.NonMaxSuppressionV4Options();
        return $;
    }
};

cir_root.circle.NonMaxSuppressionV5Options = class NonMaxSuppressionV5Options {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.NonMaxSuppressionV5Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.NonMaxSuppressionV5Options();
        return $;
    }
};

cir_root.circle.ScatterNdOptions = class ScatterNdOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.ScatterNdOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.ScatterNdOptions();
        return $;
    }
};

cir_root.circle.SelectV2Options = class SelectV2Options {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.SelectV2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.SelectV2Options();
        return $;
    }
};

cir_root.circle.DensifyOptions = class DensifyOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.DensifyOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.DensifyOptions();
        return $;
    }
};

cir_root.circle.SegmentSumOptions = class SegmentSumOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.SegmentSumOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.SegmentSumOptions();
        return $;
    }
};

cir_root.circle.BatchMatMulOptions = class BatchMatMulOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.BatchMatMulOptions();
        $.adjoint_lhs = reader.bool_(position, 4, false);
        $.adjoint_rhs = reader.bool_(position, 6, false);
        $.asymmetric_quantize_inputs = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.BatchMatMulOptions();
        $.adjoint_lhs = reader.value(json.adjoint_lhs, false);
        $.adjoint_rhs = reader.value(json.adjoint_rhs, false);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

cir_root.circle.CumsumOptions = class CumsumOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.CumsumOptions();
        $.exclusive = reader.bool_(position, 4, false);
        $.reverse = reader.bool_(position, 6, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.CumsumOptions();
        $.exclusive = reader.value(json.exclusive, false);
        $.reverse = reader.value(json.reverse, false);
        return $;
    }
};

cir_root.circle.BroadcastToOptions = class BroadcastToOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.BroadcastToOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.BroadcastToOptions();
        return $;
    }
};

cir_root.circle.Rfft2dOptions = class Rfft2dOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.Rfft2dOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.Rfft2dOptions();
        return $;
    }
};

cir_root.circle.HashtableOptions = class HashtableOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.HashtableOptions();
        $.table_id = reader.int32_(position, 4, 0);
        $.key_dtype = reader.int8_(position, 6, 0);
        $.value_dtype = reader.int8_(position, 8, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.HashtableOptions();
        $.table_id = reader.value(json.table_id, 0);
        $.key_dtype = cir_root.circle.TensorType[json.key_dtype];
        $.value_dtype = cir_root.circle.TensorType[json.value_dtype];
        return $;
    }
};

cir_root.circle.HashtableFindOptions = class HashtableFindOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.HashtableFindOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.HashtableFindOptions();
        return $;
    }
};

cir_root.circle.HashtableImportOptions = class HashtableImportOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.HashtableImportOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.HashtableImportOptions();
        return $;
    }
};

cir_root.circle.HashtableSizeOptions = class HashtableSizeOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.HashtableSizeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.HashtableSizeOptions();
        return $;
    }
};

cir_root.circle.VarHandleOptions = class VarHandleOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.VarHandleOptions();
        $.container = reader.string_(position, 4, null);
        $.shared_name = reader.string_(position, 6, null);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.VarHandleOptions();
        $.container = reader.value(json.container, null);
        $.shared_name = reader.value(json.shared_name, null);
        return $;
    }
};

cir_root.circle.ReadVariableOptions = class ReadVariableOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.ReadVariableOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.ReadVariableOptions();
        return $;
    }
};

cir_root.circle.AssignVariableOptions = class AssignVariableOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.AssignVariableOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.AssignVariableOptions();
        return $;
    }
};

cir_root.circle.RandomOptions = class RandomOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.RandomOptions();
        $.seed = reader.int64_(position, 4, 0);
        $.seed2 = reader.int64_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.RandomOptions();
        $.seed = reader.value(json.seed, 0);
        $.seed2 = reader.value(json.seed2, 0);
        return $;
    }
};

cir_root.circle.BucketizeOptions = class BucketizeOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.BucketizeOptions();
        $.boundaries = reader.typedArray(position, 4, Float32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.BucketizeOptions();
        $.boundaries = reader.typedArray(json.boundaries, Float32Array);
        return $;
    }
};

cir_root.circle.GeluOptions = class GeluOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.GeluOptions();
        $.approximate = reader.bool_(position, 4, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.GeluOptions();
        $.approximate = reader.value(json.approximate, false);
        return $;
    }
};

cir_root.circle.DynamicUpdateSliceOptions = class DynamicUpdateSliceOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.DynamicUpdateSliceOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.DynamicUpdateSliceOptions();
        return $;
    }
};

cir_root.circle.UnsortedSegmentProdOptions = class UnsortedSegmentProdOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.UnsortedSegmentProdOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.UnsortedSegmentProdOptions();
        return $;
    }
};

cir_root.circle.UnsortedSegmentMaxOptions = class UnsortedSegmentMaxOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.UnsortedSegmentMaxOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.UnsortedSegmentMaxOptions();
        return $;
    }
};

cir_root.circle.UnsortedSegmentSumOptions = class UnsortedSegmentSumOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.UnsortedSegmentSumOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.UnsortedSegmentSumOptions();
        return $;
    }
};

cir_root.circle.ATan2Options = class ATan2Options {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.ATan2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.ATan2Options();
        return $;
    }
};

cir_root.circle.UnsortedSegmentMinOptions = class UnsortedSegmentMinOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.UnsortedSegmentMinOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.UnsortedSegmentMinOptions();
        return $;
    }
};

cir_root.circle.SignOptions = class SignOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.SignOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.SignOptions();
        return $;
    }
};

cir_root.circle.BitcastOptions = class BitcastOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.BitcastOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.BitcastOptions();
        return $;
    }
};

cir_root.circle.BitwiseXorOptions = class BitwiseXorOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.BitwiseXorOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.BitwiseXorOptions();
        return $;
    }
};

cir_root.circle.RightShiftOptions = class RightShiftOptions {

    static decode(/* reader, position */) {
        const $ = new cir_root.circle.RightShiftOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new cir_root.circle.RightShiftOptions();
        return $;
    }
};

cir_root.circle.BCQGatherOptions = class BCQGatherOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.BCQGatherOptions();
        $.input_hidden_size = reader.int32_(position, 4, 0);
        $.axis = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.BCQGatherOptions();
        $.input_hidden_size = reader.value(json.input_hidden_size, 0);
        $.axis = reader.value(json.axis, 0);
        return $;
    }
};

cir_root.circle.BCQFullyConnectedOptions = class BCQFullyConnectedOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.BCQFullyConnectedOptions();
        $.weights_hidden_size = reader.int32_(position, 4, 0);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.BCQFullyConnectedOptions();
        $.weights_hidden_size = reader.value(json.weights_hidden_size, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

cir_root.circle.InstanceNormOptions = class InstanceNormOptions {

    static decode(reader, position) {
        const $ = new cir_root.circle.InstanceNormOptions();
        $.epsilon = reader.float32_(position, 4, 0);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.InstanceNormOptions();
        $.epsilon = reader.value(json.epsilon, 0);
        $.fused_activation_function = cir_root.circle.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

cir_root.circle.OperatorCode = class OperatorCode {

    static decode(reader, position) {
        const $ = new cir_root.circle.OperatorCode();
        $.deprecated_builtin_code = reader.int8_(position, 4, 0);
        $.custom_code = reader.string_(position, 6, null);
        $.version = reader.int32_(position, 8, 1);
        $.builtin_code = reader.int32_(position, 10, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.OperatorCode();
        $.deprecated_builtin_code = reader.value(json.deprecated_builtin_code, 0);
        $.custom_code = reader.value(json.custom_code, null);
        $.version = reader.value(json.version, 1);
        $.builtin_code = cir_root.circle.BuiltinOperator[json.builtin_code];
        return $;
    }
};

cir_root.circle.CustomOptionsFormat = {
    FLEXBUFFERS: 0
};

cir_root.circle.DataFormat = {
    CHANNELS_LAST: 0,
    CHANNELS_FIRST: 1
};

cir_root.circle.Operator = class Operator {

    static decode(reader, position) {
        const $ = new cir_root.circle.Operator();
        $.opcode_index = reader.uint32_(position, 4, 0);
        $.inputs = reader.typedArray(position, 6, Int32Array);
        $.outputs = reader.typedArray(position, 8, Int32Array);
        $.builtin_options = reader.union(position, 10, cir_root.circle.BuiltinOptions.decode);
        $.custom_options = reader.typedArray(position, 14, Uint8Array);
        $.custom_options_format = reader.int8_(position, 16, 0);
        $.mutating_variable_inputs = reader.bools_(position, 18);
        $.intermediates = reader.typedArray(position, 20, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Operator();
        $.opcode_index = reader.value(json.opcode_index, 0);
        $.inputs = reader.typedArray(json.inputs, Int32Array);
        $.outputs = reader.typedArray(json.outputs, Int32Array);
        $.builtin_options = cir_root.circle.BuiltinOptions.decodeText(reader, json.builtin_options, json.builtin_options_type);
        $.custom_options = reader.typedArray(json.custom_options, Uint8Array);
        $.custom_options_format = cir_root.circle.CustomOptionsFormat[json.custom_options_format];
        $.mutating_variable_inputs = reader.array(json.mutating_variable_inputs);
        $.intermediates = reader.typedArray(json.intermediates, Int32Array);
        return $;
    }
};

cir_root.circle.SubGraph = class SubGraph {

    static decode(reader, position) {
        const $ = new cir_root.circle.SubGraph();
        $.tensors = reader.tableArray(position, 4, cir_root.circle.Tensor.decode);
        $.inputs = reader.typedArray(position, 6, Int32Array);
        $.outputs = reader.typedArray(position, 8, Int32Array);
        $.operators = reader.tableArray(position, 10, cir_root.circle.Operator.decode);
        $.name = reader.string_(position, 12, null);
        $.data_format = reader.int8_(position, 14, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SubGraph();
        $.tensors = reader.objectArray(json.tensors, cir_root.circle.Tensor.decodeText);
        $.inputs = reader.typedArray(json.inputs, Int32Array);
        $.outputs = reader.typedArray(json.outputs, Int32Array);
        $.operators = reader.objectArray(json.operators, cir_root.circle.Operator.decodeText);
        $.name = reader.value(json.name, null);
        $.data_format = cir_root.circle.DataFormat[json.data_format];
        return $;
    }
};

cir_root.circle.Buffer = class Buffer {

    static decode(reader, position) {
        const $ = new cir_root.circle.Buffer();
        $.data = reader.typedArray(position, 4, Uint8Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Buffer();
        $.data = reader.typedArray(json.data, Uint8Array);
        return $;
    }
};

cir_root.circle.Metadata = class Metadata {

    static decode(reader, position) {
        const $ = new cir_root.circle.Metadata();
        $.name = reader.string_(position, 4, null);
        $.buffer = reader.uint32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Metadata();
        $.name = reader.value(json.name, null);
        $.buffer = reader.value(json.buffer, 0);
        return $;
    }
};

cir_root.circle.TensorMap = class TensorMap {

    static decode(reader, position) {
        const $ = new cir_root.circle.TensorMap();
        $.name = reader.string_(position, 4, null);
        $.tensor_index = reader.uint32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.TensorMap();
        $.name = reader.value(json.name, null);
        $.tensor_index = reader.value(json.tensor_index, 0);
        return $;
    }
};

cir_root.circle.SignatureDef = class SignatureDef {

    static decode(reader, position) {
        const $ = new cir_root.circle.SignatureDef();
        $.inputs = reader.tableArray(position, 4, cir_root.circle.TensorMap.decode);
        $.outputs = reader.tableArray(position, 6, cir_root.circle.TensorMap.decode);
        $.signature_key = reader.string_(position, 8, null);
        $.deprecated_tag = reader.string_(position, 10, null);
        $.subgraph_index = reader.uint32_(position, 12, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.SignatureDef();
        $.inputs = reader.objectArray(json.inputs, cir_root.circle.TensorMap.decodeText);
        $.outputs = reader.objectArray(json.outputs, cir_root.circle.TensorMap.decodeText);
        $.signature_key = reader.value(json.signature_key, null);
        $.deprecated_tag = reader.value(json.deprecated_tag, null);
        $.subgraph_index = reader.value(json.subgraph_index, 0);
        return $;
    }
};

cir_root.circle.Model = class Model {

    static identifier(reader) {
        return reader.identifier === 'CIR0';
    }

    static create(reader) {
        return cir_root.circle.Model.decode(reader, reader.root);
    }

    static createText(reader) {
        return cir_root.circle.Model.decodeText(reader, reader.root);
    }

    static decode(reader, position) {
        const $ = new cir_root.circle.Model();
        $.version = reader.uint32_(position, 4, 0);
        $.operator_codes = reader.tableArray(position, 6, cir_root.circle.OperatorCode.decode);
        $.subgraphs = reader.tableArray(position, 8, cir_root.circle.SubGraph.decode);
        $.description = reader.string_(position, 10, null);
        $.buffers = reader.tableArray(position, 12, cir_root.circle.Buffer.decode);
        $.metadata_buffer = reader.typedArray(position, 14, Int32Array);
        $.metadata = reader.tableArray(position, 16, cir_root.circle.Metadata.decode);
        $.signature_defs = reader.tableArray(position, 18, cir_root.circle.SignatureDef.decode);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new cir_root.circle.Model();
        $.version = reader.value(json.version, 0);
        $.operator_codes = reader.objectArray(json.operator_codes, cir_root.circle.OperatorCode.decodeText);
        $.subgraphs = reader.objectArray(json.subgraphs, cir_root.circle.SubGraph.decodeText);
        $.description = reader.value(json.description, null);
        $.buffers = reader.objectArray(json.buffers, cir_root.circle.Buffer.decodeText);
        $.metadata_buffer = reader.typedArray(json.metadata_buffer, Int32Array);
        $.metadata = reader.objectArray(json.metadata, cir_root.circle.Metadata.decodeText);
        $.signature_defs = reader.objectArray(json.signature_defs, cir_root.circle.SignatureDef.decodeText);
        return $;
    }
};
