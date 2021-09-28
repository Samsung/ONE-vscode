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
                console.log(oneToolList[i].options[j].optionValue)
                const inputTag = document.querySelector("#input_path");
                inputTag.value = data.filePath;
                break;
              }
            }
            autoCompletePath(oneToolList[i]);
            emptyOptionBox(true);
            buildOptionDom(oneToolList[i]);
            break;
          }
        }
        break;
      case "importConfig":
        importConfigPath = data.filePath;
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
