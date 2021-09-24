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

export default function renderRuler(endTime, digit) {
  const graph = document.querySelector(".graph");

  const rulerContainer = document.createElement("div");
  rulerContainer.className = "ruler-container";

  const rulerBlank = document.createElement("div");
  rulerBlank.className = "ruler-blank";

  const ruler = document.createElement("div");
  ruler.className = "ruler";

  rulerContainer.append(rulerBlank, ruler);
  graph.append(rulerContainer);

  mapToRulergraduation(endTime, digit);
}

function mapToRulergraduation(endTime, digit) {
  const ruler = document.querySelector(".ruler");

  for (let i = 0; i < parseInt(endTime / 10 ** (digit - 1)); i++) {
    const graduation = document.createElement("div");
    graduation.className = "graduation";

    for (let j = 0; j < 5; j++) {
      const smallGraduation = document.createElement("div");
      smallGraduation.className = "small-graduation";

      if (j === 0) {
        const index = document.createElement("div");
        index.className = "index";
        index.innerText = calculateGraduation(i * 10 ** (digit - 1));
        smallGraduation.append(index);
      }

      graduation.append(smallGraduation);
    }

    ruler.append(graduation);
  }
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
