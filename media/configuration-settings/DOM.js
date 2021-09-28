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

const makeToggleBtn = function (target, index) {
  const LabelTag = document.createElement("label");
  LabelTag.classList.add("switch");
  const inputTag = document.createElement("input");
  inputTag.type = "checkbox";
  if (target.options[index].optionValue === true) {
    inputTag.checked = true;
  }
  inputTag.addEventListener("click", function () {
    if (target.options[index].optionValue === true) {
      target.options[index].optionValue = false;
    } else {
      target.options[index].optionValue = true;
    }
  });
  const spanTag = document.createElement("span");
  spanTag.classList.add("slider");
  spanTag.classList.add("round");
  LabelTag.appendChild(inputTag);
  LabelTag.appendChild(spanTag);
  return LabelTag
}

const makeInputTag = function (target, index) {
  const inputTag = document.createElement("input");
  if (target.options[index].optionValue.trim() !== "") {
    inputTag.value = target.options[index].optionValue;
  }
  inputTag.addEventListener("change", function (event) {
    target.options[index].optionValue = event.target.value;
  });
  return inputTag
}

const makeSelectTag = function (target, index) {
  const select = document.createElement("select");
  for (let j = 0; j < target.options[index].optionType.length; j++) {
    const option = document.createElement("option");
    option.value = target.options[index].optionType[j];
    option.text = target.options[index].optionType[j];
    if (target.options[index].optionType[j] === target.options[index].optionValue) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  select.addEventListener("change", function (event) {
    target.options[index].optionValue =
      select[event.target.selectedIndex].value;
    console.log(target)
  });
  return select
}

// build DOM for selected tool
const buildOptionDom = function (target) {
    // change tool name and change toggle button
    const h2Tag = document.querySelector("#toolName");
    h2Tag.innerText = `Options for ${target.type}`;
    const tmpBtn = document.querySelector("#useBtn");
    const useBtn = tmpBtn.cloneNode(true);
    tmpBtn.parentNode.replaceChild(useBtn, tmpBtn);
    if (target.type.startsWith("one-import")) {
      useBtn.addEventListener("click", oneImportToggleFunction);
    } else {
      useBtn.addEventListener("click", function () {
        const optionFieldset = document.querySelector("#options");
        if (target.use === true) {
          target.use = false;
          optionFieldset.disabled = true;
        } else {
          target.use = true;
          optionFieldset.disabled = false;
        }
        autoCompletePath(target);
        emptyOptionBox(false);
        buildOptionDom(target)
      });
      const optionFieldset = document.querySelector("#options");
      if (target.use === true) {
        useBtn.checked = true;
        optionFieldset.disabled = false;
      } else {
        useBtn.checked = false;
        optionFieldset.disabled = true;
      }
    }
    // make tags for options
    const optionsNameTag = document.querySelector("#optionsName");
    const optionsValueTag = document.querySelector("#optionsValue");
    const nameUlTag = document.createElement("ul");
    const valueUlTag = document.createElement("ul");
    for (let i = 0; i < target.options.length; i++) {
      const nameLiTag = document.createElement("li");
      const valueLiTag = document.createElement("li");
      // case for select tag
      if (target.options[i].optionType) {
        nameLiTag.innerText = target.options[i].optionName;
        const select = makeSelectTag(target, i)
        valueLiTag.appendChild(select);
      } else {
        // case for toggle button
        if (typeof target.options[i].optionValue === "boolean") {
          const toggleBtn = makeToggleBtn(target, i)
          valueLiTag.appendChild(toggleBtn);
          nameLiTag.innerText = target.options[i].optionName;
          // case for input tag
        } else if (typeof target.options[i].optionValue === "string") {
          nameLiTag.innerText = target.options[i].optionName;
          // input_path needs path for real file so it needs explorer
          if (target.options[i].optionName === "input_path") {
            const btnTag = document.createElement("button");
            btnTag.innerText = "+";
            const inputTag = document.createElement("input");
            inputTag.id = target.options[i].optionName;
            inputTag.placeholder = "Please enter path to your ";
            inputTag.addEventListener("change", function (event) {
              target.options[i].optionValue = event.target.value;
              autoCompletePath(target);
            });
            if (target.options[i].optionValue.trim() !== "") {
              inputTag.value = target.options[i].optionValue;
            } 
            btnTag.addEventListener("click", function () {
              sendMessage("inputPath", target.type);
            });
            valueLiTag.appendChild(inputTag);
            valueLiTag.appendChild(btnTag);
          // output_path option is diffrent from other option because of autocompletion
          } else if (target.options[i].optionName === "output_path") {
            const inputTag = document.createElement("input");
            inputTag.placeholder = "Next input_path will be changed automatically";
            if (target.options[i].optionValue.trim() !== "") {
              inputTag.value = target.options[i].optionValue;
            }
            inputTag.addEventListener("change", function (event) {
              target.options[i].optionValue = event.target.value;
              autoCompletePath(target);
            });
            valueLiTag.appendChild(inputTag);
          } else {
            const inputTag = makeInputTag(target, i)
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
const changeSelect = function (event) {
    emptyOptionBox(true);
    const selectedText = event.target.options[event.target.selectedIndex].text;
    switch (selectedText) {
      case "bcq": {
        oneImportBcq.use = true;
        oneImportOnnx.use = false;
        oneImportTf.use = false;
        oneImportTflite.use = false;
        for (let i = 0; i < oneImport.options.length; i++) {
          if (i === 0) {
            oneImport.options[i].optionValue = true;
          } else {
            oneImport.options[i].optionValue = false;
          }
        }
        buildOptionDom(oneImportBcq);
        break;
      }
      case "onnx": {
        oneImportBcq.use = false;
        oneImportOnnx.use = true;
        oneImportTf.use = false;
        oneImportTflite.use = false;
        for (let i = 0; i < oneImport.options.length; i++) {
          if (i === 1) {
            oneImport.options[i].optionValue = true;
          } else {
            oneImport.options[i].optionValue = false;
          }
        }
        buildOptionDom(oneImportOnnx);
        break;
      }
      case "tf": {
        oneImportBcq.use = false;
        oneImportOnnx.use = false;
        oneImportTf.use = true;
        oneImportTflite.use = false;
        for (let i = 0; i < oneImport.options.length; i++) {
          if (i === 2) {
            oneImport.options[i].optionValue = true;
          } else {
            oneImport.options[i].optionValue = false;
          }
        }
        buildOptionDom(oneImportTf);
        break;
      }
      case "tflite": {
        for (let i = 0; i < oneImport.options.length; i++) {
          if (i === 3) {
            oneImport.options[i].optionValue = true;
          } else {
            oneImport.options[i].optionValue = false;
          }
        }
        oneImportBcq.use = false;
        oneImportOnnx.use = false;
        oneImportTf.use = false;
        oneImportTflite.use = true;
        buildOptionDom(oneImportTflite);
        break;
      }
    }
  };
