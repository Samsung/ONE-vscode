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
  const memorySizeContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-info-memory-size');
  const cycleCountContainer = /** @type {HTMLElement} */ document.querySelector('.mondrian-info-cycle-count');

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case 'update':
      {
        const data = message.text;

        // Update our webview's content
        updateContent(data);

        // Persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ data });

        return;
      }
    }
  });

  function updateContent(/** @type {string} */ data) {
    if (!data) {
      data = '{}';
    }
    let json;
    try {
      json = JSON.parse(data);
    } catch {
      /* notesContainer.style.display = 'none';
      errorContainer.innerText = 'Error: Document is not valid json';
      errorContainer.style.display = '';
      */
      return;
    }

    /* Check schema version */
    if (json.schema_version != 1) {
      console.log(`Invalid schema version: ${json.schema_version}`);
      return;
    }

    console.log(`Segments: ${json.segments.length}`);

    let max_cycle = 0;
    let max_memory = 0;
    for (alloc of json.segments[0].allocations) {
      if (alloc.alive_till > max_cycle) {
        max_cycle = alloc.alive_till;
      }

      if (alloc.offset + alloc.size > max_memory) {
        max_memory = alloc.offset + alloc.size;
      }
    }

    memorySizeContainer.innerText = `${max_memory}`;
    cycleCountContainer.innerText = `${max_cycle}`;
  }

})();
