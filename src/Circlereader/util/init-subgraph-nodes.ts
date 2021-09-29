import { SubGraph } from '../circle-analysis/circle/sub-graph';
import { Node } from '../type/types';

export function initSubgraphNodes(subgraph: SubGraph): Array<Node> {
    let nodesArr: Array<Node> = [];

    for(let tensorIdx = 0; tensorIdx < subgraph.tensorsLength(); tensorIdx++){
        let tensor = subgraph.tensors(tensorIdx);

        let hashnode:Node = {
            name: tensor!.name()!,
            type: tensor!.shapeArray()!
        }
        nodesArr.push(hashnode);        
    }

    return nodesArr;
}