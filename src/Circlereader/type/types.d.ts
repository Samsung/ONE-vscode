declare type Node = {
  name: String; type: Int32Array;
}

declare type NodeProperties = {
  type: String,
  location: Number
}

declare type NodeAttributes = {
  attribute: String,
  value: string | Number | Boolean | Int32Array | null
}

declare type NodeInput = {
  location: Number,
  name: String,
  type: Int32Array,
  edge: Boolean
}

declare type NodeOutput = {
  location: Number,
  name: String,
  type: Int32Array
}

declare type ModelOperator = {
  builtinoptions: String,
  properties: NodeProperties,
  attributes: Array<NodeAttributes>,
  inputs: Array<NodeInput>,
  outputs: Array<NodeOutput>
}

export {
  Node, NodeAttributes, NodeInput, NodeOutput, NodeProperties, ModelOperator
}