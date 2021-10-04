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

import * as flatbuffers from 'flatbuffers';
import {readFileSync} from 'fs';

import {BuiltinOptions} from './circle-analysis/circle/builtin-options';
import {Model} from './circle-analysis/circle/model';
import {ModelOperator, Node, NodeAttributes, NodeInput, NodeOutput, NodeProperties} from './type/types';
import {getNodeInputs} from './util/getNodeInputs';
import {getNodeOutputs} from './util/getNodeOutputs';
import {initBuiltInOperator} from './util/initBuiltinOptions';
import {initSubgraphNodes} from './util/initSubgraphNodes';
import {setAttributesByOption} from './util/setAttributesByOption';

export function decoder(path: string) {
  const file = readFileSync(path);
  const buffer = file instanceof Uint8Array ? file : new Uint8Array(file);
  const bb = new flatbuffers.ByteBuffer(buffer);
  const model = Model.getRootAsModel(bb);
  const subgraphsLength = model.subgraphsLength();

  let resultArr: Array<ModelOperator> = [];
  let builtInOperatorArr: Array<String> = initBuiltInOperator(model);

  // init subgraphs
  let subgraph = model.subgraphs(0)!;

  for (let subgraphIdx = 0; subgraphIdx < subgraphsLength; subgraphIdx++) {
    // indirect bb_pos to next subgraph index
    model.subgraphs(subgraphIdx, subgraph);

    let nodesArr: Array<Node> = initSubgraphNodes(subgraph);  // init node array

    // The inputs and outputs from the operator mean the location of the tensor
    for (let operatorIdx = 0; operatorIdx < subgraph.operatorsLength(); operatorIdx++) {
      let operator = subgraph.operators(operatorIdx)!;
      let operatorType = builtInOperatorArr[operator.opcodeIndex()];
      let operatorLocation = operatorIdx;
      let operatorProp: NodeProperties = {type: operatorType, location: operatorLocation};

      // get node attribute
      let option = BuiltinOptions[operator.builtinOptionsType()];
      let operatorAttribute: Array<NodeAttributes> = [];

      setAttributesByOption(option, operator, operatorAttribute);

      // get node inputs
      let nodeInputs: Array<NodeInput> = getNodeInputs(model, subgraph, operator, nodesArr);
      // get node outputs
      let nodeOutputs: Array<NodeOutput> = getNodeOutputs(operator, nodesArr);
      // get builtin-option of node
      let builtinoptions = BuiltinOptions[operator.builtinOptionsType()];

      let modelOper: ModelOperator = {
        builtinoptions: builtinoptions,
        properties: operatorProp,
        attributes: operatorAttribute,
        inputs: nodeInputs,
        outputs: nodeOutputs
      };

      resultArr.push(modelOper);
    }
  }

  let jsondata = JSON.stringify(resultArr);
  return jsondata;
};
