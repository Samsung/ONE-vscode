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

import { displayCfgToEditor } from "./displaycfg.js";
import oneOptimizationList from "./one-optimizations.json" assert { type: "json" };
import {
  applyUpdates,
  updateCodegen,
  updateImportInputModelType,
  updateImportKERAS,
  updateImportONNX,
  updateImportPB,
  updateImportSAVED,
  updateImportTFLITE,
  updateImportEdgeTPU,
  updateOptimize,
  updateProfile,
  updateQuantizeActionType,
  updateQuantizeCopy,
  updateQuantizeDefault,
  updateQuantizeForce,
  updateSteps,
} from "./updateContent.js";
import { updateImportUI, updateQuantizeUI, updateStepUI } from "./updateUI.js";
import { postMessageToVsCode } from "./vscodeapi.js";

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
  registerSteps();
  registerImportOptions();
  registerOptimizeOptions();
  registerQuantizeOptions();
  registerCodegenOptions();
  registerProfileOptions();
  registerCodiconEvents();

  // event from vscode extension
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "displayCfgToEditor":
        displayCfgToEditor(message.text);
        break;
      case "setDefaultValues":
        setDefaultValues(message.name);
        break;
      case "applyDialogPath":
        document.getElementById(message.elemID).value = message.path;
        switch (message.step) {
          case "ImportPB":
            updateImportPB();
            break;
          case "ImportSAVED":
            updateImportSAVED();
            break;
          case "ImportKERAS":
            updateImportKERAS();
            break;
          case "ImportTFLITE":
            updateImportTFLITE();
            break;
          case "ImportONNX":
            updateImportONNX();
            break;
          case "ImportEdgeTPU":
            updateImportEdgeTPU();
            break;
          case "Optimize":
            updateOptimize();
            break;
          case "QuantizeDefault":
            updateQuantizeDefault();
            break;
          case "QuantizeForce":
            updateQuantizeForce();
            break;
          case "QuantizeCopy":
            updateQuantizeCopy();
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

function setDefaultValues(name) {
  // import step
  let importedName = name;
  let importedExt = name + ".circle";
  const importTypeInfo = {
    pb: ["PBOutputPath", updateImportPB],
    saved: ["SAVEDOutputPath", updateImportSAVED],
    keras: ["KERASOutputPath", updateImportKERAS],
    tflite: ["TFLITEOutputPath", updateImportTFLITE],
    onnx: ["ONNXOutputPath", updateImportONNX],
  };
  const curInputType = document.getElementById("importInputModelType").value;
  if (curInputType in importTypeInfo) {
    const fieldId = importTypeInfo[curInputType][0];
    const updateFunc = importTypeInfo[curInputType][1];

    document.getElementById(fieldId).value = importedExt;
    updateFunc();
  } else {
    return;
  }

  // optimization step parameters
  let optimizedName = importedName + ".opt";
  let optimizedExt = optimizedName + ".circle";
  document.getElementById("optimizeInputPath").value = importedExt;
  document.getElementById("optimizeOutputPath").value = optimizedExt;
  updateOptimize();

  // quantization step parameters
  const qType = document.getElementById("DefaultQuantQuantizedDtype").value;
  const qSuffix = qType === "uint8" ? ".q8" : ".q16";
  const optimizationUsed = document.getElementById("checkboxOptimize").checked;
  let quantizedName = optimizationUsed
    ? optimizedName + qSuffix
    : importedName + qSuffix;
  let quantizedExt = quantizedName + ".circle";
  // input
  document.getElementById("DefaultQuantInputPath").value = optimizationUsed
    ? optimizedExt
    : importedExt;
  // output
  document.getElementById("DefaultQuantOutputPath").value = quantizedExt;
  updateQuantizeDefault();

  // apply
  applyUpdates();
}

function registerSteps() {
  const checkboxImport = document.getElementById("checkboxImport");
  const checkboxOptimize = document.getElementById("checkboxOptimize");
  const checkboxQuantize = document.getElementById("checkboxQuantize");
  const checkboxCodegen = document.getElementById("checkboxCodegen");
  const checkboxProfile = document.getElementById("checkboxProfile");
  const stepImport = document.getElementById("stepImport");
  const stepOptimize = document.getElementById("stepOptimize");
  const stepQuantize = document.getElementById("stepQuantize");
  const stepCodegen = document.getElementById("stepCodegen");
  const stepProfile = document.getElementById("stepProfile");

  checkboxImport.addEventListener("click", function () {
    updateSteps();
    updateImportInputModelType();
    applyUpdates();
  });
  checkboxOptimize.addEventListener("click", function () {
    updateSteps();
    updateOptimize();
    applyUpdates();
  });
  checkboxQuantize.addEventListener("click", function () {
    updateSteps();
    updateQuantizeActionType();
    applyUpdates();
  });
  checkboxCodegen.addEventListener("click", function () {
    updateSteps();
    updateCodegen();
    applyUpdates();
  });
  checkboxProfile.addEventListener("click", function () {
    updateSteps();
    updateProfile();
    applyUpdates();
  });

  stepImport.addEventListener("click", function () {
    updateStepUI("Import");
  });
  stepOptimize.addEventListener("click", function () {
    updateStepUI("Optimize");
  });
  stepQuantize.addEventListener("click", function () {
    updateStepUI("Quantize");
  });
  stepCodegen.addEventListener("click", function () {
    updateStepUI("Codegen");
  });
  stepProfile.addEventListener("click", function () {
    updateStepUI("Profile");
  });
}

function registerImportOptions() {
  const importInputModelType = document.getElementById("importInputModelType");
  importInputModelType.addEventListener("click", function () {
    updateImportUI();
    updateImportInputModelType();
    updateSteps();
    applyUpdates();
  });

  registerPBOptions();
  registerSAVEDOptions();
  registerKERASOptions();
  registerTFLITEOptions();
  registerONNXOptions();
  registerEdgeTPUOptions();
}

function registerPBOptions() {
  const pbInputPath = document.getElementById("PBInputPath");
  const pbOutputPath = document.getElementById("PBOutputPath");
  const pbConverterVersion = document.getElementById("PBConverterVersion");
  const pbInputArrays = document.getElementById("PBInputArrays");
  const pbOutputArrays = document.getElementById("PBOutputArrays");
  const pbInputShapes = document.getElementById("PBInputShapes");

  // NOTE For radio button, 'change' event is applied from beginning.
  //      So 'click' event should be used to avoid the problem.
  pbConverterVersion.addEventListener("click", function () {
    updateImportPB();
    applyUpdates();
  });
  pbInputPath.addEventListener("input", function () {
    updateImportPB();
    applyUpdates();
  });
  pbOutputPath.addEventListener("input", function () {
    updateImportPB();
    applyUpdates();
  });
  pbInputArrays.addEventListener("input", function () {
    updateImportPB();
    applyUpdates();
  });
  pbOutputArrays.addEventListener("input", function () {
    updateImportPB();
    applyUpdates();
  });
  pbInputShapes.addEventListener("input", function () {
    updateImportPB();
    applyUpdates();
  });
}

function registerSAVEDOptions() {
  const savedInputPath = document.getElementById("SAVEDInputPath");
  const savedOutputPath = document.getElementById("SAVEDOutputPath");

  savedInputPath.addEventListener("input", function () {
    updateImportSAVED();
    applyUpdates();
  });
  savedOutputPath.addEventListener("input", function () {
    updateImportSAVED();
    applyUpdates();
  });
}

function registerKERASOptions() {
  const kerasInputPath = document.getElementById("KERASInputPath");
  const kerasOutputPath = document.getElementById("KERASOutputPath");

  kerasInputPath.addEventListener("input", function () {
    updateImportKERAS();
    applyUpdates();
  });
  kerasOutputPath.addEventListener("input", function () {
    updateImportKERAS();
    applyUpdates();
  });
}

function registerTFLITEOptions() {
  const tfliteInputPath = document.getElementById("TFLITEInputPath");
  const tfliteOutputPath = document.getElementById("TFLITEOutputPath");

  tfliteInputPath.addEventListener("input", function () {
    updateImportTFLITE();
    applyUpdates();
  });
  tfliteOutputPath.addEventListener("input", function () {
    updateImportTFLITE();
    applyUpdates();
  });
}

function registerONNXOptions() {
  const onnxInputPath = document.getElementById("ONNXInputPath");
  const onnxOutputPath = document.getElementById("ONNXOutputPath");
  const onnxSaveIntermediate = document.getElementById("ONNXSaveIntermediate");
  const onnxUnrollRNN = document.getElementById("ONNXUnrollRNN");
  const onnxUnrollLSTM = document.getElementById("ONNXUnrollLSTM");

  onnxInputPath.addEventListener("input", function () {
    updateImportONNX();
    applyUpdates();
  });
  onnxOutputPath.addEventListener("input", function () {
    updateImportONNX();
    applyUpdates();
  });
  onnxSaveIntermediate.addEventListener("click", function () {
    updateImportONNX();
    applyUpdates();
  });
  onnxUnrollRNN.addEventListener("click", function () {
    updateImportONNX();
    applyUpdates();
  });
  onnxUnrollLSTM.addEventListener("click", function () {
    updateImportONNX();
    applyUpdates();
  });
}

function registerEdgeTPUOptions() {
  const edgeTPUInputPath = document.getElementById("EdgeTPUInputPath");
  const edgeTPUHelp = document.getElementById("EdgeTPUHelp");
  const edgeTPUIntermediateTensors = document.getElementById("EdgeTPUIntermediateTensorsInputArrays");
  const edgeTPUShowOperations = document.getElementById(
    "EdgeTPUShowOperations"
  );
  const edgeTPUMinRuntimeVersion = document.getElementById(
    "EdgeTPUMinRuntimeVersion"
  );  
  const edgeTPUSearchDelegate = document.getElementById(
    "EdgeTPUSearchDelegate"
  );
  
  edgeTPUInputPath.addEventListener("input", function () {
    updateImportEdgeTPU();
    applyUpdates();
  });
  edgeTPUHelp.addEventListener("click", function () {
    updateImportEdgeTPU();
    applyUpdates();
  });
  edgeTPUIntermediateTensors.addEventListener("input",function(){
    updateImportEdgeTPU();
    applyUpdates();
  });
  edgeTPUShowOperations.addEventListener("click", function () {
    updateImportEdgeTPU();
    applyUpdates();
  });
  edgeTPUMinRuntimeVersion.addEventListener("input", function () {
    updateImportEdgeTPU();
    applyUpdates();
  });
  edgeTPUSearchDelegate.addEventListener("click", function () {
    updateImportEdgeTPU();
    applyUpdates();
  });
  edgeTPUSearchDelegate.addEventListener("click", function () {
    updateImportEdgeTPU();
    applyUpdates();   
  });
}

function registerOptimizeOptions() {
  const optimizeInputPath = document.getElementById("optimizeInputPath");
  const optimizeOutputPath = document.getElementById("optimizeOutputPath");
  const basicOptimizeTable = document.getElementById("basicOptimizeTable");

  optimizeInputPath.addEventListener("input", function () {
    updateOptimize();
    applyUpdates();
  });

  optimizeOutputPath.addEventListener("input", function () {
    updateOptimize();
    applyUpdates();
  });

  for (const optName in oneOptimizationList) {
    let row = document.createElement("vscode-data-grid-row");

    let cellSwitch = document.createElement("vscode-data-grid-cell");
    let checkbox = document.createElement("vscode-checkbox");
    checkbox.setAttribute("id", "checkboxOptimize" + optName);
    cellSwitch.appendChild(checkbox);
    cellSwitch.setAttribute("grid-column", "1");
    row.appendChild(cellSwitch);

    let cellName = document.createElement("vscode-data-grid-cell");
    cellName.textContent = optName;
    cellName.setAttribute("grid-column", "2");
    row.appendChild(cellName);

    let cellDescription = document.createElement("vscode-data-grid-cell");
    cellDescription.textContent = oneOptimizationList[optName].description;
    cellDescription.setAttribute("grid-column", "3");
    row.appendChild(cellDescription);

    basicOptimizeTable.appendChild(row);
  }

  for (const optName in oneOptimizationList) {
    document
      .getElementById("checkboxOptimize" + optName)
      .addEventListener("click", function () {
        updateOptimize();
        applyUpdates();
      });
  }
}

function registerQuantizeOptions() {
  const quantActionType = document.getElementById("quantizeActionType");
  quantActionType.addEventListener("click", function () {
    updateQuantizeUI();
    updateQuantizeActionType();
    applyUpdates();
  });

  registerDefaultQuantOptions();
  registerForceQuantOptions();
  registerCopyQuantOptions();
}

function registerDefaultQuantOptions() {
  const defaultQuantRadioButtonList = [
    "DefaultQuantInputModelDtype",
    "DefaultQuantQuantizedDtype",
    "DefaultQuantGranularity",
    "DefaultQuantInputDataFormat",
    "DefaultQuantMode",
    "DefaultQuantInputType",
    "DefaultQuantOutputType",
  ];
  const defaultQuantCheckboxList = [
    "DefaultQuantVerbose",
    "DefaultQuantSaveIntermediate",
    "DefaultQuantGenerateProfileData",
    "DefaultQuantTFStyleMaxpool",
  ];
  const defaultQuantTextFieldList = [
    "DefaultQuantInputPath",
    "DefaultQuantOutputPath",
    "DefaultQuantQuantConfig",
    "DefaultQuantInputData",
    "DefaultQuantMinPercentile",
    "DefaultQuantMaxPercentile",
  ];

  defaultQuantRadioButtonList.forEach((id) => {
    document.getElementById(id).addEventListener("click", function () {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
  defaultQuantCheckboxList.forEach((id) => {
    document.getElementById(id).addEventListener("click", function () {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
  defaultQuantTextFieldList.forEach((id) => {
    document.getElementById(id).addEventListener("input", function () {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
}

function registerForceQuantOptions() {
  const forceQuantCheckboxList = ["ForceQuantVerbose"];
  const forceQuantTextFieldList = [
    "ForceQuantInputPath",
    "ForceQuantOutputPath",
    "ForceQuantTensorName",
    "ForceQuantScale",
    "ForceQuantZeroPoint",
  ];

  forceQuantCheckboxList.forEach((id) => {
    document.getElementById(id).addEventListener("click", function () {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
  forceQuantTextFieldList.forEach((id) => {
    document.getElementById(id).addEventListener("input", function () {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
}

function registerCopyQuantOptions() {
  const copyQuantCheckboxList = ["CopyQuantVerbose"];
  const copyQuantTextFieldList = [
    "CopyQuantInputPath",
    "CopyQuantOutputPath",
    "CopyQuantSrcTensorName",
    "CopyQuantDstTensorName",
  ];

  copyQuantCheckboxList.forEach((id) => {
    document.getElementById(id).addEventListener("click", function () {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
  copyQuantTextFieldList.forEach((id) => {
    document.getElementById(id).addEventListener("input", function () {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
}

function registerCodegenOptions() {
  const codegenBackend = document.getElementById("codegenBackend");
  const codegenCommand = document.getElementById("codegenCommand");

  codegenBackend.addEventListener("input", function () {
    updateCodegen();
    applyUpdates();
  });
  codegenCommand.addEventListener("input", function () {
    updateCodegen();
    applyUpdates();
  });
}

function registerProfileOptions() {
  const profileBackend = document.getElementById("profileBackend");
  const profileCommand = document.getElementById("profileCommand");

  profileBackend.addEventListener("input", function () {
    updateProfile();
    applyUpdates();
  });
  profileCommand.addEventListener("input", function () {
    updateProfile();
    applyUpdates();
  });
}

function registerCodiconEvents() {
  document
    .getElementById("PBInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["pb"],
        oldPath: document.getElementById("PBInputPath").value,
        postStep: "ImportPB",
        postElemID: "PBInputPath",
      });
    });
  document
    .getElementById("PBOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("PBOutputPath").value,
        postStep: "ImportPB",
        postElemID: "PBOutputPath",
      });
    });
  document
    .getElementById("SAVEDInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: true,
        ext: [],
        oldPath: document.getElementById("SAVEDInputPath").value,
        postStep: "ImportSAVED",
        postElemID: "SAVEDInputPath",
      });
    });
  document
    .getElementById("SAVEDOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("SAVEDOutputPath").value,
        postStep: "ImportSAVED",
        postElemID: "SAVEDOutputPath",
      });
    });
  document
    .getElementById("KERASInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["h5"],
        oldPath: document.getElementById("KERASInputPath").value,
        postStep: "ImportKERAS",
        postElemID: "KERASInputPath",
      });
    });
  document
    .getElementById("KERASOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("KERASOutputPath").value,
        postStep: "ImportKERAS",
        postElemID: "KERASOutputPath",
      });
    });
  document
    .getElementById("TFLITEInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["tflite"],
        oldPath: document.getElementById("TFLITEInputPath").value,
        postStep: "ImportTFLITE",
        postElemID: "TFLITEInputPath",
      });
    });
  document
    .getElementById("TFLITEOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("TFLITEOutputPath").value,
        postStep: "ImportTFLITE",
        postElemID: "TFLITEOutputPath",
      });
    });
  document
    .getElementById("ONNXInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["onnx"],
        oldPath: document.getElementById("ONNXInputPath").value,
        postStep: "ImportONNX",
        postElemID: "ONNXInputPath",
      });
    });
  document
    .getElementById("ONNXOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("ONNXOutputPath").value,
        postStep: "ImportONNX",
        postElemID: "ONNXOutputPath",
      });
    });
  document
    .getElementById("optimizeInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("optimizeInputPath").value,
        postStep: "Optimize",
        postElemID: "optimizeInputPath",
      });
    });
  document
    .getElementById("optimizeOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("optimizeOutputPath").value,
        postStep: "Optimize",
        postElemID: "optimizeOutputPath",
      });
    });
  document
    .getElementById("DefaultQuantInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("DefaultQuantInputPath").value,
        postStep: "QuantizeDefault",
        postElemID: "DefaultQuantInputPath",
      });
    });
  document
    .getElementById("DefaultQuantOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("DefaultQuantOutputPath").value,
        postStep: "QuantizeDefault",
        postElemID: "DefaultQuantOutputPath",
      });
    });
  document
    .getElementById("DefaultQuantQuantConfigSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["json"],
        oldPath: document.getElementById("DefaultQuantQuantConfig").value,
        postStep: "QuantizeDefault",
        postElemID: "DefaultQuantQuantConfig",
      });
    });
  document
    .getElementById("DefaultQuantInputDataSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder:
          document.getElementById("DefaultQuantInputDataFormat").value ===
          "dir",
        ext: ["h5"],
        oldPath: document.getElementById("DefaultQuantInputData").value,
        postStep: "QuantizeDefault",
        postElemID: "DefaultQuantInputData",
      });
    });
  document
    .getElementById("ForceQuantInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("ForceQuantInputPath").value,
        postStep: "QuantizeForce",
        postElemID: "ForceQuantInputPath",
      });
    });
  document
    .getElementById("ForceQuantOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("ForceQuantOutputPath").value,
        postStep: "QuantizeForce",
        postElemID: "ForceQuantOutputPath",
      });
    });
  document
    .getElementById("CopyQuantInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("CopyQuantInputPath").value,
        postStep: "QuantizeCopy",
        postElemID: "CopyQuantInputPath",
      });
    });
  document
    .getElementById("CopyQuantOutputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["circle"],
        oldPath: document.getElementById("CopyQuantOutputPath").value,
        postStep: "QuantizeCopy",
        postElemID: "CopyQuantOutputPath",
      });
    });
  document
    .getElementById("EdgeTPUInputPathSearch")
    .addEventListener("click", function () {
      postMessageToVsCode({
        type: "getPathByDialog",
        isFolder: false,
        ext: ["tflite"],
        oldPath: document.getElementById("EdgeTPUInputPath").value,
        postStep: "ImportEdgeTPU",
        postElemID: "EdgeTPUInputPath",
      });
    });
}
