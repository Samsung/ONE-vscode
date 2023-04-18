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
      case "displayCFG":
        displayCFGToEditor(message.content);
        break;
      default:
        break;
    }
  });

  vscode.postMessage({ type: "requestDisplayCFG" });
}

function register() {
  registerMainControls();
}

function registerMainControls() {
  {
    document
      .getElementById("float-file")
      .addEventListener("click", function () {
        vscode.postMessage({
          type: "loadFloatInputFile",
        });
      });

    document
      .getElementById("quantized-file")
      .addEventListener("click", function () {
        vscode.postMessage({
          type: "loadQuantizedInputFile",
        });
      });

    document.getElementById("h5-file").addEventListener("click", function () {
      vscode.postMessage({
        type: "loadH5DataFile",
      });
    });
  }

  {
    document.getElementById("MPEIR-on").addEventListener("click", function () {
      vscode.postMessage({
        type: "toggleMPEIROutputFile",
        on: document.getElementById("MPEIR-on").checked,
      });
    });
    document
      .getElementById("mpeir-file")
      .addEventListener("click", function () {
        vscode.postMessage({
          type: "loadMPEIROutputFile",
        });
      });
    document
      .getElementById("MPEIROutputPath")
      .addEventListener("input", function () {
        vscode.postMessage({
          type: "onMPEIRChanged",
          path: document.getElementById("MPEIROutputPath").value,
        });
      });
  }

  {
    document.getElementById("MSE-on").addEventListener("click", function () {
      vscode.postMessage({
        type: "toggleMSEOutputFile",
        on: document.getElementById("MSE-on").checked,
      });
    });

    document.getElementById("mse-file").addEventListener("click", function () {
      vscode.postMessage({
        type: "loadMSEInputFile",
      });
    });

    document
      .getElementById("MSEOutputPath")
      .addEventListener("input", function () {
        vscode.postMessage({
          type: "onMSEChanged",
          path: document.getElementById("MSEOutputPath").value,
        });
      });
  }

  {
    document.getElementById("TAE-on").addEventListener("click", function () {
      vscode.postMessage({
        type: "toggleTAEOutputFile",
        on: document.getElementById("TAE-on").checked,
      });
    });
    document.getElementById("tae-file").addEventListener("click", function () {
      vscode.postMessage({
        type: "loadTAEOutputFile",
      });
    });
    document
      .getElementById("TAEOutputPath")
      .addEventListener("input", function () {
        vscode.postMessage({
          type: "onTAEChanged",
          path: document.getElementById("TAEOutputPath").value,
        });
      });
  }

  {
    document.getElementById("SRMSE-on").addEventListener("click", function () {
      vscode.postMessage({
        type: "toggleSRMSEOutputFile",
        on: document.getElementById("SRMSE-on").checked,
      });
    });
    document
      .getElementById("srmse-file")
      .addEventListener("click", function () {
        vscode.postMessage({
          type: "loadSRMSEOutputFile",
        });
      });
    document
      .getElementById("SRMSEOutputPath")
      .addEventListener("input", function () {
        vscode.postMessage({
          type: "onSRMSEChanged",
          path: document.getElementById("SRMSEOutputPath").value,
        });
      });
  }

  document.getElementById("DumpDot").addEventListener("click", function () {
    vscode.postMessage({
      type: "dumpDot",
      dump: document.getElementById("DumpDot").checked,
    });
  });

  document.getElementById("RunCfg").addEventListener("click", function () {
    vscode.postMessage({
      type: "runCfg",
    });
  });
}

function displayCFGToEditor(cfg) {
  document.getElementById("FloatModelInputPath").value = cfg?.["fp32_circle"];
  document.getElementById("QuantizedModelInputPath").value = cfg?.["q_circle"];
  document.getElementById("DataInputPath").value = cfg?.["data"];
  document.getElementById("MPEIR-on").checked = cfg?.["mpeir_on"];
  document.getElementById("MPEIROutputPath").value = cfg?.["mpeir_output"];
  document.getElementById("MSE-on").checked = cfg?.["mse_on"];
  document.getElementById("MSEOutputPath").value = cfg?.["mse_output"];
  document.getElementById("TAE-on").checked = cfg?.["tae_on"];
  document.getElementById("TAEOutputPath").value = cfg?.["tae_output"];
  document.getElementById("SRMSE-on").checked = cfg?.["srmse_on"];
  document.getElementById("SRMSEOutputPath").value = cfg?.["srmse_output"];
  document.getElementById("DumpDot").checked = cfg?.["dump_dot_graph"];
}
