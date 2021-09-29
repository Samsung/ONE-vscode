/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

/**
 * @brief oneImportTools will import one-import-xxx of cfg file to webview. so user can update .cfg
 * file comfortably.
 * @param data 2D array that holds all options and values of one-import-xxx
 * @param importOpt option names of one-import-xxx
 * @param tool name of one-import-xxx
 * @param idx Integer index of one-import-xxx
 * @param defaultImportObject one-import-xxx object of tools.js
 */
const oneImportTools = function(data, importOpt, tool, idx, defaultImportObject) {
  oneImport.use = true;
  for (let i = 0; i < defaultImportObject.options.length; i++) {
    if (importOpt === defaultImportObject.options[i].optionName) {
      defaultImportObject.options[i].optionValue = data[tool][importOpt];
    }
  }
  for (let i = 0; i < oneImport.options.length; i++) {
    if (i === idx) {
      oneImport.options[i].optionValue = true;
    } else {
      oneImport.options[i].optionValue = false;
    }
  }
};

/**
 * @brief oneOtherTools will import one-xxx of cfg file to webview execpt one-import-xxx. so user
 * can update .cfg file comfortably.
 * @param data 2D array that holds all options and values of one-xxx
 * @param importOpt option names of one-xxx
 * @param tool name of one-xxx tool
 * @param otherTool one-xxx object of tools.js
 */
const oneOtherTools = function(data, importOpt, tool, otherTool) {
  for (let i = 0; i < otherTool.options.length; i++) {
    if (importOpt === otherTool.options[i].optionName && data[tool][importOpt] === 'False') {
      otherTool.options[i].optionValue = false;
    } else if (importOpt === otherTool.options[i].optionName && data[tool][importOpt] === 'True') {
      otherTool.options[i].optionValue = true;
    } else if (importOpt === otherTool.options[i].optionName) {
      otherTool.options[i].optionValue = data[tool][importOpt];
    }
  }
};
