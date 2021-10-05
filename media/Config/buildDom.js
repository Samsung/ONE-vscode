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

const eraseChildTags = function(tagId) {
  const tag = querySelector('#' + tagId);
  while (tag.hasChildNodes()) {
    tag.removeChild(tag.firstChild);
  }
};

// remove every options on DOM
const emptyOptionBox = function(isImport) {
  if (!isImport) {
    // erase select tag for choosing framework
    eraseChildTags('spanTagForSelect');

    const toolList = document.querySelectorAll('.tools div');
    for (let i = 0; i < toolList.length; i++) {
      toolList[i].classList.remove('selected');
    }
  }

  // erase option names
  eraseChildTags('optionsName');

  // erase option values
  eraseChildTags('optionsValue');
};

// make DOM disable depends on tool.use
const chooseDisable = function(tool) {
  const useBtn = document.querySelector('#useBtn');
  const optionFieldset = document.querySelector('#options');

  if (tool.type.startsWith('one-import')) {
    // when tools are related with one-import
    if (oneImport.use === true) {
      useBtn.checked = true;
      optionFieldset.disabled = false;
    } else {
      useBtn.checked = false;
      optionFieldset.disabled = true;
    }
  } else {
    // when tool are not related with one-import
    if (tool.use === true) {
      useBtn.checked = true;
      optionFieldset.disabled = false;
    } else {
      useBtn.checked = false;
      optionFieldset.disabled = true;
    }
  }
};

// change tool name and change toggle button
// you can find oneImportToggleFunction in buildImportDom.js
// you can find autoCompletePath in pathAutoComplete.js
const changeCommonTags = function(tool) {
  const h2Tag = document.querySelector('#toolName');
  h2Tag.innerText = `Options for ${tool.type}`;

  // erase event listeners in useBtn
  const tmpBtn = document.querySelector('#useBtn');
  const useBtn = tmpBtn.cloneNode(true);
  tmpBtn.parentNode.replaceChild(useBtn, tmpBtn);

  // add event listener to useBtn
  if (tool.type.startsWith('one-import')) {
    useBtn.addEventListener('click', oneImportToggleFunction);
  } else {
    useBtn.addEventListener('click', function() {
      const optionFieldset = document.querySelector('#options');

      if (tool.use === true) {
        tool.use = false;
        optionFieldset.disabled = true;
      } else {
        tool.use = true;
        optionFieldset.disabled = false;
      }

      autoCompletePath(tool);
    });
  }
  chooseDisable(tool);
};

// build DOM for selected tool
// make tags for options
const buildOptionDom = function(tool) {
  changeCommonTags(tool);

  const optionsNameTag = document.querySelector('#optionsName');
  const optionsValueTag = document.querySelector('#optionsValue');
  const nameUlTag = document.createElement('ul');
  const valueUlTag = document.createElement('ul');

  for (let i = 0; i < tool.options.length; i++) {
    const nameLiTag = document.createElement('li');
    const valueLiTag = document.createElement('li');

    if (tool.options[i].optionType) {
      // case for select tag
      nameLiTag.innerText = tool.options[i].optionName;

      const select = makeSelectTag(tool, i);
      valueLiTag.appendChild(select);

    } else {
      if (typeof tool.options[i].optionValue === 'boolean') {
        // case for toggle button
        nameLiTag.innerText = tool.options[i].optionName;

        const toggleBtn = makeToggleBtn(tool, i);
        valueLiTag.appendChild(toggleBtn);
      } else if (typeof tool.options[i].optionValue === 'string') {
        nameLiTag.innerText = tool.options[i].optionName;

        if (tool.options[i].optionName === 'input_path') {
          // case for input_path
          const inputTag = makeInputPathInput(tool, i);
          valueLiTag.appendChild(inputTag);

          const btnTag = makeInputPathBtn(tool);
          valueLiTag.appendChild(btnTag);
        } else if (tool.options[i].optionName === 'output_path') {
          // case for output_path
          const inputTag = makeOutputPathInput(tool, i);
          valueLiTag.appendChild(inputTag);

        } else {
          // case for normal input tag
          const inputTag = makeInputTag(tool, i);
          valueLiTag.appendChild(inputTag);
        }
      }
    }
    valueUlTag.appendChild(valueLiTag);
    nameUlTag.appendChild(nameLiTag);
  }
  optionsValueTag.appendChild(valueUlTag);
  optionsNameTag.appendChild(nameUlTag);
};

// function for selecting framework
// you can find oneImportBcq, Onnx, Tf, Tflite in tools.js
// you can find chooseImportOption in buildImportDom.js
const changeSelect = function(event) {
  emptyOptionBox(true);
  const selectedText = event.target.options[event.target.selectedIndex].text;
  switch (selectedText) {
    case 'bcq': {
      chooseImportOption(0);
      buildOptionDom(oneImportBcq);
      break;
    }
    case 'onnx': {
      chooseImportOption(1);
      buildOptionDom(oneImportOnnx);
      break;
    }
    case 'tf': {
      chooseImportOption(2);
      buildOptionDom(oneImportTf);
      break;
    }
    case 'tflite': {
      chooseImportOption(3);
      buildOptionDom(oneImportTflite);
      break;
    }
  }
};

// make select tag to choose framework
// you can find oneImport in tools.js
const makeSelectTagForImport = function() {
  const select = document.createElement('select');
  select.id = 'framework';
  select.name = 'framework';

  const defaultOption = document.createElement('option');
  defaultOption.value = 'beforeDecision';
  defaultOption.text = 'Choose your framework';
  select.appendChild(defaultOption);

  for (let i = 0; i < oneImport.options.length; i++) {
    const option = document.createElement('option');
    option.value = oneImport.options[i].optionName;
    option.text = oneImport.options[i].optionName;
    select.appendChild(option);
  }

  select.addEventListener('change', changeSelect);

  return select;
};
