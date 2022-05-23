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

import {displayCfgToEditor} from './displaycfg.js';
import oneOptimizationList from './one-optimizations.json' assert {type : 'json'};
import {applyUpdates, updateCodegen, updateImportInputModelType, updateImportKERAS, updateImportONNX, updateImportPB, updateImportSAVED, updateImportTFLITE, updateOptimize, updateProfile, updateSteps} from './updateContent.js';
import {updateImportUI, updateStepUI} from './updateUI.js';

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener('load', main);

// Main function that gets executed once the webview DOM loads
function main() {
  registerSteps();
  registerImportOptions();
  registerOptimizeOptions();
  registerCodegenOptions();
  registerProfileOptions();

  // event from vscode extension
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'displayCfgToEditor':
        displayCfgToEditor(message.text);
        break;
      default:
        break;
    }
  });
}

function registerSteps() {
  const checkboxImport = document.getElementById('checkboxImport');
  const checkboxOptimize = document.getElementById('checkboxOptimize');
  const checkboxQuantize = document.getElementById('checkboxQuantize');
  const checkboxCodegen = document.getElementById('checkboxCodegen');
  const checkboxProfile = document.getElementById('checkboxProfile');
  const stepImport = document.getElementById('stepImport');
  const stepOptimize = document.getElementById('stepOptimize');
  const stepQuantize = document.getElementById('stepQuantize');
  const stepCodegen = document.getElementById('stepCodegen');
  const stepProfile = document.getElementById('stepProfile');

  checkboxImport.addEventListener('click', function() {
    updateSteps();
    updateImportInputModelType();
    applyUpdates();
  });
  checkboxOptimize.addEventListener('click', function() {
    updateSteps();
    updateOptimize();
    applyUpdates();
  });
  checkboxQuantize.addEventListener('click', function() {
    updateSteps();
    // TODO Implement this
    // UpdateQuantize();
    applyUpdates();
  });
  checkboxCodegen.addEventListener('click', function() {
    updateSteps();
    updateCodegen();
    applyUpdates();
  });
  checkboxProfile.addEventListener('click', function() {
    updateSteps();
    updateProfile();
    applyUpdates();
  });

  stepImport.addEventListener('click', function() {
    updateStepUI('Import');
  });
  stepOptimize.addEventListener('click', function() {
    updateStepUI('Optimize');
  });
  stepQuantize.addEventListener('click', function() {
    updateStepUI('Quantize');
  });
  stepCodegen.addEventListener('click', function() {
    updateStepUI('Codegen');
  });
  stepProfile.addEventListener('click', function() {
    updateStepUI('Profile');
  });
}

function registerImportOptions() {
  const importInputModelType = document.getElementById('importInputModelType');
  importInputModelType.addEventListener('click', function() {
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
}

function registerPBOptions() {
  const pbInputPath = document.getElementById('PBInputPath');
  const pbOutputPath = document.getElementById('PBOutputPath');
  const pbConverterVersion = document.getElementById('PBConverterVersion');
  const pbInputArrays = document.getElementById('PBInputArrays');
  const pbOutputArrays = document.getElementById('PBOutputArrays');
  const pbInputShapes = document.getElementById('PBInputShapes');

  // NOTE For radio button, 'change' event is applied from beginning.
  //      So 'click' event should be used to avoid the problem.
  pbConverterVersion.addEventListener('click', function() {
    updateImportPB();
    applyUpdates();
  });
  pbInputPath.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
  pbOutputPath.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
  pbInputArrays.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
  pbOutputArrays.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
  pbInputShapes.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
}

function registerSAVEDOptions() {
  const savedInputPath = document.getElementById('SAVEDInputPath');
  const savedOutputPath = document.getElementById('SAVEDOutputPath');

  savedInputPath.addEventListener('change', function() {
    updateImportSAVED();
    applyUpdates();
  });
  savedOutputPath.addEventListener('change', function() {
    updateImportSAVED();
    applyUpdates();
  });
}

function registerKERASOptions() {
  const kerasInputPath = document.getElementById('KERASInputPath');
  const kerasOutputPath = document.getElementById('KERASOutputPath');

  kerasInputPath.addEventListener('change', function() {
    updateImportKERAS();
    applyUpdates();
  });
  kerasOutputPath.addEventListener('change', function() {
    updateImportKERAS();
    applyUpdates();
  });
}

function registerTFLITEOptions() {
  const tfliteInputPath = document.getElementById('TFLITEInputPath');
  const tfliteOutputPath = document.getElementById('TFLITEOutputPath');

  tfliteInputPath.addEventListener('change', function() {
    updateImportTFLITE();
    applyUpdates();
  });
  tfliteOutputPath.addEventListener('change', function() {
    updateImportTFLITE();
    applyUpdates();
  });
}

function registerONNXOptions() {
  const onnxInputPath = document.getElementById('ONNXInputPath');
  const onnxOutputPath = document.getElementById('ONNXOutputPath');
  const onnxSaveIntermediate = document.getElementById('ONNXSaveIntermediate');
  const onnxUnrollRNN = document.getElementById('ONNXUnrollRNN');
  const onnxUnrollLSTM = document.getElementById('ONNXUnrollLSTM');

  onnxInputPath.addEventListener('change', function() {
    updateImportONNX();
    applyUpdates();
  });
  onnxOutputPath.addEventListener('change', function() {
    updateImportONNX();
    applyUpdates();
  });
  onnxSaveIntermediate.addEventListener('click', function() {
    updateImportONNX();
    applyUpdates();
  });
  onnxUnrollRNN.addEventListener('click', function() {
    updateImportONNX();
    applyUpdates();
  });
  onnxUnrollLSTM.addEventListener('click', function() {
    updateImportONNX();
    applyUpdates();
  });
}

function registerOptimizeOptions() {
  const optimizeInputPath = document.getElementById('optimizeInputPath');
  const optimizeOutputPath = document.getElementById('optimizeOutputPath');
  const basicOptimizeTable = document.getElementById('basicOptimizeTable');
  const customOptimize = document.getElementById('customOptimizeTable');

  optimizeInputPath.addEventListener('change', function() {
    updateOptimize();
    applyUpdates();
  });

  optimizeOutputPath.addEventListener('change', function() {
    updateOptimize();
    applyUpdates();
  });

  for (const optName in oneOptimizationList) {
    let row = document.createElement('vscode-data-grid-row');
    let cellName = document.createElement('vscode-data-grid-cell');
    cellName.textContent = optName;
    cellName.setAttribute('grid-column', '1');
    row.appendChild(cellName);

    let cellSwitch = document.createElement('vscode-data-grid-cell');
    cellSwitch.textContent = 'OFF';
    cellSwitch.setAttribute('grid-column', '2');
    cellSwitch.setAttribute('id', 'optimize-' + optName);
    cellSwitch.setAttribute('style', 'cursor: pointer');
    cellSwitch.addEventListener('click', function() {
      cellSwitch.textContent = cellSwitch.textContent === 'ON' ? 'OFF' : 'ON';
      updateOptimize();
      applyUpdates();
    });
    row.appendChild(cellSwitch);

    let cellDescription = document.createElement('vscode-data-grid-cell');
    cellDescription.textContent = oneOptimizationList[optName].description;
    cellDescription.setAttribute('grid-column', '3');
    row.appendChild(cellDescription);

    basicOptimizeTable.appendChild(row);
  }
}

function registerCodegenOptions() {
  const codegenBackend = document.getElementById('codegenBackend');
  const codegenCommand = document.getElementById('codegenCommand');

  codegenBackend.addEventListener('change', function() {
    updateCodegen();
    applyUpdates();
  });
  codegenCommand.addEventListener('change', function() {
    updateCodegen();
    applyUpdates();
  });
}

function registerProfileOptions() {
  const profileBackend = document.getElementById('profileBackend');
  const profileCommand = document.getElementById('profileCommand');

  profileBackend.addEventListener('change', function() {
    updateProfile();
    applyUpdates();
  });
  profileCommand.addEventListener('change', function() {
    updateProfile();
    applyUpdates();
  });
}

/* Backlog for unused functions

function expandDetail() {
  const expandedDetail = document.getElementById('expandedDetail');
  const collapsedDetail = document.getElementById('collapsedDetail');
  const optionSummary = document.getElementById('optionSummary');
  const statusBar = document.querySelector('.statusbar .steps');

  updateStepUI('Summary');

  collapsedDetail.style.display = 'none';
  expandedDetail.style.display = 'inline-block';
  optionSummary.style.display = 'block';
  statusBar.style.display = 'inline-flex';
}

function collapseDetail() {
  const expandedDetail = document.getElementById('expandedDetail');
  const collapsedDetail = document.getElementById('collapsedDetail');
  const optionSummary = document.getElementById('optionSummary');
  const statusBar = document.querySelector('.statusbar .steps');

  updateStepUI('Summary');

  collapsedDetail.style.display = 'inline-block';
  expandedDetail.style.display = 'none';
  optionSummary.style.display = 'block';
  statusBar.style.display = 'none';
}

*/