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

declare type Node = {
  name: String; type: Int32Array;
};

declare type NodeProperties = {
  type: String,
  location: Number
};

declare type NodeAttributes = {
  attribute: String,
  value: string | Number | Boolean | Int32Array | null
};

declare type NodeInput = {
  location: Number,
  name: String,
  type: Int32Array,
  edge: Boolean
};

declare type NodeOutput = {
  location: Number,
  name: String,
  type: Int32Array
};

declare type ModelOperator = {
  builtinoptions: String,
  properties: NodeProperties,
  attributes: Array<NodeAttributes>,
  inputs: Array<NodeInput>,
  outputs: Array<NodeOutput>
};

export {Node, NodeAttributes, NodeInput, NodeOutput, NodeProperties, ModelOperator};
