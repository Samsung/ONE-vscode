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

(function () {
  const vscode = acquireVsCodeApi();

  const viewerContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-viewer-area');
  const statusLineContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-statusline');
  const memorySizeContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-info-memory-size');
  const cycleCountContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-info-cycle-count');
  const segmentSelect = /** @type {HTMLElement} */ document.querySelector('.mondrian-segment-picker');

  let viewportCycles = 0;
  let viewportMemory = 0;

  class Viewer {
    constructor() {
      this.activeSegment = 0;
      this.viewportMinCycle = 0;
      this.viewportMaxCycle = 0;
    }
  }

  const boxColors = [
    "#e25935",
    "#ee7a0b",
    "#facb35",
    "#56571b",
    "#1791c2",
    "#5453b1",
    "#77455e",
  ];

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case 'update':
      {
        const data = parseText(message.text);
        if (!data) {
          return;
        }

        const viewer = new Viewer();

        // Update our webview's content
        updateContent(data, viewer);

        // Persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ data, viewer });

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

    viewportCycles = totalCycles;
    viewportMemory = totalMemory;

    updateViewport(data, viewer);
  }

  function updateViewport(data, viewer) {
    viewerContainer.replaceChildren();

    let boxTemplate = document.createElement('div');
    boxTemplate.classList.add('mondrian-allocation-box');

    let boxTemplateLabel = document.createElement('div');
    boxTemplateLabel.classList.add('mondrian-allocation-label');

    boxTemplate.appendChild(boxTemplateLabel);

    for (const [i, alloc] of data.segments[viewer.activeSegment].allocations.entries()) {
      let box = boxTemplate.cloneNode(true);
      box.firstChild.innerText = `Origin: ${alloc.origin}\nSize: ${alloc.size}\nOffset: ${alloc.offset}`;
      box.style.top = (alloc.offset / viewportMemory * 100) + '%';
      box.style.height = (alloc.size / viewportMemory * 100) + '%';
      box.style.left = (alloc.alive_from / viewportCycles * 100) + '%';
      box.style.right = ((viewportCycles - alloc.alive_till) / viewportCycles * 100) + '%';
      box.style.backgroundColor = boxColors[i % boxColors.length];
      viewerContainer.appendChild(box);
    }
  }

  const state = vscode.getState();
  if (state) {
    updateContent(state.data, state.viewer);
  }

})();
