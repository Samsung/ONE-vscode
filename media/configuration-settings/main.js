// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

const vscode = acquireVsCodeApi();

console.log('view from javascript.');

const import = {
    type: 'import',
    able: false,
    options: [
        {optionName: 'bcq', optionValue: false},
        {optionName: 'onnx', optionValue: false},
        {optionName: 'tf', optionValue: false},
        {optionName: 'tflite', optionValue: false}
    ]
}

const import_bcq = {
    type: 'import_bcq',
    able: false,
    options: [
        {optionName: 'v1', optionValue: false},
        {optionName: 'v2', optionValue: false},
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: 'input_arrays', optionValue: ''},
        {optionName: 'input_shapes', optionValue: ''},
        {optionName: 'output_arrays', optionValue: ''},

    ]
}

const import_onnx = {
    type: 'import_onnx',
    able: false,
    options: [
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: 'input_arrays', optionValue: ''},
        {optionName: 'output_arrays', optionValue: ''},
        {optionName: 'model_format', optionValue: ''},
        {optionName: 'converter_verstion', optionValue: ''},
    ]
}

const import_tf = {
    type: 'import_tf',
    able: false,
    options: [
        {optionName: 'v1', optionValue: false},
        {optionName: 'v2', optionValue: false},
        {optionName: 'graph_def', optionValue: false},
        {optionName: 'saved_model', optionValue: false},
        {optionName: 'keras_model', optionValue: false},
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: 'input_arrays', optionValue: ''},
        {optionName: 'output_arrays', optionValue: ''},
        {optionName: 'input_shapes', optionValue: ''},
    ]
}

const import_tflite = {
    type: 'import_tflite',
    able: false,
    options: [
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
    ]
}

const optimize = {
    type: 'optimize',
    able: false,
    options: [
        {optionName: 'p', optionValue: false},
        {optionName: 'change_outputs', optionValue: false},
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: '01', optionValue: false},
        {optionName: 'conver_nchw_to_nhwd', optionValue: false},
        {optionName: 'nchw_to_nhwc_input_shape', optionValue: false},
        {optionName: 'nchw_to_nhwc_output_shape', optionValue: false},
        {optionName: 'fold_add_v2', optionValue: false},
        {optionName: 'fold_cast', optionValue: false},
        {optionName: 'fold_dequantize', optionValue: false},
        {optionName: 'fold_sparse_to_dense', optionValue: false},
        {optionName: 'forward_reshape_to_unaryop', optionValue: false},
        {optionName: 'fuse_add_with_tconv', optionValue: false},
        {optionName: 'fuse_batchnorm_with_conv', optionValue: false},
        {optionName: 'fuse_batchnorm_with_dwconv', optionValue: false},
        {optionName: 'fuse_batchnorm_with_tconv', optionValue: false},
        {optionName: 'fuse_bcq', optionValue: false},
        {optionName: 'fuse_preactivation_batchnorm', optionValue: false},
        {optionName: 'fuse_mean_with_mean', optionValue: false},
        {optionName: 'fuse_transpose_with_mean', optionValue: false},
        {optionName: 'make_batchnorm_gamma_positive', optionValue: false},
        {optionName: 'fuse_activation_function', optionValue: false},
        {optionName: 'fuse_instnorm ', optionValue: false},
        {optionName: 'replace_cw_mul_add_with_depthwise_conv', optionValue: false},
        {optionName: 'remove_fakequant', optionValue: false},
        {optionName: 'remove_quantdequant', optionValue: false},
        {optionName: 'remove_redundant_reshape', optionValue: false},
        {optionName: 'remove_redundant_transpose', optionValue: false},
        {optionName: 'remove_unnecessary_reshape', optionValue: false},
        {optionName: 'remove_unnecessary_slice', optionValue: false},
        {optionName: 'remove_unnecessary_strided_slice', optionValue: false},
        {optionName: 'remove_unnecessary_split', optionValue: false},
        {optionName: 'resolve_customop_add', optionValue: false},
        {optionName: 'resolve_customop_batchmatmul', optionValue: false},
        {optionName: 'resolve_customop_matmul', optionValue: false},
        {optionName: 'resolve_customop_max_pool_with_argmax', optionValue: false},
        {optionName: 'shuffle_weight_to_16x1float32', optionValue: false},
        {optionName: 'substitute_pack_to_reshape', optionValue: false},
        {optionName: 'substitute_squeeze_to_reshape', optionValue: false},
        {optionName: 'substitute_strided_slice_to_reshape', optionValue: false},
        {optionName: 'substitute_transpose_to_reshape', optionValue: false},
        {optionName: 'transform_min_max_to_relu6', optionValue: false},
        {optionName: 'transform_min_relu_to_relu6', optionValue: false},
    ]
}

const pack = {
    type: 'pack',
    able: false,
    options: [
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
    ]
}

const quantize = {
    type: 'pack',
    able: false,
    options: [
        {optionName: 'input_path', optionValue: ''},
        {optionName: 'input_data', optionValue: ''},
        {optionName: 'input_data_format', optionValue: ''},
        {optionName: 'output_path', optionValue: ''},
        {optionName: 'p', optionValue: false},
        {optionName: 'input_dtype', optionValue: ''},
        {optionName: 'quantized_dtype', optionValue: ''},
        {optionName: 'granularity', optionValue: ''},
        {optionName: 'min_percentile', optionValue: ''},
        {optionName: 'min_percentile', optionValue: ''},
        {optionName: 'max_percentile', optionValue: ''},
        {optionName: 'mode', optionValue: ''},
    ]
}

const codegen = {
    type: 'codegen',
    able: false,
    options: [
        {optionName: 'backend', optionValue: ''},
        {optionName: 'command', optionValue: ''},
    ]
}

const profile = {
    type: 'profile',
    able: false,
    options: [
        {optionName: 'backend', optionValue: ''},
        {optionName: 'command', optionValue: ''},
    ]
}