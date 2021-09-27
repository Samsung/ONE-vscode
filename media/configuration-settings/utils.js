// autoCompletePath copy former output_path to later input_path
const autoCompletePath = function () {
    for (let i = 0; i < oneToolList.length; i++) {
      if (oneToolList[i].use === true) {
        for (let j = 0; j < oneToolList[i].options.length; j++) {
          if (
            oneToolList[i].options[j].optionName === "output_path" &&
            oneToolList[i].options[j].optionValue.trim() !== ""
          ) {
            for (let k = i + 1; k < oneToolList.length; k++) {
              if (oneToolList[k].use === true) {
                for (let l = 0; l < oneToolList[k].options.length; l++) {
                  if (oneToolList[k].options[l].optionName === "input_path") {
                    oneToolList[k].options[l].optionValue =
                      oneToolList[i].options[j].optionValue;
                    break;
                  }
                }
                break;
              }
            }
          }
        }
      }
    }
};

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
    autoCompletePath();
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
        autoCompletePath();
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
        const select = document.createElement("select");
        select.id = target.options[i].optionName;
        select.name = target.options[i].optionName;
        for (let j = 0; j < target.options[i].optionType.length; j++) {
          const option = document.createElement("option");
          option.value = target.options[i].optionType[j];
          option.text = target.options[i].optionType[j];
          if (target.options[i].optionType[j] === target.options[i].optionValue) {
            option.selected = true;
          }
          select.appendChild(option);
        }
        select.addEventListener("change", function (event) {
          target.options[i].optionValue =
            select[event.target.selectedIndex].value;
        });
        valueLiTag.appendChild(select);
      } else {
        // case for toggle button
        if (typeof target.options[i].optionValue === "boolean") {
          const valueLabelTag = document.createElement("label");
          valueLabelTag.classList.add("switch");
          const inputTag = document.createElement("input");
          inputTag.type = "checkbox";
          if (target.options[i].optionValue === true) {
            inputTag.checked = true;
          }
          inputTag.addEventListener("click", function () {
            if (target.options[i].optionValue === true) {
              target.options[i].optionValue = false;
            } else {
              target.options[i].optionValue = true;
            }
          });
          const spanTag = document.createElement("span");
          spanTag.classList.add("slider");
          spanTag.classList.add("round");
          valueLabelTag.appendChild(inputTag);
          valueLabelTag.appendChild(spanTag);
          valueLiTag.appendChild(valueLabelTag);
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
            inputTag.placeholder = "Please enter path to your target";
            inputTag.addEventListener("change", function (event) {
              target.options[i].optionValue = event.target.value;
              autoCompletePath();
            });
            if (target.options[i].optionValue.trim() !== "") {
              inputTag.value = target.options[i].optionValue;
              btnTag.addEventListener("click", function () {
                sendMessage(
                  "alert",
                  "If your earlier output_path exists, you can't change your input_path"
                );
              });
            } else {
              btnTag.addEventListener("click", function () {
                sendMessage("inputPath", target.type);
              });
            }
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
              autoCompletePath();
            });
            valueLiTag.appendChild(inputTag);
          } else {
            const inputTag = document.createElement("input");
            if (target.options[i].optionValue.trim() !== "") {
              inputTag.value = target.options[i].optionValue;
            }
            inputTag.addEventListener("change", function (event) {
              target.options[i].optionValue = event.target.value;
            });
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

// send message to config panel
const sendMessage = function (command, payload) {
    vscode.postMessage({
      command: command,
      payload: payload,
    });
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

function oneImportTools(data, importOpt, tool, idx, defaultImportObject) {
    oneImport.use = true;
    for (let i = 0; i < defaultImportObject.options.length; i++) {
      if (importOpt === defaultImportObject.options[i].optionName) {
        defaultImportObject.options[i].optionValue = data[tool][importOpt];
      }
    }
    for (let i = 0; i < oneImport.options.length; i++) {
      if (i === idx) {
        oneImport.options[i].optionValue = true;
      } else {
        oneImport.options[i].optionValue = false;
      }
    }
  }
  
  function oneOtherTools(data, importOpt, tool, otherTool) {
    for (let i = 0; i < otherTool.options.length; i++) {
      if (
        importOpt === otherTool.options[i].optionName &&
        data[tool][importOpt] === "False"
      ) {
        otherTool.options[i].optionValue = false;
      } else if (
        importOpt === otherTool.options[i].optionName &&
        data[tool][importOpt] === "True"
      ) {
        otherTool.options[i].optionValue = true;
      } else if (importOpt === otherTool.options[i].optionName) {
        otherTool.options[i].optionValue = data[tool][importOpt];
      }
    }
  }
  
