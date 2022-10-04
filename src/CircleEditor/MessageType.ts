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

/**
 * Custom message types to communicate with vscode and webviews
 */

// Response Message for loadModel function, which contains circle model data
export interface ResponseModel {
  command: string;
  type: string;
  offset: number;
  length: number;
  total: number;
  responseArray: Uint8Array;
}

// Message to inform model path to webview
export interface ResponseModelPath {
  command: string;
  type: string;
  value: string;
}

// Message to inform metadata to webview
export interface ResponseFileRequest {
  command: string;
  response: string;
}

// Message from webviews to request custom editor feature
//
// Example
//   - command : 'edit'
//   - type : 'attribute'
//   - data : {'name': 'Conv2D',
//            '_attribute': {'name': 'padding', '_value': 'SAME','_type': 'Padding'},
//            '_nodeIdx':'1','_subgraphIdx': '0'}
export interface RequestMessage {
  command: string;
  type: string;
  data: any;
}

// Message to inform custom operator information
//
// Example
//   - command : 'customType'
//   - data : {'_subgraphIdx': '2',
//            '_nodeIdx': '1',
//            '_type': {'adj_x': 'boolean', 'adj_y': 'boolean','T': 'int'}
export interface CustomInfoMessage {
  command: string;
  data: any;
}

// Response Message to load circle model in JSON format
// This can be combined into CustomInfoMessage interface with modified name (ex. ResponseData)
// if additional field is not required.
export interface ResponseJson {
  command: string;
  data: string;
}
