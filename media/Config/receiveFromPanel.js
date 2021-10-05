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
                console.log(oneToolList[i].options[j].optionValue);
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
            if (tool === 'one-build' || tool === 'onecc') {
              oneToolToggle(data.options[tool], importOpt);
            }
            for (let i = 0; i < oneToolList.length; i++) {
              if (tool === oneToolList[i].type && i <= 3) {
                oneImportTools(data.options[tool], importOpt, oneToolList[i].options);
              } else if (tool ===oneToolList[i].type && i > 3) {
                oneOtherTools(data.options[tool], importOpt, oneToolList[i].options);
            }
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
