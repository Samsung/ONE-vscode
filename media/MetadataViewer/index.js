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

this.window.addEventListener("message", (event) => {
  if (window.origin !== event.origin) {
    console.log("Unexpected Origin: ", event.origin);
    return;
  }
  const message = event.data;
  switch (message.command) {
    case "showMetadata":
      updateMetadataInfo(message.metadata);
      break;
    default:
      break;
  }
});

// Update metadata information
function updateMetadataInfo(metadata) {
  const mainViewItemBox = document.createElement("div");
  mainViewItemBox.classList.add("main-view-item-box");

  const viewItemBox = document.createElement("div");
  viewItemBox.classList.add("view-item-box");
  viewItemBox.setAttribute("id", "common-view-item-box");

  const viewItemHeaderBox = document.createElement("div");
  viewItemHeaderBox.classList.add("view-item-header-box");

  const viewItemHeader = document.createElement("div");
  viewItemHeader.classList.add("view-item-header");
  viewItemHeader.innerText = "Common";

  const viewItemShowButton = document.createElement("div");
  viewItemShowButton.setAttribute("id", "common-view-item-show-button");
  viewItemShowButton.classList.add(
    "view-item-show-button",
    "codicon-collapse-all",
    "codicon"
  );

  const commonItemContentBox = document.createElement("div");
  commonItemContentBox.setAttribute("id", "common-view-content-box");
  commonItemContentBox.classList.add("view-item-content-box");

  document.body.appendChild(mainViewItemBox);
  mainViewItemBox.appendChild(viewItemBox);
  viewItemBox.append(viewItemHeaderBox, commonItemContentBox);
  viewItemHeaderBox.append(viewItemHeader, viewItemShowButton);

  // Pull out the main key.(File Name)
  const mainFileName = Object.keys(metadata)[0];

  // Store metadata information in variable
  const metadataInfo = metadata[mainFileName];
  for (const subKey in metadataInfo) {
    const type = typeof metadataInfo[subKey];
    if (type === "undefined" || type === "null") {
      continue;
    }

    if (type !== "object") {
      // simple type
      metadataDivCreate(subKey, metadataInfo[subKey], commonItemContentBox);
    } else {
      // complex
      metadataSectionCreate(
        subKey,
        metadataInfo[subKey],
        mainViewItemBox,
        false
      );
    }
  }

  showButtonClickEvent();
}

function metadataSectionCreate(sectionKey, section, parentBox, sub) {
  const viewItemBox = document.createElement("div");
  viewItemBox.setAttribute("id", `${sectionKey}-view-item-box`);
  viewItemBox.classList.add("view-item-box");

  // draw header
  const viewItemHeader = document.createElement("div");
  if (sub) {
    viewItemHeader.innerText = `[${sectionKey}]`;
    viewItemHeader.classList.add("view-item-sub-header");
  } else {
    viewItemHeader.innerText = sectionKey;
    viewItemHeader.classList.add("view-item-header");
  }

  // add show button image
  const showButton = document.createElement("div");
  if (sub) {
    showButton.innerText = `-`;
    showButton.classList.add("view-item-show-button");
    showButton.style.fontSize = "20px";
    showButton.setAttribute("id", `${sectionKey}-view-item-show-button`);
  } else {
    showButton.classList.add(
      "view-item-show-button",
      "codicon-collapse-all",
      "codicon"
    );
    showButton.setAttribute("id", `${sectionKey}-view-item-show-button`);
  }

  // draw a header box to hold headers and showButton
  const viewItemHeaderBox = document.createElement("div");
  viewItemHeaderBox.classList.add("view-item-header-box");

  viewItemHeaderBox.append(viewItemHeader, showButton);
  viewItemBox.appendChild(viewItemHeaderBox);
  parentBox.appendChild(viewItemBox);
  // draw content box
  const viewItemContentBox = document.createElement("div");
  if (sub) {
    viewItemContentBox.classList.add("sub-view-item-content-box");
    viewItemContentBox.setAttribute("id", `${sectionKey}-sub-view-content-box`);
  } else {
    viewItemContentBox.classList.add("view-item-content-box");
    viewItemContentBox.setAttribute("id", `${sectionKey}-view-content-box`);
  }

  viewItemBox.appendChild(viewItemContentBox);

  //iterate properties
  for (const key in section) {
    if (Object.prototype.hasOwnProperty.call(section, key)) {
      //if data is just an array or simple object just add it
      if (Array.isArray(section[key]) || typeof section[key] !== "object") {
        metadataDivCreate(key, section[key], viewItemContentBox);
      } else {
        // recurse
        metadataSectionCreate(key, section[key], viewItemContentBox, true);
      }
    }
  }
}

function metadataDivCreate(subKey, value, viewItemContentBox) {
  const viewItemContent = document.createElement("div");
  viewItemContent.classList.add("view-item-content");
  const viewItemName = document.createElement("div");
  viewItemName.classList.add("view-item-name");
  viewItemName.innerText = subKey;

  // If the value of the key is the object structure again, turn the repetition door.
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      const viewItemValueList = document.createElement("div");
      viewItemValueList.classList.add("view-item-value-list");

      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const viewItemValue = document.createElement("div");
          viewItemValue.classList.add("view-item-value");
          viewItemValue.innerText = `${value[key]}`;
          // if the size of the viewer is smaller, Set items to be smaller in proportion
          viewItemValue.style.width = "auto";
          viewItemValue.classList.add("margin-bottom-border-thin-gray");
          viewItemValueList.appendChild(viewItemValue);
        }
      }

      viewItemContent.append(viewItemName, viewItemValueList);
      viewItemContent.classList.add("aline-items-baseline");
    }
  } else {
    // If it's a simple string, it's shown on the screen right away.
    const viewItemValue = document.createElement("div");
    viewItemValue.classList.add("view-item-value");
    viewItemValue.innerText = value;
    viewItemContent.append(viewItemName, viewItemValue);
  }

  viewItemContentBox.appendChild(viewItemContent);
}

function showButtonClickEvent() {
  const showButtons = document.getElementsByClassName("view-item-show-button");
  let isSubButton = false;

  for (let index = 0; index < showButtons.length; index++) {
    const button = showButtons[index];
    const id = button.getAttribute("id");

    button.addEventListener("click", () => {
      let contentBox = document.getElementById(
        `${id.split("-view")[0]}-view-content-box`
      );
      isSubButton = false;
      if (!contentBox) {
        contentBox = document.getElementById(
          `${id.split("-view")[0]}-sub-view-content-box`
        );
        isSubButton = true;
      }

      if (
        contentBox?.style.display === "block" ||
        contentBox.style.display === ""
      ) {
        isSubButton
          ? (() => {
              button.innerText = "+";
              button.style.fontSize = "14px";
            })()
          : (() => {
              button.classList.remove("codicon-collapse-all");
              button.classList.add("codicon-unfold");
            })();
        contentBox.style.display = "none";
      } else {
        isSubButton
          ? (() => {
              button.innerText = "-";
              button.style.fontSize = "20px";
            })()
          : (() => {
              button.classList.remove("codicon-unfold");
              button.classList.add("codicon-collapse-all");
            })();
        contentBox.style.display = "block";
      }
    });
  }
}
