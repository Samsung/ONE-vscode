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

// This file referenced the result of https://github.com/catapult-project/catapult/tree/444aba89e1c30edf348c611a9df79e2376178ba8/tracing

export default function dynamicGraduation() {
  const body = document.querySelector("body");
  const ruler = document.querySelector(".ruler");

  if (!ruler) {
    return;
  }

  const rulerBlank = document.querySelector(".ruler-blank");
  const graduation = document.querySelector(".ruler .graduation");
  const cnt = document.querySelectorAll(".ruler .graduation").length;
  const staticRulerWidth = body.clientWidth - rulerBlank.clientWidth;
  const setData = document.querySelector(".set-data");
  const timeLimit = setData.dataset["timeLimit"];
  const digit = setData.dataset["digit"];
  const initGraduationCnt = timeLimit / 10 ** (digit - 1);
  const staticGraduationWidth = parseInt(staticRulerWidth / initGraduationCnt);

  if (graduation.offsetWidth < staticGraduationWidth - 10) {
    removeGraduation(ruler, cnt);
  } else if (graduation.offsetWidth < staticGraduationWidth * 2) {
    return;
  } else {
    addGraduation(ruler, cnt);
  }
  updateGraduation(timeLimit);
}

function removeGraduation(ruler, cnt) {
  for (let i = 0; i < cnt / 2; i++) {
    const child = document.querySelector(".ruler .graduation");
    ruler.removeChild(child);
  }
}

function addGraduation(ruler, cnt) {
  for (let i = 0; i < cnt; i++) {
    const child = document.createElement("div");
    child.className = "graduation";

    for (let i = 0; i < 5; i++) {
      const childOfChild = document.createElement("div");
      childOfChild.className = "small-graduation";

      if (i === 0) {
        const index = document.createElement("div");
        index.className = "index";
        childOfChild.append(index);
      }

      child.append(childOfChild);
    }
    ruler.append(child);
  }
}

function updateGraduation(timeLimit) {
  const rulerWidth = document.querySelector(".ruler").scrollWidth;
  const allGraduation = document.querySelectorAll(".ruler .graduation");
  let left = 0;

  allGraduation.forEach(ele => {
    ele.firstChild.firstChild.innerText = calculateGraduation(
      (left / rulerWidth) * timeLimit
    );
    left += ele.offsetWidth;
  });
}

function calculateGraduation(graduation) {
  if (graduation >= 1000) {
    return Math.round((graduation / 1000) * 10) / 10 + "ms";
  } else if (graduation >= 1) {
    return Math.round(graduation) + "us";
  } else if (graduation === 0) {
    return 0;
  } else {
    return Math.round(graduation * 1000 * 10) / 10 + "ns";
  }
}
