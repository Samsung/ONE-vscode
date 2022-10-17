/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
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

let currentConfigType = null;

this.window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.command) {
    case 'showMetadata':
      updateMetadataInfo(message.metadata);
      break;
    default:
      break;
  }
});

// Update metadata information
function updateMetadataInfo(metadata) {
  const mainViewItemBox = document.createElement('div');
  mainViewItemBox.classList.add('main-view-item-box');

  const viewItemBox = document.createElement('div');
  viewItemBox.classList.add('view-item-box');
  viewItemBox.setAttribute('id', 'common-view-item-box');

  const viewItemHeaderBox = document.createElement('div');
  viewItemHeaderBox.classList.add('view-item-header-box');

  const viewItemHeader = document.createElement('div');
  viewItemHeader.classList.add('view-item-header');
  viewItemHeader.innerText = 'Common';

  const viewItemShowButton = document.createElement('div');
  viewItemShowButton.setAttribute('id', 'common-view-item-show-button');
  viewItemShowButton.classList.add('view-item-show-button', 'codicon-collapse-all', 'codicon');

  const viewItemContentBox = document.createElement('div');
  viewItemContentBox.setAttribute('id', 'common-view-content-box');
  viewItemContentBox.classList.add('view-item-content-box');

  document.body.appendChild(mainViewItemBox);
  mainViewItemBox.appendChild(viewItemBox);
  viewItemBox.append(viewItemHeaderBox, viewItemContentBox);
  viewItemHeaderBox.append(viewItemHeader, viewItemShowButton);

  // Pull out the main key.(File Name)
  const mainFileName = Object.keys(metadata)[0];

  // Store metadata information in variable
  const metadataInfo = metadata[mainFileName];

  for (const subKey in metadataInfo) {
    if (subKey === 'operations') {
      const viewItemBox = document.createElement('div');
      viewItemBox.setAttribute('id', 'operations-view-item-box');
      viewItemBox.classList.add('view-item-box');

      // draw header
      const viewItemHeader = document.createElement('div');
      viewItemHeader.classList.add('view-item-header');
      viewItemHeader.innerText = 'Operations';

      // add show button image
      const showButton = document.createElement('div');
      showButton.classList.add('view-item-show-button', 'codicon-collapse-all', 'codicon');
      showButton.setAttribute('id', 'operations-view-item-show-button');

      // draw a header box to hold headers and showButton
      const viewItemHeaderBox = document.createElement('div');
      viewItemHeaderBox.classList.add('view-item-header-box');

      viewItemHeaderBox.append(viewItemHeader, showButton);
      viewItemBox.appendChild(viewItemHeaderBox);
      mainViewItemBox.appendChild(viewItemBox);

      // draw content box
      const viewItemContentBox = document.createElement('div');
      viewItemContentBox.classList.add('view-item-content-box');
      viewItemContentBox.setAttribute('id', 'operations-view-content-box');
      viewItemBox.appendChild(viewItemContentBox);


      for (const operationsKey in metadataInfo[subKey]) {
        if (Object.prototype.hasOwnProperty.call(metadataInfo[subKey], operationsKey)) {
          metadataDivCreate(operationsKey, metadataInfo[subKey][operationsKey], 'operations');
        }
      }
    } else if (subKey === 'cfg-settings') {
      const viewItemBox = document.createElement('div');
      viewItemBox.setAttribute('id', 'cfg-settings-view-item-box');
      viewItemBox.classList.add('view-item-box');

      const viewItemHeaderBox = document.createElement('div');
      viewItemHeaderBox.classList.add('view-item-header-box');

      const viewItemHeader = document.createElement('div');
      viewItemHeader.classList.add('view-item-header');
      viewItemHeader.innerText = 'Config';

      const showButton = document.createElement('div');
      showButton.setAttribute('id', 'cfg-settings-view-item-show-button');
      showButton.classList.add('view-item-show-button', 'codicon-collapse-all', 'codicon');
      // showButton.innerText = '-';

      viewItemHeaderBox.append(viewItemHeader, showButton);
      viewItemBox.appendChild(viewItemHeaderBox);
      mainViewItemBox.appendChild(viewItemBox);

      const viewItemContentBox = document.createElement('div');
      viewItemContentBox.classList.add('view-item-content-box');
      viewItemContentBox.setAttribute('id', 'cfg-settings-view-content-box');
      viewItemBox.appendChild(viewItemContentBox);

      const oneccInfo = metadataInfo[subKey];

      // Store values that onecc`s value is true
      const oneccInfoList = [];

      for (const configKey in oneccInfo) {
        if (Object.prototype.hasOwnProperty.call(oneccInfo, configKey)) {
          const viewItemSubHeaderBox = document.createElement('div');
          viewItemSubHeaderBox.classList.add('view-item-header-box');

          const viewItemSubHeader = document.createElement('div');
          viewItemSubHeader.innerText = `[${configKey}]`;
          viewItemSubHeader.classList.add('view-item-sub-header');

          const showButton = document.createElement('div');
          showButton.innerText = `-`;
          showButton.classList.add('view-item-show-button');
          showButton.style.fontSize = '20px';
          showButton.setAttribute('id', `${configKey}-view-item-show-button`);

          viewItemSubHeaderBox.append(viewItemSubHeader, showButton);
          viewItemContentBox.appendChild(viewItemSubHeaderBox);

          const subContentBox = document.createElement('div');
          subContentBox.classList.add('sub-view-item-content-box');
          subContentBox.setAttribute('id', `${configKey}-sub-view-content-box`);

          viewItemContentBox.appendChild(subContentBox);

          // Save the current key to use as id
          currentConfigType = configKey;

          if (configKey === 'onecc') {
            // Handle if no onecc information is available
            const viewItemContent = document.createElement('div');
            viewItemContent.innerText = 'There is no config information...';
            viewItemBox.appendChild(viewItemContent);
            viewItemContent.classList.add('view-item-info-content');

            for (const oneccSubkey in oneccInfo[configKey]) {
              if (oneccInfo[configKey][oneccSubkey]) {
                oneccInfoList.push(oneccSubkey);

                // If you have cfg information, delete the no info statement
                viewItemContent ?.remove();
                metadataDivCreate(oneccSubkey, oneccInfo[configKey][oneccSubkey], 'cfg-settings');
              }
            }
          } else {
            if (oneccInfoList.includes(configKey)) {
              viewItemSubHeader.style.marginTop = '15px';
              for (const oneccSubkey in oneccInfo[configKey]) {
                if (Object.prototype.hasOwnProperty.call(oneccInfo[configKey], oneccSubkey)) {
                  metadataDivCreate(oneccSubkey, oneccInfo[configKey][oneccSubkey], 'cfg-settings');
                }
              }

            } else {
              viewItemSubHeader ?.remove();
            }
          }
        }
      }
    } else {
      // Other common metadata information
      metadataDivCreate(subKey, metadataInfo[subKey], 'common');
    }
  }
  showButtonClickEvent();
}

function metadataDivCreate(subKey, value, type) {
  let viewItemContentBox = null;
  let subContentBox = null;
  if (type === 'common') {
    viewItemContentBox = document.getElementById('common-view-content-box');
  } else if (type === 'operations') {
    viewItemContentBox = document.getElementById('operations-view-content-box');
  } else if (type === 'cfg-settings') {
    viewItemContentBox = document.getElementById('cfg-settings-view-content-box');
    subContentBox = document.getElementById(`${currentConfigType}-sub-view-content-box`);
  }


  const viewItemContent = document.createElement('div');
  viewItemContent.classList.add('view-item-content');
  const viewItemName = document.createElement('div');
  viewItemName.classList.add('view-item-name');
  viewItemName.innerText = subKey;

  // If the value of the key is the object structure again, turn the repetition door.
  if (typeof value === 'object' && value !== null) {
    const viewItemValueList = document.createElement('div');
    viewItemValueList.classList.add('view-item-value-list');

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const viewItemValue = document.createElement('div');
        viewItemValue.classList.add('view-item-value');
        viewItemValue.innerText = `${value[key]}`;
        // if the size of the viewer is smaller, Set items to be smaller in proportion
        viewItemValue.style.width = 'auto';
        viewItemValue.classList.add('margin-bottom-border-thin-gray');
        viewItemValueList.appendChild(viewItemValue);
      }
    }

    viewItemContent.append(viewItemName, viewItemValueList);
    viewItemContent.classList.add('aline-items-baseline');

  } else {
    // If it's a simple string, it's shown on the screen right away.
    const viewItemValue = document.createElement('div');
    viewItemValue.classList.add('view-item-value');
    viewItemValue.innerText = value;
    viewItemContent.append(viewItemName, viewItemValue);
  }

  if (type === 'cfg-settings') {
    viewItemContent.style.marginBottom = '1px';
    subContentBox.appendChild(viewItemContent);

  } else {
    viewItemContentBox.appendChild(viewItemContent);
  }
}

function showButtonClickEvent() {
  const showButtons = document.getElementsByClassName('view-item-show-button');
  let isSubButton = false;

  for (let index = 0; index < showButtons.length; index++) {
    const button = showButtons[index];
    const id = button.getAttribute('id');

    button.addEventListener('click', () => {
      let contentBox = document.getElementById(`${id.split('-view')[0]}-view-content-box`);
      isSubButton = false;
      if (!contentBox) {
        contentBox = document.getElementById(`${id.split('-view')[0]}-sub-view-content-box`);
        isSubButton = true;
      }

      if(contentBox?.style.display === 'block' || contentBox.style.display === ''){
        isSubButton ? (() => {
          button.innerText = '+';
          button.style.fontSize = '14px';
        })() :
                      (() => {
                        button.classList.remove('codicon-collapse-all');
                        button.classList.add('codicon-unfold');
                      })();
        contentBox.style.display = 'none';
      } else {
        isSubButton ? (() => {
          button.innerText = '-';
          button.style.fontSize = '20px';
        })() :
                      (() => {
                        button.classList.remove('codicon-unfold');
                        button.classList.add('codicon-collapse-all');
                      })();
        contentBox.style.display = 'block';
      }
    });
  }
}
