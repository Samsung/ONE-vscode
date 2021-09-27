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
const showOptions = function (event) {
  emptyOptionBox(false);
  event.target.classList.add("selected");
  switch (event.target.id) {
    case "import": {
      const h2Tag = document.querySelector("#toolName");
      h2Tag.innerText = "Options for import";
      const locaForSelect = document.querySelector("#locaForSelect");
      const select = document.createElement("select");
      select.id = "framework";
      select.name = "framework";
      const defaultOption = document.createElement("option");
      defaultOption.value = "beforeDecision";
      defaultOption.text = "Choose your framework";
      select.appendChild(defaultOption);
      for (let i = 0; i < oneImport.options.length; i++) {
        const option = document.createElement("option");
        option.value = oneImport.options[i].optionName;
        option.text = oneImport.options[i].optionName;
        select.appendChild(option);
      }
      select.addEventListener("change", changeSelect);
      locaForSelect.appendChild(select);
      const tmpBtn = document.querySelector("#useBtn");
      const useBtn = tmpBtn.cloneNode(true);
      tmpBtn.parentNode.replaceChild(useBtn, tmpBtn);
      const optionFieldset = document.querySelector("#options");
      if (oneImport.use === true) {
        useBtn.checked = true;
        optionFieldset.disabled = false;
      } else {
        useBtn.checked = false;
        optionFieldset.disabled = true;
      }
      useBtn.addEventListener("click", oneImportToggleFunction);
      let chosenOptionIndex = -1;
      for (let i = 0; i < oneImport.options.length; i++) {
        if (oneImport.options[i].optionValue === true) {
          chosenOptionIndex = i;
          break;
        }
      }
      if (chosenOptionIndex !== -1) {
        select.options[chosenOptionIndex + 1].selected = true;
        buildOptionDom(oneImportOptions[chosenOptionIndex]);
      }
      if (oneImport.use === false) {
        select.disabled = true;
      } else {
        select.disabled = false;
      }
      break;
    }
    case "optimize": {
      buildOptionDom(oneOptimize);
      break;
    }
    case "quantize": {
      buildOptionDom(oneQuantize);
      break;
    }
    case "pack": {
      buildOptionDom(onePack);
      break;
    }
    case "codegen": {
      buildOptionDom(oneCodegen);
      break;
    }
    case "profile": {
      buildOptionDom(oneProfile);
      break;
    }
  }
};

// send message to config panel about export configuration
const exportConfiguration = function () {
  if (exportValidation()) {
    sendMessage("exportConfig", oneToolList);
  }
};

// send message to config panel about run configuration
const runConfiguration = function () {
  if (exportValidation()) {

  }
};

// send message to config panel about import configuration
const importConfiguration = function () {
  sendMessage("importConfig", "");
};

// receive message from config panel and do things for command of receivied message
window.addEventListener("message", (event) => {
  const data = event.data;
  switch (data.command) {
    case "inputPath":
      for (let i = 0; i < oneToolList.length; i++) {
        if (oneToolList[i].type === data.selectedTool) {
          for (let j = 0; j < oneToolList[i].options.length; j++) {
            if (oneToolList[i].options[j].optionName === "input_path") {
              oneToolList[i].options[j].optionValue = data.filePath;
              const inputTag = document.querySelector("#input_path");
              inputTag.value = data.filePath;
              break;
            }
          }
          autoCompletePath();
          emptyOptionBox(true);
          buildOptionDom(oneToolList[i]);
          break;
        }
      }
      break;
    case "importConfig":
      oneImport.use = false;
      oneOptimize.use = false;
      oneQuantize.use = false;
      onePack.use = false;
      for (const tool of Object.keys(data.options)) {
        for (const importOpt in data.options[tool]) {
          if (tool === "one-import-bcq") {
            oneImportTools(data.options, importOpt, tool, 0, oneImportBcq);
          } else if (tool === "one-import-onnx") {
            oneImportTools(data.options, importOpt, tool, 1, oneImportOnnx);
          } else if (tool === "one-import-tf") {
            oneImportTools(data.options, importOpt, tool, 2, oneImportTf);
          } else if (tool === "one-import-tflite") {
            oneImportTools(data.options, importOpt, tool, 3, oneImportTflite);
          } else if (tool === "one-optimize") {
            oneOptimize.use = true;
            oneOtherTools(data.options, importOpt, tool, oneOptimize);
          } else if (tool === "one-quantize") {
            oneQuantize.use = true;
            oneOtherTools(data.options, importOpt, tool, oneQuantize);
          } else if (tool === "one-pack") {
            onePack.use = true;
            oneOtherTools(data.options, importOpt, tool, onePack);
          } else if (tool === "one-codegen") {
            oneCodegen.use = true;
            oneOtherTools(data.options, importOpt, tool, oneCodegen);
          } else if (tool === "one-profile") {
            oneProfile.use = true;
            oneOtherTools(data.options, importOpt, tool, oneProfile);
          }
        }
      }
      const tmpEvent = {
        target: document.querySelector("#import"),
      };
      showOptions(tmpEvent);
      break;
  }
});

// add EventListener to html tags
document.querySelector("#import").addEventListener("click", showOptions);
document.querySelector("#optimize").addEventListener("click", showOptions);
document.querySelector("#quantize").addEventListener("click", showOptions);
document.querySelector("#pack").addEventListener("click", showOptions);
document.querySelector("#codegen").addEventListener("click", showOptions);
document.querySelector("#profile").addEventListener("click", showOptions);
document
  .querySelector("#importBtn")
  .addEventListener("click", importConfiguration);
document.querySelector("#runBtn").addEventListener("click", runConfiguration);
document
  .querySelector("#exportBtn")
  .addEventListener("click", exportConfiguration);
const tmpEvent = {
  target: document.querySelector("#import"),
};
showOptions(tmpEvent);
