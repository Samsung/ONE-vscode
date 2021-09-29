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

const outputToInput = function (toolIndex, nextInputValue) {
  for (let k = toolIndex + 1; k < oneToolList.length; k++) {
    if (oneToolList[k].use === true) {
      for (let l = 0; l < oneToolList[k].options.length; l++) {
        if (oneToolList[k].options[l].optionName === "input_path") {
          oneToolList[k].options[l].optionValue =
            nextInputValue
          break;
        }
      }
      break;
    }
  }
};

const makeOutputAuto = function (input, toolIndex, optionIndex) {
  // because os maybe win32, divisor can be '\\'
  let divisor = "/";
  if (input.includes("\\")) {
    divisor = "\\";
  }
  let paths = input.split(divisor);
  let tmp = paths[paths.length - 1].split(".");
  switch (oneToolList[toolIndex].type) {
    case "one-optimize": {
      tmp.splice(tmp.length - 1, 0, "opt");
      paths[paths.length - 1] = tmp.join(".");
      oneToolList[toolIndex].options[optionIndex].optionValue = paths.join(divisor);
      break;
    }
    case "one-quantize": {
      if (tmp.includes('opt')) {
        tmp[tmp.indexOf('opt')] = "quantized";
      } else {
        tmp.splice(tmp.length - 1, 0, "quantized");
      }
      paths[paths.length - 1] = tmp.join(".");
      oneToolList[toolIndex].options[optionIndex].optionValue = paths.join(divisor);
      break;
    }
    case "one-pack": {
      while (tmp.length > 1) {
        tmp.splice(1, 1);
      }
      tmp[0] += "_pack";
      paths[paths.length - 1] = tmp.join(".");
      oneToolList[toolIndex].options[optionIndex].optionValue = paths.join(divisor);
      break;
    }
    default: {
      tmp[tmp.length - 1] = "circle";
      paths[paths.length - 1] = tmp.join(".");
      oneToolList[toolIndex].options[optionIndex].optionValue = paths.join(divisor);
    }
  }
  return oneToolList[toolIndex].options[optionIndex].optionValue
};

// autoCompletePath make output_path based on input_path and copy former output_path to next input_path
// for example, in import if input_path is 'filename.pb', then output_path will be 'filename.circle' automatically
// and then in optimize output_path will be 'filename.opt.circle` automatically
const autoCompletePath = function (tool) {
  // tool argument decides which location to start
  const index = oneToolList.indexOf(tool);
  for (let i = index; i < oneToolList.length; i++) {
    if (oneToolList[i].use === true) {
      let input = "";
      for (let j = 0; j < oneToolList[i].options.length; j++) {
        // if input_path is filled with something, then complete output_path based on input_path
        if (
          oneToolList[i].options[j].optionName === "input_path" &&
          oneToolList[i].options[j].optionValue.trim() !== ""
        ) {
          input = oneToolList[i].options[j].optionValue;
          // complete output path, change ouput_path file name depend on tool(ex) optimize, quantize, pack, import)
        } else if (oneToolList[i].options[j].optionName === "output_path") {
          let formerOutput = ''
          if (input.trim() !== "") {
              formerOutput = makeOutputAuto(input,i,j)
          } else {
            if (oneToolList[i].option[j].optionValue.trim() !== "") {
              formerOutput = oneToolList[i].option[j].optionValue
            }
          }
          // next input_path has to be same with former output_path, so change next input_path same as former output_path
          if (formerOutput !== '') {
            outputToInput(i, formerOutput)
          }
        }
      }
    }
  }
};
