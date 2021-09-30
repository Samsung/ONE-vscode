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

import {Model} from '../circle-analysis/circle/model';
import {Operator} from '../circle-analysis/circle/operator';
import {SubGraph} from '../circle-analysis/circle/sub-graph';
import {Node, NodeInput} from '../type/types';

export function getNodeInputs(
    model: Model, subgraph: SubGraph, operator: Operator, nodesArr: Array<Node>): Array<NodeInput> {
  let nodeInputs: Array<NodeInput> = [];
  let inputArr = operator.inputsArray()!;
  let inputLength = operator.inputsLength();

  for (let inputIdx = 0; inputIdx < inputLength; inputIdx++) {
        let nodeInput: NodeInput = {
            location: inputArr[inputIdx],
            name: nodesArr[inputArr[inputIdx]]['name'],
            type: nodesArr[inputArr[inputIdx]]['type'],
            edge: model.buffers(subgraph.tensors(inputArr[inputIdx])?.buffer()!)?.dataLength() === 0 ? true : false
        };
        nodeInputs.push(nodeInput);
  }

  return nodeInputs;
}
