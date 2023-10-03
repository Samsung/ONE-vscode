/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
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

export function displayCfgToEditor(cfg) {
  const edgeTPUCompiler = cfg["edgetpu-compiler"];
  document.getElementById("checkboxEdgeTPUCompile").checked = cfgBoolean(
    edgeTPUCompiler["edgetpu-compile"]
  );
  document.getElementById("checkboxEdgeTPUProfile").checked = cfgBoolean(
    edgeTPUCompiler["edgetpu-profile"]
  );


  const edgeTPUCompile = cfg["edgetpu-compile"];
  document.getElementById("EdgeTPUInputPath").value = cfgString(
    edgeTPUCompile?.["input_path"]
  );
  document.getElementById("EdgeTPUOutputPath").value = cfgString(
    edgeTPUCompile?.["output_path"]
  );
  document.getElementById("EdgeTPUIntermediateTensorsInputArrays").value =
    cfgString(edgeTPUCompile?.["intermediate_tensors"]);
  document.getElementById("EdgeTPUShowOperations").checked = cfgBoolean(
    edgeTPUCompile?.["show_operations"]
  );
  document.getElementById("EdgeTPUSearchDelegate").checked = cfgBoolean(
    edgeTPUCompile?.["search_delegate"]
  );
  document.getElementById("EdgeTPUDelegateSearchStep").value = cfgString(
    edgeTPUCompile?.["delegate_search_step"],
    "1"
  );
}

function cfgString(str, defaultStr = "") {
  if (str === null || str === undefined) {
    return defaultStr;
  }
  return str.trim();
}

function cfgBoolean(str) {
  if (str === null || str === undefined) {
    return false;
  }

  if (str === "True") {
    return true;
  }

  return false;
}