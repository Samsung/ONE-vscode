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
/*
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*
This code refers to
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/blob/b807107df40271e83ea6d36828357fdb10d71f12/default/hello-world/webview-ui/main.js
*/

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener('load', main);

// Main function that gets executed once the webview DOM loads
function main() {
  const inputPathCodicon = document.getElementById('inputPathCodicon');
  inputPathCodicon.addEventListener('click', clickInputPathCodicon);

  const importEnabled = document.getElementById('ImportEnabled');
  const importDisabled = document.getElementById('ImportDisabled');
  const importLink = document.getElementById('linkEnableImport');
  importEnabled.addEventListener('click', disableImportStep);
  importDisabled.addEventListener('click', function() {
    enableImportStep(true);
  });
  importLink.addEventListener('click', function() {
    enableImportStep(true);
  });

  const optimizeEnabled = document.getElementById('OptimizeEnabled');
  const optimizeDisabled = document.getElementById('OptimizeDisabled');
  const optimizeLink = document.getElementById('linkEnableOptimize');
  optimizeEnabled.addEventListener('click', function() {
    disableStep('Optimize', true);
  });
  optimizeDisabled.addEventListener('click', function() {
    enableStep('Optimize', true);
  });
  optimizeLink.addEventListener('click', function() {
    enableStep('Optimize', true);
  });

  const quantizeEnabled = document.getElementById('QuantizeEnabled');
  const quantizeDisabled = document.getElementById('QuantizeDisabled');
  const quantizeLink = document.getElementById('linkEnableQuantize');
  quantizeEnabled.addEventListener('click', function() {
    disableStep('Quantize', true);
  });
  quantizeDisabled.addEventListener('click', function() {
    enableStep('Quantize', true);
  });
  quantizeLink.addEventListener('click', function() {
    enableStep('Quantize', true);
  });

  const codegenEnabled = document.getElementById('CodegenEnabled');
  const codegenDisabled = document.getElementById('CodegenDisabled');
  const codegenLink = document.getElementById('linkEnableCodegen');
  codegenEnabled.addEventListener('click', function() {
    disableStep('Codegen', true);
  });
  codegenDisabled.addEventListener('click', function() {
    enableStep('Codegen', true);
  });
  codegenLink.addEventListener('click', function() {
    enableStep('Codegen', true);
  });

  const profileEnabled = document.getElementById('ProfileEnabled');
  const profileDisabled = document.getElementById('ProfileDisabled');
  const profileLink = document.getElementById('linkEnableProfile');
  profileEnabled.addEventListener('click', function() {
    disableStep('Profile', true);
  });
  profileDisabled.addEventListener('click', function() {
    enableStep('Profile', true);
  });
  profileLink.addEventListener('click', function() {
    enableStep('Profile', true);
  });

  const outputPathCodicon = document.getElementById('outputPathCodicon');
  outputPathCodicon.addEventListener('click', clickOutputPathCodicon);

  const inputModelSearchCodicon = document.getElementById('inputModelSearch');
  inputModelSearchCodicon.addEventListener('click', inputModelSearchClick);

  const outputPathSearchCodicon = document.getElementById('outputPathSearch');
  outputPathSearchCodicon.addEventListener('click', outputPathSearchClick);

  const modelTypeRadio = document.getElementById('modelTypeRadio');
  modelTypeRadio.addEventListener('click', modelTypeClick);

  const foldAdvancedOptionsButton = document.getElementById('foldAdvancedOptions');
  const unfoldAdvancedOptionsButton = document.getElementById('unfoldAdvancedOptions');
  foldAdvancedOptionsButton.addEventListener('click', function() {
    clickFold('AdvancedOptions');
  });
  unfoldAdvancedOptionsButton.addEventListener('click', function() {
    clickUnfold('AdvancedOptions');
  });

  const foldPBIntermediatePathsButton = document.getElementById('foldPBIntermediatePaths');
  const unfoldPBIntermediatePathsButton = document.getElementById('unfoldPBIntermediatePaths');
  foldPBIntermediatePathsButton.addEventListener('click', function() {
    clickFold('PBIntermediatePaths');
  });
  unfoldPBIntermediatePathsButton.addEventListener('click', function() {
    clickUnfold('PBIntermediatePaths');
  });

  const foldSAVEDIntermediatePathsButton = document.getElementById('foldSAVEDIntermediatePaths');
  const unfoldSAVEDIntermediatePathsButton =
      document.getElementById('unfoldSAVEDIntermediatePaths');
  foldSAVEDIntermediatePathsButton.addEventListener('click', function() {
    clickFold('SAVEDIntermediatePaths');
  });
  unfoldSAVEDIntermediatePathsButton.addEventListener('click', function() {
    clickUnfold('SAVEDIntermediatePaths');
  });

  const foldKERASIntermediatePathsButton = document.getElementById('foldKERASIntermediatePaths');
  const unfoldKERASIntermediatePathsButton =
      document.getElementById('unfoldKERASIntermediatePaths');
  foldKERASIntermediatePathsButton.addEventListener('click', function() {
    clickFold('KERASIntermediatePaths');
  });
  unfoldKERASIntermediatePathsButton.addEventListener('click', function() {
    clickUnfold('KERASIntermediatePaths');
  });

  const foldTFLITEIntermediatePathsButton = document.getElementById('foldTFLITEIntermediatePaths');
  const unfoldTFLITEIntermediatePathsButton =
      document.getElementById('unfoldTFLITEIntermediatePaths');
  foldTFLITEIntermediatePathsButton.addEventListener('click', function() {
    clickFold('TFLITEIntermediatePaths');
  });
  unfoldTFLITEIntermediatePathsButton.addEventListener('click', function() {
    clickUnfold('TFLITEIntermediatePaths');
  });

  const foldONNXIntermediatePathsButton = document.getElementById('foldONNXIntermediatePaths');
  const unfoldONNXIntermediatePathsButton = document.getElementById('unfoldONNXIntermediatePaths');
  foldONNXIntermediatePathsButton.addEventListener('click', function() {
    clickFold('ONNXIntermediatePaths');
  });
  unfoldONNXIntermediatePathsButton.addEventListener('click', function() {
    clickUnfold('ONNXIntermediatePaths');
  });

  // event from vscode extension
  window.addEventListener('message', event => {
    const message = event.data;

    switch (message.type) {
      // TODO Add more message Hanler
    }
  });
}

function outputPathSearchClick() {
  vscode.postMessage({type: 'setOutputPath'});
}

function inputModelSearchClick() {
  vscode.postMessage({type: 'setInputPath'});
}

function enableStep(step, isFocus) {
  const stepEnabled = document.getElementById(step + 'Enabled');
  const stepDisabled = document.getElementById(step + 'Disabled');
  const panelStepEnabled = document.getElementById('panel' + step + 'Enabled');
  const panelStepDisabled = document.getElementById('panel' + step + 'Disabled');

  stepEnabled.style.display = 'block';
  stepDisabled.style.display = 'none';
  panelStepEnabled.style.display = 'block';
  panelStepDisabled.style.display = 'none';

  if (isFocus) {
    clickUnfold('AdvancedOptions');
    const advancedOptions = document.getElementById('AdvancedOptions');
    advancedOptions.activeid = 'tab' + step;
  }
}

function disableStep(step) {
  const stepEnabled = document.getElementById(step + 'Enabled');
  const stepDisabled = document.getElementById(step + 'Disabled');
  const panelStepEnabled = document.getElementById('panel' + step + 'Enabled');
  const panelStepDisabled = document.getElementById('panel' + step + 'Disabled');

  stepEnabled.style.display = 'none';
  stepDisabled.style.display = 'block';
  panelStepEnabled.style.display = 'none';
  panelStepDisabled.style.display = 'block';
}

function enableImportStep(isFocus) {
  enableStep('Import', isFocus);

  const modelTypeRadioArea = document.getElementById('modelTypeRadioArea');
  modelTypeRadioArea.style.display = 'block';
}

function disableImportStep() {
  disableStep('Import');

  const modelTypeRadioArea = document.getElementById('modelTypeRadioArea');
  modelTypeRadioArea.style.display = 'none';
}

function clickUnfold(id) {
  const foldButton = document.getElementById('fold' + id);
  const unfoldButton = document.getElementById('unfold' + id);
  const content = document.getElementById(id);

  content.style.display = 'block';
  foldButton.style.display = 'inline';
  unfoldButton.style.display = 'none';
}

function clickFold(id) {
  const foldButton = document.getElementById('fold' + id);
  const unfoldButton = document.getElementById('unfold' + id);
  const content = document.getElementById(id);

  content.style.display = 'none';
  foldButton.style.display = 'none';
  unfoldButton.style.display = 'inline';
}

function modelTypeClick() {
  const modelType = document.getElementById('modelTypeRadio').value;
  const initialImportState = document.getElementById('ImportInitialState');
  const pbConverterOptions = document.getElementById('PBConverterOptions');
  const savedConverterOptions = document.getElementById('SAVEDConverterOptions');
  const kerasConverterOptions = document.getElementById('KERASConverterOptions');
  const tflConverterOptions = document.getElementById('TFLITEConverterOptions');
  const onnxConverterOptions = document.getElementById('ONNXConverterOptions');

  initialImportState.style.display = 'none';
  pbConverterOptions.style.display = 'none';
  savedConverterOptions.style.display = 'none';
  kerasConverterOptions.style.display = 'none';
  tflConverterOptions.style.display = 'none';
  onnxConverterOptions.style.display = 'none';

  switch (modelType) {
    case 'pb':
      pbConverterOptions.style.display = 'block';
      return;
    case 'savedModel':
      savedConverterOptions.style.display = 'block';
      return;
    case 'kerasModel':
      kerasConverterOptions.style.display = 'block';
      return;
    case 'tflite':
      tflConverterOptions.style.display = 'block';
      return;
    case 'onnx':
      onnxConverterOptions.style.display = 'block';
      return;
    default:
      return;
  }
}

function clickInputPathCodicon() {
  document.getElementById('inputPath').focus();
}

function clickOutputPathCodicon() {
  document.getElementById('outputPath').focus();
}
