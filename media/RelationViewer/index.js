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

// const relationData = [
//   {"name": "Top Level", "parent": "", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},  // TODO: name => id
//   {"name": "Level 2: A", "parent": "Top Level", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
//   {"name": "Level 2: B", "parent": "Top Level", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
//   {"name": "Son of A", "parent": "Level 2: A", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
//   {"name": "Daughter of A", "parent": "Level 2: A", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
// ];

// const treeData =
//   {
//     "name": "Top Level",
//     "children": [
//       { 
// 		"name": "Level 2: A",
//         "children": [
//           { "name": "Son of A" },
//           { "name": "Daughter of A" }
//         ]
//       },
//       { "name": "Level 2: B" }
//     ]
//   };

const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
  const message = event.data; // The JSON data our extension sent
  const { relationData } = message;
  detachTree();
  attachTree(relationData);
});

function attachTree(relationData) {
  //  assigns the data to a hierarchy using parent-child relationships
  const treeData = d3.stratify()
    .id(d => d.name)
    .parentId(d => d.parent)
    (relationData);
  
  // set the dimensions and margins of the diagram
  const margin = {top: 40, right: 90, bottom: 50, left: 90},
      width = 660 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  
  // declares a tree layout and assigns the size
  const treemap = d3.tree()
      .size([width, height]);
  
  // maps the node data to the tree layout
  const nodes = treemap(treeData);
  
  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  // TODO: background-color 다른 색으로 바꾸기.
  const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "lightgoldenrodyellow"),
      g = svg.append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
  
  // adds the links between the nodes
  const link = g.selectAll(".link")
      .data( nodes.descendants().slice(1))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
         return "M" + d.x + "," + d.y
           + "C" + d.x + "," + (d.y + d.parent.y) / 2
           + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
           + " " + d.parent.x + "," + d.parent.y;
         });
  
  // adds each node as a group
  const node = g.selectAll(".node")
      .data(nodes.descendants())
    .enter().append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
  
  // adds the circle to the node
  node.append("circle")
    .attr("r", 10)
    .on("click", (p, d) => {
      postMessage(d.data.path);
    });
  
  // adds the text to the node
  node.append("text")
    .attr("dy", ".35em")
    .attr("y", d => d.children ? -20 : 20)
    .style("text-anchor", "middle")
    .text(d => d.data.name);
}

function postMessage(path) {
  console.log(path);
  // vscode.postMessage({});
}

function detachTree() {
  d3.select("svg").remove();
}