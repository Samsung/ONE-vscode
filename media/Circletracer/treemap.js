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

let circleJson, durCircleJson;
function treeMap(json) {
  circleJson = json;
  durCircleJson = json;
  let g = new dagreD3.graphlib.Graph().setGraph({});
  let nodes = [];
  let inputNode, outputNode;

  json.forEach((element, idx) => {
    let type = element.properties.type;
    let myIndex = element.outputs[0].location;
    let parentsIndex = [];
    let location = element.properties.location;
    let attributes = element.attributes;
    let inputs = element.inputs;
    let outputs = element.outputs;
    inputs.forEach(input => {
      if (input.edge === true) {
        parentsIndex.push(input);
      }
    });

    let node = {
      'index': myIndex,
      'type': type,
      'class': 'type-' + type,
      'parents': parentsIndex,
      'location': location,
      'attributes': attributes,
      'inputs': inputs,
      'outputs': outputs
    };

    let label = `<p class='type'>${type}</p>`;

    // inputs label create
    inputs.forEach((input, checkIdx) => {
      if (checkIdx === 0 || input.edge === true) {
        return;
      }

      label += `<p><label><b>input${checkIdx}</b></label><span>&lt;${
          getTypeArray('x', input.type)}&gt;</span></p>`;
    });

    attributes.forEach(attr => {
      if (attr['attribute'] === 'fused_activation_function' && attr['value'] !== 'NONE') {
        label += `<p class='activation'>${attr['value']}</p>`;
      }
    });

    // if element has duration
    if (element.hasOwnProperty('duration')) {
      let timeUnit = element.duration.timeUnit;
      let dur1 = element.duration.dur1;
      let dur2 = element.duration.dur2;

      label += `<p class='duration-title'>DURATION</p>`;
      label += `<p class='duration'>${dur1.toFixed(4)} ${timeUnit} <b>&roarr;</b> ${
          dur2.toFixed(4)} ${timeUnit}</p>`;
    }

    // First node logic
    if (idx === 0) {
      inputNode = {
        'index': 0,
        'class': 'type-input',
        'inputs': [element.inputs[0]],
        'outputs': [],
        'parents': []
      };
      g.setNode(0, {label: 'input', class: 'type-input'});
    }

    // Last node logic
    if (idx === json.length - 1) {
      let outputParentIndex = [];
      let name = outputs[0].name;

      outputParentIndex.push({location: myIndex});

      inputNode.outputs.push(outputs[0]);

      outputNode = {
        'label': name,
        'class': 'type-' + name,
        'parents': outputParentIndex,
        'inputs': inputNode.inputs,
        'outputs': [outputs[0]],
        'index': myIndex + 1
      };

      nodes.push(inputNode);
      nodes.push(outputNode);
      g.setNode(
          outputNode.index, {labelType: 'html', label: outputNode.label, class: outputNode.class});
    }

    nodes.push(node);
    g.setNode(node.index, {labelType: 'html', label: label, class: node.class});
  });

  g.nodes().forEach(function(v) {
    let node = g.node(v);
    //  Round the corners of the nodes
    node.rx = node.ry = 5;
  });

  nodes.forEach(node => {
    let index = node.index;
    let parents = node.parents;
    parents.forEach(parent => {
      let label = `<p class="edge-label">${getTypeArray('x', parent.type)}</p>`;

      g.setEdge(
          parent.location, index,
          {labelType: 'html', label: label, curve: d3.curveBasis, arrowheadClass: 'arrowhead'});
    });
  });

  let render = new dagreD3.render();

  let svg = d3.select('#wrapper').append('svg');
  let inner = svg.append('g');

  // Set up zoom support
  d3.select('#wrapper')
      .on('scroll', scrolled)
      .call(d3.zoom().scaleExtent([0.1, 10]).on('zoom', () => zoomed(inner, g)));

  render(inner, g);

  svg.attr('width', g.graph().width + 300);
  svg.attr('height', g.graph().height);
  svg.selectAll('g.node').on('click', (id) => createDetailContent(nodes, id, g));
}

function zoomed(inner, g) {
  const scale = d3.event.transform.k;

  // Graph resizing
  inner.attr('transform', d3.event.transform);

  const scaledWidth = (g.graph().width + 300) * scale;
  const scaledHeight = (g.graph().height) * scale;

  // Change SVG dimensions.
  d3.select('svg').attr('width', scaledWidth).attr('height', scaledHeight);

  // Scale the image itself.
  d3.select('svg').attr('transform', `scale(${scale})`);

  // Move scrollbars.
  const wrapper = d3.select('#wrapper').node();
  wrapper.scrollLeft = -d3.event.transform.x;
  wrapper.scrollTop = -d3.event.transform.y;

  // If the image is smaller than the wrapper, move the image towards the
  // center of the wrapper.
  const dx = d3.max([0, wrapper.clientWidth / 2 - scaledWidth / 2]);
  const dy = d3.max([0, wrapper.clientHeight / 2 - scaledHeight / 2]);
  d3.select('svg').attr('transform', `translate(${dx}, ${dy})`);
}

function scrolled() {
  const wrapper = d3.select('#wrapper');
  const x = wrapper.node().scrollLeft + wrapper.node().clientWidth / 2;
  const y = wrapper.node().scrollTop + wrapper.node().clientHeight / 2;
  const scale = d3.zoomTransform(wrapper.node()).k;
  // Update zoom parameters based on scrollbar positions.
  wrapper.call(d3.zoom().translateTo, x / scale, y / scale);
}
