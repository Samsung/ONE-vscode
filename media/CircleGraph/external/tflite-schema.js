var tfl_root = flatbuffers.get('tflite');

tfl_root.tflite = tfl_root.tflite || {};

tfl_root.tflite.TensorType = {
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
    UINT32: 15
};

tfl_root.tflite.CustomQuantization = class CustomQuantization {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.CustomQuantization();
        $.custom = reader.typedArray(position, 4, Uint8Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.CustomQuantization();
        $.custom = reader.typedArray(json.custom, Uint8Array);
        return $;
    }
};

tfl_root.tflite.QuantizationDetails = class {

    static decode(reader, position, type) {
        switch (type) {
            case 1: return tfl_root.tflite.CustomQuantization.decode(reader, position);
        }
        return undefined;
    }

    static decodeText(reader, json, type) {
        switch (type) {
            case 'CustomQuantization': return tfl_root.tflite.CustomQuantization.decodeText(reader, json);
        }
        return undefined;
    }
};

tfl_root.tflite.QuantizationParameters = class QuantizationParameters {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.QuantizationParameters();
        $.min = reader.typedArray(position, 4, Float32Array);
        $.max = reader.typedArray(position, 6, Float32Array);
        $.scale = reader.typedArray(position, 8, Float32Array);
        $.zero_point = reader.int64s_(position, 10);
        $.details = reader.union(position, 12, tfl_root.tflite.QuantizationDetails.decode);
        $.quantized_dimension = reader.int32_(position, 16, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.QuantizationParameters();
        $.min = reader.typedArray(json.min, Float32Array);
        $.max = reader.typedArray(json.max, Float32Array);
        $.scale = reader.typedArray(json.scale, Float32Array);
        $.zero_point = reader.array(json.zero_point);
        $.details = tfl_root.tflite.QuantizationDetails.decodeText(reader, json.details, json.details_type);
        $.quantized_dimension = reader.value(json.quantized_dimension, 0);
        return $;
    }
};

tfl_root.tflite.DimensionType = {
    DENSE: 0,
    SPARSE_CSR: 1
};

tfl_root.tflite.Int32Vector = class Int32Vector {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Int32Vector();
        $.values = reader.typedArray(position, 4, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Int32Vector();
        $.values = reader.typedArray(json.values, Int32Array);
        return $;
    }
};

tfl_root.tflite.Uint16Vector = class Uint16Vector {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Uint16Vector();
        $.values = reader.typedArray(position, 4, Uint16Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Uint16Vector();
        $.values = reader.typedArray(json.values, Uint16Array);
        return $;
    }
};

tfl_root.tflite.Uint8Vector = class Uint8Vector {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Uint8Vector();
        $.values = reader.typedArray(position, 4, Uint8Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Uint8Vector();
        $.values = reader.typedArray(json.values, Uint8Array);
        return $;
    }
};

tfl_root.tflite.SparseIndexVector = class {

    static decode(reader, position, type) {
        switch (type) {
            case 1: return tfl_root.tflite.Int32Vector.decode(reader, position);
            case 2: return tfl_root.tflite.Uint16Vector.decode(reader, position);
            case 3: return tfl_root.tflite.Uint8Vector.decode(reader, position);
        }
        return undefined;
    }

    static decodeText(reader, json, type) {
        switch (type) {
            case 'Int32Vector': return tfl_root.tflite.Int32Vector.decodeText(reader, json);
            case 'Uint16Vector': return tfl_root.tflite.Uint16Vector.decodeText(reader, json);
            case 'Uint8Vector': return tfl_root.tflite.Uint8Vector.decodeText(reader, json);
        }
        return undefined;
    }
};

tfl_root.tflite.DimensionMetadata = class DimensionMetadata {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.DimensionMetadata();
        $.format = reader.int8_(position, 4, 0);
        $.dense_size = reader.int32_(position, 6, 0);
        $.array_segments = reader.union(position, 8, tfl_root.tflite.SparseIndexVector.decode);
        $.array_indices = reader.union(position, 12, tfl_root.tflite.SparseIndexVector.decode);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.DimensionMetadata();
        $.format = tfl_root.tflite.DimensionType[json.format];
        $.dense_size = reader.value(json.dense_size, 0);
        $.array_segments = tfl_root.tflite.SparseIndexVector.decodeText(reader, json.array_segments, json.array_segments_type);
        $.array_indices = tfl_root.tflite.SparseIndexVector.decodeText(reader, json.array_indices, json.array_indices_type);
        return $;
    }
};

tfl_root.tflite.SparsityParameters = class SparsityParameters {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SparsityParameters();
        $.traversal_order = reader.typedArray(position, 4, Int32Array);
        $.block_map = reader.typedArray(position, 6, Int32Array);
        $.dim_metadata = reader.tableArray(position, 8, tfl_root.tflite.DimensionMetadata.decode);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SparsityParameters();
        $.traversal_order = reader.typedArray(json.traversal_order, Int32Array);
        $.block_map = reader.typedArray(json.block_map, Int32Array);
        $.dim_metadata = reader.objectArray(json.dim_metadata, tfl_root.tflite.DimensionMetadata.decodeText);
        return $;
    }
};

tfl_root.tflite.Tensor = class Tensor {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Tensor();
        $.shape = reader.typedArray(position, 4, Int32Array);
        $.type = reader.int8_(position, 6, 0);
        $.buffer = reader.uint32_(position, 8, 0);
        $.name = reader.string_(position, 10, null);
        $.quantization = reader.table(position, 12, tfl_root.tflite.QuantizationParameters.decode);
        $.is_variable = reader.bool_(position, 14, false);
        $.sparsity = reader.table(position, 16, tfl_root.tflite.SparsityParameters.decode);
        $.shape_signature = reader.typedArray(position, 18, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Tensor();
        $.shape = reader.typedArray(json.shape, Int32Array);
        $.type = tfl_root.tflite.TensorType[json.type];
        $.buffer = reader.value(json.buffer, 0);
        $.name = reader.value(json.name, null);
        $.quantization = reader.object(json.quantization, tfl_root.tflite.QuantizationParameters.decodeText);
        $.is_variable = reader.value(json.is_variable, false);
        $.sparsity = reader.object(json.sparsity, tfl_root.tflite.SparsityParameters.decodeText);
        $.shape_signature = reader.typedArray(json.shape_signature, Int32Array);
        return $;
    }
};

tfl_root.tflite.BuiltinOperator = {
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
    RANDOM_STANDARD_NORMAL: 146
};

tfl_root.tflite.BuiltinOptions = class {

    static decode(reader, position, type) {
        switch (type) {
            case 1: return tfl_root.tflite.Conv2DOptions.decode(reader, position);
            case 2: return tfl_root.tflite.DepthwiseConv2DOptions.decode(reader, position);
            case 3: return tfl_root.tflite.ConcatEmbeddingsOptions.decode(reader, position);
            case 4: return tfl_root.tflite.LSHProjectionOptions.decode(reader, position);
            case 5: return tfl_root.tflite.Pool2DOptions.decode(reader, position);
            case 6: return tfl_root.tflite.SVDFOptions.decode(reader, position);
            case 7: return tfl_root.tflite.RNNOptions.decode(reader, position);
            case 8: return tfl_root.tflite.FullyConnectedOptions.decode(reader, position);
            case 9: return tfl_root.tflite.SoftmaxOptions.decode(reader, position);
            case 10: return tfl_root.tflite.ConcatenationOptions.decode(reader, position);
            case 11: return tfl_root.tflite.AddOptions.decode(reader, position);
            case 12: return tfl_root.tflite.L2NormOptions.decode(reader, position);
            case 13: return tfl_root.tflite.LocalResponseNormalizationOptions.decode(reader, position);
            case 14: return tfl_root.tflite.LSTMOptions.decode(reader, position);
            case 15: return tfl_root.tflite.ResizeBilinearOptions.decode(reader, position);
            case 16: return tfl_root.tflite.CallOptions.decode(reader, position);
            case 17: return tfl_root.tflite.ReshapeOptions.decode(reader, position);
            case 18: return tfl_root.tflite.SkipGramOptions.decode(reader, position);
            case 19: return tfl_root.tflite.SpaceToDepthOptions.decode(reader, position);
            case 20: return tfl_root.tflite.EmbeddingLookupSparseOptions.decode(reader, position);
            case 21: return tfl_root.tflite.MulOptions.decode(reader, position);
            case 22: return tfl_root.tflite.PadOptions.decode(reader, position);
            case 23: return tfl_root.tflite.GatherOptions.decode(reader, position);
            case 24: return tfl_root.tflite.BatchToSpaceNDOptions.decode(reader, position);
            case 25: return tfl_root.tflite.SpaceToBatchNDOptions.decode(reader, position);
            case 26: return tfl_root.tflite.TransposeOptions.decode(reader, position);
            case 27: return tfl_root.tflite.ReducerOptions.decode(reader, position);
            case 28: return tfl_root.tflite.SubOptions.decode(reader, position);
            case 29: return tfl_root.tflite.DivOptions.decode(reader, position);
            case 30: return tfl_root.tflite.SqueezeOptions.decode(reader, position);
            case 31: return tfl_root.tflite.SequenceRNNOptions.decode(reader, position);
            case 32: return tfl_root.tflite.StridedSliceOptions.decode(reader, position);
            case 33: return tfl_root.tflite.ExpOptions.decode(reader, position);
            case 34: return tfl_root.tflite.TopKV2Options.decode(reader, position);
            case 35: return tfl_root.tflite.SplitOptions.decode(reader, position);
            case 36: return tfl_root.tflite.LogSoftmaxOptions.decode(reader, position);
            case 37: return tfl_root.tflite.CastOptions.decode(reader, position);
            case 38: return tfl_root.tflite.DequantizeOptions.decode(reader, position);
            case 39: return tfl_root.tflite.MaximumMinimumOptions.decode(reader, position);
            case 40: return tfl_root.tflite.ArgMaxOptions.decode(reader, position);
            case 41: return tfl_root.tflite.LessOptions.decode(reader, position);
            case 42: return tfl_root.tflite.NegOptions.decode(reader, position);
            case 43: return tfl_root.tflite.PadV2Options.decode(reader, position);
            case 44: return tfl_root.tflite.GreaterOptions.decode(reader, position);
            case 45: return tfl_root.tflite.GreaterEqualOptions.decode(reader, position);
            case 46: return tfl_root.tflite.LessEqualOptions.decode(reader, position);
            case 47: return tfl_root.tflite.SelectOptions.decode(reader, position);
            case 48: return tfl_root.tflite.SliceOptions.decode(reader, position);
            case 49: return tfl_root.tflite.TransposeConvOptions.decode(reader, position);
            case 50: return tfl_root.tflite.SparseToDenseOptions.decode(reader, position);
            case 51: return tfl_root.tflite.TileOptions.decode(reader, position);
            case 52: return tfl_root.tflite.ExpandDimsOptions.decode(reader, position);
            case 53: return tfl_root.tflite.EqualOptions.decode(reader, position);
            case 54: return tfl_root.tflite.NotEqualOptions.decode(reader, position);
            case 55: return tfl_root.tflite.ShapeOptions.decode(reader, position);
            case 56: return tfl_root.tflite.PowOptions.decode(reader, position);
            case 57: return tfl_root.tflite.ArgMinOptions.decode(reader, position);
            case 58: return tfl_root.tflite.FakeQuantOptions.decode(reader, position);
            case 59: return tfl_root.tflite.PackOptions.decode(reader, position);
            case 60: return tfl_root.tflite.LogicalOrOptions.decode(reader, position);
            case 61: return tfl_root.tflite.OneHotOptions.decode(reader, position);
            case 62: return tfl_root.tflite.LogicalAndOptions.decode(reader, position);
            case 63: return tfl_root.tflite.LogicalNotOptions.decode(reader, position);
            case 64: return tfl_root.tflite.UnpackOptions.decode(reader, position);
            case 65: return tfl_root.tflite.FloorDivOptions.decode(reader, position);
            case 66: return tfl_root.tflite.SquareOptions.decode(reader, position);
            case 67: return tfl_root.tflite.ZerosLikeOptions.decode(reader, position);
            case 68: return tfl_root.tflite.FillOptions.decode(reader, position);
            case 69: return tfl_root.tflite.BidirectionalSequenceLSTMOptions.decode(reader, position);
            case 70: return tfl_root.tflite.BidirectionalSequenceRNNOptions.decode(reader, position);
            case 71: return tfl_root.tflite.UnidirectionalSequenceLSTMOptions.decode(reader, position);
            case 72: return tfl_root.tflite.FloorModOptions.decode(reader, position);
            case 73: return tfl_root.tflite.RangeOptions.decode(reader, position);
            case 74: return tfl_root.tflite.ResizeNearestNeighborOptions.decode(reader, position);
            case 75: return tfl_root.tflite.LeakyReluOptions.decode(reader, position);
            case 76: return tfl_root.tflite.SquaredDifferenceOptions.decode(reader, position);
            case 77: return tfl_root.tflite.MirrorPadOptions.decode(reader, position);
            case 78: return tfl_root.tflite.AbsOptions.decode(reader, position);
            case 79: return tfl_root.tflite.SplitVOptions.decode(reader, position);
            case 80: return tfl_root.tflite.UniqueOptions.decode(reader, position);
            case 81: return tfl_root.tflite.ReverseV2Options.decode(reader, position);
            case 82: return tfl_root.tflite.AddNOptions.decode(reader, position);
            case 83: return tfl_root.tflite.GatherNdOptions.decode(reader, position);
            case 84: return tfl_root.tflite.CosOptions.decode(reader, position);
            case 85: return tfl_root.tflite.WhereOptions.decode(reader, position);
            case 86: return tfl_root.tflite.RankOptions.decode(reader, position);
            case 87: return tfl_root.tflite.ReverseSequenceOptions.decode(reader, position);
            case 88: return tfl_root.tflite.MatrixDiagOptions.decode(reader, position);
            case 89: return tfl_root.tflite.QuantizeOptions.decode(reader, position);
            case 90: return tfl_root.tflite.MatrixSetDiagOptions.decode(reader, position);
            case 91: return tfl_root.tflite.HardSwishOptions.decode(reader, position);
            case 92: return tfl_root.tflite.IfOptions.decode(reader, position);
            case 93: return tfl_root.tflite.WhileOptions.decode(reader, position);
            case 94: return tfl_root.tflite.DepthToSpaceOptions.decode(reader, position);
            case 95: return tfl_root.tflite.NonMaxSuppressionV4Options.decode(reader, position);
            case 96: return tfl_root.tflite.NonMaxSuppressionV5Options.decode(reader, position);
            case 97: return tfl_root.tflite.ScatterNdOptions.decode(reader, position);
            case 98: return tfl_root.tflite.SelectV2Options.decode(reader, position);
            case 99: return tfl_root.tflite.DensifyOptions.decode(reader, position);
            case 100: return tfl_root.tflite.SegmentSumOptions.decode(reader, position);
            case 101: return tfl_root.tflite.BatchMatMulOptions.decode(reader, position);
            case 102: return tfl_root.tflite.CumsumOptions.decode(reader, position);
            case 103: return tfl_root.tflite.CallOnceOptions.decode(reader, position);
            case 104: return tfl_root.tflite.BroadcastToOptions.decode(reader, position);
            case 105: return tfl_root.tflite.Rfft2dOptions.decode(reader, position);
            case 106: return tfl_root.tflite.Conv3DOptions.decode(reader, position);
            case 107: return tfl_root.tflite.HashtableOptions.decode(reader, position);
            case 108: return tfl_root.tflite.HashtableFindOptions.decode(reader, position);
            case 109: return tfl_root.tflite.HashtableImportOptions.decode(reader, position);
            case 110: return tfl_root.tflite.HashtableSizeOptions.decode(reader, position);
            case 111: return tfl_root.tflite.VarHandleOptions.decode(reader, position);
            case 112: return tfl_root.tflite.ReadVariableOptions.decode(reader, position);
            case 113: return tfl_root.tflite.AssignVariableOptions.decode(reader, position);
            case 114: return tfl_root.tflite.RandomOptions.decode(reader, position);
        }
        return undefined;
    }

    static decodeText(reader, json, type) {
        switch (type) {
            case 'Conv2DOptions': return tfl_root.tflite.Conv2DOptions.decodeText(reader, json);
            case 'DepthwiseConv2DOptions': return tfl_root.tflite.DepthwiseConv2DOptions.decodeText(reader, json);
            case 'ConcatEmbeddingsOptions': return tfl_root.tflite.ConcatEmbeddingsOptions.decodeText(reader, json);
            case 'LSHProjectionOptions': return tfl_root.tflite.LSHProjectionOptions.decodeText(reader, json);
            case 'Pool2DOptions': return tfl_root.tflite.Pool2DOptions.decodeText(reader, json);
            case 'SVDFOptions': return tfl_root.tflite.SVDFOptions.decodeText(reader, json);
            case 'RNNOptions': return tfl_root.tflite.RNNOptions.decodeText(reader, json);
            case 'FullyConnectedOptions': return tfl_root.tflite.FullyConnectedOptions.decodeText(reader, json);
            case 'SoftmaxOptions': return tfl_root.tflite.SoftmaxOptions.decodeText(reader, json);
            case 'ConcatenationOptions': return tfl_root.tflite.ConcatenationOptions.decodeText(reader, json);
            case 'AddOptions': return tfl_root.tflite.AddOptions.decodeText(reader, json);
            case 'L2NormOptions': return tfl_root.tflite.L2NormOptions.decodeText(reader, json);
            case 'LocalResponseNormalizationOptions': return tfl_root.tflite.LocalResponseNormalizationOptions.decodeText(reader, json);
            case 'LSTMOptions': return tfl_root.tflite.LSTMOptions.decodeText(reader, json);
            case 'ResizeBilinearOptions': return tfl_root.tflite.ResizeBilinearOptions.decodeText(reader, json);
            case 'CallOptions': return tfl_root.tflite.CallOptions.decodeText(reader, json);
            case 'ReshapeOptions': return tfl_root.tflite.ReshapeOptions.decodeText(reader, json);
            case 'SkipGramOptions': return tfl_root.tflite.SkipGramOptions.decodeText(reader, json);
            case 'SpaceToDepthOptions': return tfl_root.tflite.SpaceToDepthOptions.decodeText(reader, json);
            case 'EmbeddingLookupSparseOptions': return tfl_root.tflite.EmbeddingLookupSparseOptions.decodeText(reader, json);
            case 'MulOptions': return tfl_root.tflite.MulOptions.decodeText(reader, json);
            case 'PadOptions': return tfl_root.tflite.PadOptions.decodeText(reader, json);
            case 'GatherOptions': return tfl_root.tflite.GatherOptions.decodeText(reader, json);
            case 'BatchToSpaceNDOptions': return tfl_root.tflite.BatchToSpaceNDOptions.decodeText(reader, json);
            case 'SpaceToBatchNDOptions': return tfl_root.tflite.SpaceToBatchNDOptions.decodeText(reader, json);
            case 'TransposeOptions': return tfl_root.tflite.TransposeOptions.decodeText(reader, json);
            case 'ReducerOptions': return tfl_root.tflite.ReducerOptions.decodeText(reader, json);
            case 'SubOptions': return tfl_root.tflite.SubOptions.decodeText(reader, json);
            case 'DivOptions': return tfl_root.tflite.DivOptions.decodeText(reader, json);
            case 'SqueezeOptions': return tfl_root.tflite.SqueezeOptions.decodeText(reader, json);
            case 'SequenceRNNOptions': return tfl_root.tflite.SequenceRNNOptions.decodeText(reader, json);
            case 'StridedSliceOptions': return tfl_root.tflite.StridedSliceOptions.decodeText(reader, json);
            case 'ExpOptions': return tfl_root.tflite.ExpOptions.decodeText(reader, json);
            case 'TopKV2Options': return tfl_root.tflite.TopKV2Options.decodeText(reader, json);
            case 'SplitOptions': return tfl_root.tflite.SplitOptions.decodeText(reader, json);
            case 'LogSoftmaxOptions': return tfl_root.tflite.LogSoftmaxOptions.decodeText(reader, json);
            case 'CastOptions': return tfl_root.tflite.CastOptions.decodeText(reader, json);
            case 'DequantizeOptions': return tfl_root.tflite.DequantizeOptions.decodeText(reader, json);
            case 'MaximumMinimumOptions': return tfl_root.tflite.MaximumMinimumOptions.decodeText(reader, json);
            case 'ArgMaxOptions': return tfl_root.tflite.ArgMaxOptions.decodeText(reader, json);
            case 'LessOptions': return tfl_root.tflite.LessOptions.decodeText(reader, json);
            case 'NegOptions': return tfl_root.tflite.NegOptions.decodeText(reader, json);
            case 'PadV2Options': return tfl_root.tflite.PadV2Options.decodeText(reader, json);
            case 'GreaterOptions': return tfl_root.tflite.GreaterOptions.decodeText(reader, json);
            case 'GreaterEqualOptions': return tfl_root.tflite.GreaterEqualOptions.decodeText(reader, json);
            case 'LessEqualOptions': return tfl_root.tflite.LessEqualOptions.decodeText(reader, json);
            case 'SelectOptions': return tfl_root.tflite.SelectOptions.decodeText(reader, json);
            case 'SliceOptions': return tfl_root.tflite.SliceOptions.decodeText(reader, json);
            case 'TransposeConvOptions': return tfl_root.tflite.TransposeConvOptions.decodeText(reader, json);
            case 'SparseToDenseOptions': return tfl_root.tflite.SparseToDenseOptions.decodeText(reader, json);
            case 'TileOptions': return tfl_root.tflite.TileOptions.decodeText(reader, json);
            case 'ExpandDimsOptions': return tfl_root.tflite.ExpandDimsOptions.decodeText(reader, json);
            case 'EqualOptions': return tfl_root.tflite.EqualOptions.decodeText(reader, json);
            case 'NotEqualOptions': return tfl_root.tflite.NotEqualOptions.decodeText(reader, json);
            case 'ShapeOptions': return tfl_root.tflite.ShapeOptions.decodeText(reader, json);
            case 'PowOptions': return tfl_root.tflite.PowOptions.decodeText(reader, json);
            case 'ArgMinOptions': return tfl_root.tflite.ArgMinOptions.decodeText(reader, json);
            case 'FakeQuantOptions': return tfl_root.tflite.FakeQuantOptions.decodeText(reader, json);
            case 'PackOptions': return tfl_root.tflite.PackOptions.decodeText(reader, json);
            case 'LogicalOrOptions': return tfl_root.tflite.LogicalOrOptions.decodeText(reader, json);
            case 'OneHotOptions': return tfl_root.tflite.OneHotOptions.decodeText(reader, json);
            case 'LogicalAndOptions': return tfl_root.tflite.LogicalAndOptions.decodeText(reader, json);
            case 'LogicalNotOptions': return tfl_root.tflite.LogicalNotOptions.decodeText(reader, json);
            case 'UnpackOptions': return tfl_root.tflite.UnpackOptions.decodeText(reader, json);
            case 'FloorDivOptions': return tfl_root.tflite.FloorDivOptions.decodeText(reader, json);
            case 'SquareOptions': return tfl_root.tflite.SquareOptions.decodeText(reader, json);
            case 'ZerosLikeOptions': return tfl_root.tflite.ZerosLikeOptions.decodeText(reader, json);
            case 'FillOptions': return tfl_root.tflite.FillOptions.decodeText(reader, json);
            case 'BidirectionalSequenceLSTMOptions': return tfl_root.tflite.BidirectionalSequenceLSTMOptions.decodeText(reader, json);
            case 'BidirectionalSequenceRNNOptions': return tfl_root.tflite.BidirectionalSequenceRNNOptions.decodeText(reader, json);
            case 'UnidirectionalSequenceLSTMOptions': return tfl_root.tflite.UnidirectionalSequenceLSTMOptions.decodeText(reader, json);
            case 'FloorModOptions': return tfl_root.tflite.FloorModOptions.decodeText(reader, json);
            case 'RangeOptions': return tfl_root.tflite.RangeOptions.decodeText(reader, json);
            case 'ResizeNearestNeighborOptions': return tfl_root.tflite.ResizeNearestNeighborOptions.decodeText(reader, json);
            case 'LeakyReluOptions': return tfl_root.tflite.LeakyReluOptions.decodeText(reader, json);
            case 'SquaredDifferenceOptions': return tfl_root.tflite.SquaredDifferenceOptions.decodeText(reader, json);
            case 'MirrorPadOptions': return tfl_root.tflite.MirrorPadOptions.decodeText(reader, json);
            case 'AbsOptions': return tfl_root.tflite.AbsOptions.decodeText(reader, json);
            case 'SplitVOptions': return tfl_root.tflite.SplitVOptions.decodeText(reader, json);
            case 'UniqueOptions': return tfl_root.tflite.UniqueOptions.decodeText(reader, json);
            case 'ReverseV2Options': return tfl_root.tflite.ReverseV2Options.decodeText(reader, json);
            case 'AddNOptions': return tfl_root.tflite.AddNOptions.decodeText(reader, json);
            case 'GatherNdOptions': return tfl_root.tflite.GatherNdOptions.decodeText(reader, json);
            case 'CosOptions': return tfl_root.tflite.CosOptions.decodeText(reader, json);
            case 'WhereOptions': return tfl_root.tflite.WhereOptions.decodeText(reader, json);
            case 'RankOptions': return tfl_root.tflite.RankOptions.decodeText(reader, json);
            case 'ReverseSequenceOptions': return tfl_root.tflite.ReverseSequenceOptions.decodeText(reader, json);
            case 'MatrixDiagOptions': return tfl_root.tflite.MatrixDiagOptions.decodeText(reader, json);
            case 'QuantizeOptions': return tfl_root.tflite.QuantizeOptions.decodeText(reader, json);
            case 'MatrixSetDiagOptions': return tfl_root.tflite.MatrixSetDiagOptions.decodeText(reader, json);
            case 'HardSwishOptions': return tfl_root.tflite.HardSwishOptions.decodeText(reader, json);
            case 'IfOptions': return tfl_root.tflite.IfOptions.decodeText(reader, json);
            case 'WhileOptions': return tfl_root.tflite.WhileOptions.decodeText(reader, json);
            case 'DepthToSpaceOptions': return tfl_root.tflite.DepthToSpaceOptions.decodeText(reader, json);
            case 'NonMaxSuppressionV4Options': return tfl_root.tflite.NonMaxSuppressionV4Options.decodeText(reader, json);
            case 'NonMaxSuppressionV5Options': return tfl_root.tflite.NonMaxSuppressionV5Options.decodeText(reader, json);
            case 'ScatterNdOptions': return tfl_root.tflite.ScatterNdOptions.decodeText(reader, json);
            case 'SelectV2Options': return tfl_root.tflite.SelectV2Options.decodeText(reader, json);
            case 'DensifyOptions': return tfl_root.tflite.DensifyOptions.decodeText(reader, json);
            case 'SegmentSumOptions': return tfl_root.tflite.SegmentSumOptions.decodeText(reader, json);
            case 'BatchMatMulOptions': return tfl_root.tflite.BatchMatMulOptions.decodeText(reader, json);
            case 'CumsumOptions': return tfl_root.tflite.CumsumOptions.decodeText(reader, json);
            case 'CallOnceOptions': return tfl_root.tflite.CallOnceOptions.decodeText(reader, json);
            case 'BroadcastToOptions': return tfl_root.tflite.BroadcastToOptions.decodeText(reader, json);
            case 'Rfft2dOptions': return tfl_root.tflite.Rfft2dOptions.decodeText(reader, json);
            case 'Conv3DOptions': return tfl_root.tflite.Conv3DOptions.decodeText(reader, json);
            case 'HashtableOptions': return tfl_root.tflite.HashtableOptions.decodeText(reader, json);
            case 'HashtableFindOptions': return tfl_root.tflite.HashtableFindOptions.decodeText(reader, json);
            case 'HashtableImportOptions': return tfl_root.tflite.HashtableImportOptions.decodeText(reader, json);
            case 'HashtableSizeOptions': return tfl_root.tflite.HashtableSizeOptions.decodeText(reader, json);
            case 'VarHandleOptions': return tfl_root.tflite.VarHandleOptions.decodeText(reader, json);
            case 'ReadVariableOptions': return tfl_root.tflite.ReadVariableOptions.decodeText(reader, json);
            case 'AssignVariableOptions': return tfl_root.tflite.AssignVariableOptions.decodeText(reader, json);
            case 'RandomOptions': return tfl_root.tflite.RandomOptions.decodeText(reader, json);
        }
        return undefined;
    }
};

tfl_root.tflite.Padding = {
    SAME: 0,
    VALID: 1
};

tfl_root.tflite.ActivationFunctionType = {
    NONE: 0,
    RELU: 1,
    RELU_N1_TO_1: 2,
    RELU6: 3,
    TANH: 4,
    SIGN_BIT: 5
};

tfl_root.tflite.Conv2DOptions = class Conv2DOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Conv2DOptions();
        $.padding = reader.int8_(position, 4, 0);
        $.stride_w = reader.int32_(position, 6, 0);
        $.stride_h = reader.int32_(position, 8, 0);
        $.fused_activation_function = reader.int8_(position, 10, 0);
        $.dilation_w_factor = reader.int32_(position, 12, 1);
        $.dilation_h_factor = reader.int32_(position, 14, 1);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Conv2DOptions();
        $.padding = tfl_root.tflite.Padding[json.padding];
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.dilation_w_factor = reader.value(json.dilation_w_factor, 1);
        $.dilation_h_factor = reader.value(json.dilation_h_factor, 1);
        return $;
    }
};

tfl_root.tflite.Conv3DOptions = class Conv3DOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Conv3DOptions();
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
        const $ = new tfl_root.tflite.Conv3DOptions();
        $.padding = tfl_root.tflite.Padding[json.padding];
        $.stride_d = reader.value(json.stride_d, 0);
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.dilation_d_factor = reader.value(json.dilation_d_factor, 1);
        $.dilation_w_factor = reader.value(json.dilation_w_factor, 1);
        $.dilation_h_factor = reader.value(json.dilation_h_factor, 1);
        return $;
    }
};

tfl_root.tflite.Pool2DOptions = class Pool2DOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Pool2DOptions();
        $.padding = reader.int8_(position, 4, 0);
        $.stride_w = reader.int32_(position, 6, 0);
        $.stride_h = reader.int32_(position, 8, 0);
        $.filter_width = reader.int32_(position, 10, 0);
        $.filter_height = reader.int32_(position, 12, 0);
        $.fused_activation_function = reader.int8_(position, 14, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Pool2DOptions();
        $.padding = tfl_root.tflite.Padding[json.padding];
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.filter_width = reader.value(json.filter_width, 0);
        $.filter_height = reader.value(json.filter_height, 0);
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

tfl_root.tflite.DepthwiseConv2DOptions = class DepthwiseConv2DOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.DepthwiseConv2DOptions();
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
        const $ = new tfl_root.tflite.DepthwiseConv2DOptions();
        $.padding = tfl_root.tflite.Padding[json.padding];
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        $.depth_multiplier = reader.value(json.depth_multiplier, 0);
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.dilation_w_factor = reader.value(json.dilation_w_factor, 1);
        $.dilation_h_factor = reader.value(json.dilation_h_factor, 1);
        return $;
    }
};

tfl_root.tflite.ConcatEmbeddingsOptions = class ConcatEmbeddingsOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ConcatEmbeddingsOptions();
        $.num_channels = reader.int32_(position, 4, 0);
        $.num_columns_per_channel = reader.typedArray(position, 6, Int32Array);
        $.embedding_dim_per_channel = reader.typedArray(position, 8, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ConcatEmbeddingsOptions();
        $.num_channels = reader.value(json.num_channels, 0);
        $.num_columns_per_channel = reader.typedArray(json.num_columns_per_channel, Int32Array);
        $.embedding_dim_per_channel = reader.typedArray(json.embedding_dim_per_channel, Int32Array);
        return $;
    }
};

tfl_root.tflite.LSHProjectionType = {
    UNKNOWN: 0,
    SPARSE: 1,
    DENSE: 2
};

tfl_root.tflite.LSHProjectionOptions = class LSHProjectionOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.LSHProjectionOptions();
        $.type = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.LSHProjectionOptions();
        $.type = tfl_root.tflite.LSHProjectionType[json.type];
        return $;
    }
};

tfl_root.tflite.SVDFOptions = class SVDFOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SVDFOptions();
        $.rank = reader.int32_(position, 4, 0);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        $.asymmetric_quantize_inputs = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SVDFOptions();
        $.rank = reader.value(json.rank, 0);
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.RNNOptions = class RNNOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.RNNOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.asymmetric_quantize_inputs = reader.bool_(position, 6, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.RNNOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.SequenceRNNOptions = class SequenceRNNOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SequenceRNNOptions();
        $.time_major = reader.bool_(position, 4, false);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        $.asymmetric_quantize_inputs = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SequenceRNNOptions();
        $.time_major = reader.value(json.time_major, false);
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.BidirectionalSequenceRNNOptions = class BidirectionalSequenceRNNOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.BidirectionalSequenceRNNOptions();
        $.time_major = reader.bool_(position, 4, false);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        $.merge_outputs = reader.bool_(position, 8, false);
        $.asymmetric_quantize_inputs = reader.bool_(position, 10, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.BidirectionalSequenceRNNOptions();
        $.time_major = reader.value(json.time_major, false);
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.merge_outputs = reader.value(json.merge_outputs, false);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.FullyConnectedOptionsWeightsFormat = {
    DEFAULT: 0,
    SHUFFLED4x16INT8: 1
};

tfl_root.tflite.FullyConnectedOptions = class FullyConnectedOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.FullyConnectedOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.weights_format = reader.int8_(position, 6, 0);
        $.keep_num_dims = reader.bool_(position, 8, false);
        $.asymmetric_quantize_inputs = reader.bool_(position, 10, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.FullyConnectedOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.weights_format = tfl_root.tflite.FullyConnectedOptionsWeightsFormat[json.weights_format];
        $.keep_num_dims = reader.value(json.keep_num_dims, false);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.SoftmaxOptions = class SoftmaxOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SoftmaxOptions();
        $.beta = reader.float32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SoftmaxOptions();
        $.beta = reader.value(json.beta, 0);
        return $;
    }
};

tfl_root.tflite.ConcatenationOptions = class ConcatenationOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ConcatenationOptions();
        $.axis = reader.int32_(position, 4, 0);
        $.fused_activation_function = reader.int8_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ConcatenationOptions();
        $.axis = reader.value(json.axis, 0);
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

tfl_root.tflite.AddOptions = class AddOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.AddOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.pot_scale_int16 = reader.bool_(position, 6, true);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.AddOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.pot_scale_int16 = reader.value(json.pot_scale_int16, true);
        return $;
    }
};

tfl_root.tflite.MulOptions = class MulOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.MulOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.MulOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

tfl_root.tflite.L2NormOptions = class L2NormOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.L2NormOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.L2NormOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

tfl_root.tflite.LocalResponseNormalizationOptions = class LocalResponseNormalizationOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.LocalResponseNormalizationOptions();
        $.radius = reader.int32_(position, 4, 0);
        $.bias = reader.float32_(position, 6, 0);
        $.alpha = reader.float32_(position, 8, 0);
        $.beta = reader.float32_(position, 10, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.LocalResponseNormalizationOptions();
        $.radius = reader.value(json.radius, 0);
        $.bias = reader.value(json.bias, 0);
        $.alpha = reader.value(json.alpha, 0);
        $.beta = reader.value(json.beta, 0);
        return $;
    }
};

tfl_root.tflite.LSTMKernelType = {
    FULL: 0,
    BASIC: 1
};

tfl_root.tflite.LSTMOptions = class LSTMOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.LSTMOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.cell_clip = reader.float32_(position, 6, 0);
        $.proj_clip = reader.float32_(position, 8, 0);
        $.kernel_type = reader.int8_(position, 10, 0);
        $.asymmetric_quantize_inputs = reader.bool_(position, 12, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.LSTMOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.cell_clip = reader.value(json.cell_clip, 0);
        $.proj_clip = reader.value(json.proj_clip, 0);
        $.kernel_type = tfl_root.tflite.LSTMKernelType[json.kernel_type];
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.UnidirectionalSequenceLSTMOptions = class UnidirectionalSequenceLSTMOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.UnidirectionalSequenceLSTMOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.cell_clip = reader.float32_(position, 6, 0);
        $.proj_clip = reader.float32_(position, 8, 0);
        $.time_major = reader.bool_(position, 10, false);
        $.asymmetric_quantize_inputs = reader.bool_(position, 12, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.UnidirectionalSequenceLSTMOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.cell_clip = reader.value(json.cell_clip, 0);
        $.proj_clip = reader.value(json.proj_clip, 0);
        $.time_major = reader.value(json.time_major, false);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.BidirectionalSequenceLSTMOptions = class BidirectionalSequenceLSTMOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.BidirectionalSequenceLSTMOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.cell_clip = reader.float32_(position, 6, 0);
        $.proj_clip = reader.float32_(position, 8, 0);
        $.merge_outputs = reader.bool_(position, 10, false);
        $.time_major = reader.bool_(position, 12, true);
        $.asymmetric_quantize_inputs = reader.bool_(position, 14, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.BidirectionalSequenceLSTMOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.cell_clip = reader.value(json.cell_clip, 0);
        $.proj_clip = reader.value(json.proj_clip, 0);
        $.merge_outputs = reader.value(json.merge_outputs, false);
        $.time_major = reader.value(json.time_major, true);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.ResizeBilinearOptions = class ResizeBilinearOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ResizeBilinearOptions();
        $.new_height = reader.int32_(position, 4, 0);
        $.new_width = reader.int32_(position, 6, 0);
        $.align_corners = reader.bool_(position, 8, false);
        $.half_pixel_centers = reader.bool_(position, 10, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ResizeBilinearOptions();
        $.new_height = reader.value(json.new_height, 0);
        $.new_width = reader.value(json.new_width, 0);
        $.align_corners = reader.value(json.align_corners, false);
        $.half_pixel_centers = reader.value(json.half_pixel_centers, false);
        return $;
    }
};

tfl_root.tflite.ResizeNearestNeighborOptions = class ResizeNearestNeighborOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ResizeNearestNeighborOptions();
        $.align_corners = reader.bool_(position, 4, false);
        $.half_pixel_centers = reader.bool_(position, 6, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ResizeNearestNeighborOptions();
        $.align_corners = reader.value(json.align_corners, false);
        $.half_pixel_centers = reader.value(json.half_pixel_centers, false);
        return $;
    }
};

tfl_root.tflite.CallOptions = class CallOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.CallOptions();
        $.subgraph = reader.uint32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.CallOptions();
        $.subgraph = reader.value(json.subgraph, 0);
        return $;
    }
};

tfl_root.tflite.PadOptions = class PadOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.PadOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.PadOptions();
        return $;
    }
};

tfl_root.tflite.PadV2Options = class PadV2Options {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.PadV2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.PadV2Options();
        return $;
    }
};

tfl_root.tflite.ReshapeOptions = class ReshapeOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ReshapeOptions();
        $.new_shape = reader.typedArray(position, 4, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ReshapeOptions();
        $.new_shape = reader.typedArray(json.new_shape, Int32Array);
        return $;
    }
};

tfl_root.tflite.SpaceToBatchNDOptions = class SpaceToBatchNDOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.SpaceToBatchNDOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.SpaceToBatchNDOptions();
        return $;
    }
};

tfl_root.tflite.BatchToSpaceNDOptions = class BatchToSpaceNDOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.BatchToSpaceNDOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.BatchToSpaceNDOptions();
        return $;
    }
};

tfl_root.tflite.SkipGramOptions = class SkipGramOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SkipGramOptions();
        $.ngram_size = reader.int32_(position, 4, 0);
        $.max_skip_size = reader.int32_(position, 6, 0);
        $.include_all_ngrams = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SkipGramOptions();
        $.ngram_size = reader.value(json.ngram_size, 0);
        $.max_skip_size = reader.value(json.max_skip_size, 0);
        $.include_all_ngrams = reader.value(json.include_all_ngrams, false);
        return $;
    }
};

tfl_root.tflite.SpaceToDepthOptions = class SpaceToDepthOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SpaceToDepthOptions();
        $.block_size = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SpaceToDepthOptions();
        $.block_size = reader.value(json.block_size, 0);
        return $;
    }
};

tfl_root.tflite.DepthToSpaceOptions = class DepthToSpaceOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.DepthToSpaceOptions();
        $.block_size = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.DepthToSpaceOptions();
        $.block_size = reader.value(json.block_size, 0);
        return $;
    }
};

tfl_root.tflite.SubOptions = class SubOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SubOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        $.pot_scale_int16 = reader.bool_(position, 6, true);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SubOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        $.pot_scale_int16 = reader.value(json.pot_scale_int16, true);
        return $;
    }
};

tfl_root.tflite.DivOptions = class DivOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.DivOptions();
        $.fused_activation_function = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.DivOptions();
        $.fused_activation_function = tfl_root.tflite.ActivationFunctionType[json.fused_activation_function];
        return $;
    }
};

tfl_root.tflite.TopKV2Options = class TopKV2Options {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.TopKV2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.TopKV2Options();
        return $;
    }
};

tfl_root.tflite.CombinerType = {
    SUM: 0,
    MEAN: 1,
    SQRTN: 2
};

tfl_root.tflite.EmbeddingLookupSparseOptions = class EmbeddingLookupSparseOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.EmbeddingLookupSparseOptions();
        $.combiner = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.EmbeddingLookupSparseOptions();
        $.combiner = tfl_root.tflite.CombinerType[json.combiner];
        return $;
    }
};

tfl_root.tflite.GatherOptions = class GatherOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.GatherOptions();
        $.axis = reader.int32_(position, 4, 0);
        $.batch_dims = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.GatherOptions();
        $.axis = reader.value(json.axis, 0);
        $.batch_dims = reader.value(json.batch_dims, 0);
        return $;
    }
};

tfl_root.tflite.TransposeOptions = class TransposeOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.TransposeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.TransposeOptions();
        return $;
    }
};

tfl_root.tflite.ExpOptions = class ExpOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.ExpOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.ExpOptions();
        return $;
    }
};

tfl_root.tflite.CosOptions = class CosOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.CosOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.CosOptions();
        return $;
    }
};

tfl_root.tflite.ReducerOptions = class ReducerOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ReducerOptions();
        $.keep_dims = reader.bool_(position, 4, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ReducerOptions();
        $.keep_dims = reader.value(json.keep_dims, false);
        return $;
    }
};

tfl_root.tflite.SqueezeOptions = class SqueezeOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SqueezeOptions();
        $.squeeze_dims = reader.typedArray(position, 4, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SqueezeOptions();
        $.squeeze_dims = reader.typedArray(json.squeeze_dims, Int32Array);
        return $;
    }
};

tfl_root.tflite.SplitOptions = class SplitOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SplitOptions();
        $.num_splits = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SplitOptions();
        $.num_splits = reader.value(json.num_splits, 0);
        return $;
    }
};

tfl_root.tflite.SplitVOptions = class SplitVOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SplitVOptions();
        $.num_splits = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SplitVOptions();
        $.num_splits = reader.value(json.num_splits, 0);
        return $;
    }
};

tfl_root.tflite.StridedSliceOptions = class StridedSliceOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.StridedSliceOptions();
        $.begin_mask = reader.int32_(position, 4, 0);
        $.end_mask = reader.int32_(position, 6, 0);
        $.ellipsis_mask = reader.int32_(position, 8, 0);
        $.new_axis_mask = reader.int32_(position, 10, 0);
        $.shrink_axis_mask = reader.int32_(position, 12, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.StridedSliceOptions();
        $.begin_mask = reader.value(json.begin_mask, 0);
        $.end_mask = reader.value(json.end_mask, 0);
        $.ellipsis_mask = reader.value(json.ellipsis_mask, 0);
        $.new_axis_mask = reader.value(json.new_axis_mask, 0);
        $.shrink_axis_mask = reader.value(json.shrink_axis_mask, 0);
        return $;
    }
};

tfl_root.tflite.LogSoftmaxOptions = class LogSoftmaxOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.LogSoftmaxOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.LogSoftmaxOptions();
        return $;
    }
};

tfl_root.tflite.CastOptions = class CastOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.CastOptions();
        $.in_data_type = reader.int8_(position, 4, 0);
        $.out_data_type = reader.int8_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.CastOptions();
        $.in_data_type = tfl_root.tflite.TensorType[json.in_data_type];
        $.out_data_type = tfl_root.tflite.TensorType[json.out_data_type];
        return $;
    }
};

tfl_root.tflite.DequantizeOptions = class DequantizeOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.DequantizeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.DequantizeOptions();
        return $;
    }
};

tfl_root.tflite.MaximumMinimumOptions = class MaximumMinimumOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.MaximumMinimumOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.MaximumMinimumOptions();
        return $;
    }
};

tfl_root.tflite.TileOptions = class TileOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.TileOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.TileOptions();
        return $;
    }
};

tfl_root.tflite.ArgMaxOptions = class ArgMaxOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ArgMaxOptions();
        $.output_type = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ArgMaxOptions();
        $.output_type = tfl_root.tflite.TensorType[json.output_type];
        return $;
    }
};

tfl_root.tflite.ArgMinOptions = class ArgMinOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ArgMinOptions();
        $.output_type = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ArgMinOptions();
        $.output_type = tfl_root.tflite.TensorType[json.output_type];
        return $;
    }
};

tfl_root.tflite.GreaterOptions = class GreaterOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.GreaterOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.GreaterOptions();
        return $;
    }
};

tfl_root.tflite.GreaterEqualOptions = class GreaterEqualOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.GreaterEqualOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.GreaterEqualOptions();
        return $;
    }
};

tfl_root.tflite.LessOptions = class LessOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.LessOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.LessOptions();
        return $;
    }
};

tfl_root.tflite.LessEqualOptions = class LessEqualOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.LessEqualOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.LessEqualOptions();
        return $;
    }
};

tfl_root.tflite.NegOptions = class NegOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.NegOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.NegOptions();
        return $;
    }
};

tfl_root.tflite.SelectOptions = class SelectOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.SelectOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.SelectOptions();
        return $;
    }
};

tfl_root.tflite.SliceOptions = class SliceOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.SliceOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.SliceOptions();
        return $;
    }
};

tfl_root.tflite.TransposeConvOptions = class TransposeConvOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.TransposeConvOptions();
        $.padding = reader.int8_(position, 4, 0);
        $.stride_w = reader.int32_(position, 6, 0);
        $.stride_h = reader.int32_(position, 8, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.TransposeConvOptions();
        $.padding = tfl_root.tflite.Padding[json.padding];
        $.stride_w = reader.value(json.stride_w, 0);
        $.stride_h = reader.value(json.stride_h, 0);
        return $;
    }
};

tfl_root.tflite.ExpandDimsOptions = class ExpandDimsOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.ExpandDimsOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.ExpandDimsOptions();
        return $;
    }
};

tfl_root.tflite.SparseToDenseOptions = class SparseToDenseOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SparseToDenseOptions();
        $.validate_indices = reader.bool_(position, 4, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SparseToDenseOptions();
        $.validate_indices = reader.value(json.validate_indices, false);
        return $;
    }
};

tfl_root.tflite.EqualOptions = class EqualOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.EqualOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.EqualOptions();
        return $;
    }
};

tfl_root.tflite.NotEqualOptions = class NotEqualOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.NotEqualOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.NotEqualOptions();
        return $;
    }
};

tfl_root.tflite.ShapeOptions = class ShapeOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ShapeOptions();
        $.out_type = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ShapeOptions();
        $.out_type = tfl_root.tflite.TensorType[json.out_type];
        return $;
    }
};

tfl_root.tflite.RankOptions = class RankOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.RankOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.RankOptions();
        return $;
    }
};

tfl_root.tflite.PowOptions = class PowOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.PowOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.PowOptions();
        return $;
    }
};

tfl_root.tflite.FakeQuantOptions = class FakeQuantOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.FakeQuantOptions();
        $.min = reader.float32_(position, 4, 0);
        $.max = reader.float32_(position, 6, 0);
        $.num_bits = reader.int32_(position, 8, 0);
        $.narrow_range = reader.bool_(position, 10, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.FakeQuantOptions();
        $.min = reader.value(json.min, 0);
        $.max = reader.value(json.max, 0);
        $.num_bits = reader.value(json.num_bits, 0);
        $.narrow_range = reader.value(json.narrow_range, false);
        return $;
    }
};

tfl_root.tflite.PackOptions = class PackOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.PackOptions();
        $.values_count = reader.int32_(position, 4, 0);
        $.axis = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.PackOptions();
        $.values_count = reader.value(json.values_count, 0);
        $.axis = reader.value(json.axis, 0);
        return $;
    }
};

tfl_root.tflite.LogicalOrOptions = class LogicalOrOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.LogicalOrOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.LogicalOrOptions();
        return $;
    }
};

tfl_root.tflite.OneHotOptions = class OneHotOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.OneHotOptions();
        $.axis = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.OneHotOptions();
        $.axis = reader.value(json.axis, 0);
        return $;
    }
};

tfl_root.tflite.AbsOptions = class AbsOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.AbsOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.AbsOptions();
        return $;
    }
};

tfl_root.tflite.HardSwishOptions = class HardSwishOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.HardSwishOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.HardSwishOptions();
        return $;
    }
};

tfl_root.tflite.LogicalAndOptions = class LogicalAndOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.LogicalAndOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.LogicalAndOptions();
        return $;
    }
};

tfl_root.tflite.LogicalNotOptions = class LogicalNotOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.LogicalNotOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.LogicalNotOptions();
        return $;
    }
};

tfl_root.tflite.UnpackOptions = class UnpackOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.UnpackOptions();
        $.num = reader.int32_(position, 4, 0);
        $.axis = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.UnpackOptions();
        $.num = reader.value(json.num, 0);
        $.axis = reader.value(json.axis, 0);
        return $;
    }
};

tfl_root.tflite.FloorDivOptions = class FloorDivOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.FloorDivOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.FloorDivOptions();
        return $;
    }
};

tfl_root.tflite.SquareOptions = class SquareOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.SquareOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.SquareOptions();
        return $;
    }
};

tfl_root.tflite.ZerosLikeOptions = class ZerosLikeOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.ZerosLikeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.ZerosLikeOptions();
        return $;
    }
};

tfl_root.tflite.FillOptions = class FillOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.FillOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.FillOptions();
        return $;
    }
};

tfl_root.tflite.FloorModOptions = class FloorModOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.FloorModOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.FloorModOptions();
        return $;
    }
};

tfl_root.tflite.RangeOptions = class RangeOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.RangeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.RangeOptions();
        return $;
    }
};

tfl_root.tflite.LeakyReluOptions = class LeakyReluOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.LeakyReluOptions();
        $.alpha = reader.float32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.LeakyReluOptions();
        $.alpha = reader.value(json.alpha, 0);
        return $;
    }
};

tfl_root.tflite.SquaredDifferenceOptions = class SquaredDifferenceOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.SquaredDifferenceOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.SquaredDifferenceOptions();
        return $;
    }
};

tfl_root.tflite.MirrorPadMode = {
    REFLECT: 0,
    SYMMETRIC: 1
};

tfl_root.tflite.MirrorPadOptions = class MirrorPadOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.MirrorPadOptions();
        $.mode = reader.int8_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.MirrorPadOptions();
        $.mode = tfl_root.tflite.MirrorPadMode[json.mode];
        return $;
    }
};

tfl_root.tflite.UniqueOptions = class UniqueOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.UniqueOptions();
        $.idx_out_type = reader.int8_(position, 4, 2);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.UniqueOptions();
        $.idx_out_type = tfl_root.tflite.TensorType[json.idx_out_type];
        return $;
    }
};

tfl_root.tflite.ReverseV2Options = class ReverseV2Options {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.ReverseV2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.ReverseV2Options();
        return $;
    }
};

tfl_root.tflite.AddNOptions = class AddNOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.AddNOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.AddNOptions();
        return $;
    }
};

tfl_root.tflite.GatherNdOptions = class GatherNdOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.GatherNdOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.GatherNdOptions();
        return $;
    }
};

tfl_root.tflite.WhereOptions = class WhereOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.WhereOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.WhereOptions();
        return $;
    }
};

tfl_root.tflite.ReverseSequenceOptions = class ReverseSequenceOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ReverseSequenceOptions();
        $.seq_dim = reader.int32_(position, 4, 0);
        $.batch_dim = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.ReverseSequenceOptions();
        $.seq_dim = reader.value(json.seq_dim, 0);
        $.batch_dim = reader.value(json.batch_dim, 0);
        return $;
    }
};

tfl_root.tflite.MatrixDiagOptions = class MatrixDiagOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.MatrixDiagOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.MatrixDiagOptions();
        return $;
    }
};

tfl_root.tflite.QuantizeOptions = class QuantizeOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.QuantizeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.QuantizeOptions();
        return $;
    }
};

tfl_root.tflite.MatrixSetDiagOptions = class MatrixSetDiagOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.MatrixSetDiagOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.MatrixSetDiagOptions();
        return $;
    }
};

tfl_root.tflite.IfOptions = class IfOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.IfOptions();
        $.then_subgraph_index = reader.int32_(position, 4, 0);
        $.else_subgraph_index = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.IfOptions();
        $.then_subgraph_index = reader.value(json.then_subgraph_index, 0);
        $.else_subgraph_index = reader.value(json.else_subgraph_index, 0);
        return $;
    }
};

tfl_root.tflite.CallOnceOptions = class CallOnceOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.CallOnceOptions();
        $.init_subgraph_index = reader.int32_(position, 4, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.CallOnceOptions();
        $.init_subgraph_index = reader.value(json.init_subgraph_index, 0);
        return $;
    }
};

tfl_root.tflite.WhileOptions = class WhileOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.WhileOptions();
        $.cond_subgraph_index = reader.int32_(position, 4, 0);
        $.body_subgraph_index = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.WhileOptions();
        $.cond_subgraph_index = reader.value(json.cond_subgraph_index, 0);
        $.body_subgraph_index = reader.value(json.body_subgraph_index, 0);
        return $;
    }
};

tfl_root.tflite.NonMaxSuppressionV4Options = class NonMaxSuppressionV4Options {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.NonMaxSuppressionV4Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.NonMaxSuppressionV4Options();
        return $;
    }
};

tfl_root.tflite.NonMaxSuppressionV5Options = class NonMaxSuppressionV5Options {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.NonMaxSuppressionV5Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.NonMaxSuppressionV5Options();
        return $;
    }
};

tfl_root.tflite.ScatterNdOptions = class ScatterNdOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.ScatterNdOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.ScatterNdOptions();
        return $;
    }
};

tfl_root.tflite.SelectV2Options = class SelectV2Options {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.SelectV2Options();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.SelectV2Options();
        return $;
    }
};

tfl_root.tflite.DensifyOptions = class DensifyOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.DensifyOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.DensifyOptions();
        return $;
    }
};

tfl_root.tflite.SegmentSumOptions = class SegmentSumOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.SegmentSumOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.SegmentSumOptions();
        return $;
    }
};

tfl_root.tflite.BatchMatMulOptions = class BatchMatMulOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.BatchMatMulOptions();
        $.adj_x = reader.bool_(position, 4, false);
        $.adj_y = reader.bool_(position, 6, false);
        $.asymmetric_quantize_inputs = reader.bool_(position, 8, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.BatchMatMulOptions();
        $.adj_x = reader.value(json.adj_x, false);
        $.adj_y = reader.value(json.adj_y, false);
        $.asymmetric_quantize_inputs = reader.value(json.asymmetric_quantize_inputs, false);
        return $;
    }
};

tfl_root.tflite.CumsumOptions = class CumsumOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.CumsumOptions();
        $.exclusive = reader.bool_(position, 4, false);
        $.reverse = reader.bool_(position, 6, false);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.CumsumOptions();
        $.exclusive = reader.value(json.exclusive, false);
        $.reverse = reader.value(json.reverse, false);
        return $;
    }
};

tfl_root.tflite.BroadcastToOptions = class BroadcastToOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.BroadcastToOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.BroadcastToOptions();
        return $;
    }
};

tfl_root.tflite.Rfft2dOptions = class Rfft2dOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.Rfft2dOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.Rfft2dOptions();
        return $;
    }
};

tfl_root.tflite.HashtableOptions = class HashtableOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.HashtableOptions();
        $.table_id = reader.int32_(position, 4, 0);
        $.key_dtype = reader.int8_(position, 6, 0);
        $.value_dtype = reader.int8_(position, 8, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.HashtableOptions();
        $.table_id = reader.value(json.table_id, 0);
        $.key_dtype = tfl_root.tflite.TensorType[json.key_dtype];
        $.value_dtype = tfl_root.tflite.TensorType[json.value_dtype];
        return $;
    }
};

tfl_root.tflite.HashtableFindOptions = class HashtableFindOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.HashtableFindOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.HashtableFindOptions();
        return $;
    }
};

tfl_root.tflite.HashtableImportOptions = class HashtableImportOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.HashtableImportOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.HashtableImportOptions();
        return $;
    }
};

tfl_root.tflite.HashtableSizeOptions = class HashtableSizeOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.HashtableSizeOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.HashtableSizeOptions();
        return $;
    }
};

tfl_root.tflite.VarHandleOptions = class VarHandleOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.VarHandleOptions();
        $.container = reader.string_(position, 4, null);
        $.shared_name = reader.string_(position, 6, null);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.VarHandleOptions();
        $.container = reader.value(json.container, null);
        $.shared_name = reader.value(json.shared_name, null);
        return $;
    }
};

tfl_root.tflite.ReadVariableOptions = class ReadVariableOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.ReadVariableOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.ReadVariableOptions();
        return $;
    }
};

tfl_root.tflite.AssignVariableOptions = class AssignVariableOptions {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.AssignVariableOptions();
        return $;
    }

    static decodeText(/* reader, json */) {
        const $ = new tfl_root.tflite.AssignVariableOptions();
        return $;
    }
};

tfl_root.tflite.RandomOptions = class RandomOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.RandomOptions();
        $.seed = reader.int32_(position, 4, 0);
        $.seed2 = reader.int32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.RandomOptions();
        $.seed = reader.value(json.seed, 0);
        $.seed2 = reader.value(json.seed2, 0);
        return $;
    }
};

tfl_root.tflite.OperatorCode = class OperatorCode {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.OperatorCode();
        $.deprecated_builtin_code = reader.int8_(position, 4, 0);
        $.custom_code = reader.string_(position, 6, null);
        $.version = reader.int32_(position, 8, 1);
        $.builtin_code = reader.int32_(position, 10, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.OperatorCode();
        $.deprecated_builtin_code = reader.value(json.deprecated_builtin_code, 0);
        $.custom_code = reader.value(json.custom_code, null);
        $.version = reader.value(json.version, 1);
        $.builtin_code = tfl_root.tflite.BuiltinOperator[json.builtin_code];
        return $;
    }
};

tfl_root.tflite.CustomOptionsFormat = {
    FLEXBUFFERS: 0
};

tfl_root.tflite.Operator = class Operator {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Operator();
        $.opcode_index = reader.uint32_(position, 4, 0);
        $.inputs = reader.typedArray(position, 6, Int32Array);
        $.outputs = reader.typedArray(position, 8, Int32Array);
        $.builtin_options = reader.union(position, 10, tfl_root.tflite.BuiltinOptions.decode);
        $.custom_options = reader.typedArray(position, 14, Uint8Array);
        $.custom_options_format = reader.int8_(position, 16, 0);
        $.mutating_variable_inputs = reader.bools_(position, 18);
        $.intermediates = reader.typedArray(position, 20, Int32Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Operator();
        $.opcode_index = reader.value(json.opcode_index, 0);
        $.inputs = reader.typedArray(json.inputs, Int32Array);
        $.outputs = reader.typedArray(json.outputs, Int32Array);
        $.builtin_options = tfl_root.tflite.BuiltinOptions.decodeText(reader, json.builtin_options, json.builtin_options_type);
        $.custom_options = reader.typedArray(json.custom_options, Uint8Array);
        $.custom_options_format = tfl_root.tflite.CustomOptionsFormat[json.custom_options_format];
        $.mutating_variable_inputs = reader.array(json.mutating_variable_inputs);
        $.intermediates = reader.typedArray(json.intermediates, Int32Array);
        return $;
    }
};

tfl_root.tflite.SubGraph = class SubGraph {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SubGraph();
        $.tensors = reader.tableArray(position, 4, tfl_root.tflite.Tensor.decode);
        $.inputs = reader.typedArray(position, 6, Int32Array);
        $.outputs = reader.typedArray(position, 8, Int32Array);
        $.operators = reader.tableArray(position, 10, tfl_root.tflite.Operator.decode);
        $.name = reader.string_(position, 12, null);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SubGraph();
        $.tensors = reader.objectArray(json.tensors, tfl_root.tflite.Tensor.decodeText);
        $.inputs = reader.typedArray(json.inputs, Int32Array);
        $.outputs = reader.typedArray(json.outputs, Int32Array);
        $.operators = reader.objectArray(json.operators, tfl_root.tflite.Operator.decodeText);
        $.name = reader.value(json.name, null);
        return $;
    }
};

tfl_root.tflite.Buffer = class Buffer {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Buffer();
        $.data = reader.typedArray(position, 4, Uint8Array);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Buffer();
        $.data = reader.typedArray(json.data, Uint8Array);
        return $;
    }
};

tfl_root.tflite.Metadata = class Metadata {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Metadata();
        $.name = reader.string_(position, 4, null);
        $.buffer = reader.uint32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Metadata();
        $.name = reader.value(json.name, null);
        $.buffer = reader.value(json.buffer, 0);
        return $;
    }
};

tfl_root.tflite.TensorMap = class TensorMap {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.TensorMap();
        $.name = reader.string_(position, 4, null);
        $.tensor_index = reader.uint32_(position, 6, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.TensorMap();
        $.name = reader.value(json.name, null);
        $.tensor_index = reader.value(json.tensor_index, 0);
        return $;
    }
};

tfl_root.tflite.SignatureDef = class SignatureDef {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SignatureDef();
        $.inputs = reader.tableArray(position, 4, tfl_root.tflite.TensorMap.decode);
        $.outputs = reader.tableArray(position, 6, tfl_root.tflite.TensorMap.decode);
        $.signature_key = reader.string_(position, 8, null);
        $.deprecated_tag = reader.string_(position, 10, null);
        $.subgraph_index = reader.uint32_(position, 12, 0);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.SignatureDef();
        $.inputs = reader.objectArray(json.inputs, tfl_root.tflite.TensorMap.decodeText);
        $.outputs = reader.objectArray(json.outputs, tfl_root.tflite.TensorMap.decodeText);
        $.signature_key = reader.value(json.signature_key, null);
        $.deprecated_tag = reader.value(json.deprecated_tag, null);
        $.subgraph_index = reader.value(json.subgraph_index, 0);
        return $;
    }
};

tfl_root.tflite.Model = class Model {

    static identifier(reader) {
        return reader.identifier === 'TFL3';
    }

    static create(reader) {
        return tfl_root.tflite.Model.decode(reader, reader.root);
    }

    static createText(reader) {
        return tfl_root.tflite.Model.decodeText(reader, reader.root);
    }

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Model();
        $.version = reader.uint32_(position, 4, 0);
        $.operator_codes = reader.tableArray(position, 6, tfl_root.tflite.OperatorCode.decode);
        $.subgraphs = reader.tableArray(position, 8, tfl_root.tflite.SubGraph.decode);
        $.description = reader.string_(position, 10, null);
        $.buffers = reader.tableArray(position, 12, tfl_root.tflite.Buffer.decode);
        $.metadata_buffer = reader.typedArray(position, 14, Int32Array);
        $.metadata = reader.tableArray(position, 16, tfl_root.tflite.Metadata.decode);
        $.signature_defs = reader.tableArray(position, 18, tfl_root.tflite.SignatureDef.decode);
        return $;
    }

    static decodeText(reader, json) {
        const $ = new tfl_root.tflite.Model();
        $.version = reader.value(json.version, 0);
        $.operator_codes = reader.objectArray(json.operator_codes, tfl_root.tflite.OperatorCode.decodeText);
        $.subgraphs = reader.objectArray(json.subgraphs, tfl_root.tflite.SubGraph.decodeText);
        $.description = reader.value(json.description, null);
        $.buffers = reader.objectArray(json.buffers, tfl_root.tflite.Buffer.decodeText);
        $.metadata_buffer = reader.typedArray(json.metadata_buffer, Int32Array);
        $.metadata = reader.objectArray(json.metadata, tfl_root.tflite.Metadata.decodeText);
        $.signature_defs = reader.objectArray(json.signature_defs, tfl_root.tflite.SignatureDef.decodeText);
        return $;
    }
};


tfl_root.tflite = tfl_root.tflite || {};

tfl_root.tflite.AssociatedFileType = {
    UNKNOWN: 0,
    DESCRIPTIONS: 1,
    TENSOR_AXIS_LABELS: 2,
    TENSOR_VALUE_LABELS: 3,
    TENSOR_AXIS_SCORE_CALIBRATION: 4,
    VOCABULARY: 5
};

tfl_root.tflite.AssociatedFile = class AssociatedFile {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.AssociatedFile();
        $.name = reader.string_(position, 4, null);
        $.description = reader.string_(position, 6, null);
        $.type = reader.int8_(position, 8, 0);
        $.locale = reader.string_(position, 10, null);
        return $;
    }
};

tfl_root.tflite.FeatureProperties = class FeatureProperties {

    static decode(/* reader, position */) {
        const $ = new tfl_root.tflite.FeatureProperties();
        return $;
    }
};

tfl_root.tflite.ColorSpaceType = {
    UNKNOWN: 0,
    RGB: 1,
    GRAYSCALE: 2
};

tfl_root.tflite.ImageSize = class ImageSize {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ImageSize();
        $.width = reader.uint32_(position, 4, 0);
        $.height = reader.uint32_(position, 6, 0);
        return $;
    }
};

tfl_root.tflite.ImageProperties = class ImageProperties {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ImageProperties();
        $.color_space = reader.int8_(position, 4, 0);
        $.default_size = reader.table(position, 6, tfl_root.tflite.ImageSize.decode);
        return $;
    }
};

tfl_root.tflite.BoundingBoxType = {
    UNKNOWN: 0,
    BOUNDARIES: 1,
    UPPER_LEFT: 2,
    CENTER: 3
};

tfl_root.tflite.AudioProperties = class AudioProperties {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.AudioProperties();
        $.sample_rate = reader.uint32_(position, 4, 0);
        $.channels = reader.uint32_(position, 6, 0);
        return $;
    }
};

tfl_root.tflite.CoordinateType = {
    RATIO: 0,
    PIXEL: 1
};

tfl_root.tflite.BoundingBoxProperties = class BoundingBoxProperties {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.BoundingBoxProperties();
        $.index = reader.typedArray(position, 4, Uint32Array);
        $.type = reader.int8_(position, 6, 0);
        $.coordinate_type = reader.int8_(position, 8, 0);
        return $;
    }
};

tfl_root.tflite.ContentProperties = class {

    static decode(reader, position, type) {
        switch (type) {
            case 1: return tfl_root.tflite.FeatureProperties.decode(reader, position);
            case 2: return tfl_root.tflite.ImageProperties.decode(reader, position);
            case 3: return tfl_root.tflite.BoundingBoxProperties.decode(reader, position);
            case 4: return tfl_root.tflite.AudioProperties.decode(reader, position);
        }
        return undefined;
    }

    static decodeText(reader, json, type) {
        switch (type) {
            case 'FeatureProperties': return tfl_root.tflite.FeatureProperties.decodeText(reader, json);
            case 'ImageProperties': return tfl_root.tflite.ImageProperties.decodeText(reader, json);
            case 'BoundingBoxProperties': return tfl_root.tflite.BoundingBoxProperties.decodeText(reader, json);
            case 'AudioProperties': return tfl_root.tflite.AudioProperties.decodeText(reader, json);
        }
        return undefined;
    }
};

tfl_root.tflite.ValueRange = class ValueRange {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ValueRange();
        $.min = reader.int32_(position, 4, 0);
        $.max = reader.int32_(position, 6, 0);
        return $;
    }
};

tfl_root.tflite.Content = class Content {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Content();
        $.content_properties = reader.union(position, 4, tfl_root.tflite.ContentProperties.decode);
        $.range = reader.table(position, 8, tfl_root.tflite.ValueRange.decode);
        return $;
    }
};

tfl_root.tflite.NormalizationOptions = class NormalizationOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.NormalizationOptions();
        $.mean = reader.typedArray(position, 4, Float32Array);
        $.std = reader.typedArray(position, 6, Float32Array);
        return $;
    }
};

tfl_root.tflite.ScoreTransformationType = {
    IDENTITY: 0,
    LOG: 1,
    INVERSE_LOGISTIC: 2
};

tfl_root.tflite.ScoreCalibrationOptions = class ScoreCalibrationOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ScoreCalibrationOptions();
        $.score_transformation = reader.int8_(position, 4, 0);
        $.default_score = reader.float32_(position, 6, 0);
        return $;
    }
};

tfl_root.tflite.ScoreThresholdingOptions = class ScoreThresholdingOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ScoreThresholdingOptions();
        $.global_score_threshold = reader.float32_(position, 4, 0);
        return $;
    }
};

tfl_root.tflite.BertTokenizerOptions = class BertTokenizerOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.BertTokenizerOptions();
        $.vocab_file = reader.tableArray(position, 4, tfl_root.tflite.AssociatedFile.decode);
        return $;
    }
};

tfl_root.tflite.SentencePieceTokenizerOptions = class SentencePieceTokenizerOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SentencePieceTokenizerOptions();
        $.sentencePiece_model = reader.tableArray(position, 4, tfl_root.tflite.AssociatedFile.decode);
        $.vocab_file = reader.tableArray(position, 6, tfl_root.tflite.AssociatedFile.decode);
        return $;
    }
};

tfl_root.tflite.RegexTokenizerOptions = class RegexTokenizerOptions {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.RegexTokenizerOptions();
        $.delim_regex_pattern = reader.string_(position, 4, null);
        $.vocab_file = reader.tableArray(position, 6, tfl_root.tflite.AssociatedFile.decode);
        return $;
    }
};

tfl_root.tflite.ProcessUnitOptions = class {

    static decode(reader, position, type) {
        switch (type) {
            case 1: return tfl_root.tflite.NormalizationOptions.decode(reader, position);
            case 2: return tfl_root.tflite.ScoreCalibrationOptions.decode(reader, position);
            case 3: return tfl_root.tflite.ScoreThresholdingOptions.decode(reader, position);
            case 4: return tfl_root.tflite.BertTokenizerOptions.decode(reader, position);
            case 5: return tfl_root.tflite.SentencePieceTokenizerOptions.decode(reader, position);
            case 6: return tfl_root.tflite.RegexTokenizerOptions.decode(reader, position);
        }
        return undefined;
    }

    static decodeText(reader, json, type) {
        switch (type) {
            case 'NormalizationOptions': return tfl_root.tflite.NormalizationOptions.decodeText(reader, json);
            case 'ScoreCalibrationOptions': return tfl_root.tflite.ScoreCalibrationOptions.decodeText(reader, json);
            case 'ScoreThresholdingOptions': return tfl_root.tflite.ScoreThresholdingOptions.decodeText(reader, json);
            case 'BertTokenizerOptions': return tfl_root.tflite.BertTokenizerOptions.decodeText(reader, json);
            case 'SentencePieceTokenizerOptions': return tfl_root.tflite.SentencePieceTokenizerOptions.decodeText(reader, json);
            case 'RegexTokenizerOptions': return tfl_root.tflite.RegexTokenizerOptions.decodeText(reader, json);
        }
        return undefined;
    }
};

tfl_root.tflite.ProcessUnit = class ProcessUnit {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ProcessUnit();
        $.options = reader.union(position, 4, tfl_root.tflite.ProcessUnitOptions.decode);
        return $;
    }
};

tfl_root.tflite.Stats = class Stats {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.Stats();
        $.max = reader.typedArray(position, 4, Float32Array);
        $.min = reader.typedArray(position, 6, Float32Array);
        return $;
    }
};

tfl_root.tflite.TensorGroup = class TensorGroup {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.TensorGroup();
        $.name = reader.string_(position, 4, null);
        $.tensor_names = reader.strings_(position, 6);
        return $;
    }
};

tfl_root.tflite.TensorMetadata = class TensorMetadata {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.TensorMetadata();
        $.name = reader.string_(position, 4, null);
        $.description = reader.string_(position, 6, null);
        $.dimension_names = reader.strings_(position, 8);
        $.content = reader.table(position, 10, tfl_root.tflite.Content.decode);
        $.process_units = reader.tableArray(position, 12, tfl_root.tflite.ProcessUnit.decode);
        $.stats = reader.table(position, 14, tfl_root.tflite.Stats.decode);
        $.associated_files = reader.tableArray(position, 16, tfl_root.tflite.AssociatedFile.decode);
        return $;
    }
};

tfl_root.tflite.SubGraphMetadata = class SubGraphMetadata {

    static decode(reader, position) {
        const $ = new tfl_root.tflite.SubGraphMetadata();
        $.name = reader.string_(position, 4, null);
        $.description = reader.string_(position, 6, null);
        $.input_tensor_metadata = reader.tableArray(position, 8, tfl_root.tflite.TensorMetadata.decode);
        $.output_tensor_metadata = reader.tableArray(position, 10, tfl_root.tflite.TensorMetadata.decode);
        $.associated_files = reader.tableArray(position, 12, tfl_root.tflite.AssociatedFile.decode);
        $.input_process_units = reader.tableArray(position, 14, tfl_root.tflite.ProcessUnit.decode);
        $.output_process_units = reader.tableArray(position, 16, tfl_root.tflite.ProcessUnit.decode);
        $.input_tensor_groups = reader.tableArray(position, 18, tfl_root.tflite.TensorGroup.decode);
        $.output_tensor_groups = reader.tableArray(position, 20, tfl_root.tflite.TensorGroup.decode);
        return $;
    }
};

tfl_root.tflite.ModelMetadata = class ModelMetadata {

    static identifier(reader) {
        return reader.identifier === 'M001';
    }

    static create(reader) {
        return tfl_root.tflite.ModelMetadata.decode(reader, reader.root);
    }

    static decode(reader, position) {
        const $ = new tfl_root.tflite.ModelMetadata();
        $.name = reader.string_(position, 4, null);
        $.description = reader.string_(position, 6, null);
        $.version = reader.string_(position, 8, null);
        $.subgraph_metadata = reader.tableArray(position, 10, tfl_root.tflite.SubGraphMetadata.decode);
        $.author = reader.string_(position, 12, null);
        $.license = reader.string_(position, 14, null);
        $.associated_files = reader.tableArray(position, 16, tfl_root.tflite.AssociatedFile.decode);
        $.min_parser_version = reader.string_(position, 18, null);
        return $;
    }
};
