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

(function() {
const vscode = acquireVsCodeApi();

const viewerContainer =
    /** @type {HTMLElement} */ document.querySelector('.mondrian-viewer-bounds');
const statusLineContainer =
    /** @type {HTMLElement} */ document.querySelector('.mondrian-statusline');
const memorySizeContainer =
    /** @type {HTMLElement} */ document.querySelector('.mondrian-info-memory-size');
const cycleCountContainer =
    /** @type {HTMLElement} */ document.querySelector('.mondrian-info-cycle-count');
const segmentSelect = /** @type {HTMLElement} */ document.querySelector('.mondrian-segment-picker');
const viewerHScale = /** @type {HTMLElement} */ document.querySelector('.mondrian-viewer-h-scale');
const viewerVScale = /** @type {HTMLElement} */ document.querySelector('.mondrian-viewer-v-scale');

class Viewer {
  constructor() {
    this.activeSegment = 0;
    this.viewportMinCycle = 0;
    this.viewportMaxCycle = 0;
    this.viewportHScale = 5;
    this.viewportVScale = 5;
  }
}

let viewportMemory = 0;

const boxColors = [
  '#e25935',
  '#ee7a0b',
  '#facb35',
  '#56571b',
  '#1791c2',
  '#5453b1',
  '#77455e',
];

// Handle messages sent from the extension to the webview
window.addEventListener('message', event => {
  const message = event.data;  // The json data that the extension sent
  switch (message.type) {
    case 'update': {
      const data = parseText(message.text);
      if (!data) {
        return;
      }

      const viewer = new Viewer();

      // Update our webview's content
      updateContent(data, viewer);

      // Persist state information.
      // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
      vscode.setState({data, viewer});

      return;
    }
  }
});

segmentSelect.addEventListener('change', event => {
  let state = vscode.getState();
  state.viewer.activeSegment = parseInt(segmentSelect.value);

  updateContent(state.data, state.viewer);
  vscode.setState(state);
});

function parseText(/** @type (string) */ text) {
  if (!text) {
    text = '{}';
  }
  let data;

  /* Parse data JSON */
  try {
    data = JSON.parse(text);
  } catch {
    statusLineContainer.innerText = 'Error: Document is not a valid JSON';
    return null;
  }

  /* Check schema version */
  if (data.schema_version !== 1) {
    statusLineContainer.innerText = 'Error: Invalid JSON schema version';
    return null;
  }

  /* Check if data has any memory segments */
  if (data.segments === undefined || data.segments.length === 0) {
    statusLineContainer.innerText = 'Error: Document has no memory segments';
    return null;
  }

  return data;
}

function updateContent(data, viewer) {
  let loadTs = performance.now();

  let totalCycles = 0;
  let totalMemory = data.segments[viewer.activeSegment].size;

  if (totalMemory === undefined) {
    totalMemory = 0;
  }

  segmentSelect.replaceChildren();
  for (const [index, segment] of data.segments.entries()) {
    segmentSelect.appendChild(new Option(segment.name, index));
  }
  segmentSelect.value = viewer.activeSegment;

  for (alloc of data.segments[viewer.activeSegment].allocations) {
    if (alloc.alive_till > totalCycles) {
      totalCycles = alloc.alive_till;
    }

    if (alloc.offset + alloc.size > totalMemory) {
      totalMemory = alloc.offset + alloc.size;
    }
  }

  memorySizeContainer.innerText = `${totalMemory}`;
  cycleCountContainer.innerText = `${totalCycles}`;

  let loadMs = (performance.now() - loadTs).toFixed(2);
  statusLineContainer.innerText = `Document loaded in ${loadMs}ms`;

  viewer.viewportMinCycle = 0;
  viewer.viewportMaxCycle = totalCycles;
  viewportMemory = totalMemory;

  updateViewport(data, viewer);
}

function scaleViewport(viewer) {
  const viewportCycles = viewer.viewportMaxCycle - viewer.viewportMinCycle;
  viewerContainer.style.width = viewportCycles * Math.pow(2, viewer.viewportHScale) + 'px';
  viewerContainer.style.height = viewportMemory * Math.pow(2, viewer.viewportVScale) / 8192 + 'px';

  if (viewer.viewportHScale < 3) {
    viewerContainer.classList.add('mondrian-viewer-bounds-no-label');
  } else {
    viewerContainer.classList.remove('mondrian-viewer-bounds-no-label');
  }
}

function updateViewport(data, viewer) {
  let boxTemplate = document.createElement('div');
  boxTemplate.classList.add('mondrian-allocation-box');

  let boxTemplateLabel = document.createElement('div');
  boxTemplateLabel.classList.add('mondrian-allocation-label');

  boxTemplate.appendChild(boxTemplateLabel);

  viewerContainer.replaceChildren();
  scaleViewport(viewer);

  const viewportCycles = viewer.viewportMaxCycle - viewer.viewportMinCycle;
  for (const [i, alloc] of data.segments[viewer.activeSegment].allocations.entries()) {
    if (alloc.alive_from > viewer.viewportMaxCycle) {
      continue;
    }

    let size = alloc.size > 1024 ? (alloc.size / 1024).toFixed(1) + 'K' : alloc.size;
    let box = boxTemplate.cloneNode(true);

    box.firstChild.innerText = size;
    box.style.top = (alloc.offset / viewportMemory * 100) + '%';
    box.style.height = (alloc.size / viewportMemory * 100) + '%';
    box.style.left = (alloc.alive_from / viewportCycles * 100) + '%';
    box.style.right = ((viewportCycles - alloc.alive_till) / viewportCycles * 100) + '%';
    box.style.backgroundColor = boxColors[i % boxColors.length];
    viewerContainer.appendChild(box);
  }
}

function changeScale(h, v) {
  let state = vscode.getState();
  state.viewer.viewportHScale += h;
  state.viewer.viewportVScale += v;

  viewerHScale.children[1].value = state.viewer.viewportHScale;
  viewerVScale.children[1].value = state.viewer.viewportVScale;

  scaleViewport(state.viewer);
  vscode.setState(state);
}

function changeVScale(v) {
  let state = vscode.getState();
  state.viewer.viewportVScale = v;
  scaleViewport(state.viewer);
  vscode.setState(state);
}

function changeHScale(h) {
  let state = vscode.getState();
  state.viewer.viewportHScale = h;
  scaleViewport(state.viewer);
  vscode.setState(state);
}

const state = vscode.getState();
if (state) {
  updateContent(state.data, state.viewer);
}

viewerVScale.children[0].addEventListener('click', () => {
  changeScale(0, 1);
});
viewerVScale.children[1].addEventListener('input', (event) => {
  changeVScale(parseInt(event.target.value));
});
viewerVScale.children[2].addEventListener('click', () => {
  changeScale(0, -1);
});
viewerHScale.children[0].addEventListener('click', () => {
  changeScale(-1, 0);
});
viewerHScale.children[1].addEventListener('input', (event) => {
  changeHScale(parseInt(event.target.value));
});
viewerHScale.children[2].addEventListener('click', () => {
  changeScale(1, 0);
});
})();
