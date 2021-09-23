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

import renderDashboard from "./dashboard.js";

const colorList = [
  "aquamarine",
  "cornflowerblue",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightsteelblue",
  "lime",
  "limegreen",
  "mediumaquamarine",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "mistyrose",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegreen",
  "palevioletred",
  "paleturquoise",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "rosybrown",
  "thistle",
  "yellowgreen",
  "firebrick",
  "dodgerblue",
  "darkorange",
  "crimson",
  "darkmagenta",
];

export default function openFileSelector() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "text/plain";
  input.onchange = (event) => {
    setFileName(event.target.files[0].name);
    processFile(event.target.files[0]);
  };
  input.click();
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result).traceEvents;
    processData(data);

    // set displayTimeUnit
    const setData = document.querySelector(".set-data");
    setData.dataset["displayTimeUnit"] = JSON.parse(
      reader.result
    ).displayTimeUnit;
  };
  reader.readAsText(file, "euc-kr");
}

function processData(data) {
  const processedData = {};
  const backgroundColor = {};
  const utility = {};
  const colorLen = colorList.length;
  let maxEndTime = 0;
  let colorIdx = 0;

  data.forEach((ele, idx) => {
    if (!ele.pid) {
      return;
    }

    // set data object
    processedData[ele.pid] = processedData[ele.pid]
      ? processedData[ele.pid]
      : {};
    processedData[ele.pid][ele.tid] = processedData[ele.pid][ele.tid]
      ? processedData[ele.pid][ele.tid]
      : [];

    // select backgroud-color
    if (!backgroundColor[ele.name]) {
      backgroundColor[ele.name] = colorList[colorIdx];
      colorIdx += 1;
      colorIdx %= colorLen;
    }

    // set maxEndTime
    if (ele.ts + ele.dur > maxEndTime) {
      maxEndTime = ele.ts + ele.dur;
    }

    // set processedData
    ele["backgroundColor"] = backgroundColor[ele.name];
    ele["pk"] = idx;
    processedData[ele.pid][ele.tid].push(ele);
    utility[ele.pid] = utility[ele.pid] ? utility[ele.pid] + ele.dur : ele.dur;
  });

  // select utility usage
  Object.keys(utility).forEach(key => {
    utility[key] = Math.round((utility[key] * 100) / maxEndTime) / 100;
  });

  // get digit
  let maxEndTime_ = maxEndTime;
  let digit = 0;
  while (maxEndTime_ > 0) {
    maxEndTime_ = parseInt(maxEndTime_ / 10);
    digit += 1;
  }

  // set endTime and digit to DOM
  const endTime = Math.ceil(maxEndTime / 10 ** (digit - 1)) * 10 ** (digit - 1);
  const setData = document.querySelector(".set-data");
  setData.dataset["endTime"] = endTime;
  setData.dataset["digit"] = digit;

  // render dashboard
  renderDashboard(utility, endTime, digit, processedData);
}

function setFileName(name) {
  const fileName = document.querySelector(".file-name");
  fileName.innerText = name;
}
