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
        const jsonEditor = this._host.document.getElementById('jsonEditor');
        if (jsonEditor) {
            jsonEditor.innerHTML = '';

            const closeButton = this._host.document.createElement('a');
            closeButton.classList.add('jsonEditor-closebutton');
            closeButton.setAttribute('id', 'jsonEditor-closebutton');
            closeButton.setAttribute('href', 'javascript:void(0)');
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', this._closeJsonEditorHandler);
            jsonEditor.appendChild(closeButton);

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

            jsonEditor.style.width = 'min(calc(100% * 0.6), 800px)';
            this._host.document.addEventListener('keydown', this._closeJsonEditorKeyDownHandler);
        }
        const container = this._host.document.getElementById('graph');
        if (container) {
            container.style.width = 'max(40vw, calc(100vw - 800px))';
        }
    }
};