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
    }

    open() {
        this.close();

        // need to add a postMessage
        // vscode.postMessage({
        //     command: 'json'
        // });
        this._activate();
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

            const content = this._host.document.createElement('div');
            content.setAttribute('id', 'jsonEditor-content');
            content.setAttribute('contenteditable', 'true');
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