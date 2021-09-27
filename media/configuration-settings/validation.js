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
const pathValidator = function (target) {
    for (let j = 0; j < target.options.length; j++) {
      if (
        target.options[j].optionName === "input_path" &&
        target.options[j].optionValue.trim() === ""
      ) {
        sendMessage(
          "alert",
          `If you want to use ${target.type}, then input_path is required`
        );
        return true;
      }
      if (
        target.options[j].optionName === "output_path" &&
        target.options[j].optionValue.trim() === ""
      ) {
        sendMessage(
          "alert",
          `If you want to use ${target.type}, then output_path is required`
        );
        return true;
      }
    }
    return false;
  };
  
  // validator for backend, this validator checks only for empty or not
  const backendValidator = function (target) {
    for (let j = 0; j < target.options.length; j++) {
      if (
        target.options[j].optionName === "backend" &&
        target.options[j].optionValue.trim() === ""
      ) {
        sendMessage(
          "alert",
          `If you want to use ${target.type}, then backend is required`
        );
        return true;
      }
    }
    return false;
  };

// before exprot, checks options whether they are valid or not
const exportValidation = function () {
    if (oneImport.use === true) {
      let chosenModelIndex = -1;
      for (let i = 0; i < oneImport.options.length; i++) {
        if (oneImport.options[i].optionValue === true) {
          chosenModelIndex = i;
          break;
        }
      }
      if (chosenModelIndex === -1) {
        sendMessage(
          "alert",
          "If you want to use one-import, then you should choose your framework"
        );
        return false;
      } else {
        if (pathValidator(oneImportOptions[chosenModelIndex])) {
          return false;
        }
      }
    }
    if (oneOptimize.use === true) {
      if (pathValidator(oneOptimize)) {
        return false;
      }
    }
    if (oneQuantize.use === true) {
      if (pathValidator(oneQuantize)) {
        return false;
      }
    }
    if (onePack.use === true) {
      if (pathValidator(onePack)) {
        return false;
      }
    }
    if (oneCodegen.use === true) {
      if (backendValidator(oneCodegen)) {
        return false;
      }
    }
    if (oneProfile.use === true) {
      if (backendValidator(oneProfile)) {
        return false;
      }
    }
    return true;
};