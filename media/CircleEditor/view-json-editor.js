var jsonEditor = jsonEditor || {};
var vscode = vscode || {};
var tensorType = tensorType || {};
var customType = customType || {};

jsonEditor.jsonEditor = class {

  constructor(host, id) {
    this._host = host;
    this._id = id ? ('-' + id) : '';
    this._closeJsonEditorHandler = () => {
      this.close();
    };
    this._closeJsonEditorKeyDownHandler = (e) => {
      if (e.keyCode === 27) {
        e.preventDefault();
        this.close();
      }
    };

    this._applyEditHandler = (e) => {
      e.preventDefault();
      const value = this._host.document.getElementById('jsonEditor-content');
      const data = value.value;
      this._host._view._jsonEditorOpened = false;
      vscode.postMessage({
        command: 'updateJson',
        data: data,
      });
    };
  }

  open() {
    this.close();
    this._host._view._jsonEditorOpened = true;
    vscode.postMessage({
      command: 'loadJson'
    });
  }

  close() {
    this._host._view._jsonEditorOpened = false;
    this._deactivate();
    this._hide();
  }

  _hide() {
    const jsonEditor = this._host.document.getElementById('jsonEditor');
    if (jsonEditor) {
      jsonEditor.style.width = '0px';
    }
    const container = this._host.document.getElementById('graph');
    if (container) {
      container.style.width = '100%';
      container.focus();
    }
  }

  _deactivate() {
    const jsonEditor = this._host.document.getElementById('jsonEditor');
    if (jsonEditor) {
      const closeButton = this._host.document.getElementById('jsonEditor-closebutton');
      if (closeButton) {
        closeButton.removeEventListener('click', this._closeJsonEditorHandler);
        closeButton.style.color = '#f8f8f8';
      }
      const applyButton = this._host.document.getElementById('jsonEditor-applybutton');
      if (applyButton) {
        applyButton.removeEventListener('click', this._applyEditHandler);
      }

      this._host.document.removeEventListener('keydown', this._closeJsonEditorKeyDownHandler);
    }
  }

  _activate(item) {
    const jsonEditorBox = this._host.document.getElementById('jsonEditor');
    if (jsonEditorBox) {
      jsonEditorBox.innerHTML = '';

      const closeButton = this._host.document.createElement('a');
      closeButton.classList.add('jsonEditor-closebutton');
      closeButton.setAttribute('id', 'jsonEditor-closebutton');
      closeButton.setAttribute('href', 'javascript:void(0)');
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', this._closeJsonEditorHandler);
      jsonEditorBox.appendChild(closeButton);

      const applyButton = this._host.document.createElement('button');
      applyButton.classList.add('jsonEditor-applybutton');
      applyButton.setAttribute('id', 'jsonEditor-applybutton');
      applyButton.addEventListener('click', this._applyEditHandler);
      applyButton.innerHTML = 'apply';
      jsonEditorBox.appendChild(applyButton);

			const title = this._host.document.createElement('div');
			title.classList.add('json-editor-title');

			const titleText = this._host.document.createElement('p');
			titleText.classList.add('json-editor-title-text');
			titleText.innerHTML = 'JSON Editor';

			title.appendChild(titleText);
			jsonEditorBox.appendChild(title);
      
      const content = new jsonEditor.content(this._host, item);
      jsonEditorBox.appendChild(content.render());

      jsonEditorBox.style.width = 'min(calc(100% * 0.6), 800px)';
      this._host.document.addEventListener('keydown', this._closeJsonEditorKeyDownHandler);

      const calculatorBox = new jsonEditor.Calculator(this._host).render();
      jsonEditorBox.appendChild(calculatorBox[0]);
    }
    const container = this._host.document.getElementById('graph');
    if (container) {
      container.style.width = 'max(40vw, calc(100vw - 800px))';
    }
  }
};

jsonEditor.content = class {
  constructor(host, item) {
    this._host = host;
    this._item = item;
    this._elements = [];

    this._tabEvent = (value) => {
      event.preventDefault();
      if (event.keyCode === 9) {
        const tab = '\t';
        value.selection = this._host.document.selection.createRange();
        value.selection.text = tab;
        event.returnValue = false;
      }
    };

    const content = this._host.document.createElement('textarea');
    content.style.height = 'calc(95% - 22px)';
    content.style.width = 'calc(100% - 6px)';
    content.setAttribute('id', 'jsonEditor-content');
    content.style.resize = 'none';
    content.value = item;

    content.addEventListener('keydown', (e) => {
      if (e.keyCode === 9) {
        e.preventDefault();
        const tab = '  ';
        const value = e.target.value;
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        e.target.value = value.substring(0, start) + tab + value.substring(end);
        e.target.selectionEnd = start+tab.length;
        return;
      }
    });

    this._elements.push(content);
  }

  render() {
    return this._elements[0];
  }
};

jsonEditor.Calculator = class {
  constructor(host) {
    this._host = host;
    this._elements = [];

    this._editObject = {};
    
    this._jsonEditorBox = this._host.document.getElementById('jsonEditor');
    this._calculatorBox = this.makeTag('div', 'calculator-box');
    const calculatorNameBox = this.makeTag('div', 'calculator-name-box');
    const calculatorName = this.makeTag('div', 'calculator-name');
    this._toggle = this.makeTag('div', 'toggle-button');
    const navigator = this.makeTag('div', 'navigator');
    const buttonArea = this.makeTag('div', 'button-area');
    this._bufferButton = this.makeTag('div', 'button');
    this._customOptionsButton = this.makeTag('div', 'button');

    this._calculatorBox.style.height = "5%";
    
    this._toggle.innerText = '+';
    calculatorName.innerText = 'Calculator';
    navigator.appendChild(calculatorNameBox);
    calculatorNameBox.appendChild(calculatorName);
    calculatorNameBox.appendChild(this._toggle);

    this._bufferButton.innerText = 'Buffer';
    this._customOptionsButton.innerText = 'Custom';

    buttonArea.appendChild(this._bufferButton);
    buttonArea.appendChild(this._customOptionsButton);
    navigator.appendChild(buttonArea);
    this._calculatorBox.appendChild(navigator);

    this._toggle.addEventListener('click', () => {
      this.toggle();
    });

    this._elements.push(this._calculatorBox);
  }

  toggle() {
    if(this._toggle.innerText === '+') {
      this._toggle.innerText = '-';
      const editBox = this._host.document.getElementById('jsonEditor-content');
      editBox.style.height = '58%';
      const div = this.makeTag('div');
      this._jsonEditorBox.appendChild(div);
      
      this.buffer();

      this._bufferButton.addEventListener('click', () => {
        this.buffer();
      });

      this._customOptionsButton.addEventListener('click', () => {
        this.customOptions();
      });
    } else {
      this._toggle.innerText = '+';

      const editBox = this._host.document.getElementById('jsonEditor-content');
      editBox.style.height = 'calc(95% - 22px)';

      this._calculatorBox.style.height = "5%";
			
			while (this._jsonEditorBox.childElementCount > 5) {
				this._jsonEditorBox.removeChild(this._jsonEditorBox.lastChild);
			}
		}
  }

  buffer() {
    while (this._elements[0].childElementCount > 1) {
      this._elements[0].removeChild(this._elements[0].lastChild);
    }
    this._jsonEditorBox.removeChild(this._jsonEditorBox.lastChild);
    this._bufferButton.className = 'button-selected';
    this._customOptionsButton.className = 'button';
    this._calculatorBox.style.height = "calc(30% - 22px)";
    const expanderArea = this.makeTag('div', 'expander-area');
    const titleArea = this.makeTag('div', 'title-area');
    const inputTitle = this.makeTag('div', 'title');
    const convert = this.makeTag('div', 'convert-button');
    const inputArea = this.makeTag('div', 'input-area');
    const valueArea = this.makeTag('div', 'value-area');
    const typeArea = this.makeTag('div', 'type-area');
    const valueTitle = this.makeTag('div', 'input-title');
    const typeTitle = this.makeTag('div', 'input-title');
    this._input = this.makeTag('input', 'input');
    this._select = this.makeTag('select', 'select');
    const outputArea = this.makeTag('div', 'output-area');
    const outputTitle = this.makeTag('div', 'output-title');
    const outputLine = this.makeTag('div', 'output-line');
    const clear = this.makeTag('div', 'clear-button');
    this._output = this.makeTag('input', 'output');
    const copy = this.makeTag('div', 'copy-button');
    convert.innerText = 'Convert';
    clear.innerText = 'Clear';
    inputTitle.innerText = 'Input ';
    outputTitle.innerText = 'Output ';
    copy.innerText = '📋️';
    valueTitle.innerText = 'Value';
    typeTitle.innerText = 'Type';
    
    titleArea.appendChild(inputTitle);
    titleArea.appendChild(convert);
    expanderArea.appendChild(titleArea);
    valueArea.appendChild(valueTitle);
    valueArea.appendChild(this._input);
    typeArea.appendChild(typeTitle);
    typeArea.appendChild(this._select);
    inputArea.appendChild(valueArea);
    inputArea.appendChild(typeArea);
    expanderArea.appendChild(inputArea);
    outputArea.appendChild(outputTitle);
    outputLine.appendChild(this._output);
    outputLine.appendChild(copy);
    outputLine.appendChild(clear);
    outputArea.appendChild(outputLine);
    this._calculatorBox.appendChild(expanderArea);
    this._jsonEditorBox.appendChild(outputArea);

    this._output.setAttribute('readonly', 'true');

    convert.addEventListener('click', () => {
      this.bufferConvert();
    });

    clear.addEventListener('click', () => {
      this.bufferClear();
    });

    copy.addEventListener('click', () => {
      this.bufferCopy();
    });

    for(const type of tensorType){
      const option = this._host.document.createElement('option');
      option.setAttribute('value', type);
      option.innerText = type.toLowerCase();

      this._select.appendChild(option);
    }
  }

  customOptions() {
    while (this._elements[0].childElementCount > 1) {
      this._elements[0].removeChild(this._elements[0].lastChild);
    }
    this._jsonEditorBox.removeChild(this._jsonEditorBox.lastChild);
    this._bufferButton.className = 'button';
    this._customOptionsButton.className = 'button-selected';
    const expanderArea = this.makeTag('div', 'expander-area');
    const titleArea = this.makeTag('div', 'title-area');
    const inputTitle = this.makeTag('div', 'title');
    const convert = this.makeTag('div', 'convert-button');
    this._inputArea = this.makeTag('div', 'custom-input-area');
    const inputTitleLine = this.makeTag('div', 'input-title-line');
    const keyTitle = this.makeTag('div', 'custom-input-title');
    const valueTitle = this.makeTag('div', 'custom-input-title');
    const typeTitle = this.makeTag('div', 'custom-select-title');
    const minus = this.makeTag('div', 'minus-button');
    const plus = this.makeTag('div', 'plus-button');
    const outputArea = this.makeTag('div', 'output-area');
    const outputTitle = this.makeTag('div', 'output-title');
    const outputLine = this.makeTag('div', 'output-line');
    const clear = this.makeTag('div', 'clear-button');
    this._customOutput = this.makeTag('input', 'output');
    this._customOutput.setAttribute('id', 'output');
    const copy = this.makeTag('div', 'copy-button');
    minus.setAttribute('style', 'visibility: hidden');

    convert.innerText = 'Convert';
    inputTitle.innerText = 'Input ';
    keyTitle.innerText = 'Key';
    valueTitle.innerText = 'Value';
    typeTitle.innerText = 'Type';
    clear.innerText = 'Clear';
    outputTitle.innerText = 'Output ';
    minus.innerText = '-';
    copy.innerText = '📋️';

    this._customOutput.setAttribute('readonly', 'true');
    plus.innerText = '+ New Attributes';

    convert.addEventListener('click', () => {
      this.customOptionsConvert();
    });
    clear.addEventListener('click', () => {
      this.customOptions();
    });
    plus.addEventListener('click', () => {
      this._inputArea.appendChild(this.makeLine());
    });
    copy.addEventListener('click', () => {
      this.customOptionsCopy();
    });

    titleArea.appendChild(inputTitle);
    titleArea.appendChild(convert);
    expanderArea.appendChild(titleArea);
    inputTitleLine.appendChild(keyTitle);
    inputTitleLine.appendChild(valueTitle);
    inputTitleLine.appendChild(typeTitle);
    inputTitleLine.appendChild(minus);
    this._inputArea.appendChild(inputTitleLine);
    expanderArea.appendChild(this._inputArea);
    outputArea.appendChild(outputTitle);
    outputLine.appendChild(this._customOutput);
    outputLine.appendChild(copy);
    outputLine.appendChild(clear);
    outputArea.appendChild(outputLine);
    this._jsonEditorBox.appendChild(outputArea);
    

    this._inputArea.appendChild(this.makeLine());
    expanderArea.appendChild(this._inputArea);
    expanderArea.appendChild(plus);
    this._calculatorBox.appendChild(expanderArea);
  }

  makeLine() {
    const inputLine = this.makeTag('div', 'input-line');
    const key = this.makeTag('input', 'custom-input');
    const value = this.makeTag('input', 'custom-input');
    const select = this.makeTag('select', 'custom-select');
    const minus = this.makeTag('div', 'minus-button');
    minus.innerText = '-';

    for(const type of customType){
      const option = this._host.document.createElement('option');
      option.setAttribute('value', type);
      option.innerText = type.toLowerCase();

      select.appendChild(option);
    }

    minus.addEventListener('click', () => {
      this._inputArea.removeChild(inputLine);
    });
    
    inputLine.appendChild(key);
    inputLine.appendChild(value);
    inputLine.appendChild(select);
    inputLine.appendChild(minus);

    return inputLine;
  }

  bufferConvert() {
    this._output.value = new jsonEditor.Converter(this._input.value, this._select.value).render();
  }

  customOptionsConvert() {
    this._editObject = new Object;
    for(let i = 1 ; i < this._inputArea.childElementCount ; i++){
      const key = this._inputArea.childNodes[i].childNodes[0].value;
      const value = this._inputArea.childNodes[i].childNodes[1].value;
      const type = this._inputArea.childNodes[i].childNodes[2].value;
      if(key && value) {
        this._editObject[key] = [value, type];
      } else {
        vscode.postMessage({
          command: 'alert',
          text: 'FORMAT ERROR : Please enter key and value.'
        });
        return;
      }
    }

    vscode.postMessage({
      command: 'requestEncodingData',
      data : this._editObject
    });
  }

  bufferClear() {
    this._input.value = '';
    this._output.value = '';
  }

  bufferCopy() {
    this._output.select();
    document.execCommand('copy');
    this._output.setSelectionRange(0, 0);
  }

  customOptionsCopy() {
    this._customOutput.select();
    document.execCommand('copy');
    this._customOutput.setSelectionRange(0, 0);
  }

  makeTag(tag, className) {
    const temp = this._host.document.createElement(tag);
    if(className){
      temp.className = className;
    }

    return temp;
  }

  render() {
    return this._elements;
  }
};

jsonEditor.Converter = class {

  constructor(str, type) {
    this._str = str;
    this._type = type;

    this.calc();
  }

  calc() {
    const types = ['float32', 'float16', 'int32', 'uint8', 'int64', 'string', 'bool', 'int16', 'complex64', 'int8', 'float64', 'complex128', 'uint64', 'resource', 'variant', 'uint32'];
        
    // 0:float, 1:int, 2:uint, 3:string, 4:boolean, 5:complex, 6:resource, 7:variant
    this._bits = [32, 16, 32, 8, 64, 0, 8, 16, 64, 8, 64, 128, 64, 0, 0, 32];
        
    this._typeIndex = types.indexOf(this._type.toLowerCase());
        
    this._arr = this._str.split(',');
    this._result = "";
    if (this._type.toLowerCase() === 'bool') {
      for (let i = 0; i < this._arr.length; i++) {
        if (this._arr[i].trim().toLowerCase() === 'true') {
          this._result += "1, ";
        } else if (this._arr[i].trim().toLowerCase() === 'false') {
          this._result += "0, ";
        } else {
          return this._result = "ERROR: Please enter in 'true' or 'false' format for boolean type.";
        }
      }
      this._result = this._result.slice(0, -2);
      return this._result;
    } else {
      for (let i = 0; i < this._arr.length; i++) {
        if (!/^[0-9\\.\-\\/]+$/.test(this._arr[i].trim())) { return this._result = "ERROR: Please enter digits and decimal points only."; }
        let v = this.calculate(parseFloat(this._arr[i]), this._typeIndex, this._bits[this._typeIndex] / 8);
        if (!v) {
          return this._result = "ERROR: Data does not match type.";
        } else {
          for (let j = 0; j < v.byteLength; j++) {
            this._result += v.getUint8(j) + ", ";
          }
        }
      }
      this._result = this._result.slice(0, -2);
      return this._result;
    }
  }

  calculate(num, c, b) {

    var buffer = new ArrayBuffer(b);
    var view = new DataView(buffer);

    switch (c) {
      case 0:
        view.setFloat32(0, num, true);
        break;
      case 1:
        view.setFloat16(0, num, true);
        break;
      case 2:
        view.setInt32(0, num, true);
        break;
      case 3:
        if(num < 0) { return; }
        view.setUint8(0, num, true);
        break;
      case 4:
        view.setBigInt64(0, BigInt(parseInt(String(num))), true);
        break;
      case 5:
        break;
      case 6:
        view.setInt32(0, num, true);
        break;
      case 7:
        view.setInt16(0, num, true);
        break;
      case 8:
        break;
      case 9:
        view.setInt8(0, num, true);
        break;
      case 10:
        view.setFloat64(0, num, true);
        break;
      case 11:
        break;
      case 12:
        if(num < 0) { return; }
        view.setBigUint64(0, BigInt(parseInt(String(num))), true);
        break;
      case 13:
        break;
      case 14:
        break;
      case 15:
        if(num < 0) { return; }
        view.setUInt32(0, num, true);
        break;
    }

    return view;
  }

  render() {
    return this._result;
  }
};
