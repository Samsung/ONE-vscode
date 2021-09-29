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

// one-import options are different from other tools so separate toggle function
const oneImportToggleFunction = function () {
    const optionFieldset = document.querySelector("#options");
    const selectTag = document.querySelector("#framework");
    if (oneImport.use === true) {
      oneImport.use = false;
      for (let i = 0; i < oneImport.options.length; i++) {
        oneImport.options[i].optionValue = false;
      }
      for (let j = 0; j < oneImportOptions.length; j++) {
        oneImportOptions[j].use = false;
      }
      optionFieldset.disabled = true;
      selectTag.disabled = true;
    } else {
      oneImport.use = true;
      optionFieldset.disabled = false;
      selectTag.disabled = false;
    }
    autoCompletePath(oneImportBcq);
};

// remove every options on DOM
const emptyOptionBox = function (isImport) {
    if (!isImport) {
      const locaForSelect = document.querySelector("#locaForSelect");
      while (locaForSelect.hasChildNodes()) {
        locaForSelect.removeChild(locaForSelect.firstChild);
      }
      const toolList = document.querySelectorAll(".tools div");
      for (let i = 0; i < toolList.length; i++) {
        toolList[i].classList.remove("selected");
      }
    }
    const optionsName = document.querySelector("#optionsName");
    while (optionsName.hasChildNodes()) {
      optionsName.removeChild(optionsName.firstChild);
    }
    const optionsValue = document.querySelector("#optionsValue");
    while (optionsValue.hasChildNodes()) {
      optionsValue.removeChild(optionsValue.firstChild);
    }
};

// makeToggle button for tool's option
const makeToggleBtn = function (tool, index) {
  const labelTag = document.createElement("label");
  labelTag.classList.add("switch");
  const inputTag = document.createElement("input");
  inputTag.type = "checkbox";
  if (tool.options[index].optionValue === true) {
    inputTag.checked = true;
  }
  inputTag.addEventListener("click", function () {
    if (tool.options[index].optionValue === true) {
      tool.options[index].optionValue = false;
    } else {
      tool.options[index].optionValue = true;
    }
  });
  const spanTag = document.createElement("span");
  spanTag.classList.add("slider");
  spanTag.classList.add("round");
  labelTag.appendChild(inputTag);
  labelTag.appendChild(spanTag);
  return labelTag;
};

// make input tag for tool's option
const makeInputTag = function (tool, index) {
  const inputTag = document.createElement("input");
  if (tool.options[index].optionValue.trim() !== "") {
    inputTag.value = tool.options[index].optionValue;
  }
  inputTag.addEventListener("change", function (event) {
    tool.options[index].optionValue = event.target.value;
  });
  return inputTag;
};

// make select tag for tool's option
const makeSelectTag = function (tool, index) {
  const select = document.createElement("select");
  for (let j = 0; j < tool.options[index].optionType.length; j++) {
    const option = document.createElement("option");
    option.value = tool.options[index].optionType[j];
    option.text = tool.options[index].optionType[j];
    if (tool.options[index].optionType[j] === tool.options[index].optionValue) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  select.addEventListener("change", function (event) {
    tool.options[index].optionValue =
      select[event.target.selectedIndex].value;
  });
  return select;
};

// make input tag for input_path
const makeInputPathInput = function(tool, index) {
  const inputTag = document.createElement("input");
  inputTag.id = tool.options[index].optionName;
  inputTag.placeholder = "Please enter path to your file";
  inputTag.addEventListener("change", function (event) {
    tool.options[index].optionValue = event.target.value;
    autoCompletePath(tool);
  });
  if (tool.options[index].optionValue.trim() !== "") {
    inputTag.value = tool.options[index].optionValue;
  } 
  return inputTag;
};

// make button tag for input_path
// input_path needs path for real file so it needs explorer
const makeInputPathBtn = function(tool) {
  const btnTag = document.createElement("button");
  btnTag.innerText = "+";
  btnTag.addEventListener("click", function () {
    sendMessage("inputPath", tool.type);
  });
  return btnTag;
};

// make input tag for output_path
// output_path option is diffrent from other option because of autocompletion
const makeOutputPathInput = function(tool, index) {
  const inputTag = document.createElement("input");
  inputTag.placeholder = "Next input_path will be changed automatically";
  if (tool.options[index].optionValue.trim() !== "") {
    inputTag.value = tool.options[index].optionValue;
  }
  inputTag.addEventListener("change", function (event) {
    tool.options[index].optionValue = event.target.value;
    autoCompletePath(tool);
  });
  return inputTag;
};

const changeCommonTags = function(tool) {
  // change tool name and change toggle button
  const h2Tag = document.querySelector("#toolName");
  h2Tag.innerText = `Options for ${tool.type}`;
  const tmpBtn = document.querySelector("#useBtn");
  const useBtn = tmpBtn.cloneNode(true);
  tmpBtn.parentNode.replaceChild(useBtn, tmpBtn);
  if (tool.type.startsWith("one-import")) {
    useBtn.addEventListener("click", oneImportToggleFunction);
  } else {
    useBtn.addEventListener("click", function () {
      const optionFieldset = document.querySelector("#options");
      if (tool.use === true) {
        tool.use = false;
        optionFieldset.disabled = true;
      } else {
        tool.use = true;
        optionFieldset.disabled = false;
      }
      autoCompletePath(tool);
      emptyOptionBox(false);
      buildOptionDom(tool);
    });
    const optionFieldset = document.querySelector("#options");
    if (tool.use === true) {
      useBtn.checked = true;
      optionFieldset.disabled = false;
    } else {
      useBtn.checked = false;
      optionFieldset.disabled = true;
    }
  }
};

// build DOM for selected tool
const buildOptionDom = function (tool) {
    changeCommonTags(tool);
    // make tags for options
    const optionsNameTag = document.querySelector("#optionsName");
    const optionsValueTag = document.querySelector("#optionsValue");
    const nameUlTag = document.createElement("ul");
    const valueUlTag = document.createElement("ul");
    for (let i = 0; i < tool.options.length; i++) {
      const nameLiTag = document.createElement("li");
      const valueLiTag = document.createElement("li");
      if (tool.options[i].optionType) {
        // case for select tag
        nameLiTag.innerText = tool.options[i].optionName;
        const select = makeSelectTag(tool, i);
        valueLiTag.appendChild(select);
      } else {
        if (typeof tool.options[i].optionValue === "boolean") {
          // case for toggle button
          const toggleBtn = makeToggleBtn(tool, i);
          valueLiTag.appendChild(toggleBtn);
          nameLiTag.innerText = tool.options[i].optionName;
        } else if (typeof tool.options[i].optionValue === "string") {
          // case for input tag
          nameLiTag.innerText = tool.options[i].optionName;
          if (tool.options[i].optionName === "input_path") {
            const btnTag = makeInputPathBtn(tool);
            const inputTag = makeInputPathInput(tool, i);
            valueLiTag.appendChild(inputTag);
            valueLiTag.appendChild(btnTag);
          } else if (tool.options[i].optionName === "output_path") {
            const inputTag = makeOutputPathInput(tool, i);
            valueLiTag.appendChild(inputTag);
          } else {
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

// function for selecting framework
const changeSelect = function (event) {
    emptyOptionBox(true);
    const selectedText = event.target.options[event.target.selectedIndex].text;
    switch (selectedText) {
      case "bcq": {
        chooseImportOption(0);
        buildOptionDom(oneImportBcq);
        break;
      }
      case "onnx": {
        chooseImportOption(1);
        buildOptionDom(oneImportOnnx);
        break;
      }
      case "tf": {
        chooseImportOption(2);
        buildOptionDom(oneImportTf);
        break;
      }
      case "tflite": {
        chooseImportOption(3);
        buildOptionDom(oneImportTflite);
        break;
      }
    }
  };
