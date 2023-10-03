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

import { postMessageToVsCode } from "./vscodeapi.js";

function iniKeyValueString(iniKey, iniValue, noEffectValue = undefined) {
  if (iniValue === null || iniValue === undefined) {
    return "";
  }

  if (iniValue === false) {
    return "";
  } else if (iniValue === true) {
    return iniKey + "=True\n";
  }

  const trimmedValue = iniValue.trim();
  if (trimmedValue === "" || trimmedValue === noEffectValue) {
    return "";
  }

  return iniKey + "=" + trimmedValue + "\n";
}

export function applyUpdates() {
  postMessageToVsCode({ type: "updateDocument" });
}

export function updateEdgeTPUStep(){
  postMessageToVsCode({
    type: "setParam",
    section: "edgetpu-compiler",
    param: "edgetpu-compile",
    value: document.getElementById("checkboxEdgeTPUCompile").checked
    ? "True"
    : "False",
  }); 
  postMessageToVsCode({
    type: "setParam",
    section: "edgetpu-compiler",
    param: "edgetpu-profile",
    value: document.getElementById("checkboxEdgeTPUProfile").checked
    ? "True"
    : "False",
  }); 
}

function addPostfixToFileName(filePath = "", postfix = "") {
  if (filePath.trim() === "") {
    return "";
  }
  const parts = filePath.split(".");
  let newFilePath = "";
  if (parts.length < 2) {
    newFilePath = `${filePath}${postfix}`;
  } else {
    const fileName = parts.slice(0, -1).join(".");
    const fileExtension = parts[parts.length - 1];
    const newFileName = `${fileName}${postfix}`;
    newFilePath = `${newFileName}.${fileExtension}`;
  }

  return newFilePath;
}

export function updateEdgeTPUCompile() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("EdgeTPUInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    addPostfixToFileName(
      document.getElementById("EdgeTPUInputPath").value,
      "_edgetpu"
    )
  );
  content += iniKeyValueString(
    "intermediate_tensors",
    document.getElementById("EdgeTPUIntermediateTensorsInputArrays").value
  );
  content += iniKeyValueString(
    "show_operations",
    document.getElementById("EdgeTPUShowOperations").checked
  );
  content += iniKeyValueString(
    "search_delegate",
    document.getElementById("EdgeTPUSearchDelegate").checked
  );
  content += iniKeyValueString(
    "delegate_search_step",
    document.getElementById("EdgeTPUSearchDelegate").checked
      ? document.getElementById("EdgeTPUDelegateSearchStep").value < 1
        ? "1"
        : document.getElementById("EdgeTPUDelegateSearchStep").value
      : undefined
  );

  postMessageToVsCode({
    type: "setSection",
    section: "edgetpu-compile",
    param: content,
  });
}

export function updateEdgeTPUProfile() {
  let content = "";

  postMessageToVsCode({
    type: "setSection",
    section: "edgetpu-profile",
    param: content,
  });
}
