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

import oneOptimizationList from './one-optimizations.json' assert {type : 'json'};

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

function iniKeyValueString(iniKey, iniValue) {
  if (iniValue === null || iniValue === undefined) {
    return '';
  }

  if (iniValue === false) {
    return '';
  } else if (iniValue === true) {
    return iniKey + '=True\n';
  }

  const trimmedValue = iniValue.trim();
  if (trimmedValue === '') {
    return '';
  }

  return iniKey + '=' + trimmedValue + '\n';
}

export function applyUpdates() {
  vscode.postMessage({type: 'updateDocument'});
}

export function updateSteps() {
  vscode.postMessage({type: 'setParam', section: 'onecc', param: 'one-import-tf', value: 'False'});
  vscode.postMessage(
      {type: 'setParam', section: 'onecc', param: 'one-import-tflite', value: 'False'});
  vscode.postMessage({type: 'setParam', section: 'onecc', param: 'one-import-bcq', value: 'False'});
  vscode.postMessage(
      {type: 'setParam', section: 'onecc', param: 'one-import-onnx', value: 'False'});
  if (document.getElementById('checkboxImport').checked) {
    switch (document.getElementById('importInputModelType').value) {
      case 'pb':
      case 'saved':
      case 'keras':
        vscode.postMessage(
            {type: 'setParam', section: 'onecc', param: 'one-import-tf', value: 'True'});
        break;
      case 'tflite':
        vscode.postMessage(
            {type: 'setParam', section: 'onecc', param: 'one-import-tflite', value: 'True'});
        break;
      case 'onnx':
        vscode.postMessage(
            {type: 'setParam', section: 'onecc', param: 'one-import-onnx', value: 'True'});
        break;
      default:
        break;
    }
  }

  vscode.postMessage({
    type: 'setParam',
    section: 'onecc',
    param: 'one-optimize',
    value: document.getElementById('checkboxOptimize').checked ? 'True' : 'False'
  });
  vscode.postMessage({
    type: 'setParam',
    section: 'onecc',
    param: 'one-quantize',
    value: document.getElementById('checkboxQuantize').checked ? 'True' : 'False'
  });
  vscode.postMessage({
    type: 'setParam',
    section: 'onecc',
    param: 'one-codegen',
    value: document.getElementById('checkboxCodegen').checked ? 'True' : 'False'
  });
  vscode.postMessage({
    type: 'setParam',
    section: 'onecc',
    param: 'one-profile',
    value: document.getElementById('checkboxProfile').checked ? 'True' : 'False'
  });
}

export function updateImportInputModelType() {
  switch (document.getElementById('importInputModelType').value) {
    case 'pb':
      updateImportPB();
      break;
    case 'saved':
      updateImportSAVED();
      break;
    case 'keras':
      updateImportKERAS();
      break;
    case 'tflite':
      updateImportTFLITE();
      break;
    case 'onnx':
      updateImportONNX();
      break;
    default:
      break;
  }
}

export function updateImportPB() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('PBInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('PBOutputPath').value);
  content +=
      iniKeyValueString('converter_version', document.getElementById('PBConverterVersion').value);
  content += iniKeyValueString('input_arrays', document.getElementById('PBInputArrays').value);
  content += iniKeyValueString('output_arrays', document.getElementById('PBOutputArrays').value);
  content += iniKeyValueString('input_shapes', document.getElementById('PBInputShapes').value);

  vscode.postMessage({type: 'setSection', section: 'one-import-tf', param: content});
}

export function updateImportSAVED() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('SAVEDInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('SAVEDOutputPath').value);
  content += iniKeyValueString('model_format', 'saved_model');

  vscode.postMessage({type: 'setSection', section: 'one-import-tf', param: content});
}

export function updateImportKERAS() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('KERASInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('KERASOutputPath').value);
  content += iniKeyValueString('model_format', 'keras_model');

  vscode.postMessage({type: 'setSection', section: 'one-import-tf', param: content});
}

export function updateImportTFLITE() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('TFLITEInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('TFLITEOutputPath').value);

  vscode.postMessage({type: 'setSection', section: 'one-import-tflite', param: content});
}

export function updateImportONNX() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('ONNXInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('ONNXOutputPath').value);
  content += iniKeyValueString(
      'save_intermediate', document.getElementById('ONNXSaveIntermediate').checked);
  content += iniKeyValueString('unroll_rnn', document.getElementById('ONNXUnrollRNN').checked);
  content += iniKeyValueString('unroll_lstm', document.getElementById('ONNXUnrollLSTM').checked);

  vscode.postMessage({type: 'setSection', section: 'one-import-onnx', param: content});
}

export function updateOptimize() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('optimizeInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('optimizeOutputPath').value);

  for (const optName in oneOptimizationList) {
    content +=
        iniKeyValueString(optName, document.getElementById('checkboxOptimize' + optName).checked);
  }

  vscode.postMessage({type: 'setSection', section: 'one-optimize', param: content});
}

export function updateCodegen() {
  let content = '';
  content += iniKeyValueString('backend', document.getElementById('codegenBackend').value);
  content += iniKeyValueString('command', document.getElementById('codegenCommand').value);

  vscode.postMessage({type: 'setSection', section: 'one-codegen', param: content});
}

export function updateProfile() {
  let content = '';
  content += iniKeyValueString('backend', document.getElementById('profileBackend').value);
  content += iniKeyValueString('command', document.getElementById('profileCommand').value);

  vscode.postMessage({type: 'setSection', section: 'one-profile', param: content});
}
