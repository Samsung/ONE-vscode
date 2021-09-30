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

// validator for input_path and output_path, this validator checks only for empty or not
const pathValidator = function(tool) {
  for (let j = 0; j < tool.options.length; j++) {
    if (tool.options[j].optionName === 'input_path' && tool.options[j].optionValue.trim() === '') {
      sendMessage('alert', `input_path is required to use ${tool.type}`);
      return false;
    }
    if (tool.options[j].optionName === 'output_path' && tool.options[j].optionValue.trim() === '') {
      sendMessage('alert', `output_path is required to use ${tool.type}`);
      return false;
    }
  }
  return true;
};

// validator for backend, this validator checks only for empty or not
const backendValidator = function(tool) {
  for (let j = 0; j < tool.options.length; j++) {
    if (tool.options[j].optionName === 'backend' && tool.options[j].optionValue.trim() === '') {
      sendMessage('alert', `backend is required to use ${tool.type}`);
      return false;
    }
  }
  return true;
};

// before exprot, checks options whether they are valid or not
// you can find variables started with 'one' in tools.js
const exportValidation = function() {
  if (oneImport.use === true) {
    let chosenModelIndex = -1;
    for (let i = 0; i < oneImport.options.length; i++) {
      if (oneImport.options[i].optionValue === true) {
        chosenModelIndex = i;
        break;
      }
    }
    if (chosenModelIndex === -1) {
      sendMessage('alert', 'You need to choose the framework(ex. TensorFlow) to use one-import');
      return false;
    } else {
      if (!pathValidator(oneImportOptions[chosenModelIndex])) {
        return false;
      }
    }
  }
  if (oneOptimize.use === true) {
    if (!pathValidator(oneOptimize)) {
      return false;
    }
  }
  if (oneQuantize.use === true) {
    if (!pathValidator(oneQuantize)) {
      return false;
    }
  }
  if (onePack.use === true) {
    if (!pathValidator(onePack)) {
      return false;
    }
  }
  if (oneCodegen.use === true) {
    if (!backendValidator(oneCodegen)) {
      return false;
    }
  }
  if (oneProfile.use === true) {
    if (!backendValidator(oneProfile)) {
      return false;
    }
  }
  return true;
};
