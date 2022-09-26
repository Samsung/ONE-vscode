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

function attachTree(relationData) {
  
  //  assigns the data to a hierarchy using parent-child relationships
  const treeData = d3.stratify()
    .id(d => d.id)
    .parentId(d => d.parent)
    (relationData);
  
  const historyDivWidth = screen.width * 0.11;
  if(historyDivWidth < 200){

  }
  // set the dimensions and margins of the diagram
  const margin = {top: 60, right: 0, bottom: 60, left: 0},
      width = screen.width * 0.8  - historyDivWidth - margin.left - margin.right,
      height = screen.height * 0.6  - margin.top - margin.bottom;
  
  // declares a tree layout and assigns the size
  const treemap = d3.tree()
      .size([width, height]);
  
  // maps the node data to the tree layout
  const nodes = treemap(treeData);
  
  // Main Box Create
  const relationBox = document.createElement('div');
  relationBox.classList.add('relation-box');
  relationBox.style.width = `${historyDivWidth + width}px`;

  const relationMainBox = document.createElement('div');
  relationMainBox.classList.add('relation-main-box');

  relationBox.appendChild(relationMainBox);
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
  const svg = d3.select(".relation-main-box").append("svg")
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
  const node = g.selectAll(".node")
      .data(nodes.descendants())
      .enter().append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
  
  let waitForDouble = null;
  const rectSizeWidth = 130;
  const rectSizeHeight = 45;

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
    .attr('class','text-shadow-white')
    .style("text-anchor", "middle")
    .text(d => d.data.dataList[d.data.representIdx].name.split('.')[d.data.dataList[d.data.representIdx].name.split('.').length - 1])
    .on('mouseover', (mouse, node) => {
      hoverText.style.display = 'block';
      hoverText.innerText = `${node.data.dataList[node.data.representIdx].path}`;
      hoverText.style.left = `${node.x - 35}px`;
      hoverText.style.top = `${node.y + 10}px`;
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
  //console.log(node._groups[0]);
  node._groups[0].forEach((g) => {
    g.setAttribute('id',`${g.__data__.data.id}-g`);

    const rectDom = g.childNodes[0];
    if(g.__data__.data.dataList.length >= 2){
      
      //플러스 버튼 생성 및 css 처리
      const rect = rectDom.getBoundingClientRect();
      
      const plusButton = document.createElement('div');
      plusButton.setAttribute('id',`${g.__data__.data.id}-plus-button`);
      plusButton.classList.add('plus-button');
      plusButton.style.top = `${window.scrollY + rect.y - 17}px`;
      plusButton.style.left = `${window.scrollX + rect.x + rect.width - 13}px`;
      plusButton.innerText = `+`;

      document.body.append(plusButton);

      //플러스버튼 컨텍스트 메뉴 바깥의 div
      const plusButtonContextBox = document.createElement('div');
      plusButtonContextBox.classList.add('plus-button-context-box');
      plusButtonContextBox.style.width = `${width + historyDivWidth}px`;
      document.body.appendChild(plusButtonContextBox);
      
      //플러스버튼 컨텍스트 메뉴
      const plusButtonContextMenu = document.createElement('div');
      plusButtonContextMenu.classList.add('plus-button-context-menu');
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
                hidePlusButtonContextMenu(plusButtonContextBox,plusButtonContextMenu,plusButton);
              });
            }
          } 
        }
        
      }

      //플러스 버튼 클릭이벤트 처리
      plusButton.addEventListener('click',(mouse) => {
        const plusButtontop = parseInt(plusButton.style.top.split('px')[0]);
        if(plusButtonContextBox.style.display === 'none' || plusButtonContextBox.style.display === ""){
          plusButtonContextBox.style.display = 'block';
          const plusButtonRect = plusButton.getBoundingClientRect();
          
          plusButtonContextMenu.style.top = `${plusButtonRect.top + window.scrollY}px`;
          plusButtonContextMenu.style.left = `${plusButtonRect.right + window.scrollX}px`;
          plusButtonContextMenu.style.display = 'block';

          plusButton.innerText = '-';
          plusButton.style.fontSize = '40px';
          plusButton.style.top = `${plusButtontop - 13}px`;
          plusButton.style.zIndex = 2;

          //플러스 버튼 컨텍스트 메뉴가 열린 후 해당 컨텍스트 메뉴로 스크롤 이동
          window.scrollTo({left:(plusButtonRect.left + window.scrollX) - rectSizeWidth * 2,top:(plusButtonRect.top + window.scrollY),behavior: "smooth"});
          
        } else {
          plusButtonContextBox.style.display = 'none';
          plusButtonContextMenu.style.display = 'none';
          plusButton.innerText = '+';
          plusButton.style.fontSize = '25px';
          plusButton.style.top = `${plusButtontop + 13}px`;
          plusButton.style.zIndex = 1;
        }
      });

      //+ 버튼 꺼지는 이벤트 처리
      plusButtonContextBox.addEventListener('click',(event) => {
        
        //컨텍스트 메뉴창 숨기기
        hidePlusButtonContextMenu(plusButtonContextBox,plusButtonContextMenu,plusButton);
      });
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

  //마우스 드래그 스크롤 이벤트 추가
  document.getElementsByClassName('relation-box')[0].addEventListener('mousedown', (e) => _mouseDownHandler(e));

  //히스토리 영역 추가
  const historyDiv = document.createElement('div');
  historyDiv.style.width = `${historyDivWidth}px`;
  historyDiv.style.height = `${height}px`;
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

}

function pushCurrentFileInfoObject(historyList) {

  const currentFileInfoObject = {
    name: currentFileInfo.dataList[currentFileInfo.representIdx].name,
    path: currentFileInfo.dataList[currentFileInfo.representIdx].path
  };
  historyList.unshift(currentFileInfoObject);
}

function _mouseDownHandler(e) {
  
  if (e.buttons === 1) {
      const html = document.getElementsByTagName('html')[0];
      html.style.cursor = 'grabbing';
      const container = document.getElementsByClassName('relation-box')[0];
      let _mousePosition =
          {left: window.scrollX, top: window.scrollY, x: e.clientX, y: e.clientY};
      e.stopImmediatePropagation();

      const mouseMoveHandler = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          const dx = e.clientX - _mousePosition.x;
          const dy = e.clientY - _mousePosition.y;
          _mousePosition.moved = dx * dx + dy * dy > 0;
          
          if (_mousePosition.moved) {
              window.scrollTo(_mousePosition.left - dx,_mousePosition.top - dy);
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

function hidePlusButtonContextMenu(plusButtonContextBox,plusButtonContextMenu,plusButton) {

  if(plusButtonContextBox.style.display === 'block'){

    plusButtonContextBox.style.display = 'none';
    plusButtonContextMenu.style.display = 'none';
    if(plusButton){
      const top = parseInt(plusButton.style.top.split('px')[0]);
      plusButton.innerText = '+';
      plusButton.style.fontSize = '25px';
      plusButton.style.top = `${top + 13}px`;
      plusButton.style.zIndex = 1;
    }
  }
}

function openContextMenu(mouse,path) {
  const contextMenuBox = document.getElementById('context-menu-box');
  const contextMenu = document.getElementById('context-menu');

  contextMenuBox.style.display = 'block';
  contextMenu.style.display = 'block';

  contextMenu.style.top = `${window.scrollY + mouse.y}px`;
  contextMenu.style.left = `${window.scrollX + mouse.x}px`;

  const contextMenuRect = contextMenu.getBoundingClientRect();

  //만약 현재 창의 크기보다 컨텍스메뉴의 끝이 더 길다면
  if(document.body.clientWidth < (contextMenuRect.right + window.scrollX)){
    console.log(document.body.clientWidth,contextMenuRect.right + window.scrollX);
    window.scrollTo({left:(contextMenuRect.left + window.scrollX) - contextMenuRect.width / 2,top:(contextMenuRect.top + window.scrollY) + contextMenuRect.height,behavior: "smooth"});
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