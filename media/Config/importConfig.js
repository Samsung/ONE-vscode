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
 * @brief oneToolToggle will toggle one-import-xxx and one-xxx of webview.
 * @param data array that holds all options and values of one-build or onecc
 * @param importOpt option name of one-build or onecc
 */
const oneToolToggle = function(data, importOpt) {
  if (data[importOpt] === 'True') {
    for (let i = 0; i < oneImportToolSeparation; i++) {
      if (importOpt === oneToolList[i].type) {
        oneImport.use = true;
        chooseImportOption(i);
      }
    }
    for (let i = oneImportToolSeparation; i < oneToolList.length; i++) {
      if (importOpt === oneToolList[i].type) {
        oneToolList[i].use = true;
      }
    }
  }
};

/**
 * @brief oneImportTools will import one-import-xxx of cfg file to webview. so user can update .cfg
 * file comfortably.
 * @param data array that holds all options and values of one-import-xxx
 * @param importOpt option name of one-import-xxx
 * @param defaultImportObject one-import-xxx object of tools.js
 */
const oneImportTools = function(data, importOpt, defaultImportObject) {
  for (let i = 0; i < defaultImportObject.length; i++) {
    if (importOpt === defaultImportObject[i].optionName) {
      defaultImportObject[i].optionValue = data[importOpt];
    }
  }
};

/**
 * @brief oneOtherTools will import one-xxx of cfg file to webview execpt one-import-xxx. so user
 * can update .cfg file comfortably.
 * @param data array that holds all options and values of one-xxx
 * @param importOpt option name of one-xxx
 * @param defaultOtherObject one-xxx object of tools.js
 */
const oneOtherTools = function(data, importOpt, defaultOtherObject) {
  for (let i = 0; i < defaultOtherObject.length; i++) {
    if (importOpt === defaultOtherObject[i].optionName && data[importOpt] === 'False') {
      defaultOtherObject[i].optionValue = false;
    } else if (importOpt === defaultOtherObject[i].optionName && data[importOpt] === 'True') {
      defaultOtherObject[i].optionValue = true;
    } else if (importOpt === defaultOtherObject[i].optionName) {
      defaultOtherObject[i].optionValue = data[importOpt];
    }
  }
};
