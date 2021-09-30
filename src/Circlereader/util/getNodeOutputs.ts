import {Operator} from '../circle-analysis/circle/operator';
import {Node, NodeOutput} from '../type/types';

export function getNodeOutputs(operator: Operator, nodesArr: Array<Node>): Array<NodeOutput> {
  let nodeOutputs: Array<NodeOutput> = [];
  let outputArr = operator.outputsArray()!;
  let outputLength = operator.outputsLength();

  for (let outputIdx = 0; outputIdx < outputLength; outputIdx++) {
    let nodeInput: NodeOutput = {
      location: outputArr[outputIdx],
      name: nodesArr[outputArr[outputIdx]]['name'],
      type: nodesArr[outputArr[outputIdx]]['type']
    };

    nodeOutputs.push(nodeInput);
  }

  return nodeOutputs;
}
