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

// autoCompletePath make output_path based on input_path and copy former output_path to next input_path
const autoCompletePath = function (tool) {
  const index = oneToolList.indexOf(tool)
  for (let i = index; i < oneToolList.length; i++) {
    if (oneToolList[i].use === true) {
      let input = "";
      for (let j = 0; j < oneToolList[i].options.length; j++) {
        if (
          oneToolList[i].options[j].optionName === "input_path" &&
          oneToolList[i].options[j].optionValue.trim() !== ""
        ) {
          input = oneToolList[i].options[j].optionValue;
        } else if (oneToolList[i].options[j].optionName === "output_path") {
          if (input.trim() !== "") {
            let divisor = '/'
            if (input.includes('\\')) {
              divisor = '\\'
            }
            switch (oneToolList[i].type) {
              case "one-optimize": {
                let paths = input.split(divisor);
                let tmp = paths[paths.length - 1].split(".");
                tmp.splice(tmp.length-1, 0, "opt");
                paths[paths.length - 1] = tmp.join(".");
                oneToolList[i].options[j].optionValue = paths.join(divisor);
                break;
              }
              case "one-quantize": {
                let paths = input.split(divisor);
                let tmp = paths[paths.length - 1].split(".");
                if (tmp.length > 2) {
                  tmp[tmp.length-2] = "quantized";
                } else {
                  tmp.splice(tmp.length-1, 0, "quantized");
                }
                paths[paths.length - 1] = tmp.join(".");
                oneToolList[i].options[j].optionValue = paths.join(divisor);
                break;
              }
              case "one-pack": {
                let paths = input.split(divisor);
                let tmp = paths[paths.length - 1].split(".");
                while (tmp.length > 1) {
                  tmp.splice(1, 1);
                }
                tmp[0] += '_pack'
                paths[paths.length - 1] = tmp.join(".");
                oneToolList[i].options[j].optionValue = paths.join(divisor);
                break;
              }
              default: {
                let paths = input.split(divisor)
                let tmp = paths[paths.length-1].split('.')
                tmp[tmp.length-1] = 'circle'
                paths[paths.length-1] = tmp.join('.')
                oneToolList[i].options[j].optionValue = paths.join(divisor)
              }
            }
          }
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
