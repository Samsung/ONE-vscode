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

const getInputPath = function(tool) {
  for (let i = 0; i < tool.options.length; i++) {
    if (tool.options[i].optionName === 'input_path') {
      return tool.options[i].optionValue;
    }
  }
  return '';
};

const getOutputPath = function(tool) {
  for (let i = 0; i < tool.options.length; i++) {
    if (tool.options[i].optionName === 'output_path') {
      return tool.options[i].optionValue;
    }
  }
  return '';
};

const makeOutputPath = function(tool, input) {
  // because os maybe win32, divisor can be '\\'
  let divisor = '/';
  if (input.includes('\\')) {
    divisor = '\\';
  }
  let paths = input.split(divisor);
  let filename = paths[paths.length - 1].split('.');
  let result = '';
  switch (tool.type) {
    case 'one-optimize': {
      filename.splice(filename.length - 1, 0, 'opt');
      paths[paths.length - 1] = filename.join('.');
      result = paths.join(divisor);
      break;
    }
    case 'one-quantize': {
      if (filename.includes('opt')) {
        filename[filename.indexOf('opt')] = 'quantized';
      } else {
        filename.splice(filename.length - 1, 0, 'quantized');
      }
      paths[paths.length - 1] = filename.join('.');
      result = paths.join(divisor);
      break;
    }
    case 'one-pack': {
      while (filename.length > 1) {
        filename.splice(1, 1);
      }
      filename[0] += '_pack';
      paths[paths.length - 1] = filename.join('.');
      result = paths.join(divisor);
      break;
    }
    default: {
      filename[filename.length - 1] = 'circle';
      paths[paths.length - 1] = filename.join('.');
      result = paths.join(divisor);
    }
  }
  return result;
};

const setOutputPath = function(tool, newOutputPath) {
  for (let i = 0; i < tool.options.length; i++) {
    if (tool.options[i].optionName === 'output_path') {
      tool.options[i].optionValue = newOutputPath;
      break;
    }
  }
};

const outputToInput = function(toolIndex, nextInputValue) {
  for (let k = toolIndex + 1; k < oneToolList.length; k++) {
    if (oneToolList[k].use === true) {
      for (let l = 0; l < oneToolList[k].options.length; l++) {
        if (oneToolList[k].options[l].optionName === 'input_path') {
          oneToolList[k].options[l].optionValue = nextInputValue;
          break;
        }
      }
      break;
    }
  }
};



// autoCompletePath will generate output_path from the input_path for the specific tool.
// ex) if input_path is 'filename.pb' then 'output_path' will be 'filename.circle' for
// You can find 'oneToolList' in 'tool.js'
const autoCompletePath = function(tool) {
  // tool argument decides which location to start
  const index = oneToolList.indexOf(tool);
  for (let i = index; i < oneToolList.length; i++) {
    if (oneToolList[i].use === true) {
      const inputPath = getInputPath(oneToolList[i]);
      let outputPath = '';
      if (inputPath.trim() !== '') {
        outputPath = makeOutputPath(oneToolList[i], inputPath);
        setOutputPath(oneToolList[i], outputPath);
      } else {
        outputPath = getOutputPath(oneToolList[i]);
      }
      if (outputPath.trim() !== '') {
        outputToInput(i, outputPath);
      }
    }
  }
};
