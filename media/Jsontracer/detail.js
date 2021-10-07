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

const timeUnit = {
  ms: 10 ** -3,
  us: 1,
  ns: 10 ** 3,
};

export function renderSingleDetail(data) {
  const detailSection = document.querySelector('.detail-container section');
  const ul = document.createElement('ul');
  ul.className = 'detail';

  Object.keys(data).map((key) => {
    // invisible backgroundColor and pk
    if (key === 'backgroundColor' || key === 'pk') {
      return;
    }
    const li = document.createElement('li');

    if (key === 'args') {
      // show args in list
      li.innerText = 'args';
      li.className = 'args';
      li.addEventListener('click', () => {
        li.classList.toggle('fold');
      });
      li.append(renderArgs(data[key]));
    } else if (key === 'ts' || key === 'dur') {
      // show time with displayTimeUnit
      const setData = document.querySelector('.set-data');
      const displayTimeUnit = setData.dataset['displayTimeUnit'];
      li.innerText = `${key} : ${parseInt(data[key] * timeUnit[displayTimeUnit] * 1000) / 1000} ${
          displayTimeUnit}`;
    } else {
      // show others
      li.innerText = `${key} : ${data[key]}`;
    }

    // append DOM
    ul.append(li);
    detailSection.append(ul);
  });
}

function renderArgs(args) {
  const ul = document.createElement('ul');
  args.split('.#/#.').forEach(element => {
    const li = document.createElement('li');
    li.innerText = element;
    ul.append(li);
  });
  return ul;
}

export function renderMultipleDetail() {
  makeTable();
  refinedSelectedOp();
}

function makeTable() {
  const detailSection = document.querySelector('.detail-container section');
  const table = document.createElement('table');
  table.className = 'detail';

  const thead = document.createElement('thead');
  const tr = document.createElement('tr');

  const thName = document.createElement('th');
  thName.innerText = 'name';

  const thWall = document.createElement('th');
  thWall.innerText = 'Wall Duration';

  const thAverage = document.createElement('th');
  thAverage.innerText = 'Average Wall Duration';

  const thOccurrences = document.createElement('th');
  thOccurrences.innerText = 'Occurrences';

  tr.append(thName, thWall, thAverage, thOccurrences);
  thead.append(tr);
  table.append(thead);
  detailSection.append(table);
}

function refinedSelectedOp() {
  const selectedOpList = document.querySelectorAll('.selected-op');
  const refinedOP = [];
  const refinedOPDict = {};
  let idx = 0;

  selectedOpList.forEach(element => {
    const name = element.dataset.name;
    const ts = Number(element.dataset.ts);
    const dur = Number(element.dataset.dur);

    const info = {
      name,
      ts,
      dur,
      occurrences: 1,
    };

    if (name in refinedOPDict) {
      const idx = refinedOPDict[name];
      refinedOP[idx].dur += info.dur;
      refinedOP[idx].occurrences += 1;
    } else {
      refinedOP.push(info);
      refinedOPDict[name] = idx;
      idx += 1;
    }
  });

  renderTds(refinedOP);
}

function renderTds(value) {
  const totals = {
    name: 'totals',
    dur: 0,
    occurrences: 0,
  };

  value.forEach(op => {
    totals.dur += op.dur;
    totals.occurrences += op.occurrences;
  });

  value.push(totals);

  const setData = document.querySelector('.set-data');
  const displayTimeUnit = setData.dataset['displayTimeUnit'];
  const detail = document.querySelector('.detail');

  value.forEach(ele => {
    const tr = document.createElement('tr');

    if (ele['name'] === 'totals') {
      tr.className = 'totals';
    }

    const name = document.createElement('td');
    name.innerText = ele['name'];

    const dur = document.createElement('td');
    dur.innerText =
        `${Math.round(ele['dur'] * timeUnit[displayTimeUnit] * 1000) / 1000} ${displayTimeUnit}`;

    const durAvg = document.createElement('td');
    durAvg.innerText =
        `${Math.round(ele['dur'] * timeUnit[displayTimeUnit] * 1000) / 1000 / ele['occurrences']} ${
            displayTimeUnit}`;

    const occurrences = document.createElement('td');
    occurrences.innerText = ele['occurrences'];

    tr.append(name, dur, durAvg, occurrences);
    detail.append(tr);
  });
}
