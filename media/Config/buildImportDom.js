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

// function for deciding which importOption(ex, one-import-tf) is used
// if index is out of range, then it means not using import
// you can find oneImport and oneImportOptions in tools.js
const chooseImportOption = function(index) {
  for (let i = 0; i < oneImport.options.length; i++) {
    if (i === index) {
      oneImport.options[i].optionValue = true;
      oneImportOptions[i].use = true;
    } else {
      oneImport.options[i].optionValue = false;
      oneImportOptions[i].use = false;
    }
  }
};

// one-import options are different from other tools so separate toggle function
// you can find oneImport in tools.js
// you can find autoCompletePath in pathAutoComplete.js
const oneImportToggleFunction = function() {
  const optionFieldset = document.querySelector('#options');
  const selectTag = document.querySelector('#framework');
  if (oneImport.use === true) {
    oneImport.use = false;
    chooseImportOption(-1);
    optionFieldset.disabled = true;
    selectTag.disabled = true;
  } else {
    oneImport.use = true;
    optionFieldset.disabled = false;
    selectTag.disabled = false;
  }
  // you can find autoCompletePath in pathAutoComplete.js
  autoCompletePath(oneImportBcq);
};
