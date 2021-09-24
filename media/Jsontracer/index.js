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

import openFileSelector from "./processData.js";
import dynamicGraduation from "./dynamicGraduation.js";

const graph = document.querySelector(".graph");

const loadBtn = document.querySelector(".load-btn");
loadBtn.addEventListener("click", () => {
  initData();
  openFileSelector();
});

let ratio = 100;
const slider = document.querySelector("input");
slider.addEventListener("input", event => {
  ratio = event.target.value * 1;
  graph.style.width = `${ratio}%`;
  changeSlider(event.target.value, event.target.max, event.target.min);
  dynamicGraduation();
});

const zoomInBtn = document.querySelector(".zoom-in-btn");
zoomInBtn.addEventListener("click", () => {
  if (ratio >= 5000) { return; }
  
  // change ratio
  ratio += 50;
  ratio = ratio > 5000 ? 5000 : ratio;
  graph.style.width = `${ratio}%`;

  // change slider
  const slider = document.querySelector("input");
  slider.value = ratio;
  changeSlider(slider.value, slider.max, slider.min);

  // change graduation and set delay
  dynamicGraduation();
  zoomInBtn.disabled = true;
  setTimeout(() => (zoomInBtn.disabled = false), 300);
});

const zoomOutBtn = document.querySelector(".zoom-out-btn");
zoomOutBtn.addEventListener("click", () => {
  if (ratio <= 100) { return; }

  // change ratio
  ratio -= 50;
  ratio = ratio < 100 ? 100 : ratio;
  graph.style.width = `${ratio}%`;

  // change slider
  const slider = document.querySelector("input");
  slider.value = ratio;
  changeSlider(slider.value, slider.max, slider.min);

  // change graduation and set delay
  dynamicGraduation();
  zoomOutBtn.disabled = true;
  setTimeout(() => (zoomOutBtn.disabled = false), 300);
});

const captureBtn = document.querySelector(".capture-btn");
captureBtn.addEventListener("click", () => {
  // TODO capture inside vscode extension webview
});

function changeSlider(inputValue, inputMax, inputMin) {
  if (inputMax === inputValue) {
    if (inputMax === "200") {
      slider.max = "400";
      slider.value = "200";
      slider.min = "100";
    } else if (inputMax === "400") {
      slider.max = "800";
      slider.value = "400";
      slider.min = "200";
    } else if (inputMax === "800") {
      slider.max = "1600";
      slider.value = "800";
      slider.min = "400";
    } else if (inputMax === "1600") {
      slider.max = "3200";
      slider.value = "1600";
      slider.min = "800";
    } else if (inputMax === "3200") {
      slider.max = "5000";
      slider.value = "3200";
      slider.min = "1600";
    }
  } else if (inputMin === inputValue) {
    if (inputMin === "100") {
      slider.max = "200";
      slider.value = "100";
      slider.min = "100";
    } else if (inputMin === "200") {
      slider.max = "400";
      slider.value = "200";
      slider.min = "100";
    } else if (inputMin === "400") {
      slider.max = "800";
      slider.value = "400";
      slider.min = "200";
    } else if (inputMin === "800") {
      slider.max = "1600";
      slider.value = "800";
      slider.min = "400";
    } else if (inputMin === "1600") {
      slider.max = "3200";
      slider.value = "1600";
      slider.min = "800";
    }
  } else {
    return;
  }

  // set delay
  slider.disabled = true;
  setTimeout((slider.disabled = false), 100);
}

function initData() {
  const graph = document.querySelector(".graph");
  // init ratio
  ratio = 100;
  graph.style.width = `${ratio}%`;

  // init slider
  const silder = document.querySelector("input");
  silder.max = "200";
  silder.min = "100";
  silder.value = "100";

  // init graph
  while (graph.hasChildNodes()) {
    graph.removeChild(graph.firstChild);
  }

  // init selected bar
  const selected = document.querySelector(".selected");
  while (selected.hasChildNodes()) {
    selected.removeChild(selected.firstChild);
  }

  // init detail
  const detail = document.querySelector(".detail");
  if (detail) {
    detail.remove();
  }
}
