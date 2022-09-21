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
//   {"name": "Top Level", "parent": "", "path": "임의 경로", "onecc version": "1.0.0", "toolchain version": "1.0.0"},  // TODO: name => id
//   {"name": "Level 2: A", "parent": "Top Level", "path": "임의 경로", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
//   {"name": "Level 2: B", "parent": "Top Level", "path": "임의 경로", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
//   {"name": "Son of A", "parent": "Level 2: A", "path": "임의 경로", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
//   {"name": "Daughter of A", "parent": "Level 2: A", "path": "임의 경로", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
// ];

//웹뷰 오른쪽 클릭 막기
document.addEventListener('contextmenu', event => event.preventDefault());

const vscode = acquireVsCodeApi();

//현재 파일의 Uri 
let currentFileUri = "";

//현재 파일의 워크스페이스 주소
let workspaceFolderName = "";

window.addEventListener('message',(event) => {
  const message = event.data;
  const { selected, relationData } = message.payload;
  
  switch (message.type) {
    case 'create':
      currentFileUri = message.fileUri.path;
      console.log(message.fileUri.path);
      workspaceFolderName = message.workspaceFolderName;
      detachTree();
      attachTree(relationData);
      console.log('create 메시지는: ', message);
      break;
    case 'update':
      console.log('update 메시지는: ', message);
      detachTree();
      attachTree(relationData);
      break;
    default:
      break;
  }
});

function attachTree(relationData) {
  
  //현재 파일 절대 경로 보여주기
  //currentFileUri = String(currentFileUri).replace(/\//gi," > ");
  //document.getElementById('nav-bar-content-box').innerText =`${currentFileUri}` ;
  
  //  assigns the data to a hierarchy using parent-child relationships
  const treeData = d3.stratify()
    .id(d => d.id)
    .parentId(d => d.parent)
    (relationData);
  
  // set the dimensions and margins of the diagram
  const margin = {top: 60, right: 90, bottom: 60, left: 90},
      width = 1400 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
  
  // declares a tree layout and assigns the size
  const treemap = d3.tree()
      .size([width, height]);
  
  // maps the node data to the tree layout
  const nodes = treemap(treeData);
  
  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  // TODO: background-color 다른 색으로 바꾸기.
  const svg = d3.select(".relation-main-box").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "#545454"),
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
  
  let waitForDouble = null;
  const rectSizeWidth = 130;
  const rectSizeHeight = 50;
  // adds the rectangle to the node
  node.append("rect")
    .attr("x", -rectSizeWidth / 2)
    .attr("y", -rectSizeHeight)
    .attr("width", rectSizeWidth)
    .attr("height", rectSizeHeight)
    .attr("rx",8)
    .attr("ry",8)
    .on("dblclick", (p,d) => {
      if (waitForDouble !== null) {
        clearTimeout(waitForDouble);
        waitForDouble = null;
        console.log('더블 클릭입니다.', d);
        postMessage(d.data.dataList[d.data.idx].path);
      }
    })
    .on("click", (p, d) => {
      if(waitForDouble === null) {
        waitForDouble = setTimeout(() => {
          console.log('원 클릭입니다.', d);
          waitForDouble = null;
        }, 300);
      }
    })
    .on("contextmenu",(p,d)=>{
      console.log('오른쪽 클릭입니다.', d);
    });
    
    
  const hoverText = document.createElement('div');
  document.body.appendChild(hoverText);
  hoverText.classList.add('hover-text');
  // adds the text to the node
  node.append("text")
    .attr("dy", ".35em")
    .attr("y", -rectSizeHeight)
    .style("text-anchor", "middle")
    .text(d => d.data.dataList[d.data.idx].name)
    .on('mouseover', (mouse, node) => {
      hoverText.style.visibility = 'visible';
      hoverText.innerText = "/home/jihongyu/ONE-vscode/res/modelDir/truediv/model.q8.circle.log";
      hoverText.style.left = `${node.x}px`;
      hoverText.style.top = `${mouse.path[0].getBoundingClientRect().top - 25}px`;
      
    }).on('mouseout', (mouse, node) => {
      hoverText.style.visibility = 'hidden';
    });
  
  //toolchain/onecc 정보 기록
  node.append("text")
  .attr("dy", ".35em")
  .attr("y", -rectSizeHeight + 30)
  .style("text-anchor", "middle")
  .text(d => d.data.dataList[d.data.idx].name)
  .on("dblclick", (p,d) => {
    if (waitForDouble !== null) {
      clearTimeout(waitForDouble);
      
      console.log('더블 클릭입니다.');
      waitForDouble = null;
      
    }
  })
  .on("click", (p, d) => {
    if(waitForDouble === null) {
      waitForDouble = setTimeout(() => {
        console.log('원 클릭입니다.');
        waitForDouble = null;
      }, 400);
    }
  });
}

function postMessage(path) {
  vscode.postMessage({path: path});
}

function detachTree() {
  d3.select("svg").remove();
}