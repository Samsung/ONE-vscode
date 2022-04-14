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

  const statusLineContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-statusline');
  const memorySizeContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-info-memory-size');
  const cycleCountContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-info-cycle-count');

  class Viewer {
    constructor() {
      this.activeSegment = 0;
      this.viewportMinCycle = 0;
      this.viewportMaxCycle = 0;
    }
  }

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
    let totalMemory = 0;

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
  }

  const state = vscode.getState();
  if (state) {
    updateContent(state.data, state.viewer);
  }

})();
