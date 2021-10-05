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

function openDetail() {
  document.querySelector('#main').style.marginRight = '35%';
  document.querySelector('#detail').style.width = '35%';
  document.querySelector('#detail').style.display = 'block';
}

function closeDetail() {
  document.querySelector('#main').style.marginRight = '0%';
  document.querySelector('#detail').style.display = 'none';
}

function createDetailContent(nodes, id, g) {
  var _node = g.node(id);

  removeElementsByClass('detail-content-list');
  nodes.forEach(node => {
    if (String(node.index) === id) {
      for (let key in node) {
        if (key === 'type' || key === 'location') {
          createDetailItem(key, node[key], '#node-properties-content');
        }

        else if (key === 'attributes') {
          node[key].forEach(element => {
            createDetailItem(element['attribute'], element['value'], '#attributes-content');
          });
        }

        else if (key === 'inputs') {
          node[key].forEach((input, idx) => {
            createDetailItem(`input ${idx}`, `name: ${input['name']}`, '#inputs-content');
            createDetailItem('', `type: [${getTypeArray(',', input['type'])}]`, '#inputs-content');
            createDetailItem('', `location: ${input['location']}`, '#inputs-content');
          });
        }

        else if (key === 'outputs') {
          node[key].forEach((output, idx) => {
            createDetailItem(`output ${idx}`, `name: ${output['name']}`, '#outputs-content');
            createDetailItem(
                '', `type: [${getTypeArray(',', output['type'])}]`, '#outputs-content');
            createDetailItem('', `location: ${output['location']}`, '#outputs-content');
          });
        }
      }
    }
  });
  openDetail();
}

function removeElementsByClass(className) {
  const elements = document.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function getTypeArray(delimeter, type) {
  let result = '';
  for (key in type) {
    result = result + type[key] + delimeter;
  }
  result = result.slice(0, -1);
  return result;
}

function createDetailItem(key, inputValue, selector) {
  let name = document.createElement('div');
  name.setAttribute('class', 'detail-content-name detail-content-list');
  let label = document.createElement('label');
  label.innerHTML = key;
  name.appendChild(label);

  let value = document.createElement('div');
  value.setAttribute('class', 'detail-content-value detail-content-list');
  value.innerHTML = inputValue;

  document.querySelector(selector).appendChild(name);
  document.querySelector(selector).appendChild(value);
}