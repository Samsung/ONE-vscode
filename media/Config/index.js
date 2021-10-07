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

// before building DOM, this function guide which tool will be built
// you can find makeSelectTagForImport and buildOptionDom in buildDom.js
const showOptions = function(event) {
  emptyOptionBox(false);
  event.target.classList.add('selected');
  switch (event.target.id) {
    case 'import': {
      changeCommonTags(oneImport);

      const select = makeSelectTagForImport();

      if (oneImport.use === false) {
        select.disabled = true;
      } else {
        select.disabled = false;
      }

      const spanTagForSelect = document.querySelector('#spanTagForSelect');
      spanTagForSelect.appendChild(select);

      // if framework like tensorflow has already been chosen, then bring it
      let chosenOptionIndex = -1;
      for (let i = 0; i < oneImport.options.length; i++) {
        if (oneImport.options[i].optionValue === true) {
          chosenOptionIndex = i;
          break;
        }
      }

      if (chosenOptionIndex !== -1) {
        // select.options has 'beforeDecision' at index 0
        select.options[chosenOptionIndex + 1].selected = true;
        buildOptionDom(oneImportOptions[chosenOptionIndex]);
      }
      break;
    }
    case 'optimize': {
      buildOptionDom(oneOptimize);
      break;
    }
    case 'quantize': {
      buildOptionDom(oneQuantize);
      break;
    }
    case 'pack': {
      buildOptionDom(onePack);
      break;
    }
    case 'codegen': {
      buildOptionDom(oneCodegen);
      break;
    }
    case 'profile': {
      buildOptionDom(oneProfile);
      break;
    }
  }
};

// send message to config panel about export configuration
// you can find sendMessage in sendToPanel.js
// you can finde exportValidation in configValidator.js
const exportConfiguration = function() {
  if (exportValidation()) {
    sendMessage('exportConfig', {oneToolList: oneToolList, fileName: getFileName(oneToolList)});
  }
};

// send message to config panel about run configuration
// you can finde exportValidation in configValidator.js
const runConfiguration = function() {
  if (exportValidation()) {
    sendMessage('runConfig', oneToolList);
  }
};

// send message to config panel about import configuration
// you can find sendMessage in sednToPanel.js
const importConfiguration = function() {
  sendMessage('importConfig', '');
};

// add EventListener to html tags
document.querySelector('#import').addEventListener('click', showOptions);
document.querySelector('#optimize').addEventListener('click', showOptions);
document.querySelector('#quantize').addEventListener('click', showOptions);
document.querySelector('#pack').addEventListener('click', showOptions);
document.querySelector('#codegen').addEventListener('click', showOptions);
document.querySelector('#profile').addEventListener('click', showOptions);
document.querySelector('#importBtn').addEventListener('click', importConfiguration);
document.querySelector('#runBtn').addEventListener('click', runConfiguration);
document.querySelector('#exportBtn').addEventListener('click', exportConfiguration);

const tmpEvent = {
  target: document.querySelector('#import'),
};
showOptions(tmpEvent);
