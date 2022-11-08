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

sidebar.Sidebar = class {
    constructor(host, id) {
        this._host = host;
        this._id = id ? '-' + id : '';
        this._stack = [];
        this._closeSidebarHandler = () => {
            this._pop();
        };
        this._closeSidebarKeyDownHandler = (e) => {
            if (e.keyCode === 27) {
                e.preventDefault();
                this._pop();
            }
        };
    }

    _getElementById(id) {
        return this._host.document.getElementById(id + this._id);
    }

    open(content, title) {
        this.close();
        this.push(content, title);
    }

    close() {
        this._deactivate();
        this._stack = [];
        this._hide();
    }

    push(content, title) {
        const item = {title: title, content: content};
        this._stack.push(item);
        this._activate(item);
    }

    _pop() {
        // Change the node index shown to null when sidebar is closed
        this._host._viewingNode = null;
        this._deactivate();
        if (this._stack.length > 0) {
            this._stack.pop();
        }
        if (this._stack.length > 0) {
            this._activate(this._stack[this._stack.length - 1]);
        } else {
            this._hide();
        }
    }

    _hide() {
        const sidebar = this._getElementById('sidebar');
        if (sidebar) {
            sidebar.style.width = '0px';
        }
        const container = this._getElementById('graph');
        if (container) {
            container.style.width = '100%';
            container.focus();
        }
    }

    _deactivate() {
        const sidebar = this._getElementById('sidebar');
        if (sidebar) {
            const closeButton = this._getElementById('sidebar-closebutton');
            if (closeButton) {
                closeButton.removeEventListener('click', this._closeSidebarHandler);
                closeButton.style.color = '#f8f8f8';
            }

            this._host.document.removeEventListener('keydown', this._closeSidebarKeyDownHandler);
        }
    }

    _activate(item) {
        const sidebar = this._getElementById('sidebar');
        if (sidebar) {
            sidebar.innerHTML = '';

            const title = this._host.document.createElement('h1');
            title.classList.add('sidebar-title');
            title.innerHTML = item.title ? item.title.toUpperCase() : '';
            sidebar.appendChild(title);

            const closeButton = this._host.document.createElement('a');
            closeButton.classList.add('sidebar-closebutton');
            closeButton.setAttribute('id', 'sidebar-closebutton');
            closeButton.setAttribute('href', 'javascript:void(0)');
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', this._closeSidebarHandler);
            sidebar.appendChild(closeButton);

            const content = this._host.document.createElement('div');
            content.classList.add('sidebar-content');
            content.setAttribute('id', 'sidebar-content');
            sidebar.appendChild(content);

            if (typeof item.content === 'string') {
                content.innerHTML = item.content;
            } else if (item.content instanceof Array) {
                for (const element of item.content) {
                    content.appendChild(element);
                }
            } else {
                content.appendChild(item.content);
            }
            sidebar.style.width = 'min(calc(100% * 0.6), 500px)';
            this._host.document.addEventListener('keydown', this._closeSidebarKeyDownHandler);
        }
        const container = this._getElementById('graph');
        if (container) {
            container.style.width = 'max(40vw, calc(100vw - 500px))';
        }
    }
};

sidebar.NodeSidebar = class {
    constructor(host, node) {
        this._host = host;
        this._node = node;
        this._elements = [];
        this._attributes = [];
        this._inputs = [];
        this._outputs = [];
        this._isCustom = node._isCustom;

        if (node.type) {
            let showDocumentation = null;
            const type = node.type;
            if (type && (type.description || type.inputs || type.outputs || type.attributes)) {
                showDocumentation = {};
                showDocumentation.text = type.nodes ? '\u0192' : '?';
                showDocumentation.callback = () => {
                    this._raise('show-documentation', null);
                };
            }
            this._addProperty(
                'type',
                new sidebar.ValueTextView(
                    this._host, node.type.name, showDocumentation, node, this._isCustom));
            if (node.type.module) {
                this._addProperty(
                    'module', new sidebar.ValueTextView(this._host, node.type.module));
            }
        }

        if (node.name) {
            this._addProperty('name', new sidebar.ValueTextView(this._host, node.name));
        }

        if (node.location) {
            this._addProperty('location', new sidebar.ValueTextView(this._host, node.location));
        }

        if (node.description) {
            this._addProperty(
                'description', new sidebar.ValueTextView(this._host, node.description));
        }

        if (node.device) {
            this._addProperty('device', new sidebar.ValueTextView(this._host, node.device));
        }

        const attributes = node.attributes;
        if (attributes && attributes.length > 0) {
            const attributesElements =
                new sidebar.EditAttributesView(host, node, this._isCustom).render();
            for (const attributesElement of attributesElements) {
                this._elements.push(attributesElement);
            }
        }

        const inputs = node.inputs;
        if (inputs && inputs.length > 0) {
            const inputsElements =
                new sidebar.EditInputsView(host, inputs, this._isCustom, this._node).render();
            for (const inputsElement of inputsElements) {
                this._elements.push(inputsElement);
            }
        }

        const outputs = node.outputs;
        if (outputs && outputs.length > 0) {
            const outputsElements =
                new sidebar.EditOutputsView(host, outputs, this._isCustom, this._node).render();
            for (const outputsElement of outputsElements) {
                this._elements.push(outputsElement);
            }
        }

        const separator = this._host.document.createElement('div');
        separator.className = 'sidebar-view-separator';
        this._elements.push(separator);
    }

    render() {
        return this._elements;
    }

    _addHeader(title) {
        const headerElement = this._host.document.createElement('div');
        headerElement.className = 'sidebar-view-header';
        headerElement.innerText = title;
        this._elements.push(headerElement);
    }

    _addProperty(name, value) {
        const item = new sidebar.NameValueView(this._host, name, value);
        this._elements.push(item.render());
    }

    toggleInput(name) {
        for (const input of this._inputs) {
            if (name === input.name) {
                input.toggle();
            }
        }
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
};

// NOTE : New class for Circle Editor
sidebar.EditAttributesView = class {
    constructor(host, node, isCustom) {
        this._host = host;
        this._node = node;
        this._elements = [];
        this._attributes = [];
        this._isCustom = isCustom;
        this._attributesBox = host.document.createElement('div');

        this._editObject = {
            name: 'custom',
            _attribute: {},
            _nodeIdx: parseInt(this._node.location),
            _subgraphIdx: this._node._subgraphIdx
        };

        const sortedAttributes = node.attributes.slice();
        sortedAttributes.sort((a, b) => {
            const au = a.name.toUpperCase();
            const bu = b.name.toUpperCase();
            return (au < bu) ? -1 : (au > bu) ? 1 : 0;
        });
        this._addHeader('Attributes');
        let index = 0;
        for (const attribute of sortedAttributes) {
            this._addAttribute(attribute.name, attribute, index);
            index++;
        }
        if (isCustom === true) {
            const addAttribute = this._host.document.createElement('div');
            addAttribute.className = 'sidebar-view-item-value-add';
            addAttribute.innerText = '+ New Attributes';
            addAttribute.addEventListener('click', () => {
                this.add();
            });
            this._attributesBox.appendChild(addAttribute);
            this._elements.push(this._attributesBox);
        }
    }

    _addHeader(title) {
        const headerElement = this._host.document.createElement('div');
        headerElement.className = 'sidebar-view-header';
        headerElement.innerText = title;
        this._elements.push(headerElement);
    }

    _addAttribute(name, attribute, index) {
        const item =
            new NodeAttributeView(this._host, attribute, this._isCustom, index, this._node);
        item.on('show-graph', (sender, graph) => {
            this._raise('show-graph', graph);
        });
        const view = new sidebar.NameValueView(this._host, name, item, index, 'attribute');
        this._attributes.push(view);
        if (this._isCustom === true) {
            this._attributesBox.appendChild(view.render());
        } else {
            this._elements.push(view.render());
        }
    }

    add() {
        this._editObject._attribute.name = this._node.type.name;
        const keys = [];
        for (const key of this._node.attributes) {
            keys.push(key.name);
            this._editObject._attribute[key.name] = key.value;
            this._editObject._attribute[key.name + '_type'] = key.type;
        }
        keys.push('attribute');
        this._editObject._attribute['attribute'] = 'value';
        this._editObject._attribute['attribute_type'] = 'string';
        this._editObject._attribute.keys = keys;

        vscode.postMessage({
            command: 'edit',
            type: 'attribute',
            data: this._editObject,
        });
    }

    render() {
        return this._elements;
    }
};

// NOTE : New class for Circle Editor
sidebar.EditInputsView = class {
    constructor(host, inputs, isCustom, node) {
        this._host = host;
        this._elements = [];
        this._inputs = [];
        this._isCustom = isCustom;
        this._node = node;

        this._addHeader('Inputs');
        for (const input of inputs) {
            this._addInput(input.name, input);
        }
    }

    _addHeader(title) {
        const headerElement = this._host.document.createElement('div');
        headerElement.className = 'sidebar-view-header';
        headerElement.innerText = title;
        this._elements.push(headerElement);
    }

    _addInput(name, input) {
        if (input.arguments.length > 0) {
            const inputAttributes = {
                title: 'input',
                index: this._inputs.length,
                this: this._isCustom,
                name: name,
                nodeIdx: this._node._location,
                subgraphIdx: this._node._subgraphIdx,
                visible: true,
            };

            const view = new sidebar.ParameterView(this._host, input, inputAttributes);
            view.on('export-tensor', (sender, tensor) => {
                this._raise('export-tensor', tensor);
            });
            view.on('error', (sender, tensor) => {
                this._raise('error', tensor);
            });
            const item =
                new sidebar.NameValueView(this._host, name, view, this._inputs.length, 'input');
            this._inputs.push(item);
            this._elements.push(item.render());
        }
    }

    render() {
        return this._elements;
    }
};

// NOTE : New class for Circle Editor
sidebar.EditOutputsView = class {
    constructor(host, outputs, isCustom, node) {
        this._host = host;
        this._elements = [];
        this._outputs = [];
        this._isCustom = isCustom;
        this._node = node;

        this._addHeader('Outputs');
        for (const output of outputs) {
            this._addOutput(output.name, output);
        }
    }

    _addHeader(title) {
        const headerElement = this._host.document.createElement('div');
        headerElement.className = 'sidebar-view-header';
        headerElement.innerText = title;
        this._elements.push(headerElement);
    }

    _addOutput(name, output) {
        if (output.arguments.length > 0) {
            const inputAttributes = {
                title: 'output',
                index: this._outputs.length,
                this: this._isCustom,
                name: name,
                nodeIdx: this._node._location,
                subgraphIdx: this._node._subgraphIdx,
                visible: true,
            };
            const view = new sidebar.ParameterView(this._host, output, inputAttributes);
            const item =
                new sidebar.NameValueView(this._host, name, view, this._outputs.length, 'output');
            this._outputs.push(item);
            this._elements.push(item.render());
        }
    }

    render() {
        return this._elements;
    }
};

sidebar.NameValueView = class {
    constructor(host, name, value, index, title) {
        this._host = host;
        this._name = name;
        this._value = value;

        const nameElement = this._host.document.createElement('div');
        nameElement.className = 'sidebar-view-item-name';

        const nameInputElement = this._host.document.createElement('input');
        nameInputElement.setAttribute('id', title + index);
        nameInputElement.setAttribute('type', 'text');
        nameInputElement.setAttribute('value', name);
        nameInputElement.setAttribute('title', name);
        nameInputElement.disabled = true;
        nameElement.appendChild(nameInputElement);

        const valueElement = this._host.document.createElement('div');
        valueElement.className = 'sidebar-view-item-value-list';

        for (const element of value.render()) {
            valueElement.appendChild(element);
        }

        this._element = this._host.document.createElement('div');
        this._element.className = 'sidebar-view-item';
        this._element.appendChild(nameElement);
        this._element.appendChild(valueElement);
    }

    get name() {
        return this._name;
    }

    render() {
        return this._element;
    }

    toggle() {
        this._value.toggle();
    }
};

sidebar.ValueTextView = class {
    constructor(host, value, action, node, isCustom) {
        this._host = host;
        this._elements = [];
        const element = this._host.document.createElement('div');
        element.className = 'sidebar-view-item-value';
        this._elements.push(element);
        this._node = node;
        if (node) {
            this._type = node.type;
            this._editObject = {
                name: 'custom',
                _attribute: {},
                _nodeIdx: parseInt(this._node.location),
                _subgraphIdx: this._node._subgraphIdx
            };
        }

        if (action) {
            this._action = this._host.document.createElement('div');
            this._action.className = 'sidebar-view-item-value-expander';
            this._action.innerHTML = action.text;
            this._action.addEventListener('click', () => {
                action.callback();
            });
            element.appendChild(this._action);
        }

        const list = Array.isArray(value) ? value : [value];
        let className = 'sidebar-view-item-value-line';
        if (isCustom === true && this._type) {
            for (const item of list) {
                const line = this._host.document.createElement('div');
                this._input = this._host.document.createElement('input');
                this._editButton = this._host.document.createElement('div');
                this._saveButton = this._host.document.createElement('div');
                this._cancelButton = this._host.document.createElement('div');
                this._input.className = 'sidebar-view-item-value-line-input';
                this._editButton.className =
                    'sidebar-view-item-value-expander codicon codicon-edit';
                this._saveButton.className =
                    'sidebar-view-item-value-expander codicon codicon-save';
                this._cancelButton.className =
                    'sidebar-view-item-value-expander codicon codicon-discard';
                this._input.value = item;
                this._input.disabled = true;
                this._saveButton.setAttribute('style', 'display: none;');
                this._cancelButton.setAttribute('style', 'display: none;');
                line.appendChild(this._input);
                line.appendChild(this._editButton);
                line.appendChild(this._cancelButton);
                line.appendChild(this._saveButton);
                element.appendChild(line);
                className = 'sidebar-view-item-value-line-border';

                this._editButton.addEventListener('click', () => {
                    this.edit();
                });

                this._saveButton.addEventListener('click', () => {
                    this.save();
                });

                this._cancelButton.addEventListener('click', () => {
                    this.cancel();
                });
            }
        } else {
            for (const item of list) {
                const line = this._host.document.createElement('div');
                line.className = className;
                line.innerText = item;
                element.appendChild(line);
                className = 'sidebar-view-item-value-line-border';
            }
        }
    }

    edit() {
        this._input.disabled = false;
        this._editButton.setAttribute('style', 'display: none;');
        this._saveButton.setAttribute('style', 'display: ;');
        this._cancelButton.setAttribute('style', 'display: ;');
    }

    save() {
        this._editObject._attribute.name = this._input.value;
        const keys = [];
        for (const key of this._node.attributes) {
            keys.push(key.name);
            this._editObject._attribute[key.name] = key.value;
            this._editObject._attribute[key.name + '_type'] = key.type;
        }
        this._editObject._attribute.keys = keys;

        vscode.postMessage({
            command: 'edit',
            type: 'attribute',
            data: this._editObject,
        });
    }

    cancel() {
        this._input.disabled = true;
        this._editButton.setAttribute('style', 'display: ;');
        this._saveButton.setAttribute('style', 'display: none;');
        this._cancelButton.setAttribute('style', 'display: none;');
        this._input.value = this._type.name;
    }

    render() {
        return this._elements;
    }

    toggle() {}
};

NodeAttributeView = class {
    constructor(host, attribute, isCustom, index, node) {
        this._host = host;
        this._attribute = attribute;
        this._element = this._host.document.createElement('div');
        this._element.className = 'sidebar-view-item-value';
        this._isCustom = isCustom;
        this._attributeName = '';
        this._index = index;
        this._node = node;
        this._line;
        this._select;

        this._editObject = {
            name: '',
            _attribute: {},
            _nodeIdx: parseInt(this._node.location),
            _subgraphIdx: this._node._subgraphIdx
        };

        if (isCustom) {
            this._editObject.name = 'custom';
        } else {
            this._editObject.name = node.type.name;
        }

        this.show();
    }

    show() {
        const type = this._attribute.type;
        const value = this._attribute._value;
        if (type) {
            this._expander = this._host.document.createElement('div');
            this._edit = this._host.document.createElement('div');
            this._expander.className =
                'sidebar-view-item-value-expander codicon codicon-chevron-down';
            this._edit.className = 'sidebar-view-item-value-expander codicon codicon-edit';
            this._expander.addEventListener('click', () => {
                this.toggle();
            });
            this._edit.addEventListener('click', () => {
                this.edit();
            });
            this._element.appendChild(this._expander);
            this._element.appendChild(this._edit);
        } else {
            this._edit = this._host.document.createElement('div');
            this._edit.className = 'sidebar-view-item-value-edit codicon codicon-edit';
            this._edit.addEventListener('click', () => {
                this.edit();
            });
            this._element.appendChild(this._edit);
        }

        let content = new sidebar.Formatter(value, type).toString();
        if (content) {
            content = content.length > 1000 ? content.substring(0, 1000) + '\u2026' : content;
            content = content.split('<').join('&lt;').split('>').join('&gt;');
        }
        const line = this._host.document.createElement('div');
        line.className = 'sidebar-view-item-value-line';
        line.innerHTML = content ? content : '&nbsp;';
        this._element.appendChild(line);
    }

    toggle() {
        if (this._expander.className ===
            'sidebar-view-item-value-expander codicon codicon-chevron-down') {
            this._expander.className =
                'sidebar-view-item-value-expander codicon codicon-chevron-up';

            const typeLine = this._host.document.createElement('div');
            typeLine.className = 'sidebar-view-item-value-line-border';
            const type = this._attribute.type;
            const value = this._attribute.value;
            if (type === 'tensor' && value && value.type) {
                typeLine.innerHTML = 'type: ' +
                    '<code><b>' + value.type.toString() + '</b></code>';
                this._element.appendChild(typeLine);
            } else {
                typeLine.innerHTML = 'type: ' +
                    '<code><b>' + this._attribute.type + '</b></code>';
                this._element.appendChild(typeLine);
            }

            const description = this._attribute.description;
            if (description) {
                const descriptionLine = this._host.document.createElement('div');
                descriptionLine.className = 'sidebar-view-item-value-line-border';
                descriptionLine.innerHTML = description;
                this._element.appendChild(descriptionLine);
            }

            if (this._attribute.type === 'tensor' && value) {
                const state = value.state;
                const valueLine = this._host.document.createElement('div');
                valueLine.className = 'sidebar-view-item-value-line-border';
                const contentLine = this._host.document.createElement('pre');
                contentLine.innerHTML = state || value.toString();
                valueLine.appendChild(contentLine);
                this._element.appendChild(valueLine);
            }
        } else {
            this._expander.className =
                'sidebar-view-item-value-expander codicon codicon-chevron-down';
            while (this._element.childElementCount > 3) {
                this._element.removeChild(this._element.lastChild);
            }
        }
    }

    edit() {
        while (this._element.childElementCount) {
            this._element.removeChild(this._element.lastChild);
        }
        const type = this._attribute.type;

        if (this._isCustom === true) {
            const input = this._host.document.getElementById('attribute' + this._index);
            input.disabled = false;
            this._attributeName = input.value;
        }

        this._save = this._host.document.createElement('div');
        this._cancel = this._host.document.createElement('div');
        this._remove = this._host.document.createElement('div');
        this._save.className = 'sidebar-view-item-value-save codicon codicon-save';
        this._cancel.className = 'sidebar-view-item-value-cancel codicon codicon-discard';
        this._remove.className = 'sidebar-view-item-value-remove codicon codicon-trash';
        this._save.addEventListener('click', (e) => {
            e.preventDefault();
            this.save();
        });
        this._cancel.addEventListener('click', () => {
            this.cancel();
        });
        this._remove.addEventListener('click', () => {
            this.remove();
        });
        if (this._isCustom === true) {
            this._element.appendChild(this._remove);
        }
        this._element.appendChild(this._cancel);
        this._element.appendChild(this._save);

        const value = this._attribute.value;

        let content = new sidebar.Formatter(value, type).toString();
        if (content) {
            content = content.length > 1000 ? content.substring(0, 1000) + '\u2026' : content;
            content = content.split('<').join('&lt;').split('>').join('&gt;');
        }
        let line;
        if (optionValues[type]) {
            line = this._host.document.createElement('select');
            for (const options of optionValues[type]) {
                const option = this._host.document.createElement('option');
                option.setAttribute('value', options);
                option.innerText = options;
                if (options.toLowerCase() === content.toLowerCase()) {
                    option.setAttribute('selected', 'selected');
                }
                line.appendChild(option);
            }
            line.setAttribute('name', type);
            line.className = 'sidebar-view-item-value-line-select';
        } else {
            line = this._host.document.createElement('input');
            line.setAttribute('type', 'text');
            line.className = 'sidebar-view-item-value-line-input';
            line.setAttribute('value', content ? content : '&nbsp;');
        }
        this._line = line;
        this._element.appendChild(line);

        if (type) {
            const typeLine = this._host.document.createElement('div');
            typeLine.className = 'sidebar-view-item-value-line-border';
            if (!this._isCustom) {
                if (type === 'tensor' && value && value.type) {
                    typeLine.innerHTML = 'type: ' +
                        '<code><b>' + value.type.toString() + '</b></code>';
                    this._element.appendChild(typeLine);
                } else {
                    typeLine.innerHTML = 'type: ' +
                        '<code><b>' + type + '</b></code>';
                    this._element.appendChild(typeLine);
                }
            } else {
                typeLine.innerHTML = 'type: ';
                this._select = this._host.document.createElement('select');
                this._select.className = 'sidebar-view-item-value-line-type-select';
                for (const type of customType) {
                    const option = this._host.document.createElement('option');
                    option.setAttribute('value', type);
                    option.innerText = type.toLowerCase();
                    if (type.toLowerCase() === type) {
                        option.setAttribute('selected', 'selected');
                    }
                    this._select.appendChild(option);
                }
                typeLine.appendChild(this._select);
                this._element.appendChild(typeLine);
            }

            const description = this._attribute.description;
            if (description) {
                const descriptionLine = this._host.document.createElement('div');
                descriptionLine.className = 'sidebar-view-item-value-line-border';
                descriptionLine.innerHTML = description;
                this._element.appendChild(descriptionLine);
            }
        }

        if (type === 'tensor' && value) {
            const state = value.state;
            const valueLine = this._host.document.createElement('div');
            valueLine.className = 'sidebar-view-item-value-line-border';
            const contentLine = this._host.document.createElement('pre');
            contentLine.innerHTML = state || value.toString();
            valueLine.appendChild(contentLine);
            this._element.appendChild(valueLine);
        }
    }

    save() {
        if (this._attribute._type === 'int32') {
            if (this._line.value - 0 > 2147483648) {
                vscode.postMessage({command: 'alert', text: 'Can\'t exceed 2,147,483,648'});
                return;
            }
        }

        if (this._isCustom === true) {
            const input = this._host.document.getElementById('attribute' + this._index);
            if (this._select.value === 'int') {
                if (this._line.value - 0 > 2147483648) {
                    vscode.postMessage({command: 'alert', text: 'Can\'t exceed 2,147,483,648'});
                    return;
                }
            }
            input.disabled = true;
            this._attribute._name = input.value;
            this._attribute._type = this._select.value;
            this._attribute._value = this._line.value;
        }

        while (this._element.childElementCount) {
            this._element.removeChild(this._element.lastChild);
        }

        if (!this._isCustom) {
            this._editObject._attribute.name = this._attribute.name;
            this._editObject._attribute._value = this._line.value;
            this._editObject._attribute._type = this._attribute.type;
        } else {
            this._editObject._attribute.name = this._node.type.name;
            const keys = [];
            for (const key of this._node.attributes) {
                keys.push(key.name);
                this._editObject._attribute[key.name] = key.value;
                this._editObject._attribute[key.name + '_type'] = key.type;
            }
            this._editObject._attribute.keys = keys;
        }

        vscode.postMessage({
            command: 'edit',
            type: 'attribute',
            data: this._editObject,
        });
    }

    cancel() {
        if (this._isCustom === true) {
            const input = this._host.document.getElementById('attribute' + this._index);
            input.disabled = true;
            input.value = this._attributeName;
        }
        while (this._element.childElementCount) {
            this._element.removeChild(this._element.lastChild);
        }

        this.show();
    }

    remove() {
        const input = this._host.document.getElementById('attribute' + this._index);
        const box = input.parentElement.parentElement.parentElement;
        const element = input.parentElement.parentElement;
        box.removeChild(element);
        for (const i in this._node._attributes) {
            if (this._node._attributes[i].name === this._attribute.name) {
                this._node._attributes.splice(i, 1);
                break;
            }
        }

        this._editObject._attribute.name = this._node.type.name;
        const keys = [];
        for (const key of this._node.attributes) {
            keys.push(key.name);
            this._editObject._attribute[key.name] = key.value;
            this._editObject._attribute[key.name + '_type'] = key.type;
        }
        this._editObject._attribute.keys = keys;

        vscode.postMessage({
            command: 'edit',
            type: 'attribute',
            data: this._editObject,
        });
    }

    render() {
        return [this._element];
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
}

sidebar.ParameterView = class {
    constructor(host, tensors, ioAttributes) {
        this._elements = [];
        this._items = [];

        for (const argument of tensors.arguments) {
            const item = new sidebar.ArgumentView(host, argument, tensors, ioAttributes);
            item.on('export-tensor', (sender, tensor) => {
                this._raise('export-tensor', tensor);
            });
            item.on('error', (sender, tensor) => {
                this._raise('error', tensor);
            });
            this._items.push(item);
            this._elements.push(item.render());
        }
    }

    render() {
        return this._elements;
    }

    toggle() {
        for (const item of this._items) {
            item.toggle();
        }
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
};

sidebar.ArgumentView = class {
    constructor(host, argument, tensors, ioAttributes) {
        this._host = host;
        this._argument = argument;
        this._select;
        this._shape;
        this._data;
        this._index = ioAttributes.index;
        this._isCustom = ioAttributes.isCustom;
        this._tensors = tensors;
        this._title = ioAttributes.title;

        this._editObject = {
            _name: ioAttributes.name,
            _visible: ioAttributes.visible,
            _arguments: JSON.parse(JSON.stringify(argument)),
            _subgraphIdx: ioAttributes.subgraphIdx,
            _nodeIdx: ioAttributes.nodeIdx,
        };

        this._element = this._host.document.createElement('div');
        this._element.className = 'sidebar-view-item-value';

        const initializer = argument.initializer;
        if (initializer) {
            this._element.classList.add('sidebar-view-item-value-dark');
        }

        this.show(initializer);
    }

    render() {
        return this._element;
    }

    toggle() {
        if (this._expander) {
            if (this._expander.className ===
                'sidebar-view-item-value-expander codicon codicon-chevron-down') {
                this._expander.className =
                    'sidebar-view-item-value-expander codicon codicon-chevron-up';

                const initializer = this._argument.initializer;
                if (this._hasId && this._hasKind) {
                    const kindLine = this._host.document.createElement('div');
                    kindLine.className = 'sidebar-view-item-value-line-border';
                    kindLine.innerHTML = 'kind: ' +
                        '<b>' + initializer.kind + '</b>';
                    this._element.appendChild(kindLine);
                }
                let type = null;
                let denotation = null;
                if (this._argument.type) {
                    type = this._argument.type.toString();
                    denotation = this._argument.type.denotation || null;
                }
                if (type && (this._hasId || this._hasKind)) {
                    const typeLine = this._host.document.createElement('div');
                    typeLine.className = 'sidebar-view-item-value-line-border';
                    typeLine.innerHTML = 'type: <code><b>' +
                        type.split('<').join('&lt;').split('>').join('&gt;') + '</b></code>';
                    this._element.appendChild(typeLine);
                }
                if (denotation) {
                    const denotationLine = this._host.document.createElement('div');
                    denotationLine.className = 'sidebar-view-item-value-line-border';
                    denotationLine.innerHTML = 'denotation: <code><b>' + denotation + '</b></code>';
                    this._element.appendChild(denotationLine);
                }

                const description = this._argument.description;
                if (description) {
                    const descriptionLine = this._host.document.createElement('div');
                    descriptionLine.className = 'sidebar-view-item-value-line-border';
                    descriptionLine.innerHTML = description;
                    this._element.appendChild(descriptionLine);
                }

                const quantization = this._argument.quantization;
                if (quantization) {
                    const quantizationLine = this._host.document.createElement('div');
                    quantizationLine.className = 'sidebar-view-item-value-line-border';
                    const content = !Array.isArray(quantization) ?
                        quantization :
                        '<br><br>' + quantization.map((value) => '    ' + value).join('<br>');
                    quantizationLine.innerHTML =
                        '<span class=\'sidebar-view-item-value-line-content\'>quantization: ' +
                        '<b>' + content + '</b></span>';
                    this._element.appendChild(quantizationLine);
                }

                if (this._argument.location !== undefined) {
                    const location = this._host.document.createElement('div');
                    location.className = 'sidebar-view-item-value-line-border';
                    location.innerHTML = 'location: ' +
                        '<b>' + this._argument.location + '</b>';
                    this._element.appendChild(location);
                }

                if (initializer) {
                    const contentLine = this._host.document.createElement('pre');
                    const valueLine = this._host.document.createElement('div');
                    try {
                        const state = initializer.state;
                        if (state === null && this._host.save && initializer.type.dataType &&
                            initializer.type.dataType !== '?' && initializer.type.shape &&
                            initializer.type.shape
                                .dimensions /*&& initializer.type.shape.dimensions.length > 0*/) {
                            this._saveButton = this._host.document.createElement('div');
                            this._saveButton.className = 'sidebar-view-item-value-expander';
                            this._saveButton.innerHTML = '&#x1F4BE;';
                            this._saveButton.addEventListener('click', () => {
                                this._raise('export-tensor', initializer);
                            });
                            this._element.appendChild(this._saveButton);
                        }

                        valueLine.className = 'sidebar-view-item-value-line-border';
                        contentLine.innerHTML = state || initializer.toString();
                    } catch (err) {
                        contentLine.innerHTML = err.toString();
                        this._raise('error', err);
                    }
                    valueLine.appendChild(contentLine);
                    this._element.appendChild(valueLine);
                }
            } else {
                this._expander.className =
                    'sidebar-view-item-value-expander codicon codicon-chevron-down';
                while (this._element.childElementCount > 3) {
                    this._element.removeChild(this._element.lastChild);
                }
            }
        }
    }

    show(initializer) {
        const quantization = this._argument.quantization;
        const type = this._argument.type;
        const location = this._argument.location !== undefined;
        if (type || initializer || quantization || location) {
            this._expander = this._host.document.createElement('div');
            this._edit = this._host.document.createElement('div');
            this._expander.className =
                'sidebar-view-item-value-expander codicon codicon-chevron-down';
            this._edit.className = 'sidebar-view-item-value-edit codicon codicon-edit';
            this._expander.addEventListener('click', () => {
                this.toggle();
            });
            this._edit.addEventListener('click', () => {
                this.edit();
            });
            this._element.appendChild(this._expander);
            this._element.appendChild(this._edit);
        }

        let name = this._argument.name || '';
        this._hasId = name ? true : false;
        this._hasKind = initializer && initializer.kind ? true : false;
        if (this._hasId || (!this._hasKind && !type)) {
            this._hasId = true;
            const nameLine = this._host.document.createElement('div');
            nameLine.className = 'sidebar-view-item-value-line';
            if (typeof name !== 'string') {
                throw new Error('Invalid argument identifier \'' + JSON.stringify(name) + '\'.');
            }
            name = name.split('\n').shift();  // custom argument id
            name = name || ' ';
            nameLine.innerHTML = '<span class=\'sidebar-view-item-value-line-content\'>name: <b>' +
                name + '</b></span>';
            this._element.appendChild(nameLine);
        } else if (this._hasKind) {
            const kindLine = this._host.document.createElement('div');
            kindLine.className = 'sidebar-view-item-value-line';
            kindLine.innerHTML = 'kind: <b>' + initializer.kind + '</b>';
            this._element.appendChild(kindLine);
        } else if (type) {
            const typeLine = this._host.document.createElement('div');
            typeLine.className = 'sidebar-view-item-value-line-border';
            typeLine.innerHTML = 'type: <code><b>' +
                type.toString().split('<').join('&lt;').split('>').join('&gt;') + '</b></code>';
            this._element.appendChild(typeLine);
        }
    }

    edit() {
        while (this._element.childElementCount) {
            this._element.removeChild(this._element.lastChild);
        }

        if (this._isCustom === true) {
            const input = this._host.document.getElementById(this._title + this._index);
            input.disabled = false;
            this._attributeName = input.value;
        }

        const initializer = this._argument.initializer;
        const quantization = this._argument.quantization;
        let type = this._argument.type;
        const location = this._argument.location !== undefined;
        if (type || initializer || quantization || location) {
            this._save = this._host.document.createElement('div');
            this._cancel = this._host.document.createElement('div');
            this._save.className = 'sidebar-view-item-value-save codicon codicon-save';
            this._cancel.className = 'sidebar-view-item-value-cancel codicon codicon-discard';
            this._save.addEventListener('click', () => {
                this.save();
            });
            this._cancel.addEventListener('click', () => {
                this.cancel();
            });
            this._element.appendChild(this._cancel);
            this._element.appendChild(this._save);
        }

        let name = this._argument.name || '';
        this._hasId = name ? true : false;
        this._hasKind = initializer && initializer.kind ? true : false;
        if (this._hasId || (!this._hasKind && !type)) {
            this._hasId = true;
            const nameLine = this._host.document.createElement('div');
            const nameValue = this._host.document.createElement('input');
            nameValue.setAttribute('type', 'text');
            nameLine.className = 'sidebar-view-item-value-line';
            nameValue.className = 'sidebar-view-item-value-line-inputs';
            if (typeof name !== 'string') {
                throw new Error('Invalid argument identifier \'' + JSON.stringify(name) + '\'.');
            }
            name = name.split('\n').shift();  // custom argument id
            name = name || ' ';
            nameValue.setAttribute('value', name);
            nameLine.innerHTML =
                '<span class=\'sidebar-view-item-value-line-content\'>name: </span>';
            nameLine.appendChild(nameValue);
            this._element.appendChild(nameLine);
        } else if (this._hasKind) {
            const kindLine = this._host.document.createElement('div');
            kindLine.className = 'sidebar-view-item-value-line';
            kindLine.innerHTML = 'kind: <b>' + initializer.kind + '</b>';
            this._element.appendChild(kindLine);
        } else if (type) {
            const typeLine = this._host.document.createElement('div');
            typeLine.className = 'sidebar-view-item-value-line-border';
            typeLine.innerHTML = 'type: <code><b>' +
                type.toString().split('<').join('&lt;').split('>').join('&gt;') + '</b></code>';
            this._element.appendChild(typeLine);
        }
        if (this._hasId && this._hasKind) {
            const kindLine = this._host.document.createElement('div');
            kindLine.className = 'sidebar-view-item-value-line-border';
            kindLine.innerHTML = 'kind: ' +
                '<b>' + initializer.kind + '</b>';
            this._element.appendChild(kindLine);
        }
        let denotation = null;
        if (this._argument.type) {
            type = this._argument.type.toString();
            denotation = this._argument.type.denotation || null;
        }
        if (type && (this._hasId || this._hasKind)) {
            const typeLine = this._host.document.createElement('div');
            const typeSelect = this._host.document.createElement('select');
            const shape = this._host.document.createElement('input');
            typeLine.className = 'sidebar-view-item-value-line-border';
            typeSelect.className = 'sidebar-view-item-value-line-type-select';
            shape.className = 'sidebar-view-item-value-line-shape-input';
            this._select = typeSelect;
            this._shape = shape;
            typeLine.innerText = 'type: ';
            shape.setAttribute('value', this._argument.type.shape.dimensions.toString());
            for (const type of tensorType) {
                const option = this._host.document.createElement('option');
                option.setAttribute('value', type);
                option.innerText = type.toLowerCase();
                if (type.toLowerCase() === this._argument.type.dataType) {
                    option.setAttribute('selected', 'selected');
                }
                typeSelect.appendChild(option);
            }
            typeLine.appendChild(typeSelect);
            typeLine.appendChild(shape);
            this._element.appendChild(typeLine);
        }
        if (denotation) {
            const denotationLine = this._host.document.createElement('div');
            denotationLine.className = 'sidebar-view-item-value-line-border';
            denotationLine.innerHTML = 'denotation: <code><b>' + denotation + '</b></code>';
            this._element.appendChild(denotationLine);
        }

        const description = this._argument.description;
        if (description) {
            const descriptionLine = this._host.document.createElement('div');
            descriptionLine.className = 'sidebar-view-item-value-line-border';
            descriptionLine.innerHTML = description;
            this._element.appendChild(descriptionLine);
        }

        if (quantization) {
            const quantizationLine = this._host.document.createElement('div');
            quantizationLine.className = 'sidebar-view-item-value-line-border';
            const content = !Array.isArray(quantization) ?
                quantization :
                '<br><br>' + quantization.map((value) => '    ' + value).join('<br>');
            quantizationLine.innerHTML =
                '<span class=\'sidebar-view-item-value-line-content\'>quantization: ' +
                '<b>' + content + '</b></span>';
            this._element.appendChild(quantizationLine);
        }

        if (this._argument.location !== undefined) {
            const location = this._host.document.createElement('div');
            location.className = 'sidebar-view-item-value-line-border';
            location.innerHTML = 'location: ' +
                '<b>' + this._argument.location + '</b>';
            this._element.appendChild(location);
        }

        if (initializer) {
            const contentLine = this._host.document.createElement('textarea');
            const valueLine = this._host.document.createElement('div');
            try {
                const state = initializer.state;
                if (state === null && this._host.save && initializer.type.dataType &&
                    initializer.type.dataType !== '?' && initializer.type.shape &&
                    initializer.type.shape
                        .dimensions /*&& initializer.type.shape.dimensions.length > 0*/) {
                    this._saveButton = this._host.document.createElement('div');
                    this._saveButton.className = 'sidebar-view-item-value-expander';
                    this._saveButton.innerHTML = '&#x1F4BE;';
                    this._saveButton.addEventListener('click', () => {
                        this._raise('export-tensor', initializer);
                    });
                    this._element.appendChild(this._saveButton);
                }
                this._data = contentLine;
                valueLine.className = 'sidebar-view-item-value-line-border';
                contentLine.className = 'sidebar-view-item-value-line-textarea';
                contentLine.innerHTML = state || initializer.toString();
                contentLine.style.height = 150 + contentLine.scrollHeight + 'px';
            } catch (err) {
                contentLine.innerHTML = err.toString();
                this._raise('error', err);
            }
            valueLine.appendChild(contentLine);
            this._element.appendChild(valueLine);
        }
    }

    save() {
        const currentType = this._select.value.toLowerCase();

        if (!this.check()) {
            vscode.postMessage(
                {command: 'alert', text: 'FORMAT ERROR : Please enter commas and numbers only.'});
            return;
        }

        let shape = this._shape.value;
        shape = '{ "data": [' + shape + '] }';

        try {
            shape = JSON.parse(shape).data;
        } catch (err) {
            vscode.postMessage({
                command: 'alert',
                text: 'VALIDATION ERROR : Please check your buffer data again.'
            });
            return;
        }

        this._editObject._arguments._isChanged = true;

        if (this._argument._initializer) {
            const originalType = this._argument._type.dataType;

            let result;

            if (!this._data) {
                result = false;
            } else if (
                currentType === originalType && shape === this._argument._type._shape._dimensions) {
                this.editBufferData(this._data.value, currentType, shape);
                result = true;
            } else {
                result = this.changeBufferType(currentType, this._data.value, shape);
            }

            if (!result) {
                vscode.postMessage({
                    command: 'alert',
                    text: 'VALIDATION ERROR : Please check your buffer data again.'
                });
                return;
            }
        } else {
            this._editObject._arguments._initializer = null;
        }

        this._editObject._arguments._type._dataType = currentType;
        this._editObject._arguments._type._shape._dimensions = shape;

        const nameValue = this._element.childNodes[2].lastChild.value;
        this._editObject._arguments._name = nameValue;

        if (this._isCustom === true) {
            const input = this._host.document.getElementById(this._title + this._index);
            input.disabled = true;
            this._tensors._name = input.value;
        }

        vscode.postMessage({command: 'edit', type: 'tensor', data: this._editObject});
    }

    cancel() {
        if (this._isCustom === true) {
            const input = this._host.document.getElementById('input' + this._index);
            input.disabled = true;
        }

        while (this._element.childElementCount) {
            this._element.removeChild(this._element.lastChild);
        }
        const initializer = this._argument.initializer;
        this.show(initializer);
    }

    check() {
        for (const ch of this._shape.value) {
            if (ch !== ',' && (ch > '9' || ch < '0')) {
                return false;
            }
        }
        return true;
    }

    // 'data' is string formatted even they are numbers
    storeData(buf, data, dataType) {
        let dataLength = dataType === 'int64' ? bufferArr.length * 2 : bufferArr.length;
        for (let i = 0; i < dataLength; i++) {
            var buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            switch (dataType) {
                case 'float32':
                    view.setFloat32(0, parseFloat(data[i]), true);
                    for (let j = 0; j < 4; j++) {
                        buf[i * 4 + j] = view.getUint8(j);
                    }
                    break;
                case 'float16':
                    view.setFloat16(0, parseFloat(data[i]), true);
                    for (let j = 0; j < 2; j++) {
                        buf[i * 2 + j] = view.getUint8(j);
                    }
                    break;
                case 'int32':
                    view.setInt32(0, parseInt(data[i]), true);
                    for (let j = 0; j < 4; j++) {
                        buf[i * 4 + j] = view.getUint8(j);
                    }
                    break;
                case 'uint8':
                    view.setUint8(0, parseUint(data[i]), true);
                    buf[i] = view.getUint8(0);
                    break;
                case 'int64':
                    view.setBigInt64(0, BigInt(parseInt(data[i])), true);
                    for (let j = 0; j < 4; j++) {
                        buf[i * 4 + j] = view.getUint8(j);
                    }
                    break;
                case 'boolean':
                    if (data[i] === 'false' || data[i] - 0 === 0) {
                        buf[i] = 0;
                    } else {
                        buf[i] = 1;
                    }
                    break;
                case 'int16':
                    view.setInt16(0, parseInt(data[i]), true);
                    for (let j = 0; j < 2; j++) {
                        buf[i * 2 + j] = view.getUint8(j);
                    }
                    break;
                case 'int8':
                    view.setInt8(0, parseInt(data[i]), true);
                    buf[i] = view.getUint8(0);
                    break;
                case 'float64':
                    view.setFloat64(0, parseFloat(data[i]), true);
                    for (let j = 0; j < 8; j++) {
                        buf[i * 8 + j] = view.getUint8(j);
                    }
                    break;
                default:  // TODO Enable other types uint32, uint64, string
                    break;
            }
        }
    }

    removeBracket(str) {
        str = str.replace(/\[/g, '');
        str = str.replace(/\]/g, '');
        str = str.replace(/\n/g, '');
        str = str.replace(/ /g, '');
        str = str.replace(/\{/g, '');
        str = str.replace(/\}/g, '');
        str = str.replace(/"/g, '');
        str = str.replace(/:/g, '');
        str = str.replace(/low/g, '');
        str = str.replace(/high/g, '');
        const arr = str.split(',');
        return arr;
    }

    parseBufData(bufData, shape, type) {
        /* data validation - bracket check */
        const stack = [];
        for (let i = 0; i < bufData.length; i++) {
            if (bufData.charAt(i) === '[') {
                stack.push('[');
            } else if (bufData.charAt(i) === ']') {
                if (stack[stack.length - 1] === '[') {
                    stack.pop();
                } else {
                    // alert(error! Brackets do not match);
                    return [];
                }
            }
        }
        if (stack.length) {
            // alert(error! Brackets do not match);
            return [];
        }


        /* parse data to string array */
        var dataArr = this.removeBracket(bufData);


        /* data validation - shape count */
        let shapeCnt = 1;
        for (let i = 0; i < shape.length; i++) {
            shapeCnt *= shape[i];
        }
        if (type === 'int64') {
            shapeCnt *= 2;
        }
        if (dataArr.length !== shapeCnt) {
            // alert(error! Shape and data count does not match);
            return [];
        }

        return dataArr;
    }

    editBufferData(bufData, currentType, shape) {
        const dataArr = this.parseBufData(bufData, shape, currentType);

        if (dataArr.length === 0) {
            vscode.postMessage({command: 'alert', text: 'Validation Error!'});
            return;
        }

        this.storeData(
            dataArr, this._editObject._arguments._initializer._data, currentType.toLowerCase());
    }

    // Data can be changed according to the types
    // e.g. int32 <--> float32
    changeBufferType(newType, bufData, shape) {
        const dataArr = this.parseBufData(bufData, shape, newType);

        if (dataArr.length === 0) {
            return false;
        }

        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);

        let newArray = [];

        if (newType.startsWith('float')) {
            const bits = Number(newType.slice(-2));

            for (let i = 0; i < dataArr.length; i++) {
                const data = parseFloat(dataArr[i]);

                if (isNaN(data)) {
                    return false;
                } else if (bits === 16) {
                    view.setFloat16(0, data, true);
                } else if (bits === 32) {
                    view.setFloat32(0, data, true);
                } else if (bits === 64) {
                    view.setFloat64(0, data, true);
                }

                for (let j = 0; j < bits / 8; j++) {
                    newArray.push(view.getUint8(j));
                }
            }
        } else if (newType.startsWith('int')) {
            let bits = Number(newType.slice(-2));

            for (let i = 0; i < dataArr.length; i++) {
                const data = parseInt(dataArr[i]);

                if (isNaN(data)) {
                    return false;
                } else if (bits === 16) {
                    view.setInt16(0, data, true);
                } else if (bits === 32) {
                    view.setInt32(0, data, true);
                } else if (bits === 64) {
                    view.setBigInt64(0, BigInt(data), true);
                } else {
                    bits = Number(newType.slice(-1));

                    if (bits === 8) {
                        view.setInt8(0, data, true);
                    }
                }
                for (let j = 0; j < bits / 8; j++) {
                    newArray.push(view.getUint8(j));
                }
            }
        } else if (newType.startsWith('uint')) {
            let bits = Number(newType.slice(-2));

            for (let i = 0; i < dataArr.length; i++) {
                const data = parseInt(dataArr[i]);

                if (data < 0) {
                    return false;
                }

                if (isNaN(data)) {
                    return false;
                } else if (bits === 32) {  // uint32
                    // TODO Support uint32
                } else if (bits === 64) {  // uint64
                    // TODO Support uint64
                } else {
                    bits = Number(newType.slice(-1));

                    if (bits === 8) {  // uint8
                        view.setUint8(0, data, true);
                    }
                }
                for (let j = 0; j < bits / 8; j++) {
                    newArray.push(view.getUint8(j));
                }
            }
        } else if (newType === 'boolean') {
            for (let i = 0; i < dataArr.length; i++) {
                if (dataArr[i]) {
                    newArray.push(1);
                } else {
                    newArray.push(0);
                }
            }
        }

        this._editObject._arguments._initializer._data = newArray;

        return true;
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
};

sidebar.ModelSidebar = class {
    constructor(host, model, graph) {
        this._host = host;
        this._model = model;
        this._elements = [];

        if (model.format) {
            this._addProperty('format', new sidebar.ValueTextView(this._host, model.format));
        }
        if (model.producer) {
            this._addProperty('producer', new sidebar.ValueTextView(this._host, model.producer));
        }
        if (model.source) {
            this._addProperty('source', new sidebar.ValueTextView(this._host, model.source));
        }
        if (model.name) {
            this._addProperty('name', new sidebar.ValueTextView(this._host, model.name));
        }
        if (model.version) {
            this._addProperty('version', new sidebar.ValueTextView(this._host, model.version));
        }
        if (model.description) {
            this._addProperty(
                'description', new sidebar.ValueTextView(this._host, model.description));
        }
        if (model.author) {
            this._addProperty('author', new sidebar.ValueTextView(this._host, model.author));
        }
        if (model.company) {
            this._addProperty('company', new sidebar.ValueTextView(this._host, model.company));
        }
        if (model.license) {
            this._addProperty('license', new sidebar.ValueTextView(this._host, model.license));
        }
        if (model.domain) {
            this._addProperty('domain', new sidebar.ValueTextView(this._host, model.domain));
        }
        if (model.imports) {
            this._addProperty('imports', new sidebar.ValueTextView(this._host, model.imports));
        }
        if (model.runtime) {
            this._addProperty('runtime', new sidebar.ValueTextView(this._host, model.runtime));
        }

        const metadata = model.metadata;
        if (metadata) {
            for (const property of model.metadata) {
                this._addProperty(
                    property.name, new sidebar.ValueTextView(this._host, property.value));
            }
        }

        const graphs = Array.isArray(model.graphs) ? model.graphs : [];
        if (graphs.length > 1) {
            const graphSelector = new sidebar.SelectView(this._host, model.graphs, graph);
            graphSelector.on('change', (sender, data) => {
                this._raise('update-active-graph', data);
            });
            this._addProperty('subgraph', graphSelector);
        }

        if (graph) {
            if (graph.version) {
                this._addProperty('version', new sidebar.ValueTextView(this._host, graph.version));
            }
            if (graph.type) {
                this._addProperty('type', new sidebar.ValueTextView(this._host, graph.type));
            }
            if (graph.tags) {
                this._addProperty('tags', new sidebar.ValueTextView(this._host, graph.tags));
            }
            if (graph.description) {
                this._addProperty(
                    'description', new sidebar.ValueTextView(this._host, graph.description));
            }
            if (Array.isArray(graph.inputs) && graph.inputs.length > 0) {
                this._addHeader('Inputs');
                for (const input of graph.inputs) {
                    this.addArgument(input.name, input);
                }
            }
            if (Array.isArray(graph.outputs) && graph.outputs.length > 0) {
                this._addHeader('Outputs');
                for (const output of graph.outputs) {
                    this.addArgument(output.name, output);
                }
            }
        }

        const separator = this._host.document.createElement('div');
        separator.className = 'sidebar-view-separator';
        this._elements.push(separator);
    }

    render() {
        return this._elements;
    }

    _addHeader(title) {
        const headerElement = this._host.document.createElement('div');
        headerElement.className = 'sidebar-view-header';
        headerElement.innerText = title;
        this._elements.push(headerElement);
    }

    _addProperty(name, value) {
        const item = new sidebar.NameValueView(this._host, name, value);
        this._elements.push(item.render());
    }

    addArgument(name, argument) {
        const attributes = {
            title: 'model',
            index: 0,
            this: false,
            name: name,
            nodeIdx: 0,
            subgraphIdx: 0,
            visible: false,
        };
        const view = new sidebar.ParameterView(this._host, argument, attributes);
        view.toggle();
        const item = new sidebar.NameValueView(this._host, name, view);
        this._elements.push(item.render());
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
};
