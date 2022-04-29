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
  importDisabled.addEventListener('click', enableImportStep);
  importLink.addEventListener('click', enableImportStep);

  const optimizeEnabled = document.getElementById('OptimizeEnabled');
  const optimizeDisabled = document.getElementById('OptimizeDisabled');
  const optimizeLink = document.getElementById('linkEnableOptimize');
  optimizeEnabled.addEventListener('click', disableOptimizeStep);
  optimizeDisabled.addEventListener('click', enableOptimizeStep);
  optimizeLink.addEventListener('click', enableOptimizeStep);

  const quantizeEnabled = document.getElementById('QuantizeEnabled');
  const quantizeDisabled = document.getElementById('QuantizeDisabled');
  const quantizeLink = document.getElementById('linkEnableQuantize');
  quantizeEnabled.addEventListener('click', disableQuantizeStep);
  quantizeDisabled.addEventListener('click', enableQuantizeStep);
  quantizeLink.addEventListener('click', enableQuantizeStep);

  const codegenEnabled = document.getElementById('CodegenEnabled');
  const codegenDisabled = document.getElementById('CodegenDisabled');
  const codegenLink = document.getElementById('linkEnableCodegen');
  codegenEnabled.addEventListener('click', disableCodegenStep);
  codegenDisabled.addEventListener('click', enableCodegenStep);
  codegenLink.addEventListener('click', enableCodegenStep);

  const profileEnabled = document.getElementById('ProfileEnabled');
  const profileDisabled = document.getElementById('ProfileDisabled');
  const profileLink = document.getElementById('linkEnableProfile');
  profileEnabled.addEventListener('click', disableProfileStep);
  profileDisabled.addEventListener('click', enableProfileStep);
  profileLink.addEventListener('click', enableProfileStep);

  const outputPathCodicon = document.getElementById('outputPathCodicon');
  outputPathCodicon.addEventListener('click', clickOutputPathCodicon);

  const inputModelSearchCodicon = document.getElementById('inputModelSearch');
  inputModelSearchCodicon.addEventListener('click', inputModelSearchClick);

  const outputPathSearchCodicon = document.getElementById('outputPathSearch');
  outputPathSearchCodicon.addEventListener('click', outputPathSearchClick);

  const modelTypeRadio = document.getElementById('modelTypeRadio');
  modelTypeRadio.addEventListener('click', modelTypeClick);

  const foldButton = document.getElementById('foldAdvancedOptions');
  foldButton.addEventListener('click', clickFoldAdvancedOptions);

  const unfoldButton = document.getElementById('unfoldAdvancedOptions');
  unfoldButton.addEventListener('click', clickUnfoldAdvencedOptions);

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

function enableImportStep() {
  const importEnabled = document.getElementById('ImportEnabled');
  const importDisabled = document.getElementById('ImportDisabled');
  const modelTypeRadioArea = document.getElementById('modelTypeRadioArea');
  const panelImportEnabled = document.getElementById('panelImportEnabled');
  const panelImportDisabled = document.getElementById('panelImportDisabled');

  importEnabled.style.display = 'block';
  importDisabled.style.display = 'none';
  modelTypeRadioArea.style.display = 'block';
  panelImportEnabled.style.display = 'block';
  panelImportDisabled.style.display = 'none';

  clickUnfoldAdvencedOptions();
  const advancedOptions = document.getElementById('AdvancedOptions');
  advancedOptions.activeid = 'tabImport';
}

function disableImportStep() {
  const importEnabled = document.getElementById('ImportEnabled');
  const importDisabled = document.getElementById('ImportDisabled');
  const modelTypeRadioArea = document.getElementById('modelTypeRadioArea');
  const panelImportEnabled = document.getElementById('panelImportEnabled');
  const panelImportDisabled = document.getElementById('panelImportDisabled');

  importEnabled.style.display = 'none';
  importDisabled.style.display = 'block';
  modelTypeRadioArea.style.display = 'none';
  panelImportEnabled.style.display = 'none';
  panelImportDisabled.style.display = 'block';
}

function enableOptimizeStep() {
  const optimizeEnabled = document.getElementById('OptimizeEnabled');
  const optimizeDisabled = document.getElementById('OptimizeDisabled');
  const panelOptimizeEnabled = document.getElementById('panelOptimizeEnabled');
  const panelOptimizeDisabled = document.getElementById('panelOptimizeDisabled');

  optimizeEnabled.style.display = 'block';
  optimizeDisabled.style.display = 'none';
  panelOptimizeEnabled.style.display = 'block';
  panelOptimizeDisabled.style.display = 'none';

  clickUnfoldAdvencedOptions();
  const advancedOptions = document.getElementById('AdvancedOptions');
  advancedOptions.activeid = 'tabOptimize';
}

function disableOptimizeStep() {
  const optimizeEnabled = document.getElementById('OptimizeEnabled');
  const optimizeDisabled = document.getElementById('OptimizeDisabled');
  const panelOptimizeEnabled = document.getElementById('panelOptimizeEnabled');
  const panelOptimizeDisabled = document.getElementById('panelOptimizeDisabled');

  optimizeEnabled.style.display = 'none';
  optimizeDisabled.style.display = 'block';
  panelOptimizeEnabled.style.display = 'none';
  panelOptimizeDisabled.style.display = 'block';
}

function enableQuantizeStep() {
  const quantizeEnabled = document.getElementById('QuantizeEnabled');
  const quantizeDisabled = document.getElementById('QuantizeDisabled');
  const panelQuantizeEnabled = document.getElementById('panelQuantizeEnabled');
  const panelQuantizeDisabled = document.getElementById('panelQuantizeDisabled');

  quantizeEnabled.style.display = 'block';
  quantizeDisabled.style.display = 'none';
  panelQuantizeEnabled.style.display = 'block';
  panelQuantizeDisabled.style.display = 'none';

  clickUnfoldAdvencedOptions();
  const advancedOptions = document.getElementById('AdvancedOptions');
  advancedOptions.activeid = 'tabQuantize';
}

function disableQuantizeStep() {
  const quantizeEnabled = document.getElementById('QuantizeEnabled');
  const quantizeDisabled = document.getElementById('QuantizeDisabled');
  const panelQuantizeEnabled = document.getElementById('panelQuantizeEnabled');
  const panelQuantizeDisabled = document.getElementById('panelQuantizeDisabled');

  quantizeEnabled.style.display = 'none';
  quantizeDisabled.style.display = 'block';
  panelQuantizeEnabled.style.display = 'none';
  panelQuantizeDisabled.style.display = 'block';
}

function enableCodegenStep() {
  const codegenEnabled = document.getElementById('CodegenEnabled');
  const codegenDisabled = document.getElementById('CodegenDisabled');
  const panelCodegenEnabled = document.getElementById('panelCodegenEnabled');
  const panelCodegenDisabled = document.getElementById('panelCodegenDisabled');

  codegenEnabled.style.display = 'block';
  codegenDisabled.style.display = 'none';
  panelCodegenEnabled.style.display = 'block';
  panelCodegenDisabled.style.display = 'none';

  clickUnfoldAdvencedOptions();
  const advancedOptions = document.getElementById('AdvancedOptions');
  advancedOptions.activeid = 'tabCodegen';
}

function disableCodegenStep() {
  const codegenEnabled = document.getElementById('CodegenEnabled');
  const codegenDisabled = document.getElementById('CodegenDisabled');
  const panelCodegenEnabled = document.getElementById('panelCodegenEnabled');
  const panelCodegenDisabled = document.getElementById('panelCodegenDisabled');

  codegenEnabled.style.display = 'none';
  codegenDisabled.style.display = 'block';
  panelCodegenEnabled.style.display = 'none';
  panelCodegenDisabled.style.display = 'block';
}

function enableProfileStep() {
  const profileEnabled = document.getElementById('ProfileEnabled');
  const profileDisabled = document.getElementById('ProfileDisabled');
  const panelProfileEnabled = document.getElementById('panelProfileEnabled');
  const panelProfileDisabled = document.getElementById('panelProfileDisabled');

  profileEnabled.style.display = 'block';
  profileDisabled.style.display = 'none';
  panelProfileEnabled.style.display = 'block';
  panelProfileDisabled.style.display = 'none';

  clickUnfoldAdvencedOptions();
  const advancedOptions = document.getElementById('AdvancedOptions');
  advancedOptions.activeid = 'tabProfile';
}

function disableProfileStep() {
  const profileEnabled = document.getElementById('ProfileEnabled');
  const profileDisabled = document.getElementById('ProfileDisabled');
  const panelProfileEnabled = document.getElementById('panelProfileEnabled');
  const panelProfileDisabled = document.getElementById('panelProfileDisabled');

  profileEnabled.style.display = 'none';
  profileDisabled.style.display = 'block';
  panelProfileEnabled.style.display = 'none';
  panelProfileDisabled.style.display = 'block';
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

function clickUnfoldAdvencedOptions() {
  const foldButton = document.getElementById('foldAdvancedOptions');
  const unfoldButton = document.getElementById('unfoldAdvancedOptions');
  const advancedOptions = document.getElementById('AdvancedOptions');

  advancedOptions.style.display = 'block';
  foldButton.style.display = 'inline';
  unfoldButton.style.display = 'none';
}

function clickFoldAdvancedOptions() {
  const foldButton = document.getElementById('foldAdvancedOptions');
  const unfoldButton = document.getElementById('unfoldAdvancedOptions');
  const advancedOptions = document.getElementById('AdvancedOptions');

  advancedOptions.style.display = 'none';
  foldButton.style.display = 'none';
  unfoldButton.style.display = 'inline';
}

function clickInputPathCodicon() {
  document.getElementById('inputPath').focus();
}

function clickOutputPathCodicon() {
  document.getElementById('outputPath').focus();
}
