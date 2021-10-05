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

import {Project} from '../Project';
import {BuilderCfgFile} from '../Project/BuilderCfgFile';
import {Utils} from '../Utils';

export function runConfig(payload: any): void {
  let logger = new Utils.Logger();
  let projectBuilder = new Project.Builder(logger);
  let builderCfgFile = new BuilderCfgFile(projectBuilder, logger);
  builderCfgFile.importCfg(parseCfg(payload));
  projectBuilder.build(payload);
}

interface ToolsType {
  [key: string]: ToolType;
}

interface ToolType {
  [key: string]: string;
}

// Change form of 'oneToolList' to fit 'cfgIni' of method 'onBeginImport'
const parseCfg = function(oneToolList: any) {
  let tools: ToolsType = {};
  let oneBuild: ToolType = {};
  for (let i = 0; i < oneToolList.length; i++) {
    let tool: ToolType = {};
    oneBuild[oneToolList[i].type] = oneToolList[i].use ? 'True' : 'False';
    if (oneToolList[i].use === true) {
      for (let j = 0; j < oneToolList[i].options.length; j++) {
        let optionValue = oneToolList[i].options[j].optionValue;
        if (optionValue === false || optionValue === '') {
          continue;
        }
        if (optionValue === true) optionValue = 'True';
        tool[oneToolList[i].options[j].optionName] = optionValue;
      }
      tools[oneToolList[i].type] = tool;
    }
  }
  tools['one-build'] = oneBuild;
  return tools;
}
