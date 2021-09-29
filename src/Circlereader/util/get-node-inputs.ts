import { Model } from '../circle-analysis/circle/model';
import { Operator } from '../circle-analysis/circle/operator';
import { SubGraph } from '../circle-analysis/circle/sub-graph';
import { NodeInput, Node } from '../type/types';

export function getNodeInputs(model: Model,subgraph: SubGraph ,operator: Operator, nodesArr: Array<Node>): Array<NodeInput> {
    let nodeInputs: Array<NodeInput> = [];
    let inputArr = operator.inputsArray()!;
    let inputLength = operator.inputsLength();    
    
    for (let inputIdx = 0; inputIdx < inputLength; inputIdx++) {
        let node_input: NodeInput = {
            location: inputArr[inputIdx],
            name: nodesArr[inputArr[inputIdx]]['name'],
            type: nodesArr[inputArr[inputIdx]]['type'],
            edge: model.buffers(subgraph.tensors(inputArr[inputIdx])?.buffer()!)?.dataLength() == 0 ? true : false
        };
        nodeInputs.push(node_input);
    }
    
    return nodeInputs;
}