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

//웹뷰 오른쪽 클릭 막기
document.addEventListener('contextmenu', event => event.preventDefault());

const vscode = acquireVsCodeApi();
//히스토리 저장 리스트
let historyList = vscode.getState()?.historyList || [];

//현재 오픈된 파일의 정보 저장
let currentFileInfo = null;

//현재 컨텍스트 메뉴를 킨 노드 경로 저장
let selectedNodePath = null;

window.addEventListener('message',(event) => {
  const message = event.data;
  const { selected, relationData } = message.payload;
  getSelectedFileInfo(selected,relationData);
  
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
      vscode.setState({historyList:historyList});
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

//노드 저장
let node;

function attachTree(relationData) {
  
  const wheelInfoBox = document.createElement('div');
  wheelInfoBox.innerText = '* (ctrl OR shift) + wheel : 확대, 축소';
  wheelInfoBox.classList.add('wheel-info-box');
  document.body.appendChild(wheelInfoBox);

  //  assigns the data to a hierarchy using parent-child relationships
  const treeData = d3.stratify()
    .id(d => d.id)
    .parentId(d => d.parent)
    (relationData);
  
  let historyDivWidth = (screen.width * 0.11 < 200) ? 200 : screen.width * 0.11;
  const rectSizeWidth = 130;
  const rectSizeHeight = 45;

  const [maxWidthCount,maxHeightCount] = countMaxDataNum(relationData);

  // set the dimensions and margins of the diagram
  const margin = {top: 70, right: 0, bottom: 60, left: 0};
  let width = (maxWidthCount + 4) * rectSizeWidth  - margin.left - margin.right;
  width = (width < screen.width * 0.7) ? screen.width * 0.7 : width;
  let height = screen.height * 0.6  - margin.top - margin.bottom;
  height = (rectSizeHeight * maxHeightCount < height) ? height : rectSizeHeight * maxHeightCount;
  // declares a tree layout and assigns the size
  const treemap = d3.tree()
      .size([width, height]);
  
  // maps the node data to the tree layout
  const nodes = treemap(treeData);
  
  // Main Box Create
  const relationBox = document.createElement('div');
  relationBox.classList.add('relation-box');
  relationBox.setAttribute('id','relation-box');
  relationBox.style.width = `${historyDivWidth + width}px`;

  document.body.appendChild(relationBox);

  //컨텍스트 메뉴 Box 그리기
  const contextMenuBox = document.createElement('div');
  contextMenuBox.setAttribute('id','context-menu-box');
  contextMenuBox.classList.add('plus-button-context-box');
  contextMenuBox.style.width = `${width + historyDivWidth}px`;
  

  //컨텍스트 메뉴 그리기
  const contextMenu = document.createElement('div');
  contextMenu.setAttribute('id','context-menu');
  contextMenu.classList.add('context-menu');

  document.body.append(contextMenu,contextMenuBox);

  const contextMenuList = ['Show Metadata of this file','Open this file'];

  for (let index = 0; index < contextMenuList.length; index++) {

    //메뉴 구분선 추가
    if(index >= 1){
      const contextMenuInfoLine = document.createElement('div');
      contextMenuInfoLine.classList.add('context-menu-line');
      contextMenu.appendChild(contextMenuInfoLine);
    }

    const element = contextMenuList[index];
    const contextMenuInfo = document.createElement('div');
    contextMenuInfo.classList.add('context-menu-info');
    contextMenuInfo.innerText = element;
    contextMenu.appendChild(contextMenuInfo);

    contextMenuInfo.addEventListener('click', (e) => {
        contextMenuBox.style.display = 'none';
        contextMenu.style.display = 'none';
        switch (element) {
          case 'Show Metadata of this file':
            postMessage('showMetadata',{path: selectedNodePath});
            break;
          case 'Open this file':
            postMessage('openFile',{path: selectedNodePath});
            break;
          default:
            break;
        }
    });
    
  }
  //좌 우 클릭 이벤트 등록
  contextMenuBox.addEventListener('click', (e) => {
    contextMenuBox.style.display = 'none';
    contextMenu.style.display = 'none';
  });
  contextMenuBox.addEventListener('contextmenu', (e) => {
    contextMenuBox.style.display = 'none';
    contextMenu.style.display = 'none';
  });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  // TODO: background-color 다른 색으로 바꾸기.
  const svg = d3.select(".relation-box").append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "#545454"),
      g = svg.append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
  
  // adds the links between the nodes
  const link = g.selectAll(".link")
      .data( nodes.descendants().slice(1))
      .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
         return "M" + d.x + "," + d.y
           + "C" + d.x + "," + (d.y + d.parent.y) / 2
           + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
           + " " + d.parent.x + "," + d.parent.y;
         });
  
  // adds each node as a group
  node = g.selectAll(".node")
      .data(nodes.descendants())
      .enter().append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
  
  let waitForDouble = null;
  

  // adds the rectangle to the node
  node.append("rect")
    .attr("x", -rectSizeWidth / 2)
    .attr("y", -rectSizeHeight)
    .attr("width", rectSizeWidth)
    .attr("height", rectSizeHeight)
    .attr("rx",8)
    .attr("ry",8)
    .attr('class', d => {
      if(d.data.id === currentFileInfo.id){
        return "current-node";
      } 
      return "";
    })
    .style('fill', d => {
      const nodeData = d.data.dataList[d.data.representIdx];
      const nodeFileExtension = nodeData['name'].split('.')[nodeData['name'].split('.').length - 1];
      if(nodeFileExtension === 'log'){
        return 'rgb(25, 40, 60, 1.0)';
      } else if (nodeFileExtension === 'circle'){
        return 'rgba(75, 27, 22, 1.0)';
      } else {
        return "";
      }
    })
    .on("dblclick", (p,d) => {
      if (waitForDouble !== null) {
        clearTimeout(waitForDouble);
        waitForDouble = null;
        console.log('더블 클릭입니다.', d);
      }
    })
    .on("click", (p, d) => {
      if(waitForDouble === null) {
        waitForDouble = setTimeout(() => {
          postMessage('update',{path: d.data.dataList[d.data.representIdx].path,historyList:historyList});
          waitForDouble = null;
        }, 300);
      }
    })
    .on("contextmenu",(mouse,d)=>{
      openContextMenu(mouse,d.data.dataList[d.data.representIdx].path);
    });
    
  
  // 파일 path 보여줄 호버 텍스트 div 생성
  const hoverText = document.createElement('div');
  document.body.appendChild(hoverText);
  hoverText.classList.add('hover-text');

  // 파일 확장자 표시
  node.append("text")
    .attr("y", -rectSizeHeight + 3)
    .attr('class','text-shadow-white file-extension')
    .style("text-anchor", "middle")
    .text(d => d.data.dataList[d.data.representIdx].name.split('.')[d.data.dataList[d.data.representIdx].name.split('.').length - 1])
    .on('mouseover', (mouse, node) => {
      const fileExtensionText = mouse.path[0].getBoundingClientRect();
      hoverText.style.display = 'block';
      hoverText.innerText = `${node.data.dataList[node.data.representIdx].path}`;
      hoverText.style.left = `${window.scrollX + fileExtensionText.x - 10}px`;
      hoverText.style.top = `${window.scrollY + fileExtensionText.y - 23}px`;
    }).on('mouseout', (mouse, node) => {
      hoverText.style.display = 'none';
    });
  
  //각 노드 이름 그리기
  setDrawInfoInNode('name',node,rectSizeHeight,waitForDouble);

  //이름과 버젼 정보 구분선 처리
  setDrawInfoInNode('line',node, rectSizeHeight,waitForDouble);

  //버젼 정보 그리기
  setDrawInfoInNode('toolchainVersion',node, rectSizeHeight,waitForDouble);
  setDrawInfoInNode('oneccVersion',node, rectSizeHeight),waitForDouble;

  //플러스 버튼 추가
  node._groups[0].forEach((g) => {
    g.setAttribute('id',`${g.__data__.data.id}-g`);

    const rectDom = g.childNodes[0];

    if(g.__data__.data.dataList.length >= 2){

      //플러스버튼 컨텍스트 메뉴
      const plusButtonContextMenu = document.createElement('div');
      plusButtonContextMenu.classList.add('plus-button-context-menu');
      plusButtonContextMenu.setAttribute('id',`${g.__data__.data.id}-plus-button-context-menu`);
      document.body.appendChild(plusButtonContextMenu);

      //플러스버튼 컨텍스트 메뉴 헤더 추가
      const plusButtonContextMenuHeader = document.createElement('div');
      plusButtonContextMenuHeader.classList.add('plus-button-context-menu-header');
      plusButtonContextMenuHeader.innerText = 'Same Content File List';
      plusButtonContextMenu.appendChild(plusButtonContextMenuHeader);

      //컨텍스 메뉴에 데이터 리스트 정보 추가
      const dataList = g.__data__.data.dataList;
      
      for (let idx = 0; idx < dataList.length; idx++) {
        if(idx !== g.__data__.data.representIdx){
          const data = dataList[idx];
          for (const key in data) {
            if(key === 'name'){

              //구분선 추가
              const plusButtonContextMenuLine = document.createElement('div');
              plusButtonContextMenuLine.classList.add('context-menu-line');
              plusButtonContextMenu.appendChild(plusButtonContextMenuLine);
              
              //플러스 버튼 컨텍스트 메뉴 정보 그리기
              const plusButtonContextMenuInfo = document.createElement('div');
              plusButtonContextMenuInfo.innerText = data[key];
              plusButtonContextMenuInfo.classList.add('plus-button-context-menu-info');
              plusButtonContextMenu.appendChild(plusButtonContextMenuInfo);
              
              plusButtonContextMenuInfo.addEventListener('click', () => {
                postMessage('update',{path:dataList[idx]['path'],historyList:historyList});
                //컨텍스트 메뉴창 숨기기
                hidePlusButtonContextMenu(plusButtonContextBox);
              });
            }
          } 
        }
        
      }

    }
    
    //버젼 정보가 2개 일때는 rect의 높이를 더 크게 해준다.
    let versionInfoCount = 0;
    const nodeData = g.__data__.data.dataList[g.__data__.data.representIdx];
    for (const key in nodeData) {
      if(key === 'oneccVersion' || key === "toolchainVersion"){
        versionInfoCount += 1;
      }
    }
    rectDom.style.height = versionInfoCount === 2 ? rectSizeHeight + 9 : rectSizeHeight;
    
    //만약 버젼정보가 없다면 파일 이름 가운데 정렬
    if(versionInfoCount === 0) {
      const fileName = g.childNodes[2];
      fileName.style.textAnchor = 'middle';
      fileName.setAttribute('x',0);
    }
  });

  //플러스버튼 컨텍스트 메뉴 바깥의 div
  const plusButtonContextBox = document.createElement('div');
  plusButtonContextBox.classList.add('plus-button-context-box');
  plusButtonContextBox.setAttribute('id',`plus-button-context-box`);
  plusButtonContextBox.style.width = `100%`;
  document.body.appendChild(plusButtonContextBox);

   //+ 버튼 꺼지는 이벤트 처리
   plusButtonContextBox.addEventListener('click',(event) => {
        
    //컨텍스트 메뉴창 숨기기
    hidePlusButtonContextMenu(plusButtonContextBox);
  });

  //플러스 마이너스 버튼 추가
  plusMinusButtonCreate('minus',rectSizeWidth,rectSizeHeight);
  plusMinusButtonCreate('plus',rectSizeWidth,rectSizeHeight);

  //마우스 드래그 스크롤 이벤트 추가
  relationBox.addEventListener('mousedown', (e) => _mouseDownHandler(e));
  relationBox.addEventListener('mousewheel', (e) => _wheelHandler(e), {passive: false});

  //히스토리 영역 추가
  const historyDiv = document.createElement('div');
  historyDiv.style.width = `${historyDivWidth}px`;
  historyDiv.style.height = `${document.getElementsByTagName('svg')[0].getBoundingClientRect().height - 100}px`;
  historyDiv.classList.add('history-main-box');
  relationBox.appendChild(historyDiv);

  //히스토리 헤더 박스 추가
  const historyDivHeaderBox = document.createElement('div');
  historyDivHeaderBox.classList.add('plus-button-context-menu-header-box');
  historyDiv.appendChild(historyDivHeaderBox);
  //히스토리 글자 추가
  const historyDivHeader = document.createElement('div');
  historyDivHeader.classList.add('plus-button-context-menu-header');
  historyDivHeader.innerText = 'History';
  historyDivHeader.style.fontSize = '20px';
  //clear 버튼 추가
  const historyDivHeaderClearButton = document.createElement('div');
  historyDivHeaderClearButton.classList.add('plus-button-context-menu-header-clear-button');
  historyDivHeaderClearButton.innerText = '[c]';

  historyDivHeaderClearButton.addEventListener('click', (e) => {
    historyList = [historyList[0]];
    vscode.setState({historyList:historyList});
    
    const historyDivChildNodes = [...historyDiv.childNodes];
    for (let index = 0; index < historyDivChildNodes.length; index++) {
      const element = historyDivChildNodes[index];
      if(index >= 3){
        element.remove();
      }
    }
  });

  historyDivHeaderBox.append(historyDivHeader,historyDivHeaderClearButton);

  //히스토리 내용 추가
  for (let index = 0; index < historyList.length; index++) {
    
    //구분선 추가
    const historyInfoLine = document.createElement('div');
    historyInfoLine.classList.add('context-menu-line');
    
    const element = historyList[index];
    const historyDivInfo = document.createElement('div');

    let historyFileName = element.name;
    //파일이름이 35자를 넘어가면 35자 까지만 표시
    if(historyFileName.length > 35){
      historyFileName = historyFileName.substring(0,35) + '...';
    }
    historyDivInfo.innerText = historyFileName;
    historyDivInfo.id = element.path;
    historyDivInfo.classList.add('plus-button-context-menu-info');

    historyDivInfo.addEventListener('click', (e) => {
      postMessage('history',{path:historyDivInfo.id,historyList:historyList});
    });

    if(index === 0){
      historyDivInfo.style.color = 'darkorange ';
    }
    historyDiv.append(historyInfoLine,historyDivInfo);
  }

  //로드시 해당 노드를 중심으로 화면 이동
  const currentNodeRect = document.getElementsByClassName('current-node')[0].getBoundingClientRect();
  const relationBoxRect = document.getElementsByClassName('relation-box')[0].getBoundingClientRect();
  
  relationBox.scrollTo({left:currentNodeRect.left - relationBoxRect.width / 2 + currentNodeRect.width / 2 ,top:currentNodeRect.top - relationBoxRect.height / 2 + currentNodeRect.height / 2 ,behavior:"auto"});
}

function pushCurrentFileInfoObject(historyList) {

  const currentFileInfoObject = {
    name: currentFileInfo.dataList[currentFileInfo.representIdx].name,
    path: currentFileInfo.dataList[currentFileInfo.representIdx].path
  };
  historyList.unshift(currentFileInfoObject);
}
let _zoom = 1;
function _wheelHandler(e) {
  if (e.shiftKey || e.ctrlKey) {
      const delta = -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) *
          (e.ctrlKey ? 10 : 1);
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
  _width = canvas.width.animVal.value;
  _height = canvas.height.animVal.value;
  
  const container = document.getElementsByClassName('relation-box')[0];
  const historyMainBox = document.getElementsByClassName('history-main-box')[0];

  const limit = container.clientHeight / _height;
  const min = Math.min(Math.max(limit, 0.15), 1);
  zoom = Math.max(min, Math.min(zoom, 1.4));
  const width = zoom * _width;
  const height = zoom * _height;
  
  if(zoom !== 1){
    historyMainBox.style.height = height * 0.7 + 'px';
  } else {
    historyMainBox.style.height = height - 100 + 'px';
  }

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const scrollLeft = _scrollLeft || container.scrollLeft;
  const scrollTop = _scrollTop || container.scrollTop;
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

function postMessage(type,object) {
  vscode.postMessage({type:type, ...object});
}

function detachTree() {
  d3.select("svg")?.remove();
  
  while ( document.body.hasChildNodes())
  {
    document.body.removeChild(document.body.firstChild);       
  }
}

//각 노드에 정보 그리기
function setDrawInfoInNode(type, node, rectSizeHeight, waitForDouble) {
  node.append("text")
  .attr("x", -60)
  .attr('class',d => {
    if(type === 'line'){
      return 'text-shadow-white';
    } else {
      return "";
    }
  })
  .attr("y", d => {
    if(type === 'oneccVersion'){
      return -rectSizeHeight + 47;
    }else if (type === 'toolchainVersion'){
      return -rectSizeHeight + 37;
    } else if(type === 'line') {
      return -rectSizeHeight + 27;
    } else if (type === 'name'){
      const oneccVersion = d.data.dataList[d.data.representIdx].oneccVersion;
      const toolchainVersion = d.data.dataList[d.data.representIdx].toolchainVersion;

      if(oneccVersion || toolchainVersion){
        return -rectSizeHeight + 18;
      } else {
        return -rectSizeHeight + 28;
      }
    }
  })
  .style('font-size',d => {
    if(type === 'line'){
      return '5px';
    }else {
      return '10px';
    }
  })
  .style('fill',d => {
    if(type === 'line'){
      return 'black';
    }else{
      return `white`;
    }
  })
  .text(d => {
    let versionInfo = "";
    if(type === 'oneccVersion' && d.data.dataList[d.data.representIdx].oneccVersion){
      versionInfo = d.data.dataList[d.data.representIdx].oneccVersion;
      versionInfo = `onecc-version: ${versionInfo}`;
    } else if(type === 'toolchainVersion' && d.data.dataList[d.data.representIdx].toolchainVersion){
      versionInfo = d.data.dataList[d.data.representIdx].toolchainVersion;
      versionInfo = `toolchain-version: ${versionInfo}`;
    } else if(type === 'line' && (d.data.dataList[d.data.representIdx].toolchainVersion || d.data.dataList[d.data.representIdx].oneccVersion)) {
      versionInfo = 'ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ';
    } else if (type === 'name'){
      let fullName = d.data.dataList[d.data.representIdx].name;
      if(fullName.length > 22){
        fullName = fullName.substring(0,22) + '...';
      }
      return fullName;
    }
    return versionInfo;
  })
  .on("dblclick", (p,d) => {
    if (waitForDouble !== null) {
      clearTimeout(waitForDouble);
      console.log('더블 클릭입니다.');
      waitForDouble = null;
    }
  })
  .on("click", (p, d) => {
    if(waitForDouble === null) {
      waitForDouble = setTimeout(() => {
        postMessage('update',{
          path: d.data.dataList[d.data.representIdx].path,
          historyList:historyList});
        waitForDouble = null;
      }, 300);
    }
  }).on("contextmenu",(mouse,d)=>{
      openContextMenu(mouse,d.data.dataList[d.data.representIdx].path);
      
  })
  .on('mouseover', (mouse,node) => {
    const rectDom = mouse.target.parentNode.firstChild;
    rectDom.classList.add('text-hover');
  }).on('mouseout',(mouse,node) => {
    const rectDom = mouse.target.parentNode.firstChild;
    rectDom.classList.remove('text-hover');
  });
}

function hidePlusButtonContextMenu(plusButtonContextBox,plusButton) {

  if(plusButtonContextBox.style.display === 'block'){

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

function openContextMenu(mouse,path) {
  const contextMenuBox = document.getElementById('context-menu-box');
  const contextMenu = document.getElementById('context-menu');
  const relationBox = document.getElementById('relation-box');
  const relationBoxRect = relationBox.getBoundingClientRect();
  
  contextMenuBox.style.display = 'block';
  contextMenu.style.display = 'block';

  contextMenu.style.top = `${mouse.y}px`;
  contextMenu.style.left = `${mouse.x}px`;

  const contextMenuRect = contextMenu.getBoundingClientRect();
  
  //만약 현재 창의 크기보다 컨텍스메뉴의 끝이 더 길다면
  if(relationBoxRect.right - mouse.x < contextMenuRect.width){
    contextMenu.style.left = `${mouse.x - contextMenuRect.width}px`;
  }

  selectedNodePath = path;

}

//현재 오픈된 파일 정보 얻기
function getSelectedFileInfo(selected,relationData) {
  
  for (let idx = 0; idx < relationData.length; idx++) {
    for (const key in relationData[idx]) {
      if(key === 'id'){
        if (relationData[idx]['id'] === selected){
          currentFileInfo = relationData[idx];
        }
      }
    }
    if(!currentFileInfo){
      break;
    }
  }
}

function plusMinusButtonCreate(type,rectSizeWidth,rectSizeHeight) {

  //마이너스 버튼 추가 text
node.append("text")
.attr("x",rectSizeWidth / 2 - 14)
.attr("y", -rectSizeHeight + 9)
.attr('class',() => {
  return type === 'minus' ? 
  'minus-button' : 'plus-button'}
  )
.attr('id',node => {
  return type === 'minus' ? `${node.data.id}-minus-button` : `${node.data.id}-plus-button`;
})
.text(node => {
  if(node.data.dataList.length >= 2){
    return type === 'minus' ? `-` : '+';
  }
})
.on('click', (mouse,node)=> {
  const minusButton = document.getElementById(`${node.data.id}-minus-button`);
  const plusButton = document.getElementById(`${node.data.id}-plus-button`);
  const plusButtonContextBox = document.getElementById(`plus-button-context-box`);
  const plusButtonContextMenu = document.getElementById(`${node.data.id}-plus-button-context-menu`);
  const relationBox = document.getElementById(`relation-box`);
  const relationBoxRect = relationBox.getBoundingClientRect();

  if(type === 'minus'){
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
 
    const plusButtonContextMenuWidth = plusButtonContextMenu.getBoundingClientRect().width;
    const plusButtonContextMenuHeight = plusButtonContextMenu.getBoundingClientRect().height;
    
    //플러스 메뉴의 넓이가 현재 화면밖을 넘어선다면
    if(plusButtonRect.right + plusButtonContextMenuWidth > relationBox.getBoundingClientRect().right) {
      plusButtonContextMenu.style.left = `${plusButtonRect.right - plusButtonContextMenuWidth}px`;
    }
    //플러스 메뉴의 높이가 화면 아래를 벗어난다면
    if(relationBoxRect.height - plusButtonRect.top  < plusButtonContextMenuHeight){
      plusButtonContextMenu.style.top = `${plusButtonRect.y - plusButtonContextMenuHeight}px`;
    }
  }
});
}

function countMaxDataNum(relationData){

  //d3 그래프의 층 정보
  const d3ClassData = {};

  //d3 그래프의 층당 개수 저장
  const d3NumData = {};
  let _maxWidthCount = 1;
  let _maxHeightCount = 1;
  for (const key in relationData) {
    const data = relationData[key];

    if(!d3ClassData[data.parent]){
      d3ClassData[data.id] = 1;
    } else {
      d3ClassData[data.id] = d3ClassData[data.parent] + 1;
    }

    d3NumData[d3ClassData[data.id]] = (d3NumData[d3ClassData[data.id]] ? d3NumData[d3ClassData[data.id]] : 0) + 1;
    if(_maxWidthCount < d3NumData[d3ClassData[data.id]]){
      _maxWidthCount = d3NumData[d3ClassData[data.id]];
    }
  }
  _maxHeightCount = Object.keys(d3NumData).length;
  return [_maxWidthCount,_maxHeightCount];
}