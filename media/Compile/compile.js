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
  // event from html
  const compileButton = document.getElementById('compile-button');
  compileButton.addEventListener('click', handleCompileClick);

  const showDetailedOptions = document.getElementById('show-detailed-options');
  showDetailedOptions.addEventListener('click', handleShowDetailedOptionClick);

  const outputDir = document.getElementById('output-dir');
  outputDir.addEventListener('click', handleOutputDirClick);

  // event from vscode extension
  window.addEventListener('message', event => {
    const message = event.data;  // The JSON data our extension sent

    switch (message.command) {
      case 'set-output-dir':  // called when user enteres output directory in vscode extension UI
        outputDir.textContent = message.data;
        break;
    }
  });
}

// Callback function that is executed when the [Compile] button is clicked
function handleCompileClick() {
  const targetCode = document.getElementById('target-code').value;
  const outputDir = document.getElementById('output-dir').textContent;
  const compilerVer = document.getElementById('compiling-env-ver').value;

  // circle_optimizer options
  const foldAddV2 = document.getElementById('fold_add_v2').value;
  const fuseActivationFunction = document.getElementById('fuse_activation_function').value;
  // TODO Handle more options from circle_optimizer

  // circle_quantizer options
  const quantizeDequantizeWeights = document.getElementById('quantize_dequantize_weights').value;
  // TODO Handle more options from circle_quantizer

  // Ask vscode extension to compile model file
  vscode.postMessage({
    command: 'request-compile',
    // TODO Revise this message in a way that these params can be handled easily by ONE
    text: `Compilation is finished for ${targetCode}. || ` +
        `- Output dir: ${outputDir} || ` +
        `- Compiling env: ${compilerVer} || ` +
        `Options: || ` +
        ` --fold_add_v2=${foldAddV2} || ` +
        ` --fuse_activation_function=${fuseActivationFunction}` +
        ` --quantize_dequantize_weights=${quantizeDequantizeWeights}`
  });
}

function handleShowDetailedOptionClick() {
  const showDetailedOptions = document.getElementById('detailed-options');
  if (showDetailedOptions.style.display === 'none') {
    showDetailedOptions.style.display = 'block';
  } else if (showDetailedOptions.style.display === 'block') {
    showDetailedOptions.style.display = 'none';
  }
}

function handleOutputDirClick() {
  vscode.postMessage({command: 'set-output-dir'});
}
