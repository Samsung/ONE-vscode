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

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

const oneImport = {
  type: "one-import",
  use: true,
  options: [
    { optionName: "bcq", optionValue: false },
    { optionName: "onnx", optionValue: false },
    { optionName: "tf", optionValue: false },
    { optionName: "tflite", optionValue: false },
  ],
};

const oneImportBcq = {
  type: "one-import-bcq",
  use: false,
  options: [
    {
      optionName: "converter_version",
      optionValue: "v1",
      optionType: ["v1", "v2"],
    },
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "input_arrays", optionValue: "" },
    { optionName: "input_shapes", optionValue: "" },
    { optionName: "output_arrays", optionValue: "" },
  ],
};

const oneImportOnnx = {
  type: "one-import-onnx",
  use: false,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "input_arrays", optionValue: "" },
    { optionName: "output_arrays", optionValue: "" },
    { optionName: "model_format", optionValue: "" },
    { optionName: "converter_verstion", optionValue: "" },
  ],
};

const oneImportTf = {
  type: "one-import-tf",
  use: false,
  options: [
    {
      optionName: "converter_version",
      optionValue: "v1",
      optionType: ["v1", "v2"],
    },
    {
      optionName: "model_format",
      optionValue: "graph_def",
      optionType: ["graph_def", "saved_model", "keras_model"],
    },
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "input_arrays", optionValue: "" },
    { optionName: "output_arrays", optionValue: "" },
    { optionName: "input_shapes", optionValue: "" },
  ],
};

const oneImportTflite = {
  type: "one-import-tflite",
  use: false,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
  ],
};

const oneImportOptions = [
  oneImportBcq,
  oneImportOnnx,
  oneImportTf,
  oneImportTflite,
];

const oneOptimize = {
  type: "one-optimize",
  use: true,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "generate_profile_data", optionValue: false },
    { optionName: "change_outputs", optionValue: false },
    { optionName: "01", optionValue: false },
    { optionName: "conver_nchw_to_nhwd", optionValue: false },
    { optionName: "nchw_to_nhwc_input_shape", optionValue: false },
    { optionName: "nchw_to_nhwc_output_shape", optionValue: false },
    { optionName: "fold_add_v2", optionValue: false },
    { optionName: "fold_cast", optionValue: false },
    { optionName: "fold_dequantize", optionValue: false },
    { optionName: "fold_sparse_to_dense", optionValue: false },
    { optionName: "forward_reshape_to_unaryop", optionValue: false },
    { optionName: "fuse_add_with_tconv", optionValue: false },
    { optionName: "fuse_batchnorm_with_conv", optionValue: false },
    { optionName: "fuse_batchnorm_with_dwconv", optionValue: false },
    { optionName: "fuse_batchnorm_with_tconv", optionValue: false },
    { optionName: "fuse_bcq", optionValue: false },
    { optionName: "fuse_preactivation_batchnorm", optionValue: false },
    { optionName: "fuse_mean_with_mean", optionValue: false },
    { optionName: "fuse_transpose_with_mean", optionValue: false },
    { optionName: "make_batchnorm_gamma_positive", optionValue: false },
    { optionName: "fuse_activation_function", optionValue: false },
    { optionName: "fuse_instnorm ", optionValue: false },
    {
      optionName: "replace_cw_mul_add_with_depthwise_conv",
      optionValue: false,
    },
    { optionName: "remove_fakequant", optionValue: false },
    { optionName: "remove_quantdequant", optionValue: false },
    { optionName: "remove_redundant_reshape", optionValue: false },
    { optionName: "remove_redundant_transpose", optionValue: false },
    { optionName: "remove_unnecessary_reshape", optionValue: false },
    { optionName: "remove_unnecessary_slice", optionValue: false },
    { optionName: "remove_unnecessary_strided_slice", optionValue: false },
    { optionName: "remove_unnecessary_split", optionValue: false },
    { optionName: "resolve_customop_add", optionValue: false },
    { optionName: "resolve_customop_batchmatmul", optionValue: false },
    { optionName: "resolve_customop_matmul", optionValue: false },
    { optionName: "resolve_customop_max_pool_with_argmax", optionValue: false },
    { optionName: "shuffle_weight_to_16x1float32", optionValue: false },
    { optionName: "substitute_pack_to_reshape", optionValue: false },
    { optionName: "substitute_squeeze_to_reshape", optionValue: false },
    { optionName: "substitute_strided_slice_to_reshape", optionValue: false },
    { optionName: "substitute_transpose_to_reshape", optionValue: false },
    { optionName: "transform_min_max_to_relu6", optionValue: false },
    { optionName: "transform_min_relu_to_relu6", optionValue: false },
  ],
};

const oneQuantize = {
  type: "one-quantize",
  use: true,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "input_data", optionValue: "" },
    { optionName: "input_data_format", optionValue: "" },
    { optionName: "input_dtype", optionValue: "" },
    { optionName: "quantized_dtype", optionValue: "" },
    { optionName: "granularity", optionValue: "" },
    { optionName: "min_percentile", optionValue: "" },
    { optionName: "min_percentile", optionValue: "" },
    { optionName: "max_percentile", optionValue: "" },
    { optionName: "mode", optionValue: "" },
    { optionName: "generate_profile_data", optionValue: false },
  ],
};

const onePack = {
  type: "one-pack",
  use: true,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
  ],
};

const oneCodegen = {
  type: "one-codegen",
  use: false,
  options: [
    { optionName: "backend", optionValue: "" },
    { optionName: "command", optionValue: "" },
  ],
};

const oneProfile = {
  type: "one-profile",
  use: false,
  options: [
    { optionName: "backend", optionValue: "" },
    { optionName: "command", optionValue: "" },
  ],
};

// this is entire options for ONE compile
const oneToolList = [
  oneImportBcq,
  oneImportOnnx,
  oneImportTf,
  oneImportTflite,
  oneOptimize,
  oneQuantize,
  onePack,
  oneCodegen,
  oneProfile,
];
