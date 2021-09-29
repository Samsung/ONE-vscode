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

import calculateGraduation from './calculateGraduation.js';

export default function renderRuler(timeLimit, digit) {
  const graph = document.querySelector('.graph');

  const rulerContainer = document.createElement('div');
  rulerContainer.className = 'ruler-container';

  const rulerBlank = document.createElement('div');
  rulerBlank.className = 'ruler-blank';

  const ruler = document.createElement('div');
  ruler.className = 'ruler';

  rulerContainer.append(rulerBlank, ruler);
  graph.append(rulerContainer);

  mapToRulergraduation(timeLimit, digit);
}

function mapToRulergraduation(timeLimit, digit) {
  const ruler = document.querySelector('.ruler');

  for (let i = 0; i < parseInt(timeLimit / 10 ** (digit - 1)); i++) {
    const graduation = document.createElement('div');
    graduation.className = 'graduation';

    for (let j = 0; j < 5; j++) {
      const smallGraduation = document.createElement('div');
      smallGraduation.className = 'small-graduation';

      if (j === 0) {
        const index = document.createElement('div');
        index.className = 'index';
        index.innerText = calculateGraduation(i * 10 ** (digit - 1));
        smallGraduation.append(index);
      }

      graduation.append(smallGraduation);
    }

    ruler.append(graduation);
  }
}
