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

// MIT License

// Copyright (c) Lutz Roeder

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// This file referenced the result of
// https://github.com/lutzroeder/netron/tree/50083007d427fa0c03eda4ea0e62de373ec89c9b

let selectedNodes = [];
let selectedNodesIdx = [];

document.body.oncontextmenu = function() {
  return false;
};

function drawSelectBox(canvas) {
  let mouse = {x: 0, y: 0, startX: 0, startY: 0};
  let element = null;

  canvas.onmousedown = function(e) {
    mouse.startX = mouse.x;
    mouse.startY = mouse.y;
    element = document.createElement('div');
    element.className = 'select_box';
    element.style.left = mouse.x + 'px';
    element.style.top = mouse.y + 'px';
    canvas.appendChild(element);
    canvas.style.cursor = 'crosshair';
  };

  canvas.onmousemove = function(e) {
    mouse.x = e.clientX + window.scrollX;
    mouse.y = e.clientY + window.scrollY;
    if (element !== null) {
      element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
      element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
      element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
      element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
    }
  };

  canvas.onmouseup = function(e) {
    const htmlCollection = document.getElementsByClassName('node');
    const nodes = Array.from(htmlCollection);
    const top = getMinVal(mouse.startY, mouse.y);
    const bottom = getMaxVal(mouse.startY, mouse.y);
    const left = getMinVal(mouse.startX, mouse.x);
    const right = getMaxVal(mouse.startX, mouse.x);

    nodes.forEach((node) => {
      const x = node.getBoundingClientRect().x;
      const y = node.getBoundingClientRect().y;
      const w = node.getBoundingClientRect().width;
      const h = node.getBoundingClientRect().height;
      if (x >= left && y >= top && (x + w) <= right && (h + y) <= bottom) {
        if (!selectedNodes.includes(node)) {
          selectedNodes.push(node);
          selectedNodesIdx.push(nodes.indexOf(node));
          node.classList.add('selected_node');
        };
      };
    });
    canvas.removeChild(element);
    element = null;
    canvas.style.cursor = 'default';
    console.log('selectedNodesIdx;', selectedNodesIdx);
    let tempStr = '';
    for (let i = 0; i < selectedNodesIdx.length; i++) {
      tempStr += selectedNodesIdx[i];
      if (i !== (selectedNodesIdx.length - 1)) {
        tempStr += ',';
      }
    }
    document.getElementById('selectedNodesIndices').innerText = tempStr;
  };
}

function getMaxVal(a, b) {
  if (a >= b) {
    return a;
  } else {
    return b;
  }
}

function getMinVal(a, b) {
  if (a <= b) {
    return a;
  } else {
    return b;
  }
}

function deselectAllNodes() {
  selectedNodes.forEach((node) => {
    node.classList.remove('selected_node');
  });
  selectedNodes = [];
  selectedNodesIdx = [];
  document.getElementById('selectedNodesIndices').innerText = '';
}

function copyToClipboard() {
  const tempText = document.createElement('textarea');
  document.body.appendChild(tempText);
  tempText.value = document.getElementsByClassName('seleted_nodes_text')[0].innerText;
  tempText.select();
  document.execCommand('copy');
  document.body.removeChild(tempText);
}

document.getElementById('deselectAllNodes').onclick = deselectAllNodes;
document.getElementById('copyToClipboard').onclick = copyToClipboard;