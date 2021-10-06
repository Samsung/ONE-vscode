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

const firstLoadBtn = document.getElementById('first-json-btn');
const secondLoadBtn = document.getElementById('second-json-btn');
const resetBtn = document.getElementById('reset-btn');

firstLoadBtn.addEventListener('click', () => {
  openFileSelector('#first-json-btn');
});

secondLoadBtn.addEventListener('click', () => {
  openFileSelector('#second-json-btn');
});

resetBtn.addEventListener('click', () => {
  reset();
});

function openFileSelector(flag) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (event) => {
    setFileName(event.target.files[0].name, flag);
    processFile(event.target.files[0], flag);
  };
  input.click();
}

function setFileName(name, flag) {
  document.querySelector(flag).innerHTML = name;
}

function processFile(file, flag) {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    processData(data.displayTimeUnit, data.traceEvents, flag);
  };
  reader.readAsText(file, 'euc-kr');
}

function processData(timeUnit, traceEvents, flag) {
  let instance = circleInfo.getInstance();

  document.querySelector(flag).disabled = true;

  traceEvents.forEach((elem) => {
    if (elem.args !== undefined && elem.args.origin !== undefined) {
      let origins = elem.args.origin.split(',');
      let size = origins.length;
      origins.forEach((origin) => {
        let nodeId = origin.split(':')[0];
        let nodeName = origin.split(':')[1];

        if (instance.durCircleJson[nodeId] !== undefined && nodeName !== 'Unknown') {
          if (instance.durCircleJson[nodeId].duration === undefined) {
            instance.durCircleJson[nodeId].duration = {timeUnit: timeUnit, dur1: 0, dur2: 0};
          }

          if (flag === '#first-json-btn') {
            instance.durCircleJson[nodeId].duration.dur1 += elem.dur / size;
          } else {
            instance.durCircleJson[nodeId].duration.dur2 += elem.dur / size;
          }
        }
      });
    }
  });

  // graph reset
  if (loadedJsonCnt() === 2) {
    let graphWrapper = document.querySelector('#wrapper');

    while (graphWrapper.hasChildNodes()) {
      graphWrapper.removeChild(graphWrapper.firstChild);
    }

    treeMap(instance.durCircleJson);
  }
}

function reset() {
  // button reset
  let instance = circleInfo.getInstance();
  let firstJsonBtn = document.querySelector('#first-json-btn');
  let secondJsonBtn = document.querySelector('#second-json-btn');
  firstJsonBtn.disabled = false;
  secondJsonBtn.disabled = false;

  firstJsonBtn.innerHTML = 'Load First Json File';
  secondJsonBtn.innerHTML = 'Load Second Json File';

  let graphWrapper = document.querySelector('#wrapper');

  while (graphWrapper.hasChildNodes()) {
    graphWrapper.removeChild(graphWrapper.firstChild);
  }

  instance.durCircleJson.forEach((elem) => {
    delete elem.duration;
  });

  treeMap(instance.durCircleJson);
}

function loadedJsonCnt() {
  let cnt = 0;

  if (document.querySelector('#first-json-btn').disabled === true) {
    ++cnt;
  }

  if (document.querySelector('#second-json-btn').disabled === true) {
    ++cnt;
  }

  return cnt;
}
