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
const scrollbarBtn = /** @type {HTMLElement} */ document.querySelector('.mondrian-scrollbar-btn');
const sidePanel = /** @type {HTMLElement} */ document.querySelector('.mondrian-sidepanel');

/* Limit cycle range to avoid hang-ups for large models */
const defaultCycleLimit = 1048576;

class Viewer {
  constructor() {
    this.activeSegment = 0;
    this.viewportMinCycle = 0;
    this.viewportMaxCycle = 0;
    this.viewportHScale = 5;
    this.viewportVScale = 5;
  }
}

class ViewportLimiter {
  constructor() {
    this.dragLeft = false;
    this.dragRight = false;
  }

  startDrag(left, right, origin) {
    this.dragLeft = left;
    this.dragRight = right;
    this.dragOrigin = origin;

    this.barBound = scrollbarBtn.parentElement.getBoundingClientRect();

    let handleBound = scrollbarBtn.getBoundingClientRect();
    this.barOffsetLeft = handleBound.left - this.barBound.left;
    this.barOffsetRight = this.barBound.right - handleBound.right;
  }

  showLimit(viewer) {
    let leftRatio = viewer.viewportMinCycle / viewport.cycles;
    let rightRatio = (viewport.cycles - viewer.viewportMaxCycle) / viewport.cycles;

    scrollbarBtn.style.marginLeft = leftRatio * 100 + '%';
    scrollbarBtn.style.marginRight = rightRatio * 100 + '%';

    this.updateLimit();
  }

  updateLimit(commit = false) {
    let barBound = scrollbarBtn.parentElement.getBoundingClientRect();
    let handleBound = scrollbarBtn.getBoundingClientRect();

    let minCycle =
        Math.round((handleBound.left - barBound.left) / barBound.width * viewport.cycles);
    let maxCycle = Math.round(
        (barBound.width - barBound.right + handleBound.right) / barBound.width * viewport.cycles);

    scrollbarBtn.children[1].innerHTML = `<b>Cycles:</b> ${minCycle}..${maxCycle}`;

    if (commit) {
      let state = vscode.getState();
      state.viewer.viewportMinCycle = minCycle;
      state.viewer.viewportMaxCycle = maxCycle;
      vscode.setState(state);

      updateViewport(state.data, state.viewer);
    }
  }

  move(ev) {
    if (this.dragLeft) {
      let ratioLeft = (this.barOffsetLeft + ev.clientX - this.dragOrigin) / this.barBound.width;
      scrollbarBtn.style.marginLeft = Math.max(ratioLeft * 100, 0) + '%';
    }

    if (this.dragRight) {
      let ratioRight = (this.barOffsetRight - ev.clientX + this.dragOrigin) / this.barBound.width;
      scrollbarBtn.style.marginRight = Math.max(ratioRight * 100, 0) + '%';
    }

    this.updateLimit();
  }
}

const viewport = {
  memory: 0,
  cycles: 0,
  limiter: new ViewportLimiter,
};

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

segmentSelect.addEventListener('change', () => {
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
    let option = document.createElement('vscode-option');
    option.innerText = segment.name;
    option.value = index;
    segmentSelect.appendChild(option);
  }
  segmentSelect.value = viewer.activeSegment;

  for (const alloc of data.segments[viewer.activeSegment].allocations) {
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

  viewport.cycles = totalCycles;
  viewport.memory = totalMemory;

  viewer.viewportMinCycle = 0;
  viewer.viewportMaxCycle = Math.min(defaultCycleLimit, totalCycles);

  viewport.limiter.showLimit(viewer);
  updateViewport(data, viewer);
}

function scaleViewport(viewer) {
  const scrollContainer = viewerContainer.parentElement;
  const scrollH = scrollContainer.scrollLeft / scrollContainer.scrollWidth;
  const scrollV = scrollContainer.scrollTop / scrollContainer.scrollHeight;

  const scaleH = Math.pow(2, viewer.viewportHScale);
  const scaleV = Math.pow(2, viewer.viewportVScale);

  viewerContainer.style.width = viewport.cycles * scaleH + 'px';
  viewerContainer.style.height = viewport.memory * scaleV / 8192 + 'px';
  scrollContainer.scrollLeft = scrollContainer.scrollWidth * scrollH;
  scrollContainer.scrollTop = scrollContainer.scrollHeight * scrollV;

  if (scaleH < 4 || scaleV < 4) {
    viewerContainer.style.backgroundImage = 'none';
  } else {
    viewerContainer.style.backgroundImage = `url("data:image/svg+xml;charset=UTF-8,%3csvg ` +
        `xmlns='http://www.w3.org/2000/svg' width='${scaleH}' height='${scaleV}'%3e%3cpath ` +
        `style='fill:none;stroke-width:1px;stroke:%23fff;opacity:0.1' ` +
        `d='M 0,${scaleV - 0.5} ${scaleH - 0.5},${scaleV - 0.5} ${scaleH - 0.5},0' ` +
        `/%3e%3c/svg%3e")`;
  }

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

  for (const [i, alloc] of data.segments[viewer.activeSegment].allocations.entries()) {
    if (alloc.alive_from >= viewer.viewportMaxCycle) {
      continue;
    }

    if (alloc.alive_till <= viewer.viewportMinCycle) {
      continue;
    }

    const size = alloc.size > 1024 ? Math.round(alloc.size / 102.4) / 10 + 'K' : alloc.size;

    let box = boxTemplate.cloneNode(true);
    box.firstChild.innerText = size;
    box.style.top = (alloc.offset / viewport.memory * 100) + '%';
    box.style.height = (alloc.size / viewport.memory * 100) + '%';
    box.style.left = (alloc.alive_from / viewport.cycles * 100) + '%';
    box.style.right = ((viewport.cycles - alloc.alive_till) / viewport.cycles * 100) + '%';
    box.style.backgroundColor = boxColors[i % boxColors.length];
    box.addEventListener('mouseover', () => {
      statusLineContainer.innerHTML = `<b>Origin:</b> ${
          alloc.origin.length > 32 ? alloc.origin.substring(0, 32) + '…' : alloc.origin}
          | <b>Size:</b> ${alloc.size}
          | <b>Offset:</b> ${alloc.offset}
          | <b>Lifetime:</b> ${alloc.alive_from} → ${alloc.alive_till} (${
          alloc.alive_till - alloc.alive_from})`;
    });
    box.addEventListener('click', (e) => {
      sidePanel.classList.add('mondrian-sidepanel-enabled');
      document.querySelector('.mondrian-sidepanel-origin').value = alloc.origin;
      document.querySelector('.mondrian-sidepanel-size').value = alloc.size;
      document.querySelector('.mondrian-sidepanel-offset').value = alloc.offset;
      document.querySelector('.mondrian-sidepanel-allocated').value = alloc.alive_from;
      document.querySelector('.mondrian-sidepanel-freed').value = alloc.alive_till;
      document.querySelector('.mondrian-sidepanel-lifetime').value =
          alloc.alive_till - alloc.alive_from;
      e.stopPropagation();
    });
    viewerContainer.appendChild(box);
  }

  let createShadow = () => {
    let elem = document.createElement('div');
    elem.classList.add('mondrian-allocation-limit');
    return elem;
  };

  if (viewer.viewportMinCycle > 0) {
    let shadow = createShadow();
    shadow.style.left = '0%';
    shadow.style.width = viewer.viewportMinCycle / viewport.cycles * 100 + '%';
    viewerContainer.appendChild(shadow);
  }

  if (viewer.viewportMaxCycle < viewport.cycles) {
    let shadow = createShadow();
    shadow.style.right = '0%';
    shadow.style.width = (viewport.cycles - viewer.viewportMaxCycle) / viewport.cycles * 100 + '%';
    viewerContainer.appendChild(shadow);
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

viewerContainer.parentElement.addEventListener('click', () => {
  sidePanel.classList.remove('mondrian-sidepanel-enabled');
});

viewerVScale.children[0].addEventListener('click', () => {
  changeScale(0, 0.5);
});
viewerVScale.children[1].addEventListener('input', (event) => {
  changeVScale(parseInt(event.target.value));
});
viewerVScale.children[2].addEventListener('click', () => {
  changeScale(0, -0.5);
});
viewerHScale.children[0].addEventListener('click', () => {
  changeScale(-0.5, 0);
});
viewerHScale.children[1].addEventListener('input', (event) => {
  changeHScale(parseInt(event.target.value));
});
viewerHScale.children[2].addEventListener('click', () => {
  changeScale(0.5, 0);
});

function enableViewportLimiterDrag(left, right, origin) {
  viewport.limiter.startDrag(left, right, origin);
  let moveHandler = (ev) => {
    viewport.limiter.move(ev);
  };

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', moveHandler);
    viewport.limiter.updateLimit(true);
  }, {once: true});
}

scrollbarBtn.children[0].addEventListener('mousedown', (ev) => {
  enableViewportLimiterDrag(true, false, ev.clientX);
});
scrollbarBtn.children[1].addEventListener('mousedown', (ev) => {
  enableViewportLimiterDrag(true, true, ev.clientX);
});
scrollbarBtn.children[2].addEventListener('mousedown', (ev) => {
  enableViewportLimiterDrag(false, true, ev.clientX);
});
})();
