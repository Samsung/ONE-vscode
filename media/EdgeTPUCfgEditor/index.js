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

import { displayCfgToEditor } from "./displaycfg.js";
import {
  applyUpdates,
  updateEdgeTPUStep,
  updateEdgeTPUCompile
} from "./updateContent.js";
import {
  updateStepUI,
} from "./updateUI.js";
import { postMessageToVsCode } from "./vscodeapi.js";

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
  registerCompilerStep();
  registerCompileOptions();
  registerCodiconEvents();

  // event from vscode extension
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "displayCfgToEditor":
        displayCfgToEditor(message.text);
        break;
      case "setDefaultEdgetpuValues":
        setDefaultEdgetpuValues(message.name);
        break;
      case "applyDialogPath":
        document.getElementById(message.elemID).value = message.path;
        switch (message.step) {          
          case "EdgeTPUCompile":
            updateEdgeTPUCompile();
            break;
          default:
            break;
        }
        applyUpdates();
        break;
      default:
        break;
    }
  });

  postMessageToVsCode({ type: "requestDisplayCfg" });
}

function setDefaultEdgetpuValues(name) {
  // EdgeTPu COmpiler steps
  document.getElementById("checkboxEdgeTPUCompile").checked = true;

  updateEdgeTPUStep();

  // compile step
  let compiledName = name + ".tflite";
  let compiledExt = name + "_edgetpu.tflite";
  document.getElementById("EdgeTPUInputPath").value = compiledName;
  document.getElementById("EdgeTPUOutputPath").value = compiledExt;

  updateEdgeTPUCompile();

  // apply
  applyUpdates();
}

function registerCompilerStep() {
  const checkboxEdgeTPUCompile = document.getElementById("checkboxEdgeTPUCompile");
  const checkboxEdgeTPUProfile = document.getElementById("checkboxEdgeTPUProfile");
  const stepEdgeTPUCompile = document.getElementById("stepEdgeTPUCompile");
  const stepEdgeTPUProfile = document.getElementById("stepEdgeTPUProfile");

  checkboxEdgeTPUCompile.addEventListener("click", function () {
    updateEdgeTPUStep();    
    applyUpdates();
  });
  checkboxEdgeTPUProfile.addEventListener("click", function () {
    updateEdgeTPUStep();    
    applyUpdates();
  });
  
  stepEdgeTPUCompile.addEventListener("click", function () {
    updateStepUI("EdgeTPUCompile");
  });
  stepEdgeTPUProfile.addEventListener("click", function () {
    updateStepUI("EdgeTPUProfile");
  });
}

function registerCompileOptions() {
  const edgeTPUInputPath = document.getElementById("EdgeTPUInputPath");
  const edgeTPUIntermediateTensors = document.getElementById(
    "EdgeTPUIntermediateTensorsInputArrays"
  );
  const edgeTPUShowOperations = document.getElementById(
    "EdgeTPUShowOperations"
  );
  const edgeTPUSearchDelegate = document.getElementById(
    "EdgeTPUSearchDelegate"
  );
  const edgeTPUDelegateSearchStep = document.getElementById(
    "EdgeTPUDelegateSearchStep"
  );
  const edgeTPUDelegateSearchStepDiv = document.getElementById(
    "EdgeTPUDelegateSearchStepDiv"
  );

  edgeTPUInputPath.addEventListener("input", function () {
    updateEdgeTPUCompile();
    applyUpdates();
  });
  edgeTPUIntermediateTensors.addEventListener("input", function () {
    if (edgeTPUSearchDelegate.checked) {
      edgeTPUSearchDelegate.checked = false;
      edgeTPUDelegateSearchStepDiv.style.display = "none";
    }
    updateEdgeTPUCompile();
    applyUpdates();
  });
  edgeTPUShowOperations.addEventListener("click", function () {
    updateEdgeTPUCompile();
    applyUpdates();
  });
  edgeTPUSearchDelegate.addEventListener("click", function () {
    if (edgeTPUSearchDelegate.checked) {
      edgeTPUIntermediateTensors.value = "";
      edgeTPUDelegateSearchStepDiv.style.display = "block";
    } else {
      edgeTPUDelegateSearchStepDiv.style.display = "none";
    }
    updateEdgeTPUCompile();
    applyUpdates();
  });
  edgeTPUDelegateSearchStep.addEventListener("input", function () {
    edgeTPUDelegateSearchStep.value =
      edgeTPUDelegateSearchStep.value < 1
        ? "1"
        : edgeTPUDelegateSearchStep.value;
        updateEdgeTPUCompile();
    applyUpdates();
  });
}

function registerCodiconEvents() {
  document
    .getElementById("EdgeTPUInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["tflite"],
        oldPath: document.getElementById("EdgeTPUInputPath").value,
        postStep: "EdgeTPUCompile",
        postElemID: "EdgeTPUInputPath",
      });
    });
}
