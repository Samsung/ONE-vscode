/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
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

const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

function main() {
  register();

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "displayMPQ":
        displayMPQToEditor(message.content);
        break;
      case "modelNodesChanged":
        handleModelNodesChanged(message.names);
        break;
      default:
        break;
    }
  });

  vscode.postMessage({ type: "requestDisplayMPQ" });
  vscode.postMessage({ type: "requestModelNodes" });
}

function register() {
  registerMainControls();
}

function handleModelNodesChanged(names) {
  document.getElementById("AddSpecificLayer").disabled = names.length < 1;
}

function registerMainControls() {
  document
    .getElementById("DefaultDtype")
    .addEventListener("click", function () {
      updateDefaultQuantization();
      applyUpdates();
    });

  document
    .getElementById("DefaultGranularity")
    .addEventListener("click", function () {
      updateGranularity();
      applyUpdates();
    });

  document
    .getElementById("AddSpecificLayer")
    .addEventListener("click", function () {
      vscode.postMessage({
        type: "addSpecificLayerFromDialog",
      });
    });

  document.getElementById("AddSpecificLayer").disabled = true;
}

function displayMPQToEditor(mpqCfg) {
  document.getElementById("DefaultDtype").value =
    mpqCfg?.["default_quantization_dtype"];
  document.getElementById("DefaultGranularity").value =
    mpqCfg?.["default_granularity"];

  const length = mpqCfg && mpqCfg["layers"] ? mpqCfg["layers"].length : 0;

  let names = Array(length);
  let quantization = Array(length);
  let granularity = Array(length);
  for (let i = 0; i < length; i++) {
    names[i] = mpqCfg["layers"][i]["name"];
    quantization[i] = mpqCfg["layers"][i]["dtype"];
    granularity[i] = mpqCfg["layers"][i]["granularity"];
  }

  const layersTable = document.getElementById("LayersTable");
  layersTable.replaceChildren();
  addQuantizedNodes(names, quantization, granularity, false);
}

function addQuantizedNodes(names, quantization, granularity, update) {
  const layersTable = document.getElementById("LayersTable");
  for (let idx = 0; idx < names.length; idx++) {
    if (names[idx].length < 1) {
      continue;
    }

    let row = document.createElement("vscode-data-grid-row");
    const name = names[idx];

    // name
    let cellName = document.createElement("vscode-data-grid-cell");
    cellName.textContent = name;
    cellName.setAttribute("grid-column", "1");
    row.appendChild(cellName);
    // quantization
    let cellQuantization = document.createElement("vscode-data-grid-cell");
    let quantDropdown = document.createElement("vscode-dropdown");
    {
      let uint8Opt = document.createElement("vscode-option");
      uint8Opt.innerText = "uint8";
      uint8Opt.value = 0;
      quantDropdown.appendChild(uint8Opt);
      let int16Opt = document.createElement("vscode-option");
      int16Opt.innerText = "int16";
      int16Opt.value = 1;
      quantDropdown.appendChild(int16Opt);
    }
    quantDropdown.setAttribute("id", "dropdownQuantization" + name);
    cellQuantization.appendChild(quantDropdown);
    cellQuantization.setAttribute("grid-column", "2");
    row.appendChild(cellQuantization);
    // granularity
    let cellGranularity = document.createElement("vscode-data-grid-cell");
    let granularityDropdown = document.createElement("vscode-dropdown");
    {
      let layerOpt = document.createElement("vscode-option");
      layerOpt.innerText = "layer";
      layerOpt.value = 0;
      granularityDropdown.appendChild(layerOpt);
      let channelOpt = document.createElement("vscode-option");
      channelOpt.innerText = "channel";
      channelOpt.value = 1;
      granularityDropdown.appendChild(channelOpt);
    }
    granularityDropdown.setAttribute("id", "dropdownGranularity" + name);
    cellGranularity.appendChild(granularityDropdown);
    cellGranularity.setAttribute("grid-column", "3");
    row.appendChild(cellGranularity);

    // remove button
    let cellRemoveBtn = document.createElement("vscode-data-grid-cell");
    let remBtn = document.createElement("vscode-button");
    remBtn.setAttribute("id", "removeButton" + name);
    remBtn.appearance = "icon";
    {
      let iconSpan = document.createElement("span");
      iconSpan.className = "codicon codicon-chrome-close";
      iconSpan.slot = "start";
      remBtn.appendChild(iconSpan);
    }
    cellRemoveBtn.appendChild(remBtn);
    cellRemoveBtn.setAttribute("grid-column", "4");
    row.appendChild(cellRemoveBtn);

    layersTable.appendChild(row);
  }

  //  set quantization and granularity attributes
  for (let idx = 0; idx < names.length; idx++) {
    if (names[idx].length < 1) {
      continue;
    }

    const name = names[idx];
    const qValue = quantization[idx] === "uint8" ? 0 : 1;
    document.getElementById("dropdownQuantization" + name).value = qValue;

    const gValue = granularity[idx] === "layer" ? 0 : 1;
    document.getElementById("dropdownGranularity" + name).value = gValue;
  }

  // set change values
  for (let idx = 0; idx < names.length; idx++) {
    if (names[idx].length < 1) {
      continue;
    }

    const name = names[idx];
    document
      .getElementById("dropdownQuantization" + name)
      .addEventListener("change", function () {
        updateSpecificQuantization(name);
        applyUpdates();
      });

    document
      .getElementById("dropdownGranularity" + name)
      .addEventListener("change", function () {
        updateSpecificGranularity(name);
        applyUpdates();
      });

    document
      .getElementById("removeButton" + name)
      .addEventListener("click", function () {
        removeLayer(name);
      });
  }

  if (update) {
    updateLayers(names, quantization, granularity);
    applyUpdates();
  }
}

function updateLayers(names, quantization, granularity) {
  vscode.postMessage({
    type: "updateLayers",
    names: names,
    quantization: quantization,
    granularity: granularity,
  });
}

function removeLayer(name) {
  vscode.postMessage({
    type: "removeLayer",
    name: name,
  });
}

function updateSpecificQuantization(name) {
  const value =
    document.getElementById("dropdownQuantization" + name).value === 0
      ? "uint8"
      : "int16";
  vscode.postMessage({
    type: "updateSpecificQuantization",
    name: name,
    value: value,
  });
}

function updateSpecificGranularity(name) {
  const value =
    document.getElementById("dropdownGranularity" + name).value === 0
      ? "layer"
      : "channel";
  vscode.postMessage({
    type: "updateSpecificGranularity",
    name: name,
    value: value,
  });
}

function updateDefaultQuantization() {
  let value = document.getElementById("DefaultDtype").value;
  vscode.postMessage({
    type: "updateSection",
    section: "default_quantization_dtype",
    value: value,
  });
}

function updateGranularity() {
  let value = document.getElementById("DefaultGranularity").value;
  vscode.postMessage({
    type: "updateSection",
    section: "default_granularity",
    value: value,
  });
}

function applyUpdates() {
  vscode.postMessage({ type: "updateDocument" });
}
