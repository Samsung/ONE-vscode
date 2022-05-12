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
Some part of this code refers to
https://github.com/microsoft/vscode-extension-samples/blob/2556c82cb333cf65d372bd01ac30c35ea1898a0e/custom-editor-sample/src/catScratchEditor.ts
*/
import * as vscode from 'vscode';
import {getUri} from '../Utils/external/Uri';

export class CfgEditorPanel implements vscode.CustomTextEditorProvider {
  private _disposables: vscode.Disposable[] = [];

  public static readonly viewType = 'cfg.editor';

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new CfgEditorPanel(context);
    const providerRegistration =
        vscode.window.registerCustomEditorProvider(CfgEditorPanel.viewType, provider, {
          webviewOptions: {
            retainContextWhenHidden: true,
          },
        });
    return providerRegistration;
  };

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    vscode.commands.executeCommand('setContext', CfgEditorPanel.viewType, true);

    webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      let ini = require('ini');
      webviewPanel.webview.postMessage({
        type: 'displayCfgToEditor',
        text: ini.parse(document.getText()),
      });
    };

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    webviewPanel.onDidChangeViewState(e => {
      vscode.commands.executeCommand('setContext', CfgEditorPanel.viewType, webviewPanel.visible);
    }, null, this._disposables);

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      while (this._disposables.length) {
        const x = this._disposables.pop();
        if (x) {
          x.dispose();
        }
      }
      vscode.commands.executeCommand('setContext', CfgEditorPanel.viewType, false);
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(e => {
      switch (e.type) {
        // TODO Add more webview modification handlers
        default:
          break;
      }
    });

    updateWebview();
  };

  // TODO Create separate HTML generator class
  private _getHtmlForWebview(webview: vscode.Webview) {
    const toolkitUri = getUri(webview, this.context.extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ]);
    const codiconUri = getUri(webview, this.context.extensionUri, [
      'node_modules',
      '@vscode',
      'codicons',
      'dist',
      'codicon.css',
    ]);
    const jsUri =
        getUri(webview, this.context.extensionUri, ['media', 'CfgEditor', 'cfgeditor.js']);

    const cssUri =
        getUri(webview, this.context.extensionUri, ['media', 'CfgEditor', 'cfgeditor.css']);

    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <script type="module" src="${jsUri}"></script>
        <link rel="stylesheet" href="${cssUri}">
        <link rel="stylesheet" href="${codiconUri}">
      </head>
      <body>      
        <div class="conf">
          <div class="confLeft">
            <div class="confLeftTitle">
              <h3 style="display:block">Mandatory Parameters</h3>
            </div>
            <div class="leftSubTitle">
              Compile steps&nbsp;
              <span id="helpCompileSteps" class="codicon codicon-question" style="cursor: pointer"></span>
            </div>
            <div class="leftSubTitle">
              <!-- Placeholder for display -->
            </div>
            <div class="leftInlineElement">
              <span id="inputPathCodicon" class="codicon codicon-file" style="cursor:pointer" title="Input Path"></span>
              <span>&nbsp;</span>
              <span class="codicon codicon-arrow-right"></span>
              <span>&nbsp;</span>
              <vscode-button id="ImportEnabled" appearance="primary" style="display:none">Import</vscode-button>
              <vscode-button id="ImportDisabled" appearance="secondary">Import</vscode-button>
              <span>&nbsp;</span>
              <span class="codicon codicon-arrow-right"></span>
              <span>&nbsp;</span>
              <vscode-button id="OptimizeEnabled" appearance="primary" style="display:none">Optimize</vscode-button>
              <vscode-button id="OptimizeDisabled" appearance="secondary">Optimize</vscode-button>
              <span>&nbsp;</span>
              <span class="codicon codicon-arrow-right"></span>
              <span>&nbsp;</span>
              <vscode-button id="QuantizeEnabled" appearance="primary" style="display:none">Quantize</vscode-button>
              <vscode-button id="QuantizeDisabled" appearance="secondary">Quantize</vscode-button>
              <span>&nbsp;</span>
              <span class="codicon codicon-arrow-right"></span>
              <span>&nbsp;</span>
              <vscode-button id="CodegenEnabled" appearance="primary" style="display:none">Codegen</vscode-button>
              <vscode-button id="CodegenDisabled" appearance="secondary">Codegen</vscode-button>
              <span>&nbsp;</span>
              <span class="codicon codicon-arrow-right"></span>
              <span>&nbsp;</span>
              <span id="outputPathCodicon" class="codicon codicon-file" style="cursor:pointer" title="Output Path"></span>
            </div>
            <div class="leftSubTitle">
              Additional Jobs&nbsp;
              <span id="helpAdditionalJobs" class="codicon codicon-question" style="cursor: pointer"></span>
            </div>
            <div class="leftSubTitle">
              <!-- Placeholder for display -->
            </div>
            <div class="leftInlineElement">
              <vscode-button id="ProfileEnabled" appearance="primary" style="display:none">Profile</vscode-button>
              <vscode-button id="ProfileDisabled" appearance="secondary">Profile</vscode-button>
              <span>&nbsp;&nbsp;</span>
              <vscode-button id="packEnabled" appearance="primary" style="display:none" disabled>Pack</vscode-button>
              <vscode-button id="packDisabled" appearance="secondary" disabled>Pack</vscode-button>
            </div>
            <div class="leftSubTitle">
              <!-- Placeholder for display -->
            </div>
            <div class="leftSubTitle">
              Input Model
            </div>
            <div class="leftFullElement">
              <vscode-text-field id="inputPath" startIcon=true size=40 placeholder="Select Input Model File">
                <span id="inputModelSearch" slot="end" class="codicon codicon-search" style="cursor:pointer"></span>
              </vscode-text-field>
            </div>
            <div id="modelTypeRadioArea" class="leftFullElement" style="display:none">
              <vscode-radio-group id="modelTypeRadio">
                <vscode-radio value="pb">pb</vscode-radio>
                <vscode-radio value="savedModel">saved_model</vscode-radio>
                <vscode-radio value="kerasModel">keras_model</vscode-radio>
                <vscode-radio value="tflite">tflite</vscode-radio>
                <vscode-radio value="onnx">onnx</vscode-radio>
                <vscode-radio value="bcq" disabled=true>bcq</vscode-radio>
              </vscode-radio-group>
            </div>
            <div class="leftSubTitle">
              Output Path
            </div>
            <div class="leftFullElement">
              <vscode-text-field id="outputPath" startIcon=true size=40 placeholder="Select Output Path">
                <span id="outputPathSearch" slot="end" class="codicon codicon-search" style="cursor:pointer"></span>
              </vscode-text-field>
            </div>
          </div>

          <div class="confRight">
            <div class="conRightTitle">
              <h3 style="display:inline-block">Advanced Options</h3>
              <span id="unfoldAdvancedOptions" class="codicon codicon-expand-all" style="cursor:pointer"></span>
              <span id="foldAdvancedOptions" class="codicon codicon-collapse-all" style="display:none; cursor:pointer"></span>
            </div>
            <vscode-panels id="AdvancedOptions" activeid="tabImport" style="display:none">
              <vscode-panel-tab id="tabImport">Import</vscode-panel-tab>
              <vscode-panel-tab id="tabOptimize">Optimize</vscode-panel-tab>
              <vscode-panel-tab id="tabQuantize">Quantize</vscode-panel-tab>
              <vscode-panel-tab id="tabCodegen">Codegen</vscode-panel-tab>
              <vscode-panel-tab id="tabProfile">Profile</vscode-panel-tab>
              <vscode-panel-view id="viewImport">
                <div class="vscode-panel-view-root" id="panelImportEnabled" style="display:none">
                  <div id="ImportInitialState">
                    Select import model type first.
                  </div>
                  <div id="PBConverterOptions" style="display:none">
                    <div id="PBConverterVersion" class="vscode-panel-view">
                      <vscode-radio-group id="PBConverterVersionRadio">
                        <label slot="label">Converter Version</label>
                        <vscode-radio value="v1">v1</vscode-radio>
                        <vscode-radio value="v2">v2</vscode-radio>
                      </vscode-radio-group>
                    </div>
                    <div class="vscode-panel-view">
                      <vscode-text-field id="PBInputArrays" startIcon=true size=50 placeholder="semi-colon separated input names">
                        Input Arrays
                        <span slot="end" class="codicon codicon-question" style="cursor: pointer"></span>
                      </vscode-text-field>
                    </div>
                    <div class="vscode-panel-view">
                      <vscode-text-field id="PBOutputArrays" startIcon=true size=50 placeholder="semi-colon separated output names">
                        Output Arrays
                        <span slot="end" class="codicon codicon-question" style="cursor: pointer"></span>
                      </vscode-text-field>
                    </div>
                    <div class="vscode-panel-view">
                      <vscode-text-field id="PBInputShapes" startIcon=true size=50 placeholder="semi-colon separated input shapes (e.g. 1,299,299,3;1,1001)">
                        Input Shapes (Optional)
                        <span slot="end" class="codicon codicon-question" style="cursor: pointer"></span>
                      </vscode-text-field>
                    </div>
                    <div>
                      <span>Intermediate Paths</span>
                      <span id="unfoldPBIntermediatePaths" class="codicon codicon-expand-all" style="cursor:pointer"></span>
                      <span id="foldPBIntermediatePaths" class="codicon codicon-collapse-all" style="display:none; cursor:pointer"></span>
                    </div>
                    <div id="PBIntermediatePaths" style="display:none">
                      <div class="vscode-panel-view">
                        <!-- Placeholder for display -->
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="PBInputPath" startIcon=true size=50 placeholder="">
                          Input Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="PBOutputPath" startIcon=true size=50 placeholder="">
                          Output Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                    </div>
                  </div>
                  <div id="SAVEDConverterOptions" style="display:none">
                    <div>
                      <span>Intermediate Paths</span>
                      <span id="unfoldSAVEDIntermediatePaths" class="codicon codicon-expand-all" style="cursor:pointer"></span>
                      <span id="foldSAVEDIntermediatePaths" class="codicon codicon-collapse-all" style="display:none; cursor:pointer"></span>
                    </div>
                    <div id="SAVEDIntermediatePaths" style="display:none">
                      <div class="vscode-panel-view">
                        <!-- Placeholder for display -->
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="SAVEDInputPath" startIcon=true size=50 placeholder="">
                          Input Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="SAVEDOutputPath" startIcon=true size=50 placeholder="">
                          Output Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                    </div>
                  </div>
                  <div id="KERASConverterOptions" style="display:none">
                    <div>
                      <span>Intermediate Paths</span>
                      <span id="unfoldKERASIntermediatePaths" class="codicon codicon-expand-all" style="cursor:pointer"></span>
                      <span id="foldKERASIntermediatePaths" class="codicon codicon-collapse-all" style="display:none; cursor:pointer"></span>
                    </div>
                    <div id="KERASIntermediatePaths" style="display:none">
                      <div class="vscode-panel-view">
                        <!-- Placeholder for display -->
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="KERASInputPath" startIcon=true size=50 placeholder="">
                          Input Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="KERASOutputPath" startIcon=true size=50 placeholder="">
                          Output Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                    </div>
                  </div>
                  <div id="TFLITEConverterOptions" style="display:none">
                    <div>
                      <span>Intermediate Paths</span>
                      <span id="unfoldTFLITEIntermediatePaths" class="codicon codicon-expand-all" style="cursor:pointer"></span>
                      <span id="foldTFLITEIntermediatePaths" class="codicon codicon-collapse-all" style="display:none; cursor:pointer"></span>
                    </div>
                    <div id="TFLITEIntermediatePaths" style="display:none">
                      <div class="vscode-panel-view">
                        <!-- Placeholder for display -->
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="TFLITEInputPath" startIcon=true size=50 placeholder="">
                          Input Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="TFLITEOutputPath" startIcon=true size=50 placeholder="">
                          Output Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                    </div>
                  </div>
                  <div id="ONNXConverterOptions" style="display:none">
                    <div id="ONNXSaveIntermediate" class="vscode-panel-view">
                      <vscode-checkbox id="onnxSaveIntermediateCheckbox">
                        Save Intermediate
                      </vscode-checkbox>
                      <span class="codicon codicon-question" style="cursor: pointer"></span>
                    </div>
                    <div id="ONNXUnrollRNN" class="vscode-panel-view">
                      <vscode-checkbox id="onnxUnrollRNNCheckbox">
                        Unroll RNN
                      </vscode-checkbox>
                      <span class="codicon codicon-question" style="cursor: pointer"></span>
                    </div>
                    <div id="ONNXUnrollLSTM" class="vscode-panel-view">
                      <vscode-checkbox id="onnxUnrollLSTMCheckbox">
                        Unroll LSTM
                      </vscode-checkbox>
                      <span class="codicon codicon-question" style="cursor: pointer"></span>
                    </div>
                    <div>
                      <span>Intermediate Paths</span>
                      <span id="unfoldONNXIntermediatePaths" class="codicon codicon-expand-all" style="cursor:pointer"></span>
                      <span id="foldONNXIntermediatePaths" class="codicon codicon-collapse-all" style="display:none; cursor:pointer"></span>
                    </div>
                    <div id="ONNXIntermediatePaths" style="display:none">
                      <div class="vscode-panel-view">
                        <!-- Placeholder for display -->
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="ONNXInputPath" startIcon=true size=50 placeholder="">
                          Input Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                      <div class="vscode-panel-view">
                        <vscode-text-field id="ONNXOutputPath" startIcon=true size=50 placeholder="">
                          Output Path
                          <span slot="end" class="codicon codicon-search" style="cursor: pointer"></span>
                        </vscode-text-field>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="vscode-panel-view-root" id="panelImportDisabled">
                  <vscode-link id="linkEnableImport" href="#">Enable Import</vscode-link>
                  step first.
                </div>
              </vscode-panel-view>
              <vscode-panel-view id="viewOptimizer">
                <div class="vscode-panel-view-root" id="panelOptimizeEnabled" style="display:none">
                  <span>Preparing awesome UI for optimize options...</span>
                </div>
                <div class="vscode-panel-view-root" id="panelOptimizeDisabled">
                  <vscode-link id="linkEnableOptimize" href="#">Enable Optimize</vscode-link>
                  step first.
                </div>
              </vscode-panel-view>
              <vscode-panel-view id="viewQuantizer">
                <div class="vscode-panel-view-root" id="panelQuantizeEnabled" style="display:none">
                  <span>Preparing awesome UI for quantize options...</span>
                </div>
                <div class="vscode-panel-view-root" id="panelQuantizeDisabled">
                  <vscode-link id="linkEnableQuantize" href="#">Enable Quantize</vscode-link>
                  step first.
                </div>
              </vscode-panel-view>
              <vscode-panel-view id="viewCodegen">
                <div id="panelCodegenEnabled" style="display:none">
                  <div class="vscode-panel-view">
                    <span>Backend</span>
                  </div>
                  <div class="vscode-panel-view">
                    <vscode-text-field id="codegenBackend" startIcon=true size=30 placeholder="Backend to generate code"></vscode-text-field>
                  </div>
                  <div class="vscode-panel-view">
                    <span>Command</span>
                  </div>
                  <div class="vscode-panel-view">
                    <vscode-text-field id="codegenCommand" startIcon=true size=50 placeholder="CLI command to execute"></vscode-text-field>
                  </div>             
                </div>
                <div class="vscode-panel-view-root" id="panelCodegenDisabled">
                  <vscode-link id="linkEnableCodegen" href="#">Enable Codegen</vscode-link>
                  step first.
                </div>
              </vscode-panel-view>  
              <vscode-panel-view id="viewProfiler">
                <div class="vscode-panel-view-root" id="panelProfileEnabled" style="display:none">
                  <div class="vscode-panel-view">
                    <span>Backend</span>
                  </div>
                  <div class="vscode-panel-view">
                    <vscode-text-field id="profileBackend" startIcon=true size=30 placeholder="Backend to profile"></vscode-text-field>
                  </div>
                  <div class="vscode-panel-view">
                    <span>Command</span>
                  </div>
                  <div class="vscode-panel-view">
                    <vscode-text-field id="profileCommand" startIcon=true size=50 placeholder="CLI command to execute"></vscode-text-field>
                  </div> 
                </div>
                <div class="vscode-panel-view-root" id="panelProfileDisabled">
                  <vscode-link id="linkEnableProfile" href="#">Enable Profile</vscode-link>
                  step first.
                </div>
              </vscode-panel-view>
            </vscode-panels>
          </div>
        </div>
      </body>
    </html>
      `;
  }
}
