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

import renderCategory from "./category.js";

export default function renderLevel(endTime, title, usage, data) {
  const graph = document.querySelector(".graph");

  const levelContainer = document.createElement("section");
  levelContainer.className = "level-container";

  const levelHeader = document.createElement("header");
  levelHeader.className = "level-header";
  levelHeader.addEventListener("click", () => {
    levelHeader.classList.toggle("fold");
  });

  const levelTitle = document.createElement("div");
  levelTitle.className = "level-title";
  levelTitle.innerText = title;

  const utility = document.createElement("span");
  utility.className = "utility";
  utility.innerText = usage < 1 ? " (" + usage * 100 + "%)" : "";

  levelTitle.append(utility);
  levelHeader.append(levelTitle);
  levelContainer.append(levelHeader);
  graph.append(levelContainer);

  Object.keys(data).map(key => {
    renderCategory(endTime, key, data[key]);
  });
}
