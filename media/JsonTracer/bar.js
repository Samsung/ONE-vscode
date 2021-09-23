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

import { renderSingleDetail, renderMultipleDetail } from "./detail.js";

export default function renderBar(endTime, data){
  const barLists = document.querySelectorAll(".bar-list");
  const barList = barLists[barLists.length - 1];

  const bar = document.createElement("div");
  bar.className = "bar";
  bar.style.left = `${data.ts/endTime*100}%`;
  bar.style.width = `${data.dur/endTime*100}%`;
  bar.style.backgroundColor = `${data.backgroundColor}`;

  Object.keys(data).map(key => {
    if (key === "args") {
      const args = data[key];
      const argList = Object.keys(args).map(key => {
        return `${key} : ${args[key]}`;
      });
      bar.dataset["args"] = argList.join(".#/#.");
    } else {
      bar.dataset[`${key}`] = data[key];       
    }
  });

  bar.addEventListener("click", event => {
    removeDetail();
    if (event.ctrlKey) {
      addSelectedBar(event.target.className === "bar" ? event.target : event.target.parentNode);
      renderMultipleDetail();
    } else {
      removeSelectedBar();
      renderSingleDetail(event.target.className === "bar" ? event.target.dataset : event.target.parentNode.dataset);
    }
  });

  const barTitle = document.createElement("div");
  barTitle.className = "bar-title";
  barTitle.innerText = data["name"];

  bar.append(barTitle);
  barList.append(bar);
}

function addSelectedBar(ele) {
  const selectedOpList = document.querySelectorAll(".selected-op");
  for (const selectedOp of selectedOpList) {
    if (selectedOp.dataset["pk"] === ele.dataset["pk"]) {
      return;
    }
  }

  const selected = document.querySelector(".selected");
  const op = document.createElement("div");
  op.className = "selected-op";
  Object.keys(ele.dataset).forEach(key => {
    op.dataset[key] = ele.dataset[key];
  });
  selected.append(op);
}

function removeSelectedBar() {
  const selected = document.querySelector(".selected");
  while(selected.hasChildNodes()) {
    selected.removeChild(selected.firstChild);
  }
}

function removeDetail() {
  const details = document.querySelectorAll(".detail");
  details.forEach(detail => {
    detail.remove();
  });
}
