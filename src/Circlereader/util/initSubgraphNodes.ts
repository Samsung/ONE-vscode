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

import {SubGraph} from '../circle-analysis/circle/sub-graph';
import {Node} from '../type/types';

export function initSubgraphNodes(subgraph: SubGraph): Array<Node> {
  let nodesArr: Array<Node> = [];

  for (let tensorIdx = 0; tensorIdx < subgraph.tensorsLength(); tensorIdx++) {
    let tensor = subgraph.tensors(tensorIdx);

    // TODO A function to distinguish types like int8 and float32 should be added.
    let hashnode: Node = {name: tensor!.name()!, type: tensor!.shapeArray()!};

    nodesArr.push(hashnode);
  }

  return nodesArr;
}
