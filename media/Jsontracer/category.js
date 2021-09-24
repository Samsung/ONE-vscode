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

import renderBar from './bar.js';

export default function renderCategory(endTime, title, data){
  const levelContainerList = document.querySelectorAll('.level-container');
  const levelContainer = levelContainerList[levelContainerList.length - 1];

  const categoryContainer = document.createElement('section');
  categoryContainer.className = "category-container";

  const categoryHeader = document.createElement('header');
  categoryHeader.className = "category-header";

  const categoryTitle = document.createElement('div');
  categoryTitle.className = "category-title";
  categoryTitle.innerText = title;

  const barList = document.createElement('section');
  barList.className = "bar-list";

  categoryHeader.append(categoryTitle);
  categoryContainer.append(categoryHeader, barList);
  levelContainer.append(categoryContainer);

  data.forEach(element => {
    renderBar(endTime, element);
  });
}
