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
