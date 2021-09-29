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

// Copyright (c) 2012 The Chromium Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// This file referenced the result of
// https://github.com/catapult-project/catapult/tree/444aba89e1c30edf348c611a9df79e2376178ba8/tracing

import getColorList from './colorList.js';
import renderDashboard from './dashboard.js';

const setData = document.querySelector('.set-data');

export default function openFileSelector() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'text/plain';
  input.onchange = (event) => {
    setFileName(event.target.files[0].name);
    processFile(event.target.files[0]);
  };
  input.click();
}

function setFileName(name) {
  const fileName = document.querySelector('.file-name');
  fileName.innerText = name;
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    processData(data.traceEvents);

    // set data to DOM
    setData.dataset['displayTimeUnit'] = data.displayTimeUnit;
  };
  reader.readAsText(file, 'euc-kr');
}

function processData(data) {
  const processedData = {};
  const backgroundColor = {};
  const utility = {};
  const colorList = getColorList();
  let endTime = 0;
  let colorIdx = 0;

  data.forEach((ele, idx) => {
    // exception handling
    if (!ele.name) {
      return;
    }

    // set data object
    if (processedData[ele.pid] === undefined) {
      processedData[ele.pid] = {};
    }
    if (processedData[ele.pid][ele.tid] === undefined) {
      processedData[ele.pid][ele.tid] = [];
    }

    // set backgroud-color
    if (!backgroundColor[ele.name]) {
      backgroundColor[ele.name] = colorList[colorIdx];
      colorIdx += 1;
      colorIdx %= colorList.length;
    }

    endTime = Math.max(endTime, ele.ts + ele.dur);
    utility[ele.pid] = utility[ele.pid] ? utility[ele.pid] + ele.dur : ele.dur;

    ele['pk'] = idx;
    ele['backgroundColor'] = backgroundColor[ele.name];

    processedData[ele.pid][ele.tid].push(ele);
  });

  Object.keys(utility).forEach(key => {
    utility[key] = Math.round((utility[key] * 100) / endTime) / 100;
  });

  const digit = parseInt(endTime).toString().length;
  const timeLimit = Math.ceil(endTime / 10 ** (digit - 1)) * 10 ** (digit - 1);

  // set data to DOM
  setData.dataset['digit'] = digit;
  setData.dataset['timeLimit'] = timeLimit;

  // render dashboard
  renderDashboard(utility, timeLimit, digit, processedData);
}
