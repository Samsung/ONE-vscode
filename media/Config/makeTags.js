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

// makeToggle button for tool's option
const makeToggleBtn = function(tool, index) {
  const labelTag = document.createElement('label');
  labelTag.classList.add('switch');
  const inputTag = document.createElement('input');
  inputTag.type = 'checkbox';
  if (tool.options[index].optionValue === true) {
    inputTag.checked = true;
  }
  inputTag.addEventListener('click', function() {
    if (tool.options[index].optionValue === true) {
      tool.options[index].optionValue = false;
    } else {
      tool.options[index].optionValue = true;
    }
  });
  const spanTag = document.createElement('span');
  spanTag.classList.add('slider');
  spanTag.classList.add('round');
  labelTag.appendChild(inputTag);
  labelTag.appendChild(spanTag);
  return labelTag;
};

// make input tag for tool's option
const makeInputTag = function(tool, index) {
  const inputTag = document.createElement('input');
  if (tool.options[index].optionValue.trim() !== '') {
    inputTag.value = tool.options[index].optionValue;
  }
  inputTag.addEventListener('change', function(event) {
    tool.options[index].optionValue = event.target.value;
  });
  return inputTag;
};

// make select tag for tool's option
const makeSelectTag = function(tool, index) {
  const select = document.createElement('select');
  for (let j = 0; j < tool.options[index].optionType.length; j++) {
    const option = document.createElement('option');
    option.value = tool.options[index].optionType[j];
    option.text = tool.options[index].optionType[j];
    if (tool.options[index].optionType[j] === tool.options[index].optionValue) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  select.addEventListener('change', function(event) {
    tool.options[index].optionValue = select[event.target.selectedIndex].value;
  });
  return select;
};

// make input tag for input_path
const makeInputPathInput = function(tool, index) {
  const inputTag = document.createElement('input');
  inputTag.id = tool.options[index].optionName;
  inputTag.placeholder = 'Please enter path to your file';
  inputTag.addEventListener('change', function(event) {
    tool.options[index].optionValue = event.target.value;
    autoCompletePath(tool);
  });
  if (tool.options[index].optionValue.trim() !== '') {
    inputTag.value = tool.options[index].optionValue;
  }
  return inputTag;
};

// make button tag for input_path
// input_path needs path for real file so it needs explorer
const makeInputPathBtn = function(tool) {
  const btnTag = document.createElement('button');
  btnTag.innerText = '+';
  btnTag.addEventListener('click', function() {
    sendMessage('inputPath', tool.type);
  });
  return btnTag;
};

// make input tag for output_path
// output_path option is diffrent from other option because of autocompletion
const makeOutputPathInput = function(tool, index) {
  const inputTag = document.createElement('input');
  inputTag.placeholder = 'Next input_path will be changed automatically';
  if (tool.options[index].optionValue.trim() !== '') {
    inputTag.value = tool.options[index].optionValue;
  }
  inputTag.addEventListener('change', function(event) {
    tool.options[index].optionValue = event.target.value;
    autoCompletePath(tool);
  });
  return inputTag;
};
