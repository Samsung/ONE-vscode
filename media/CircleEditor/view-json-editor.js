var jsonEditor = jsonEditor || {};
var vscode = vscode || {};

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

        // need to add a postMessage
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
            jsonEditor.appendChild(applyButton);

            const content = this._host.document.createElement('textarea');
            content.style.height = 'calc(100% - 5px)';
            content.style.width = 'calc(100% - 0px)';
            content.setAttribute('id', 'jsonEditor-content');

            content.value = item;
            jsonEditor.appendChild(content);

            jsonEditorBox.style.width = 'min(calc(100% * 0.6), 800px)';
            this._host.document.addEventListener('keydown', this._closeJsonEditorKeyDownHandler);
        }
        const container = this._host.document.getElementById('graph');
        if (container) {
            container.style.width = 'max(40vw, calc(100vw - 800px))';
        }
    }
};

jsonEditor.Calculator = class {
    constructor(host) {
        this._host = host;
        this._elements = [];
        
        this._calculatorBox = host.document.createElement('div');
        const calculatorNameBox = host.document.createElement('div');
        const calculatorName = host.document.createElement('div');
        this._toggle = host.document.createElement('div');
        this._calculatorBox.className = 'calculator-box';
        calculatorName.className = 'calculator-name';
        this._toggle.className = 'toggle-button';
        calculatorNameBox.className = 'calculator-name-box';
        
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

            this._input = this._host.document.createElement('input');
            this._select = this._host.document.createElement('select');
            this._convert = this._host.document.createElement('div');
            this._output = this._host.document.createElement('div');
            const inputBox = this._host.document.createElement('div');
            inputBox.className = 'input-box';
            this._input.className = 'input';
            this._select.className = 'select';
            this._convert.className = 'convert-button';
            this._output.className = 'output';
            this._convert.innerText = 'convert';
            this._output.innerText = 'output : ';

            this._convert.addEventListener('click', () => {
                this.convert();
            });

            for(const type of tensorType){
                const option = this._host.document.createElement('option');
                option.setAttribute('value', type);
                option.innerText = type.toLowerCase();

                this._select.appendChild(option);
            }

            inputBox.appendChild(this._input);
            inputBox.appendChild(this._select);
            inputBox.appendChild(this._convert);
            this._calculatorBox.appendChild(inputBox);
            this._calculatorBox.appendChild(this._output);
        } else {
            this._toggle.innerText = '+';
            while (this._elements[0].childElementCount > 1) {
                this._elements[0].removeChild(this._elements[0].lastChild);
            }
        }
    }

    convert() {
        this._output.innerText = 'output : ' + new jsonEditor.Converter(this._input.value, this._select.value).render();
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