
let currentConfigType = null;
const vscode = acquireVsCodeApi();

this.window.addEventListener('message',(event) => {
  const message = event.data;
  switch (message.command) {
    case 'showMetadata':
      this.updateMetadataInfo(message.metadata);
      vscode.setState({fileUri:message.fileUri, relativePath:message.relativePath});
      break;
    default:
      break;
  }
});

//메타데이터 정보를 업데이트
function updateMetadataInfo(metadata) {
  //메인 키를 꺼낸다.(파일 이름)
  const mainFileName = Object.keys(metadata)[0];
  //메인 키의 value인 메타데이터 정보 객체를 변수에 저장
  const metadataInfo = metadata[mainFileName];

  const mainViewItemBox = document.getElementById('main-view-item-box');

  for (const subKey in metadataInfo){
    if(subKey === 'operations'){
      //서브 키가 operations 정보일 때
      const viewItemBox = document.createElement('div');
      viewItemBox.setAttribute('id','operations-view-item-box');
      viewItemBox.classList.add('view-item-box');

      //헤더생성
      const viewItemHeader = document.createElement('div');
      viewItemHeader.classList.add('view-item-header');
      viewItemHeader.innerText = subKey;

      //showButton 생성(ex: +,-)
      const showButton = document.createElement('div');
      showButton.classList.add('view-item-show-button');
      showButton.setAttribute('id','operations-view-item-show-button');
      showButton.innerText = '-';

      //헤더와 showButton을 담을 헤더박스 생성
      const viewItemHeaderBox = document.createElement('div');
      viewItemHeaderBox.classList.add('view-item-header-box');

      //상위 div에 등록
      viewItemHeaderBox.append(viewItemHeader,showButton);
      viewItemBox.appendChild(viewItemHeaderBox);
      mainViewItemBox.appendChild(viewItemBox);

      //내용을 담을 컨텐트 박스 설정
      const viewItemContentBox = document.createElement('div');
      viewItemContentBox.classList.add('view-item-content-box');
      viewItemContentBox.setAttribute('id','operations-view-content-box');
      viewItemBox.appendChild(viewItemContentBox);
      
  
      for (const operationsKey in metadataInfo[subKey]) {
        metadataDivCreate(operationsKey,metadataInfo[subKey][operationsKey],'operations');
      }
    } else if (subKey === 'cfg_settings'){
      //cfg 정보 일때
      const viewItemBox = document.createElement('div');
      viewItemBox.setAttribute('id','cfg_settings-view-item-box');
      viewItemBox.classList.add('view-item-box');

      //헤더와 showButton을 담을 헤더박스 생성
      const viewItemHeaderBox = document.createElement('div');
      viewItemHeaderBox.classList.add('view-item-header-box');

      //헤더 생성(ex: Common Metadata ...)
      const viewItemHeader = document.createElement('div');
      viewItemHeader.classList.add('view-item-header');
      viewItemHeader.innerText = 'Config Info';

      //showButton 생성(ex: +,-)
      const showButton = document.createElement('div');
      showButton.classList.add('view-item-show-button');
      showButton.setAttribute('id','cfg_settings-view-item-show-button');
      showButton.innerText = '-';

      viewItemHeaderBox.append(viewItemHeader,showButton);
      viewItemBox.appendChild(viewItemHeaderBox);
      mainViewItemBox.appendChild(viewItemBox);

      const viewItemContentBox = document.createElement('div');
      viewItemContentBox.classList.add('view-item-content-box');
      viewItemContentBox.setAttribute('id','cfg_settings-view-content-box');
      viewItemBox.appendChild(viewItemContentBox);
      
      const oneccInfo = metadataInfo[subKey];

      //onecc가 true인 값들을 저장
      const oneccInfoList = [];

      for(const configKey in oneccInfo){

        //header박스 생성
        const viewItemSubHeaderBox = document.createElement('div');
        viewItemSubHeaderBox.classList.add('view-item-header-box');

        //서브 헤더 생성
        const viewItemSubHeader = document.createElement('div');
        viewItemSubHeader.innerText = `[${configKey}]`;
        viewItemSubHeader.classList.add('view-item-sub-header');
        
        //show버튼 생성
        const showButton = document.createElement('div');
        showButton.innerText = `[-]`;
        showButton.classList.add('view-item-show-button');
        showButton.style.fontSize = '14px';
        showButton.setAttribute('id',`${configKey}-view-item-show-button`);

        viewItemSubHeaderBox.append(viewItemSubHeader,showButton);
        viewItemContentBox.appendChild(viewItemSubHeaderBox);
        
        //sub컨텐트박스 만들기
        const subContentBox = document.createElement('div');
        subContentBox.classList.add('sub-view-item-content-box');
        subContentBox.setAttribute('id',`${configKey}-sub-view-content-box`);
        
        viewItemContentBox.appendChild(subContentBox);
        
        //id로 사용할 현재 키를 저장
        currentConfigType = configKey;

        if(configKey === 'onecc'){
          //아무런 onecc 정보가 없을 경우 처리
          const viewItemContent = document.createElement('div');
          viewItemContent.innerText = 'There is no config information...';
          viewItemBox.appendChild(viewItemContent);
          viewItemContent.classList.add('view-item-info-content');
          
          for (const oneccSubkey in oneccInfo[configKey]) {
            
            if(oneccInfo[configKey][oneccSubkey]){
              oneccInfoList.push(oneccSubkey);
              //만약 cfg 정보가 있다면 no info 문구 삭제
              viewItemContent?.remove();
              metadataDivCreate(oneccSubkey,oneccInfo[configKey][oneccSubkey],'cfg_settings');
            }
          }
        } else {
          if(oneccInfoList.includes(configKey)){
            viewItemSubHeader.style.marginTop = '15px';
            for (const oneccSubkey in oneccInfo[configKey]) {
              metadataDivCreate(oneccSubkey,oneccInfo[configKey][oneccSubkey],'cfg_settings');
            }

          } else{
            viewItemSubHeader?.remove();
          }
        }
      }
    } else {
      // 그외 공통 메타데이터 정보 일때
      metadataDivCreate(subKey,metadataInfo[subKey], 'common');
      
    }
  }
  //모든 showButton 클릭 이벤트 등록
  showButtonClickEvent();
}

//해당 메타데이터 정보를 webview에 그린다.
function metadataDivCreate(subKey,value, type) {
    let viewItemContentBox = null;
    let subContentBox = null;
    if(type === 'common'){
      viewItemContentBox = document.getElementById('common-view-content-box');
    } else if (type === 'operations'){
      viewItemContentBox = document.getElementById('operations-view-content-box');
    } else if (type === 'cfg_settings'){
      viewItemContentBox = document.getElementById('cfg_settings-view-content-box');
      subContentBox = document.getElementById(`${currentConfigType}-sub-view-content-box`);
    }

    
    const viewItemContent = document.createElement('div');
    viewItemContent.classList.add('view-item-content');
    const viewItemName = document.createElement('div');
    viewItemName.classList.add('view-item-name');
    viewItemName.innerText = subKey;

    // 만약 해당 키의 값이 다시 object 구조라면 반복문을 돈다.
    if(typeof value === 'object' && value !== null){
      const viewItemValueList = document.createElement('div');
      viewItemValueList.classList.add('view-item-value-list');
      
      for (const key in value) {
        const viewItemValue = document.createElement('div');
        viewItemValue.classList.add('view-item-value');
        viewItemValue.innerText = `${key} : ${value[key]}`;
        //아이템들이 viewer 의 크기가 작아져도 비율에 맞게 작아지도록 설정
        viewItemValue.style.width = 'auto';
        viewItemValue.classList.add('margin-bottom-border-thin-gray');
        viewItemValueList.appendChild(viewItemValue);
      }

      viewItemContent.append(viewItemName,viewItemValueList);
      viewItemContent.classList.add('aline-items-baseline');

    } else {
      
      //단순 string이라면 바로 화면에 보여준다.
      const viewItemValue = document.createElement('div');
      viewItemValue.classList.add('view-item-value');
      viewItemValue.innerText = value;
      viewItemContent.append(viewItemName,viewItemValue);

    }

    if(type === 'cfg_settings'){
      viewItemContent.style.marginBottom = '1px';
      subContentBox.appendChild(viewItemContent);
      
    }else{
      viewItemContentBox.appendChild(viewItemContent);
    }
}



//모든 show버튼 클릭 이벤트 처리
function showButtonClickEvent() {

  const showButtons = document.getElementsByClassName('view-item-show-button');
  let isSubButton = false;

  for (let index = 0; index < showButtons.length; index++) {
    const button = showButtons[index];
    const id = button.getAttribute('id');
    
    button.addEventListener('click',()=>{
      let contentBox = document.getElementById(`${id.split('-view')[0]}-view-content-box`);
      isSubButton = false;
      if(!contentBox){
        contentBox = document.getElementById(`${id.split('-view')[0]}-sub-view-content-box`);
        isSubButton = true;
      }
      
      if(contentBox?.style.display === 'block' || contentBox.style.display === ''){
        isSubButton ? button.innerText = '[+]' : button.innerText = '+';
        contentBox.style.display = 'none';
      }else {
        isSubButton ? button.innerText = '[-]' : button.innerText = '-';
        contentBox.style.display = 'block';
      }
    });
  }
}

