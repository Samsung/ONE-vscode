/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
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

/* eslint-disable */
const optionValues = {
  ActivationFunctionType: [
    "NONE",
    "RELU",
    "RELU_N1_TO_1",
    "RELU6",
    "TANH",
    "SIGN_BIT",
  ],
  Padding: ["SAME", "VALID"],
  LSHProjectionType: ["UNKNOWN", "SPARSE", "DENSE"],
  DimensionType: ["DENSE", "SPARSE_CSR"],
  FullyConnectedOptionsWeightsFormat: [
    "DEFAULT",
    "SHUFFLED4x16INT8",
    "SHUFFLED16x1FLOAT32",
  ],
  LSTMKernelType: ["FULL", "BASIC"],
  CombinerType: ["SUM", "MEAN", "SQRTN"],
  MirrorPadMode: ["REFLECT", "SYMMETRIC"],
  CustomOptionsFormat: ["FLEXBUFFERS"],
  DataFormat: ["CHANNELS_LAST", "CHANNELS_FIRST"],
};

const tensorType = [
  "FLOAT32",
  "FLOAT16",
  "INT32",
  "UINT8",
  "INT64",
  "BOOLEAN",
  "INT16",
  "INT8",
  "FLOAT64",
];

const customType = ["int", "boolean", "string"];
