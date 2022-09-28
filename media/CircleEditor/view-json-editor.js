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

            vscode.postMessage({
                command: 'updateJson',
                data: data,
            });
        };
    }

    open() {
        this.close();
        
        vscode.postMessage({
            command: 'loadJson'
        });
    }

    close() {
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

            const calculatorBox = new jsonEditor.Calculator(this._host).render();
            jsonEditorBox.appendChild(calculatorBox[0]);

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
            
            const content = new jsonEditor.content(this._host, item);
            jsonEditorBox.appendChild(content.render());

            jsonEditorBox.style.width = 'min(calc(100% * 0.6), 800px)';
            this._host.document.addEventListener('keydown', this._closeJsonEditorKeyDownHandler);
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

        const content = this._host.document.createElement('textarea');
        content.style.height = '95%';
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

        this._editObject = {
            
        };
        
        this._calculatorBox = this.makeTag('div', 'calculator-box');
        const calculatorNameBox = this.makeTag('div', 'calculator-name-box');
        const calculatorName = this.makeTag('div', 'calculator-name');
        this._toggle = this.makeTag('div', 'toggle-button');

        this._calculatorBox.style.height = "5%";
        
        this._toggle.innerText = '+';
        calculatorName.innerText = 'Calculator';
        calculatorNameBox.appendChild(calculatorName);
        calculatorNameBox.appendChild(this._toggle);
        this._calculatorBox.appendChild(calculatorNameBox);

        this._toggle.addEventListener('click', () => {
            this.toggle();
        });

        this._elements.push(this._calculatorBox);
    }

    toggle() {
        if(this._toggle.innerText === '+') {
            this._toggle.innerText = '-';
            const editBox = this._host.document.getElementById('jsonEditor-content');
            editBox.style.height = '88%';

            const buttonArea = this.makeTag('div', 'button-area');
            this._bufferButton = this.makeTag('div', 'button');
            this._customOptionsButton = this.makeTag('div', 'button');

            this._bufferButton.innerText = 'buffer';
            this._customOptionsButton.innerText = 'custom options';

            buttonArea.appendChild(this._bufferButton);
            buttonArea.appendChild(this._customOptionsButton);
            this._calculatorBox.appendChild(buttonArea);
            
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
            editBox.style.height = '95%';

            this._calculatorBox.style.height = "5%";
            while (this._elements[0].childElementCount > 1) {
                this._elements[0].removeChild(this._elements[0].lastChild);
            }
        }
    }

    buffer() {
        while (this._elements[0].childElementCount > 2) {
            this._elements[0].removeChild(this._elements[0].lastChild);
        }
        this._bufferButton.className = 'button-selected';
        this._customOptionsButton.className = 'button';
        this._calculatorBox.style.height = "120px";
        this._input = this.makeTag('input', 'input');
        this._select = this.makeTag('select', 'select');
        const convert = this.makeTag('div', 'convert-button');
        const clear = this.makeTag('div', 'clear-button');
        this._output = this.makeTag('input', 'input');
        const titleBox = this.makeTag('div', 'title-box');
        const inputBox = this.makeTag('div', 'input-box');
        const inputTitle = this.makeTag('div', 'title');
        const outputTitle = this.makeTag('div', 'title');
        const expanderArea = this.makeTag('div', 'expander-area');
        convert.innerText = 'convert';
        clear.innerText = 'clear';
        inputTitle.innerText = 'input :';
        outputTitle.innerText = 'output :';
        titleBox.appendChild(inputTitle);
        titleBox.appendChild(outputTitle);
        inputBox.appendChild(this._input);
        inputBox.appendChild(this._output);

        this._output.setAttribute('readonly', 'true');

        convert.addEventListener('click', () => {
            this.bufferConvert();
        });

        clear.addEventListener('click', () => {
            this.bufferClear();
        });

        for(const type of tensorType){
            const option = this._host.document.createElement('option');
            option.setAttribute('value', type);
            option.innerText = type.toLowerCase();

            this._select.appendChild(option);
        }

        expanderArea.appendChild(titleBox);
        expanderArea.appendChild(inputBox);
        expanderArea.appendChild(this._select);
        expanderArea.appendChild(convert);
        expanderArea.appendChild(clear);
        this._calculatorBox.appendChild(expanderArea);
    }

    customOptions() {
        while (this._elements[0].childElementCount > 2) {
            this._elements[0].removeChild(this._elements[0].lastChild);
        }
        this._bufferButton.className = 'button';
        this._customOptionsButton.className = 'button-selected';
        const expanderArea = this.makeTag('div', 'expander-area');
        this._inputArea = this.makeTag('div', 'input-area');
        const convert = this.makeTag('div', 'convert-button');
        const clear = this.makeTag('div', 'clear-button');
        const plus = this.makeTag('div', 'plus-button');
        const outputArea = this.makeTag('div', 'output-area');
        const outputTitle = this.makeTag('div', 'title');
        this._customOutput = this.makeTag('input', 'output');
        this._customOutput.setAttribute('id', 'output');

        this._customOutput.setAttribute('readonly', 'true');
        outputTitle.innerText = 'output : ';
        convert.innerText = 'convert';
        clear.innerText = 'clear';
        plus.innerText = '+';

        convert.addEventListener('click', () => {
            this.customOptionsConvert();
        });
        clear.addEventListener('click', () => {
            this.customOptions();
        });
        plus.addEventListener('click', () => {
            this._inputArea.appendChild(this.makeLine());
        });

        this._inputArea.appendChild(this.makeLine());
        outputArea.appendChild(outputTitle);
        outputArea.appendChild(this._customOutput);
        expanderArea.appendChild(this._inputArea);
        expanderArea.appendChild(plus);
        expanderArea.appendChild(convert);
        expanderArea.appendChild(clear);
        this._calculatorBox.appendChild(expanderArea);
        this._calculatorBox.appendChild(outputArea);
    }

    makeLine() {
        const box = this.makeTag('div', 'box');
        const keyName = this.makeTag('div', 'title');
        const valueName = this.makeTag('div', 'title');
        const keyVal = this.makeTag('input', 'custom-input');
        const valueVal = this.makeTag('input', 'custom-input');
        const select = this.makeTag('select', 'select');
        const minus = this.makeTag('div', 'minus-button');
        minus.innerText = '-';

        for(const type of customType){
            const option = this._host.document.createElement('option');
            option.setAttribute('value', type);
            option.innerText = type.toLowerCase();

            select.appendChild(option);
        }

        minus.addEventListener('click', () => {
            if(this._inputArea.childElementCount > 1){
                this._inputArea.removeChild(box);
            }
        });

        keyName.innerText = "key : ";
        valueName.innerText = "value : ";

        box.appendChild(keyName);
        box.appendChild(keyVal);
        box.appendChild(valueName);
        box.appendChild(valueVal);
        box.appendChild(select);
        box.appendChild(minus);

        return box;
    }

    bufferConvert() {
        this._output.value = new jsonEditor.Converter(this._input.value, this._select.value).render();
    }

    customOptionsConvert() {
        this._editObject = new Object;
        for(const child of this._inputArea.childNodes){
            const key = child.childNodes[1].value;
            const value = child.childNodes[3].value;
            const type = child.childNodes[4].value;
            if(key && value){
                this._editObject[key] = [value, type];
            }
            else{
                vscode.postMessage({
                    command: 'alert',
                    text: 'FORMAT ERROR : Please enter commas and numbers only.'
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
        const types = ['float32', 'float16', 'int32', 'uint8', 'int64', 'string', 'bool', 'int16',
        'complex64', 'int8', 'float64', 'complex128', 'uint64', 'resource', 'variant', 'uint32'];
        
        // 0:float, 1:int, 2:uint, 3:string, 4:boolean, 5:complex, 6:resource, 7:variant
        this._bits = [32, 16, 32, 8, 64, 0, 32, 16, 64, 8, 64, 128, 64, 0, 0, 32];
        
        this._typeIndex = types.indexOf(this._type.toLowerCase());
        
        this._arr = this._str.split(',');
        this._result = "";
        if(this._type === 'bool') {
            for (let i = 0; i< this._arr.length; i++) {
                if(this._arr[i].trim().toLowerCase() === 'true') {
                    this._arr[i] = 1;
                } else if(this._arr[i].trim().toLowerCase() === 'false') {
                    this._arr[i] = 0;
                } else {
                    return this._result = "ERROR: Please enter in 'true' or 'false' format for boolean type.";
                }
            }
        }
        for (let i = 0; i < this._arr.length; i++) {
            if(!/^[0-9\\.\-\\/]+$/.test(this._arr[i])) {return this._result = "ERROR: Please enter digits and decimal points only.";}
            let v = this.calculate(parseFloat(this._arr[i]), this._typeIndex, this._bits[this._typeIndex]/8);
            if(!v) {
                return this._result = "ERROR: Data does not match type.";
            }else {
                for (let j = 0; j < v.byteLength; j++) {
                    this._result += v.getUint8(j) +",";
                }
            }
        }
        this._result = this._result.slice(0,-1);
        return this._result;
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