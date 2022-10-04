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

// prevent right-clicks in a Web view
document.addEventListener('contextmenu', event => event.preventDefault());

const vscode = acquireVsCodeApi();
// history saved List
let historyList = vscode.getState() ?.historyList || [];

// Save information for currently open files
let currentFileInfo = null;

// Save node path to the current context menu
let selectedNodePath = null;

window.addEventListener('message', (event) => {
  const message = event.data;
  const selected = message.payload['selected'];
  const relationData = message.payload['relation-data'];

  getSelectedFileInfo(selected, relationData);

  switch (message.type) {
    case 'create':
      detachTree();
      pushCurrentFileInfoObject(historyList);
      attachTree(relationData);
      console.log('create 메시지는: ', message);
      break;
    case 'update':
      console.log('update 메시지는: ', message);
      detachTree();
      historyList = message.historyList;
      pushCurrentFileInfoObject(historyList);
      attachTree(relationData);
      historyMainBoxDisplay(message.type, message.isOpenHistoryBox);
      vscode.setState({historyList: historyList});
      break;
    case 'history':
      console.log('history 메시지는: ', message);
      detachTree();
      attachTree(relationData);
      historyList = message.historyList;
      break;
    default:
      break;
  }
});

// save node
let node;

function attachTree(relationData) {
  const wheelInfoBox = document.createElement('div');
  wheelInfoBox.innerText = '* (Ctrl or Shift) + Wheel : Zoom In, Zoom Out';
  wheelInfoBox.classList.add('wheel-info-box');
  document.body.appendChild(wheelInfoBox);

  //  assigns the data to a hierarchy using parent-child relationships
  const treeData = d3.stratify().id(d => d.id).parentId(d => d.parent)(relationData);

  let historyDivWidth = screen.width * 0.11;
  const rectSizeWidth = 130;
  const rectSizeHeight = 50;

  const [maxWidthCount, maxHeightCount] = countMaxDataNum(relationData);

  // set the dimensions and margins of the diagram
  const margin = {top: 70, right: 0, bottom: 60, left: 0};
  let width = (maxWidthCount + 5) * rectSizeWidth - margin.left - margin.right;
  width = (width < screen.width * 0.7) ? screen.width * 0.7 : width;
  let height = screen.height * 0.6 - margin.top - margin.bottom;
  height = (rectSizeHeight * maxHeightCount < height) ? height : rectSizeHeight * maxHeightCount;
  // declares a tree layout and assigns the size
  const treemap = d3.tree().size([width, height]);

  // maps the node data to the tree layout
  const nodes = treemap(treeData);

  // Main Box Create
  const relationBox = document.createElement('div');
  relationBox.classList.add('relation-box');
  relationBox.setAttribute('id', 'relation-box');
  relationBox.style.width = `${historyDivWidth + width}px`;

  document.body.appendChild(relationBox);

  // draw contextMenuBox
  const contextMenuBox = document.createElement('div');
  contextMenuBox.setAttribute('id', 'context-menu-box');
  contextMenuBox.classList.add('plus-button-context-box');
  contextMenuBox.style.width = `${width + historyDivWidth}px`;


  // draw contextMenu
  const contextMenu = document.createElement('div');
  contextMenu.setAttribute('id', 'context-menu');
  contextMenu.classList.add('context-menu');

  document.body.append(contextMenu, contextMenuBox);

  const contextMenuList = ['Show Metadata of this file', 'Open this file'];

  for (let index = 0; index < contextMenuList.length; index++) {
    // add menu a dividing line
    if (index >= 1) {
      const contextMenuInfoLine = document.createElement('div');
      contextMenuInfoLine.classList.add('context-menu-line');
      contextMenu.appendChild(contextMenuInfoLine);
    }

    const element = contextMenuList[index];
    const contextMenuInfo = document.createElement('div');
    contextMenuInfo.classList.add('context-menu-info');
    contextMenuInfo.innerText = element;
    contextMenu.appendChild(contextMenuInfo);

    contextMenuInfo.addEventListener('click', () => {
      contextMenuBox.style.display = 'none';
      contextMenu.style.display = 'none';
      switch (element) {
        case 'Show Metadata of this file':
          postMessage('showMetadata', {path: selectedNodePath});
          break;
        case 'Open this file':
          postMessage('openFile', {path: selectedNodePath});
          break;
        default:
          break;
      }
    });
  }
  // append left, right click
  contextMenuBox.addEventListener('click', () => {
    contextMenuBox.style.display = 'none';
    contextMenu.style.display = 'none';
  });
  contextMenuBox.addEventListener('contextmenu', () => {
    contextMenuBox.style.display = 'none';
    contextMenu.style.display = 'none';
  });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  const svg =
      d3.select('.relation-box')
          .append('svg')
          .attr('preserveAspectRatio', 'xMidYMid meet')
          .attr(
              'viewBox',
              `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .style('background-color', '#545454'),
        g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // adds the links between the nodes
  g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', function(d) {
        return 'M' + d.x + ',' + d.y + 'C' + d.x + ',' + (d.y + d.parent.y) / 2 + ' ' + d.parent.x +
            ',' + (d.y + d.parent.y) / 2 + ' ' + d.parent.x + ',' + d.parent.y;
      });

  // adds each node as a group
  node = g.selectAll('.node')
             .data(nodes.descendants())
             .enter()
             .append('g')
             .attr('class', d => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
             .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

  let waitForDouble = null;

  // adds the rectangle to the node
  drawRect('extension', rectSizeWidth, rectSizeHeight, waitForDouble);
  drawRect('fileName', rectSizeWidth, rectSizeHeight, waitForDouble);
  drawRect('versionInfo', rectSizeWidth, rectSizeHeight, waitForDouble);

  // Create hover text_div to show File path
  const hoverText = document.createElement('div');
  document.body.appendChild(hoverText);
  hoverText.classList.add('hover-text');

  // draw node`s extension
  setDrawInfoInNode('extension', node, rectSizeHeight, waitForDouble);
  // draw node`s fileName
  setDrawInfoInNode('name', node, rectSizeHeight, waitForDouble);

  // draw version info
  setDrawInfoInNode('toolchainVersion', node, rectSizeHeight, waitForDouble);
  setDrawInfoInNode('oneccVersion', node, rectSizeHeight), waitForDouble;

  // add a plus button
  node._groups[0].forEach((g) => {
    g.setAttribute('id', `${g.__data__.data.id}-g`);

    if (g.__data__.data['data-list'].length >= 2) {
      // draw plus_button_ctext_menu
      const plusButtonContextMenu = document.createElement('div');
      plusButtonContextMenu.classList.add('plus-button-context-menu');
      plusButtonContextMenu.setAttribute('id', `${g.__data__.data.id}-plus-button-context-menu`);
      document.body.appendChild(plusButtonContextMenu);

      // draw plus_button_context_menu_header
      const plusButtonContextMenuHeader = document.createElement('div');
      plusButtonContextMenuHeader.classList.add('plus-button-context-menu-header');
      plusButtonContextMenuHeader.innerText = 'Same Content File List';
      plusButtonContextMenu.appendChild(plusButtonContextMenuHeader);

      // Add data list information to the context menu
      const dataList = g.__data__.data['data-list'];

      for (let idx = 0; idx < dataList.length; idx++) {
        const data = dataList[idx];
        if (idx !== g.__data__.data['represent-idx'] && !data['is-deleted']) {
          for (const key in data) {
            if (key === 'name') {
              // add a dividing line
              const plusButtonContextMenuLine = document.createElement('div');
              plusButtonContextMenuLine.classList.add('context-menu-line');
              plusButtonContextMenu.appendChild(plusButtonContextMenuLine);

              // draw plus_button_context_menu_info
              const plusButtonContextMenuInfo = document.createElement('div');
              plusButtonContextMenuInfo.innerText = data[key];
              plusButtonContextMenuInfo.classList.add('plus-button-context-menu-info');
              plusButtonContextMenu.appendChild(plusButtonContextMenuInfo);

              plusButtonContextMenuInfo.addEventListener('click', () => {
                postMessage('update', {
                  path: dataList[idx]['path'],
                  historyList: historyList,
                  isOpenHistoryBox:
                      document.getElementsByClassName('history-main-box')[0].style.display
                });
                // hide context_menu
                hidePlusButtonContextMenu(plusButtonContextBox);
              });
            }
          }
        }
      }
    }

    // When there are two versions of the information,
    // the height of the rect tag is increased.
    let versionInfoCount = 0;
    const nodeData = g.__data__.data['data-list'][g.__data__.data['represent-idx']];
    for (const key in nodeData) {
      if (key === 'onecc-version' || key === 'toolchain-version') {
        versionInfoCount += 1;
      }
    }

    // If there is no version information, sort the file name in the middle
    const versionInfoRect = g.childNodes[2];
    if (versionInfoCount === 0) {
      const nameInfoRect = g.childNodes[1];
      versionInfoRect.remove();

      nameInfoRect.style.rx = 3;
    } else if (versionInfoCount === 1) {
      versionInfoRect.style.height = `20px`;
    }
  });

  // draw plusButtonContextBox
  const plusButtonContextBox = document.createElement('div');
  plusButtonContextBox.classList.add('plus-button-context-box');
  plusButtonContextBox.setAttribute('id', `plus-button-context-box`);
  plusButtonContextBox.style.width = `100%`;
  document.body.appendChild(plusButtonContextBox);

  // add hide_plus_button_Event
  plusButtonContextBox.addEventListener('click', () => {
    // hide context_menu
    hidePlusButtonContextMenu(plusButtonContextBox);
  });

  // draw plus_button and minus_button
  plusMinusButtonCreate('minus', rectSizeWidth, rectSizeHeight);
  plusMinusButtonCreate('plus', rectSizeWidth, rectSizeHeight);

  // add mouse drag and mouse wheel event
  relationBox.addEventListener('mousedown', (e) => _mouseDownHandler(e));
  relationBox.addEventListener('mousewheel', (e) => _wheelHandler(e), {passive: false});

  const historyOpenDiv = document.createElement('div');
  historyOpenDiv.style.width = `${historyDivWidth}px`;
  historyOpenDiv.classList.add('history-open-box');
  relationBox.appendChild(historyOpenDiv);

  const historyOpenDivHeader = document.createElement('div');
  historyOpenDivHeader.classList.add('plus-button-context-menu-header');
  historyOpenDivHeader.innerText = 'History';
  historyOpenDivHeader.style.fontSize = '20px';

  const historyOpenDivHeaderOpenButton = document.createElement('div');
  historyOpenDivHeaderOpenButton.classList.add(
      'history-open-button', 'codicon', 'codicon-fold-down');

  historyOpenDivHeaderOpenButton.addEventListener('click', () => {
    document.getElementsByClassName('history-main-box')[0].style.display = 'block';
    historyOpenDiv.style.display = 'none';
  });

  historyOpenDivHeaderOpenButton.addEventListener('mouseover', () => {
    const historyOpenButtonRect = historyOpenDivHeaderOpenButton.getBoundingClientRect();
    hoverText.innerText = `"History Open"`;
    hoverText.style.top = `${historyOpenButtonRect.top - historyOpenButtonRect.height - 12}px`;
    hoverText.style.left = `${historyOpenButtonRect.left - historyOpenButtonRect.width - 20}px`;
    hoverText.style.display = 'block';
    hoverText.classList.add('font-bold');
  });
  historyOpenDivHeaderOpenButton.addEventListener('mouseout', () => {
    hoverText.style.display = 'none';
    hoverText.classList.remove('font-bold');
  });

  historyOpenDiv.append(historyOpenDivHeaderOpenButton, historyOpenDivHeader);

  // draw hisory_area
  const historyDiv = document.createElement('div');
  historyDiv.style.width = `${historyDivWidth}px`;
  historyDiv.style.height =
      `${document.getElementsByTagName('svg')[0].getBoundingClientRect().height - 100}px`;
  historyDiv.classList.add('history-main-box');
  relationBox.appendChild(historyDiv);

  // draw history_box
  const historyDivHeaderBox = document.createElement('div');
  historyDivHeaderBox.classList.add('plus-button-context-menu-header-box');
  historyDiv.appendChild(historyDivHeaderBox);
  // draw history_header
  const historyDivHeader = document.createElement('div');
  historyDivHeader.classList.add('plus-button-context-menu-header');
  historyDivHeader.innerText = 'History';
  historyDivHeader.style.fontSize = '20px';
  // add clear button
  const historyDivHeaderClearButton = document.createElement('div');
  historyDivHeaderClearButton.classList.add(
      'plus-button-context-menu-header-clear-button', 'codicon', 'codicon-clear-all');

  historyDivHeaderClearButton.addEventListener('click', () => {
    historyList = [historyList[0]];
    vscode.setState({historyList: historyList});

    const historyDivChildNodes = [...historyDiv.childNodes];
    for (let index = 0; index < historyDivChildNodes.length; index++) {
      const element = historyDivChildNodes[index];
      if (index >= 3) {
        element.remove();
      }
    }
  });

  historyDivHeaderClearButton.addEventListener('mouseover', () => {
    const historyClearButtonRect = historyDivHeaderClearButton.getBoundingClientRect();
    hoverText.innerText = `"Clear history"`;
    hoverText.style.top = `${historyClearButtonRect.top - historyClearButtonRect.height - 12}px`;
    hoverText.style.left = `${historyClearButtonRect.left - historyClearButtonRect.width - 37}px`;
    hoverText.style.display = 'block';
    hoverText.classList.add('font-bold');
  });

  historyDivHeaderClearButton.addEventListener('mouseout', () => {
    hoverText.style.display = 'none';
    hoverText.classList.remove('font-bold');
  });

  const historyDivHeaderCloseButton = document.createElement('div');
  historyDivHeaderCloseButton.classList.add(
      'history-close-button', 'codicon', 'codicon-fold-up',
      'plus-button-context-menu-header-clear-button');

  historyDivHeaderCloseButton.addEventListener('click', () => {
    document.getElementsByClassName('history-main-box')[0].style.display = 'none';
    historyOpenDiv.style.display = 'flex';
  });

  historyDivHeaderCloseButton.addEventListener('mouseover', () => {
    const historyCloseButtonRect = historyDivHeaderCloseButton.getBoundingClientRect();
    hoverText.innerText = `"History Close"`;
    hoverText.style.top = `${historyCloseButtonRect.top - historyCloseButtonRect.height - 12}px`;
    hoverText.style.left = `${historyCloseButtonRect.left - historyCloseButtonRect.width - 20}px`;
    hoverText.style.display = 'block';
    hoverText.classList.add('font-bold');
  });
  historyDivHeaderCloseButton.addEventListener('mouseout', () => {
    hoverText.style.display = 'none';
    hoverText.classList.remove('font-bold');
  });

  historyDivHeaderBox.append(
      historyDivHeaderCloseButton, historyDivHeader, historyDivHeaderClearButton);

  // append history info
  for (let index = 0; index < historyList.length; index++) {
    // draw a dividing line
    const historyInfoLine = document.createElement('div');
    historyInfoLine.classList.add('context-menu-line');

    const element = historyList[index];
    const historyDivInfo = document.createElement('div');

    let historyFileName = element.name;
    // limit file_length
    if (historyFileName.length > 35) {
      historyFileName = historyFileName.substring(0, 35) + '...';
    }
    historyDivInfo.innerText = historyFileName;
    historyDivInfo.id = element.path;
    historyDivInfo.classList.add('plus-button-context-menu-info');

    historyDivInfo.addEventListener('click', () => {
      postMessage('history', {path: historyDivInfo.id, historyList: historyList});
    });

    if (index === 0) {
      historyDivInfo.classList.add('current-history-color');
    }
    historyDiv.append(historyInfoLine, historyDivInfo);
  }

  // focus screen on the current_node
  const currentNodeRect =
      document.getElementsByClassName('current-node')[0].getBoundingClientRect();
  const relationBoxRect =
      document.getElementsByClassName('relation-box')[0].getBoundingClientRect();

  relationBox.scrollTo({
    left: currentNodeRect.left - relationBoxRect.width / 2 + currentNodeRect.width / 2,
    top: currentNodeRect.top - relationBoxRect.height / 2 + currentNodeRect.height / 2,
    behavior: 'auto'
  });
}

function pushCurrentFileInfoObject(historyList) {
  const currentFileInfoObject = {
    name: currentFileInfo['data-list'][currentFileInfo['represent-idx']].name,
    path: currentFileInfo['data-list'][currentFileInfo['represent-idx']].path
  };
  historyList.unshift(currentFileInfoObject);
}
let _zoom = 1;
function _wheelHandler(e) {
  if (e.shiftKey || e.ctrlKey) {
    const delta =
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);
    _updateZoom(_zoom * Math.pow(2, delta), e);
    e.preventDefault();
  } else {
    const container = document.getElementsByClassName('relation-box')[0];
    _scrollLeft = container.scrollLeft;
    _scrollTop = container.scrollTop;
  }
}


let _scrollLeft = 0;
let _scrollTop = 0;
let _width = 0;
let _height = 0;
function _updateZoom(zoom, e) {
  const canvas = document.getElementsByTagName('svg')[0];
  _width = _width || canvas.width.animVal.value;
  _height = _height || canvas.height.animVal.value;

  const container = document.getElementsByClassName('relation-box')[0];

  const limit = container.clientHeight / _height;
  const min = Math.min(Math.max(limit, 0.15), 1);
  zoom = Math.max(min, Math.min(zoom, 1.4));
  const width = zoom * _width;
  const height = zoom * _height;

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const scrollLeft = container.scrollLeft || _scrollLeft;
  const scrollTop = container.scrollTop || _scrollTop;
  const x = e.pageX + scrollLeft;
  const y = e.pageY + scrollTop;
  _scrollLeft = Math.max(0, ((x * zoom) / _zoom) - (x - scrollLeft));
  _scrollTop = Math.max(0, ((y * zoom) / _zoom) - (y - scrollTop));

  container.scrollLeft = _scrollLeft;
  container.scrollTop = _scrollTop;
  _zoom = zoom;
}


function _mouseDownHandler(e) {
  if (e.buttons === 1) {
    const html = document.getElementsByTagName('html')[0];
    html.style.cursor = 'grabbing';
    const container = document.getElementsByClassName('relation-box')[0];
    let _mousePosition =
        {left: container.scrollLeft, top: container.scrollTop, x: e.clientX, y: e.clientY};
    e.stopImmediatePropagation();

    const mouseMoveHandler = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const dx = e.clientX - _mousePosition.x;
      const dy = e.clientY - _mousePosition.y;
      _mousePosition.moved = dx * dx + dy * dy > 0;

      if (_mousePosition.moved) {
        container.scrollLeft = _mousePosition.left - dx;
        container.scrollTop = _mousePosition.top - dy;
        _scrollLeft = container.scrollLeft;
        _scrollTop = container.scrollTop;
      }
    };

    const mouseUpHandler = () => {
      html.style.cursor = null;
      container.removeEventListener('mouseup', mouseUpHandler);
      container.removeEventListener('mouseleave', mouseUpHandler);
      container.removeEventListener('mousemove', mouseMoveHandler);
      if (_mousePosition && _mousePosition.moved) {
        e.preventDefault();
        e.stopImmediatePropagation();
        _mousePosition = null;
      }
    };
    container.addEventListener('mousemove', mouseMoveHandler);
    container.addEventListener('mouseup', mouseUpHandler);
    container.addEventListener('mouseleave', mouseUpHandler);
  }
}

function postMessage(type, object) {
  vscode.postMessage({type: type, ...object});
}

function detachTree() {
  d3.select('svg') ?.remove();

  while (document.body.hasChildNodes()) {
    document.body.removeChild(document.body.firstChild);
  }
}

function setDrawInfoInNode(type, node, rectSizeHeight, waitForDouble) {
  let currentRect = '';

  node.append('text')
      .attr('x', -60)
      .attr(
          'class',
          d => {
            let classList = '';
            if (type === 'extension') {
              classList += 'file-extension-custom file-extension ';
            } else if (
                type === 'name' && d.data['data-list'][d.data['represent-idx']]['is-deleted']) {
              classList += 'deleted-text-decoration ';
            } else if (type === 'name') {
              classList += 'text-file-name';
            }
            return classList;
          })
      .attr(
          'y',
          d => {
            if (type === 'oneccVersion') {
              return -rectSizeHeight + 75;
            } else if (type === 'toolchainVersion') {
              return -rectSizeHeight + 63;
            } else if (type === 'extension') {
              return -rectSizeHeight + 15;
            } else if (type === 'name') {
              const oneccVersion = d.data['data-list'][d.data['represent-idx']]['onecc-version'];
              const toolchainVersion =
                  d.data['data-list'][d.data['represent-idx']]['toolchain-version'];

              if (oneccVersion || toolchainVersion) {
                return -rectSizeHeight + 42;
              } else {
                return -rectSizeHeight + 42;
              }
            }
          })
      .text(d => {
        let versionInfo = '';
        if (type === 'oneccVersion' &&
            d.data['data-list'][d.data['represent-idx']]['onecc-version']) {
          versionInfo = d.data['data-list'][d.data['represent-idx']]['onecc-version'];
          versionInfo = `onecc-version: ${versionInfo}`;
        } else if (
            type === 'toolchainVersion' &&
            d.data['data-list'][d.data['represent-idx']]['toolchain-version']) {
          versionInfo = d.data['data-list'][d.data['represent-idx']]['toolchain-version'];
          versionInfo = `toolchain-version: ${versionInfo}`;
        } else if (type === 'extension') {
          versionInfo = d.data['data-list'][d.data['represent-idx']].name.split(
              '.')[d.data['data-list'][d.data['represent-idx']].name.split('.').length - 1];
        } else if (type === 'name') {
          let fullName = d.data['data-list'][d.data['represent-idx']].name;
          if (fullName.length > 22) {
            fullName = fullName.substring(0, 22) + '...';
          }

          if (d.data['data-list'][d.data['represent-idx']]['is-deleted']) {
            fullName = '(deleted)';
          }
          return fullName;
        }
        return versionInfo;
      })
      .on('dblclick',
          () => {
            if (waitForDouble !== null) {
              clearTimeout(waitForDouble);
              waitForDouble = null;
            }
          })
      .on('click',
          (_p, d) => {
            if (waitForDouble === null) {
              waitForDouble = setTimeout(() => {
                postMessage('update', {
                  path: d.data['data-list'][d.data['represent-idx']].path,
                  historyList: historyList,
                  isOpenHistoryBox:
                      document.getElementsByClassName('history-main-box')[0].style.display
                });
                waitForDouble = null;
              }, 300);
            }
          })
      .on('contextmenu',
          (mouse, d) => {
            openContextMenu(mouse, d.data['data-list'][d.data['represent-idx']].path);
          })
      .on('mouseover',
          (mouse, node) => {
            if (type === 'name') {
              const hoverText = document.getElementsByClassName('hover-text')[0];
              const fileExtensionText = mouse.path[0].getBoundingClientRect();
              hoverText.style.display = 'block';
              hoverText.innerText = `${node.data['data-list'][node.data['represent-idx']].path}`;
              hoverText.style.left = `${fileExtensionText.x - 8}px`;
              hoverText.style.top = `${fileExtensionText.y - 24}px`;
              if (node.data['data-list'][node.data['represent-idx']]['is-deleted']) {
                hoverText.classList.add('deleted-text-decoration');
              }
            }

            currentRect = mouse.fromElement;
            if(mouse.fromElement?.tagName !== 'rect') {
              currentRect = mouse.path[1].childNodes[2];
            }
            currentRect.classList.add('rect-hover-fill');
          })
      .on('mouseout', (_mouse, node) => {
        if (type === 'name') {
          const hoverText = document.getElementsByClassName('hover-text')[0];
          hoverText.style.display = 'none';
          if (node.data['data-list'][node.data['represent-idx']]['is-deleted']) {
            hoverText.classList.remove('deleted-text-decoration');
          }
        }

        currentRect.classList.remove('rect-hover-fill');
      });
}

function hidePlusButtonContextMenu(plusButtonContextBox) {
  if (plusButtonContextBox.style.display === 'block') {
    plusButtonContextBox.style.display = 'none';
    const plusButtonContextMenus = document.getElementsByClassName('plus-button-context-menu');
    for (let index = 0; index < plusButtonContextMenus.length; index++) {
      const element = plusButtonContextMenus[index];
      element.style.display = 'none';
    }
    const plusButtons = document.getElementsByClassName('plus-button');
    for (let index = 0; index < plusButtons.length; index++) {
      const element = plusButtons[index];
      element.style.display = 'block';
    }
    const minusButton = document.getElementsByClassName('minus-button');
    for (let index = 0; index < minusButton.length; index++) {
      const element = minusButton[index];
      element.style.display = 'none';
    }
  }
}

function openContextMenu(mouse, path) {
  const contextMenuBox = document.getElementById('context-menu-box');
  const contextMenu = document.getElementById('context-menu');
  const relationBox = document.getElementById('relation-box');
  const relationBoxRect = relationBox.getBoundingClientRect();

  contextMenuBox.style.display = 'block';
  contextMenu.style.display = 'block';

  contextMenu.style.top = `${mouse.y}px`;
  contextMenu.style.left = `${mouse.x}px`;

  const contextMenuRect = contextMenu.getBoundingClientRect();

  // If the right of the context menu is longer than the size of the current container,
  if (relationBoxRect.right - mouse.x < contextMenuRect.width) {
    contextMenu.style.left = `${mouse.x - contextMenuRect.width}px`;
  }

  // If the bottom of the plus menu is outside the screen,
  if (relationBoxRect.height - mouse.y < contextMenuRect.height) {
    contextMenu.style.top = `${mouse.y - contextMenuRect.height}px`;
  }


  selectedNodePath = path;
}

function getSelectedFileInfo(selected, relationData) {
  for (let idx = 0; idx < relationData.length; idx++) {
    for (const key in relationData[idx]) {
      if (key === 'id') {
        if (relationData[idx]['id'] === selected) {
          currentFileInfo = relationData[idx];
        }
      }
    }
    if (!currentFileInfo) {
      break;
    }
  }
}

function plusMinusButtonCreate(type, rectSizeWidth, rectSizeHeight) {
  node.append('text')
      .attr('x', rectSizeWidth / 2 - 14)
      .attr('y', -rectSizeHeight + 9)
      .attr(
          'class',
          () => {
            return type === 'minus' ? 'minus-button' : 'plus-button';
          })
      .attr(
          'id',
          node => {
            return type === 'minus' ? `${node.data.id}-minus-button` :
                                      `${node.data.id}-plus-button`;
          })
      .text(node => {
        if (node.data['data-list'].length >= 2) {
          return type === 'minus' ? `-` : '+';
        }
      })
      .on('click',
          (mouse, node) => {
            const minusButton = document.getElementById(`${node.data.id}-minus-button`);
            const plusButton = document.getElementById(`${node.data.id}-plus-button`);
            const plusButtonContextBox = document.getElementById(`plus-button-context-box`);
            const plusButtonContextMenu =
                document.getElementById(`${node.data.id}-plus-button-context-menu`);
            const relationBox = document.getElementById(`relation-box`);
            const relationBoxRect = relationBox.getBoundingClientRect();

            if (type === 'minus') {
              minusButton.style.display = 'none';
              plusButton.style.display = 'display';
              plusButtonContextBox.style.display = 'none';
              plusButtonContextMenu.style.display = 'none';
            } else {
              const plusButtonRect = mouse.path[0].getBoundingClientRect();
              minusButton.style.display = 'block';
              plusButton.style.display = 'none';
              plusButtonContextBox.style.display = 'block';
              plusButtonContextMenu.style.display = 'block';
              plusButtonContextMenu.style.top = `${plusButtonRect.y}px`;
              plusButtonContextMenu.style.left = `${plusButtonRect.right}px`;

              const plusButtonContextMenuWidth =
                  plusButtonContextMenu.getBoundingClientRect().width;
              const plusButtonContextMenuHeight =
                  plusButtonContextMenu.getBoundingClientRect().height;

              // the area of the plus menu is outside the current screen
              if (plusButtonRect.right + plusButtonContextMenuWidth >
                  relationBox.getBoundingClientRect().right) {
                plusButtonContextMenu.style.left =
                    `${plusButtonRect.right - plusButtonContextMenuWidth}px`;
              }
              // If the bottom of the plus menu is outside the screen,
              if (relationBoxRect.height - plusButtonRect.top < plusButtonContextMenuHeight) {
                plusButtonContextMenu.style.top =
                    `${plusButtonRect.y - plusButtonContextMenuHeight}px`;
              }
            }
          })
      .on('mouseover',
          (mouse) => {
            const plusButton = mouse.path[0].getBoundingClientRect();
            const hoverText = document.getElementsByClassName('hover-text')[0];
            hoverText.style.display = 'block';
            hoverText.innerText = `"Open the same content file list"`;
            hoverText.style.left = `${plusButton.x - 80}px`;
            hoverText.style.top = `${plusButton.y - 12}px`;
            hoverText.classList.add('font-bold');

            const hoverTextRect = hoverText.getBoundingClientRect();
            const relationBoxRect = document.getElementById('relation-box').getBoundingClientRect();
            // If the right of the hover text is longer than the size of the current container,
            if (relationBoxRect.right - plusButton.x < hoverTextRect.width) {
              hoverText.style.left = `${plusButton.x - hoverTextRect.width + 20}px`;
            }

            // If the top of the hover text is outside the screen,
            if (plusButton.y < hoverTextRect.height) {
              hoverText.style.top = `${plusButton.y + hoverTextRect.height + 10}px`;
            }
          })
      .on('mouseout', () => {
        const hoverText = document.getElementsByClassName('hover-text')[0];
        hoverText.style.display = 'none';
        hoverText.classList.remove('font-bold');
      });
}

function countMaxDataNum(relationData) {
  // d3 graph layer info
  const d3ClassData = {};

  // d3 graph number of nodes for layer
  const d3NumData = {};

  // Maximum Number in One Floor
  let _maxWidthCount = 1;
  // Total number of floors
  let _maxHeightCount = 1;
  for (const key in relationData) {
    const data = relationData[key];

    if (!d3ClassData[data.parent]) {
      d3ClassData[data.id] = 1;
    } else {
      d3ClassData[data.id] = d3ClassData[data.parent] + 1;
    }

    d3NumData[d3ClassData[data.id]] =
        (d3NumData[d3ClassData[data.id]] ? d3NumData[d3ClassData[data.id]] : 0) + 1;
    if (_maxWidthCount < d3NumData[d3ClassData[data.id]]) {
      _maxWidthCount = d3NumData[d3ClassData[data.id]];
    }
  }
  _maxHeightCount = Object.keys(d3NumData).length;
  return [_maxWidthCount, _maxHeightCount];
}

function historyMainBoxDisplay(type, isOpenHistoryBox) {
  const historyMainBox = document.getElementsByClassName('history-main-box')[0];
  const historyOpenBox = document.getElementsByClassName('history-open-box')[0];

  if (type === 'update') {
    console.log(isOpenHistoryBox);
    if (isOpenHistoryBox === 'block' || isOpenHistoryBox === '') {
      historyMainBox.style.display = 'block';
      historyOpenBox.style.display = 'none';
    } else {
      historyMainBox.style.display = 'none';
      historyOpenBox.style.display = 'flex';
    }
  } else {
    historyMainBox.style.display = 'block';
    historyOpenBox.style.display = 'none';
  }
}

function drawRect(type, rectSizeWidth, rectSizeHeight, waitForDouble) {
  node.append('rect')
      .attr('x', -rectSizeWidth / 2)
      .attr(
          'y',
          () => {
            switch (type) {
              case 'extension':
                return -rectSizeHeight;
              case 'fileName':
                return -rectSizeHeight + 25;
              case 'versionInfo':
                return -rectSizeHeight + 25 + 25;
              default:
                break;
            }
          })
      .attr(
          'rx',
          () => {
            return type === 'extension' ? 3 : null;
          })
      .attr(
          'ry',
          () => {
            return type === 'versionInfo' ? 3 : null;
          })
      .attr('width', rectSizeWidth)
      .attr('height', type === 'versionInfo' ? 30 : 25)
      .attr(
          'class',
          d => {
            let classList = '';
            if (d.data.id === currentFileInfo.id) {
              classList += 'current-node ';
            }
            if (type === 'fileName') {
              classList += 'rect-file-name';
            }
            return classList;
          })
      .style(
          'fill',
          d => {
            if (type === 'extension') {
              const nodeData = d.data['data-list'][d.data['represent-idx']];
              const nodeFileExtension =
                  nodeData['name'].split('.')[nodeData['name'].split('.').length - 1];
              if (nodeFileExtension === 'log') {
                return 'rgb(25, 40, 60, 1.0)';
              } else if (nodeFileExtension === 'circle') {
                return 'rgba(75, 27, 22, 1.0)';
              } else {
                return '#161515';
              }
            } else if (type === 'versionInfo') {
              return 'rgb(37 50 37)';
            }
          })
      .on('dblclick',
          () => {
            if (waitForDouble !== null) {
              clearTimeout(waitForDouble);
              waitForDouble = null;
            }
          })
      .on('click',
          (_p, d) => {
            if (waitForDouble === null) {
              waitForDouble = setTimeout(() => {
                postMessage('update', {
                  path: d.data['data-list'][d.data['represent-idx']].path,
                  historyList: historyList,
                  isOpenHistoryBox:
                      document.getElementsByClassName('history-main-box')[0].style.display
                });
                waitForDouble = null;
              }, 300);
            }
          })
      .on('contextmenu', (mouse, d) => {
        openContextMenu(mouse, d.data['data-list'][d.data['represent-idx']].path);
      });
}
