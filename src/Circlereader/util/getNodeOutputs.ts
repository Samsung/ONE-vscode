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

import {Operator} from '../circle-analysis/circle/operator';
import {Node, NodeOutput} from '../type/types';

export function getNodeOutputs(operator: Operator, nodesArr: Array<Node>): Array<NodeOutput> {
  let nodeOutputs: Array<NodeOutput> = [];
  let outputArr = operator.outputsArray()!;
  let outputLength = operator.outputsLength();

  for (let outputIdx = 0; outputIdx < outputLength; outputIdx++) {
    let nodeOutput: NodeOutput = {
      location: outputArr[outputIdx],
      name: nodesArr[outputArr[outputIdx]]['name'],
      type: nodesArr[outputArr[outputIdx]]['type']
    };

    nodeOutputs.push(nodeOutput);
  }

  return nodeOutputs;
}
