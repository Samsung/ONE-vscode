// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

const vscode = acquireVsCodeApi();

console.log("view from javascript.");

const oneImport = {
  type: "one-import",
  use: true,
  options: [
    { optionName: "bcq", optionValue: false },
    { optionName: "onnx", optionValue: false },
    { optionName: "tf", optionValue: false },
    { optionName: "tflite", optionValue: false },
  ],
};

const oneImportBcq = {
  type: "one-import-bcq",
  use: false,
  options: [
    {
      optionName: "converter_version",
      optionValue: "v1",
      optionType: ["v1", "v2"],
    },
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "input_arrays", optionValue: "" },
    { optionName: "input_shapes", optionValue: "" },
    { optionName: "output_arrays", optionValue: "" },
  ],
};

const oneImportOnnx = {
  type: "one-import-onnx",
  use: false,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "input_arrays", optionValue: "" },
    { optionName: "output_arrays", optionValue: "" },
    { optionName: "model_format", optionValue: "" },
    { optionName: "converter_verstion", optionValue: "" },
  ],
};

const oneImportTf = {
  type: "one-import-tf",
  use: false,
  options: [
    {
      optionName: "converter_version",
      optionValue: "v1",
      optionType: ["v1", "v2"],
    },
    {
      optionName: "model_format",
      optionValue: "graph_def",
      optionType: ["graph_def", "saved_model", "keras_model"],
    },
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "input_arrays", optionValue: "" },
    { optionName: "output_arrays", optionValue: "" },
    { optionName: "input_shapes", optionValue: "" },
  ],
};

const oneImportTflite = {
  type: "one-import-tflite",
  use: false,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
  ],
};

const oneImportOptions = [
  oneImportBcq,
  oneImportOnnx,
  oneImportTf,
  oneImportTflite,
];

const optimize = {
  type: "one-optimize",
  use: true,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "generate_profile_data", optionValue: false },
    { optionName: "change_outputs", optionValue: false },
    { optionName: "01", optionValue: false },
    { optionName: "conver_nchw_to_nhwd", optionValue: false },
    { optionName: "nchw_to_nhwc_input_shape", optionValue: false },
    { optionName: "nchw_to_nhwc_output_shape", optionValue: false },
    { optionName: "fold_add_v2", optionValue: false },
    { optionName: "fold_cast", optionValue: false },
    { optionName: "fold_dequantize", optionValue: false },
    { optionName: "fold_sparse_to_dense", optionValue: false },
    { optionName: "forward_reshape_to_unaryop", optionValue: false },
    { optionName: "fuse_add_with_tconv", optionValue: false },
    { optionName: "fuse_batchnorm_with_conv", optionValue: false },
    { optionName: "fuse_batchnorm_with_dwconv", optionValue: false },
    { optionName: "fuse_batchnorm_with_tconv", optionValue: false },
    { optionName: "fuse_bcq", optionValue: false },
    { optionName: "fuse_preactivation_batchnorm", optionValue: false },
    { optionName: "fuse_mean_with_mean", optionValue: false },
    { optionName: "fuse_transpose_with_mean", optionValue: false },
    { optionName: "make_batchnorm_gamma_positive", optionValue: false },
    { optionName: "fuse_activation_function", optionValue: false },
    { optionName: "fuse_instnorm ", optionValue: false },
    {
      optionName: "replace_cw_mul_add_with_depthwise_conv",
      optionValue: false,
    },
    { optionName: "remove_fakequant", optionValue: false },
    { optionName: "remove_quantdequant", optionValue: false },
    { optionName: "remove_redundant_reshape", optionValue: false },
    { optionName: "remove_redundant_transpose", optionValue: false },
    { optionName: "remove_unnecessary_reshape", optionValue: false },
    { optionName: "remove_unnecessary_slice", optionValue: false },
    { optionName: "remove_unnecessary_strided_slice", optionValue: false },
    { optionName: "remove_unnecessary_split", optionValue: false },
    { optionName: "resolve_customop_add", optionValue: false },
    { optionName: "resolve_customop_batchmatmul", optionValue: false },
    { optionName: "resolve_customop_matmul", optionValue: false },
    { optionName: "resolve_customop_max_pool_with_argmax", optionValue: false },
    { optionName: "shuffle_weight_to_16x1float32", optionValue: false },
    { optionName: "substitute_pack_to_reshape", optionValue: false },
    { optionName: "substitute_squeeze_to_reshape", optionValue: false },
    { optionName: "substitute_strided_slice_to_reshape", optionValue: false },
    { optionName: "substitute_transpose_to_reshape", optionValue: false },
    { optionName: "transform_min_max_to_relu6", optionValue: false },
    { optionName: "transform_min_relu_to_relu6", optionValue: false },
  ],
};

const quantize = {
  type: "one-quantize",
  use: true,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
    { optionName: "input_data", optionValue: "" },
    { optionName: "input_data_format", optionValue: "" },
    { optionName: "input_dtype", optionValue: "" },
    { optionName: "quantized_dtype", optionValue: "" },
    { optionName: "granularity", optionValue: "" },
    { optionName: "min_percentile", optionValue: "" },
    { optionName: "min_percentile", optionValue: "" },
    { optionName: "max_percentile", optionValue: "" },
    { optionName: "mode", optionValue: "" },
    { optionName: "generate_profile_data", optionValue: false },
  ],
};

const pack = {
  type: "one-pack",
  use: true,
  options: [
    { optionName: "input_path", optionValue: "" },
    { optionName: "output_path", optionValue: "" },
  ],
};

const codegen = {
  type: "one-codegen",
  use: false,
  options: [
    { optionName: "backend", optionValue: "" },
    { optionName: "command", optionValue: "" },
  ],
};

const profile = {
  type: "one-profile",
  use: false,
  options: [
    { optionName: "backend", optionValue: "" },
    { optionName: "command", optionValue: "" },
  ],
};

const oneToolList = [
  oneImportBcq,
  oneImportOnnx,
  oneImportTf,
  oneImportTflite,
  optimize,
  quantize,
  pack,
  codegen,
  profile,
];

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

const buildOptionDom = function (target) {
  // tool 이름이랑 토글버튼 변경하는 부분
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
  // 내부 옵션들 하나씩 for문 돌면서 생성하는 기능
  const optionsNameTag = document.querySelector("#optionsName");
  const optionsValueTag = document.querySelector("#optionsValue");
  const nameUlTag = document.createElement("ul");
  const valueUlTag = document.createElement("ul");
  for (let i = 0; i < target.options.length; i++) {
    const nameLiTag = document.createElement("li");
    const valueLiTag = document.createElement("li");
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
      if (typeof target.options[i].optionValue === "boolean") {
        // 들어오는 값이 boolean 값일 경우
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
      } else if (typeof target.options[i].optionValue === "string") {
        // 들어오는 값이 string 값일 경우
        nameLiTag.innerText = target.options[i].optionName;
        if (target.options[i].optionName === "input_path") {
          const btnTag = document.createElement("button");
          btnTag.innerText = "+";
          btnTag.addEventListener("click", function () {
            getFilePath(target.type);
          });
          const inputTag = document.createElement("input");
          inputTag.id = target.options[i].optionName;
          inputTag.placeholder = "please enter path to your target";
          inputTag.addEventListener("change", function (event) {
            target.options[i].optionValue = event.target.value;
            autoCompletePath();
          });
          if (target.options[i].optionValue.trim() !== "") {
            inputTag.value = target.options[i].optionValue;
          }
          valueLiTag.appendChild(inputTag);
          valueLiTag.appendChild(btnTag);
        } else if (target.options[i].optionName === "output_path") {
          const inputTag = document.createElement("input");
          inputTag.placeholder = "next inputPath will be changed automatically";
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

const getFilePath = function (tool) {
  vscode.postMessage({
    command: "inputPath",
    selectedTool: tool,
  });
};

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
      defaultOption.text = "choose your framework";
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
      buildOptionDom(optimize);
      break;
    }
    case "quantize": {
      buildOptionDom(quantize);
      break;
    }
    case "pack": {
      buildOptionDom(pack);
      break;
    }
    case "codegen": {
      buildOptionDom(codegen);
      break;
    }
    case "profile": {
      buildOptionDom(profile);
      break;
    }
  }
};

const pathValidator = function (target) {
  for (let j = 0; j < target.options.length; j++) {
    if (
      target.options[j].optionName === "input_path" &&
      target.options[j].optionValue.trim() === ""
    ) {
      vscode.postMessage({
        command: "alert",
        text: `If you want to use ${target.type}, then input_path is required`,
      });
      return true;
    }
    if (
      target.options[j].optionName === "output_path" &&
      target.options[j].optionValue.trim() === ""
    ) {
      vscode.postMessage({
        command: "alert",
        text: `If you want to use ${target.type}, then output_path is required`,
      });
      return true;
    }
  }
  return false;
};

const backendValidator = function (target) {
  for (let j = 0; j < target.options.length; j++) {
    if (
      target.options[j].optionName === "backend" &&
      target.options[j].optionValue.trim() === ""
    ) {
      vscode.postMessage({
        command: "alert",
        text: `If you want to use ${target.type}, then backend is required`,
      });
      return true;
    }
  }
  return false;
};

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
      vscode.postMessage({
        command: "alert",
        text: "If you want to use oneImport, than you have to choose your framework",
      });
      return false;
    } else {
      if (pathValidator(oneImportOptions[chosenModelIndex])) {
        return false;
      }
    }
  }
  if (optimize.use === true) {
    if (pathValidator(optimize)) {
      return false;
    }
  }
  if (quantize.use === true) {
    if (pathValidator(quantize)) {
      return false;
    }
  }
  if (pack.use === true) {
    if (pathValidator(pack)) {
      return false;
    }
  }
  if (codegen.use === true) {
    if (backendValidator(codegen)) {
      return false;
    }
  }
  if (profile.use === true) {
    if (backendValidator(profile)) {
      return false;
    }
  }
  return true;
};

const exportConfiguration = function () {
  if (exportValidation()) {
    console.log("validation OK");
  }
};
const runConfiguration = function () {};
const importConfiguration = function () {
  vscode.postMessage({
    command: "importConfig",
  });
};

function oneImportTools(data, importOpt, oneImport, tool, idx, defaultImportObject) {
  oneImport.use = true;
  for (let i = 0; i < defaultImportObject.options.length; i++) {
      if (importOpt === defaultImportObject.options[i].optionName) {
        defaultImportObject.options[i].optionValue =
          data[tool][importOpt];
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
          console.log(oneToolList[i]);
          buildOptionDom(oneToolList[i]);
          break;
        }
      }
      break;
    case "importConfig":
      oneImport.use = false;
      optimize.use = false;
      quantize.use = false;
      pack.use = false;
      for (const tool of Object.keys(data.options)) {
        for (const importOpt in data.options[tool]) {
          if (tool === "one-import-bcq") {
            oneImportTools(data.options, importOpt, oneImport, tool, 0, oneImportBcq);
          } else if (tool === "one-import-onnx") {
            oneImportTools(data.options, importOpt, oneImport, tool, 1, oneImportOnnx);
          } else if (tool === "one-import-tf") {
            oneImportTools(data.options, importOpt, oneImport, tool, 2, oneImportTf);
          } else if (tool === "one-import-tflite") {
            oneImportTools(data.options, importOpt, oneImport, tool, 3, oneImportTflite);
          } else if (tool === "one-optimize") {
            optimize.use = true;
            oneOtherTools(data.options, importOpt, tool, optimize);
          } else if (tool === "one-quantize") {
            quantize.use = true;
            oneOtherTools(data.options, importOpt, tool, quantize);
          } else if (tool === "one-pack") {
            pack.use = true;
            oneOtherTools(data.options, importOpt, tool, pack);
          } else if (tool === "one-codegen") {
            codegen.use = true;
            oneOtherTools(data.options, importOpt, tool, codegen);
          } else if (tool === "one-profile") {
            profile.use = true;
            oneOtherTools(data.options, importOpt, tool, profile);
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
