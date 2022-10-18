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
/*
 * MIT License
 *
 * Copyright (c) Lutz Roeder
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// This file referenced
// https://github.com/lutzroeder/netron/blob/ae449ff55642636e6a1eef092eda34ffcba1c684/source/view-sidebar.js

var sidebar = sidebar || {};
var base = base || require('./external/base');

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
            const inputsElements = new sidebar.EditInputsView(host, inputs, this._isCustom, this._node).render();
            for(const inputsElement of inputsElements){
                this._elements.push(inputsElement);
            }
        }

        const outputs = node.outputs;
        if (outputs && outputs.length > 0) {
            const outputsElements = new sidebar.EditOutputsView(host, outputs, this._isCustom, this._node).render();
            for(const outputsElement of outputsElements){
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
            addAttribute.addEventListener(
                'click',
                () => {
                    // TODO will be implement
                    // this.add();
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

sidebar.EditInputsView = class {
    constructor(host, inputs, isCustom, node) {
        this._host = host;
        this._elements = [];
        this._inputs = [];
        this._index = 0;
        this._isCustom = isCustom;
        this._node = node;

        this._addHeader('Inputs');
        for (const input of inputs) {
            this._addInput(input.name, input);
            this._index++;
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
                index: this._index,
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
            const item = new sidebar.NameValueView(this._host, name, view, this._index, 'input');
            this._inputs.push(item);
            this._elements.push(item.render());
        }
    }
    
    render() {
        return this._elements;
    }
}

sidebar.EditOutputsView = class {
    constructor(host, outputs, isCustom, node) {
        this._host = host;
        this._elements = [];
        this._outputs = [];
        this._isCustom = isCustom;
        this._index = 0;
        this._node = node;

        this._addHeader('Outputs');
        for (const output of outputs) {
            this._addOutput(output.name, output);
            this._index++;
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
                index: this._index,
                this: this._isCustom,
                name: name,
                nodeIdx: this._node._location,
                subgraphIdx: this._node._subgraphIdx,
                visible: true,
            };
            const view = new sidebar.ParameterView(this._host, output, inputAttributes);
            const item = new sidebar.NameValueView(this._host, name, view, this._index, 'output');
            this._outputs.push(item);
            this._elements.push(item.render());
        }
    }
    
    render() {
        return this._elements;
    }
}

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

sidebar.SelectView = class {
    constructor(host, values, selected) {
        this._host = host;
        this._elements = [];
        this._values = values;

        const selectElement = this._host.document.createElement('select');
        selectElement.setAttribute('class', 'sidebar-view-item-select');
        selectElement.addEventListener('change', (e) => {
            this._raise('change', this._values[e.target.selectedIndex]);
        });
        this._elements.push(selectElement);

        for (const value of values) {
            const optionElement = this._host.document.createElement('option');
            optionElement.innerText = value.name || '';
            if (value === selected) {
                optionElement.setAttribute('selected', 'selected');
            }
            selectElement.appendChild(optionElement);
        }
    }

    render() {
        return this._elements;
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

class NodeAttributeView {
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

sidebar.DocumentationSidebar = class {
    constructor(host, metadata) {
        this._host = host;
        this._metadata = metadata;
    }

    render() {
        if (!this._elements) {
            this._elements = [];

            const type = sidebar.DocumentationSidebar.formatDocumentation(this._metadata);

            const element = this._host.document.createElement('div');
            element.setAttribute('class', 'sidebar-view-documentation');

            this._append(element, 'h1', type.name);

            if (type.summary) {
                this._append(element, 'p', type.summary);
            }

            if (type.description) {
                this._append(element, 'p', type.description);
            }

            if (Array.isArray(type.attributes) && type.attributes.length > 0) {
                this._append(element, 'h2', 'Attributes');
                const attributes = this._append(element, 'dl');
                for (const attribute of type.attributes) {
                    this._append(
                        attributes, 'dt',
                        attribute.name +
                            (attribute.type ? ': <tt>' + attribute.type + '</tt>' : ''));
                    this._append(attributes, 'dd', attribute.description);
                }
                element.appendChild(attributes);
            }

            if (Array.isArray(type.inputs) && type.inputs.length > 0) {
                this._append(
                    element, 'h2',
                    'Inputs' + (type.inputs_range ? ' (' + type.inputs_range + ')' : ''));
                const inputs = this._append(element, 'dl');
                for (const input of type.inputs) {
                    this._append(
                        inputs, 'dt',
                        input.name + (input.type ? ': <tt>' + input.type + '</tt>' : '') +
                            (input.option ? ' (' + input.option + ')' : ''));
                    this._append(inputs, 'dd', input.description);
                }
            }

            if (Array.isArray(type.outputs) && type.outputs.length > 0) {
                this._append(
                    element, 'h2',
                    'Outputs' + (type.outputs_range ? ' (' + type.outputs_range + ')' : ''));
                const outputs = this._append(element, 'dl');
                for (const output of type.outputs) {
                    this._append(
                        outputs, 'dt',
                        output.name + (output.type ? ': <tt>' + output.type + '</tt>' : '') +
                            (output.option ? ' (' + output.option + ')' : ''));
                    this._append(outputs, 'dd', output.description);
                }
            }

            if (Array.isArray(type.type_constraints) && type.type_constraints.length > 0) {
                this._append(element, 'h2', 'Type Constraints');
                const typeConstraints = this._append(element, 'dl');
                for (const typeConstraint of type.type_constraints) {
                    this._append(
                        typeConstraints, 'dt',
                        typeConstraint.type_param_str + ': ' +
                            typeConstraint.allowed_type_strs.map((item) => '<tt>' + item + '</tt>')
                                .join(', '));
                    this._append(typeConstraints, 'dd', typeConstraint.description);
                }
            }

            if (Array.isArray(type.examples) && type.examples.length > 0) {
                this._append(element, 'h2', 'Examples');
                for (const example of type.examples) {
                    this._append(element, 'h3', example.summary);
                    this._append(element, 'pre', example.code);
                }
            }

            if (Array.isArray(type.references) && type.references.length > 0) {
                this._append(element, 'h2', 'References');
                const references = this._append(element, 'ul');
                for (const reference of type.references) {
                    this._append(references, 'li', reference.description);
                }
            }

            if (type.domain && type.version && type.support_level) {
                this._append(element, 'h2', 'Support');
                this._append(
                    element, 'dl',
                    'In domain <tt>' + type.domain + '</tt> since version <tt>' + type.version +
                        '</tt> at support level <tt>' + type.support_level + '</tt>.');
            }

            if (!this._host.type !== 'Electron') {
                element.addEventListener('click', (e) => {
                    if (e.target && e.target.href) {
                        const link = e.target.href;
                        if (link.startsWith('http://') || link.startsWith('https://')) {
                            e.preventDefault();
                            this._raise('navigate', {link: link});
                        }
                    }
                });
            }

            this._elements = [element];

            const separator = this._host.document.createElement('div');
            separator.className = 'sidebar-view-separator';
            this._elements.push(separator);
        }
        return this._elements;
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

    _append(parent, type, content) {
        const element = this._host.document.createElement(type);
        if (content) {
            element.innerHTML = content;
        }
        parent.appendChild(element);
        return element;
    }

    static formatDocumentation(source) {
        if (source) {
            const generator = new markdown.Generator();
            const target = {};
            if (source.name !== undefined) {
                target.name = source.name;
            }
            if (source.module !== undefined) {
                target.module = source.module;
            }
            if (source.category !== undefined) {
                target.category = source.category;
            }
            if (source.summary !== undefined) {
                target.summary = generator.html(source.summary);
            }
            if (source.description !== undefined) {
                target.description = generator.html(source.description);
            }
            if (Array.isArray(source.attributes)) {
                target.attributes = source.attributes.map((source) => {
                    const target = {};
                    target.name = source.name;
                    if (source.type !== undefined) {
                        target.type = source.type;
                    }
                    if (source.option !== undefined) {
                        target.option = source.option;
                    }
                    if (source.optional !== undefined) {
                        target.optional = source.optional;
                    }
                    if (source.required !== undefined) {
                        target.required = source.required;
                    }
                    if (source.minimum !== undefined) {
                        target.minimum = source.minimum;
                    }
                    if (source.src !== undefined) {
                        target.src = source.src;
                    }
                    if (source.src_type !== undefined) {
                        target.src_type = source.src_type;
                    }
                    if (source.description !== undefined) {
                        target.description = generator.html(source.description);
                    }
                    if (source.default !== undefined) {
                        target.default = source.default;
                    }
                    if (source.visible !== undefined) {
                        target.visible = source.visible;
                    }
                    return target;
                });
            }
            if (Array.isArray(source.inputs)) {
                target.inputs = source.inputs.map((source) => {
                    const target = {};
                    target.name = source.name;
                    if (source.type !== undefined) {
                        target.type = source.type;
                    }
                    if (source.description !== undefined) {
                        target.description = generator.html(source.description);
                    }
                    if (source.default !== undefined) {
                        target.default = source.default;
                    }
                    if (source.src !== undefined) {
                        target.src = source.src;
                    }
                    if (source.list !== undefined) {
                        target.list = source.list;
                    }
                    if (source.isRef !== undefined) {
                        target.isRef = source.isRef;
                    }
                    if (source.typeAttr !== undefined) {
                        target.typeAttr = source.typeAttr;
                    }
                    if (source.numberAttr !== undefined) {
                        target.numberAttr = source.numberAttr;
                    }
                    if (source.typeListAttr !== undefined) {
                        target.typeListAttr = source.typeListAttr;
                    }
                    if (source.option !== undefined) {
                        target.option = source.option;
                    }
                    if (source.optional !== undefined) {
                        target.optional = source.optional;
                    }
                    if (source.visible !== undefined) {
                        target.visible = source.visible;
                    }
                    return target;
                });
            }
            if (Array.isArray(source.outputs)) {
                target.outputs = source.outputs.map((source) => {
                    const target = {};
                    target.name = source.name;
                    if (source.type) {
                        target.type = source.type;
                    }
                    if (source.description !== undefined) {
                        target.description = generator.html(source.description);
                    }
                    if (source.list !== undefined) {
                        target.list = source.list;
                    }
                    if (source.typeAttr !== undefined) {
                        target.typeAttr = source.typeAttr;
                    }
                    if (source.typeListAttr !== undefined) {
                        target.typeListAttr = source.typeAttr;
                    }
                    if (source.numberAttr !== undefined) {
                        target.numberAttr = source.numberAttr;
                    }
                    if (source.isRef !== undefined) {
                        target.isRef = source.isRef;
                    }
                    if (source.option !== undefined) {
                        target.option = source.option;
                    }
                    return target;
                });
            }
            if (Array.isArray(source.references)) {
                target.references = source.references.map((source) => {
                    if (source) {
                        target.description = generator.html(source.description);
                    }
                    return target;
                });
            }
            if (source.version !== undefined) {
                target.version = source.version;
            }
            if (source.operator !== undefined) {
                target.operator = source.operator;
            }
            if (source.identifier !== undefined) {
                target.identifier = source.identifier;
            }
            if (source.package !== undefined) {
                target.package = source.package;
            }
            if (source.support_level !== undefined) {
                target.support_level = source.support_level;
            }
            if (source.min_input !== undefined) {
                target.min_input = source.min_input;
            }
            if (source.max_input !== undefined) {
                target.max_input = source.max_input;
            }
            if (source.min_output !== undefined) {
                target.min_output = source.min_output;
            }
            if (source.max_input !== undefined) {
                target.max_output = source.max_output;
            }
            if (source.inputs_range !== undefined) {
                target.inputs_range = source.inputs_range;
            }
            if (source.outputs_range !== undefined) {
                target.outputs_range = source.outputs_range;
            }
            if (source.examples !== undefined) {
                target.examples = source.examples;
            }
            if (source.constants !== undefined) {
                target.constants = source.constants;
            }
            if (source.type_constraints !== undefined) {
                target.type_constraints = source.type_constraints;
            }
            return target;
        }
        return '';
    }
};

sidebar.FindSidebar = class {
    constructor(host, element, graph) {
        this._host = host;
        this._graphElement = element;
        this._graph = graph;
        this._contentElement = this._host.document.createElement('div');
        this._contentElement.setAttribute('class', 'sidebar-view-find');
        this._searchElement = this._host.document.createElement('input');
        this._searchElement.setAttribute('id', 'search');
        this._searchElement.setAttribute('type', 'text');
        this._searchElement.setAttribute('spellcheck', 'false');
        this._searchElement.setAttribute('placeholder', 'Search...');
        this._searchElement.setAttribute('style', 'width: 100%');
        this._searchElement.addEventListener('input', (e) => {
            this.update(e.target.value);
            this._raise('search-text-changed', e.target.value);
        });
        this._resultElement = this._host.document.createElement('ol');
        this._resultElement.addEventListener('click', (e) => {
            this.select(e);
        });
        this._contentElement.appendChild(this._searchElement);
        this._contentElement.appendChild(this._resultElement);
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

    select(e) {
        const selection = [];
        const id = e.target.id;

        const nodesElement = this._graphElement.getElementById('nodes');
        let nodeElement = nodesElement.firstChild;
        while (nodeElement) {
            if (nodeElement.id === id) {
                selection.push(nodeElement);
            }
            nodeElement = nodeElement.nextSibling;
        }

        const edgePathsElement = this._graphElement.getElementById('edge-paths');
        let edgePathElement = edgePathsElement.firstChild;
        while (edgePathElement) {
            if (edgePathElement.id === id) {
                selection.push(edgePathElement);
            }
            edgePathElement = edgePathElement.nextSibling;
        }

        let initializerElement = this._graphElement.getElementById(id);
        if (initializerElement) {
            while (initializerElement.parentElement) {
                initializerElement = initializerElement.parentElement;
                if (initializerElement.id && initializerElement.id.startsWith('node-')) {
                    selection.push(initializerElement);
                    break;
                }
            }
        }

        if (selection.length > 0) {
            this._raise('select', selection);
        }
    }

    focus(searchText) {
        this._searchElement.focus();
        this._searchElement.value = '';
        this._searchElement.value = searchText;
        this.update(searchText);
    }

    update(searchText) {
        while (this._resultElement.lastChild) {
            this._resultElement.removeChild(this._resultElement.lastChild);
        }

        let terms = null;
        let callback = null;
        const unquote = searchText.match(new RegExp(/^'(.*)'|"(.*)"$/));
        if (unquote) {
            const term = unquote[1] || unquote[2];
            terms = [term];
            callback = (name) => {
                return term === name;
            };
        } else {
            terms = searchText.trim()
                        .toLowerCase()
                        .split(' ')
                        .map((term) => term.trim())
                        .filter((term) => term.length > 0);
            callback = (name) => {
                return terms.every((term) => name.toLowerCase().indexOf(term) !== -1);
            };
        }

        const nodes = new Set();
        const edges = new Set();

        for (const node of this._graph.nodes.values()) {
            const label = node.label;
            const initializers = [];
            if (label.class === 'graph-node' || label.class === 'graph-input') {
                for (const input of label.inputs) {
                    for (const argument of input.arguments) {
                        if (argument.name && !edges.has(argument.name)) {
                            const match = (argument, term) => {
                                if (argument.name &&
                                    argument.name.toLowerCase().indexOf(term) !== -1) {
                                    return true;
                                }
                                if (argument.type) {
                                    if (argument.type.dataType &&
                                        term === argument.type.dataType.toLowerCase()) {
                                        return true;
                                    }
                                    if (argument.type.shape) {
                                        if (term === argument.type.shape.toString().toLowerCase()) {
                                            return true;
                                        }
                                        if (argument.type.shape &&
                                            Array.isArray(argument.type.shape.dimensions)) {
                                            const dimensions = argument.type.shape.dimensions.map(
                                                (dimension) => (
                                                    dimension ? dimension.toString().toLowerCase() :
                                                                ''));
                                            if (term === dimensions.join(',')) {
                                                return true;
                                            }
                                            if (dimensions.some(
                                                    (dimension) => term === dimension)) {
                                                return true;
                                            }
                                        }
                                    }
                                }
                                return false;
                            };
                            if (terms.every((term) => match(argument, term))) {
                                if (!argument.initializer) {
                                    const inputItem = this._host.document.createElement('li');
                                    inputItem.innerText = '\u2192 ' +
                                        argument.name.split('\n').shift();  // custom argument id
                                    inputItem.id = 'edge-' + argument.name;
                                    this._resultElement.appendChild(inputItem);
                                    edges.add(argument.name);
                                } else {
                                    initializers.push(argument);
                                }
                            }
                        }
                    }
                }
            }
            if (label.class === 'graph-node') {
                const name = label.value.name;
                const type = label.value.type.name;
                if (!nodes.has(label.id) &&
                    ((name && callback(name)) || (type && callback(type)))) {
                    const nameItem = this._host.document.createElement('li');
                    nameItem.innerText = '\u25A2 ' + (name || '[' + type + ']');
                    nameItem.id = label.id;
                    this._resultElement.appendChild(nameItem);
                    nodes.add(label.id);
                }
            }
            for (const argument of initializers) {
                if (argument.name) {
                    const initializeItem = this._host.document.createElement('li');
                    initializeItem.innerText =
                        '\u25A0 ' + argument.name.split('\n').shift();  // custom argument id
                    initializeItem.id = 'initializer-' + argument.name;
                    this._resultElement.appendChild(initializeItem);
                }
            }
        }

        for (const node of this._graph.nodes.values()) {
            const label = node.label;
            if (label.class === 'graph-node' || label.class === 'graph-output') {
                for (const output of label.outputs) {
                    for (const argument of output.arguments) {
                        if (argument.name && !edges.has(argument.name) &&
                            terms.every(
                                (term) => argument.name.toLowerCase().indexOf(term) !== -1)) {
                            const outputItem = this._host.document.createElement('li');
                            outputItem.innerText = '\u2192 ' +
                                argument.name.split('\n').shift();  // custom argument id
                            outputItem.id = 'edge-' + argument.name;
                            this._resultElement.appendChild(outputItem);
                            edges.add(argument.name);
                        }
                    }
                }
            }
        }

        this._resultElement.style.display =
            this._resultElement.childNodes.length !== 0 ? 'block' : 'none';
    }

    get content() {
        return this._contentElement;
    }
};

sidebar.Formatter = class {
    constructor(value, type, quote) {
        this._value = value;
        this._type = type;
        this._quote = quote;
        this._values = new Set();
    }

    toString() {
        return this._format(this._value, this._type, this._quote);
    }

    _format(value, type, quote) {
        if (typeof value === 'function') {
            return value();
        }
        if (value && (value instanceof base.Int64 || value instanceof base.Uint64)) {
            return value.toString();
        }
        if (Number.isNaN(value)) {
            return 'NaN';
        }
        switch (type) {
            case 'shape':
                return value ? value.toString() : '(null)';
            case 'shape[]':
                if (value && !Array.isArray(value)) {
                    throw new Error('Invalid shape \'' + JSON.stringify(value) + '\'.');
                }
                return value ? value.map((item) => item.toString()).join(', ') : '(null)';
            case 'graph':
                return value ? value.name : '(null)';
            case 'graph[]':
                return value ? value.map((graph) => graph.name).join(', ') : '(null)';
            case 'tensor':
                if (value && value.type && value.type.shape && value.type.shape.dimensions &&
                    value.type.shape.dimensions.length === 0) {
                    return value.toString();
                }
                return '[...]';
            case 'function':
                return value.type.name;
            case 'function[]':
                return value ? value.map((item) => item.type.name).join(', ') : '(null)';
            default:
                break;
        }
        if (typeof value === 'string' && (!type || type !== 'string')) {
            return quote ? '"' + value + '"' : value;
        }
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return quote ? '[]' : '';
            }
            let ellipsis = false;
            if (value.length > 1000) {
                value = value.slice(0, 1000);
                ellipsis = true;
            }
            const itemType =
                type && type.endsWith('[]') ? type.substring(0, type.length - 2) : null;
            const array = value.map((item) => {
                if (item && (item instanceof base.Int64 || item instanceof base.Uint64)) {
                    return item.toString();
                }
                if (Number.isNaN(item)) {
                    return 'NaN';
                }
                const quote = !itemType || itemType === 'string';
                return this._format(item, itemType, quote);
            });
            if (ellipsis) {
                array.push('\u2026');
            }
            return quote ? ['[', array.join(', '), ']'].join(' ') : array.join(', ');
        }
        if (value === null) {
            return quote ? 'null' : '';
        }
        if (value === undefined) {
            return 'undefined';
        }
        if (value !== Object(value)) {
            return value.toString();
        }
        if (this._values.has(value)) {
            return '\u2026';
        }
        this._values.add(value);
        const list = [];
        const entries = Object.entries(value).filter(
            (entry) => !entry[0].startsWith('__') && !entry[0].endsWith('__'));
        if (entries.length === 1) {
            list.push(this._format(entries[0][1], null, true));
        } else {
            for (const entry of entries) {
                list.push(entry[0] + ': ' + this._format(entry[1], null, true));
            }
        }
        let objectType = value.__type__;
        if (!objectType && value.constructor.name && value.constructor.name !== 'Object') {
            objectType = value.constructor.name;
        }
        if (objectType) {
            return objectType + (list.length === 0 ? '()' : ['(', list.join(', '), ')'].join(''));
        }
        switch (list.length) {
            case 0:
                return quote ? '()' : '';
            case 1:
                return list[0];
            default:
                return quote ? ['(', list.join(', '), ')'].join(' ') : list.join(', ');
        }
    }
};

const markdown = {};

markdown.Generator = class {
    constructor() {
        this._newlineRegExp = /^\n+/;
        this._codeRegExp = /^( {4}[^\n]+\n*)+/;
        this._fencesRegExp =
            /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/;
        this._hrRegExp = /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/;
        this._headingRegExp = /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/;
        this._blockquoteRegExp =
            /^( {0,3}> ?(([^\n]+(?:\n(?! {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)| {0,3}#{1,6} | {0,3}>| {0,3}(?:`{3,}(?=[^`\n]*\n)|~{3,})[^\n]*\n| {0,3}(?:[*+-]|1[.)]) |<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)|[^\n]*)(?:\n|$))+/;
        this._listRegExp =
            /^( {0,3})((?:[*+-]|\d{1,9}[.)])) [\s\S]+?(?:\n+(?=\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$))|\n+(?= {0,3}\[((?!\s*\])(?:\\[[\]]|[^[\]])+)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)((?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))))? *(?:\n+|$))|\n{2,}(?! )(?!\1(?:[*+-]|\d{1,9}[.)]) )\n*|\s*$)/;
        this._htmlRegExp =
            /^ {0,3}(?:<(script|pre|style)[\s>][\s\S]*?(?:<\/\1>[^\n]*\n+|$)|<!--(?!-?>)[\s\S]*?(?:-->|$)[^\n]*(\n+|$)|<\?[\s\S]*?(?:\?>\n*|$)|<![A-Z][\s\S]*?(?:>\n*|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>\n*|$)|<\/?(address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?: +|\n|\/?>)[\s\S]*?(?:\n{2,}|$)|<(?!script|pre|style)([a-z][\w-]*)(?: +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?)*? *\/?>(?=[ \t]*(?:\n|$))[\s\S]*?(?:\n{2,}|$)|<\/(?!script|pre|style)[a-z][\w-]*\s*>(?=[ \t]*(?:\n|$))[\s\S]*?(?:\n{2,}|$))/i;
        this._defRegExp =
            /^ {0,3}\[((?!\s*\])(?:\\[[\]]|[^[\]])+)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)((?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))))? *(?:\n+|$)/;
        this._nptableRegExp =
            /^ *([^|\n ].*\|.*)\n {0,3}([-:]+ *\|[-| :]*)(?:\n((?:(?!\n| {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)| {0,3}#{1,6} | {0,3}>| {4}[^\n]| {0,3}(?:`{3,}(?=[^`\n]*\n)|~{3,})[^\n]*\n| {0,3}(?:[*+-]|1[.)]) |<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?: +|\n|\/?>)|<(?:script|pre|style|!--)).*(?:\n|$))*)\n*|$)/;
        this._tableRegExp =
            /^ *\|(.+)\n {0,3}\|?( *[-:]+[-| :]*)(?:\n *((?:(?!\n| {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)| {0,3}#{1,6} | {0,3}>| {4}[^\n]| {0,3}(?:`{3,}(?=[^`\n]*\n)|~{3,})[^\n]*\n| {0,3}(?:[*+-]|1[.)]) |<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?: +|\n|\/?>)|<(?:script|pre|style|!--)).*(?:\n|$))*)\n*|$)/;
        this._lheadingRegExp = /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/;
        this._textRegExp = /^[^\n]+/;
        this._bulletRegExp = /(?:[*+-]|\d{1,9}[.)])/;
        this._itemRegExp =
            /^( *)((?:[*+-]|\d{1,9}[.)])) ?[^\n]*(?:\n(?!\1(?:[*+-]|\d{1,9}[.)]) ?)[^\n]*)*/gm;
        this._paragraphRegExp =
            /^([^\n]+(?:\n(?! {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)| {0,3}#{1,6} | {0,3}>| {0,3}(?:`{3,}(?=[^`\n]*\n)|~{3,})[^\n]*\n| {0,3}(?:[*+-]|1[.)]) |<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/;
        this._backpedalRegExp =
            /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/;
        this._escapeRegExp = /^\\([!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~~|])/;
        this._escapesRegExp = /\\([!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~])/g;
        /* eslint-disable no-control-regex */
        this._autolinkRegExp =
            /^<([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^\s\x00-\x1f<>]*|[a-zA-Z0-9.!#$%&'*+/=?_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_]))>/;
        this._linkRegExp =
            /^!?\[((?:\[(?:\\.|[^[\]\\])*\]|\\.|`[^`]*`|[^[\]\\`])*?)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/;
        /* eslint-enable no-control-regex */
        this._urlRegExp =
            /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9-]+\.?)+[^\s<]*|^[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/i;
        this._tagRegExp =
            /^<!--(?!-?>)[\s\S]*?-->|^<\/[a-zA-Z][\w:-]*\s*>|^<[a-zA-Z][\w-]*(?:\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?)*?\s*\/?>|^<\?[\s\S]*?\?>|^<![a-zA-Z]+\s[\s\S]*?>|^<!\[CDATA\[[\s\S]*?\]\]>/;
        this._reflinkRegExp =
            /^!?\[((?:\[(?:\\.|[^[\]\\])*\]|\\.|`[^`]*`|[^[\]\\`])*?)\]\[(?!\s*\])((?:\\[[\]]?|[^[\]\\])+)\]/;
        this._nolinkRegExp = /^!?\[(?!\s*\])((?:\[[^[\]]*\]|\\[[\]]|[^[\]])*)\](?:\[\])?/;
        this._reflinkSearchRegExp =
            /!?\[((?:\[(?:\\.|[^[\]\\])*\]|\\.|`[^`]*`|[^[\]\\`])*?)\]\[(?!\s*\])((?:\\[[\]]?|[^[\]\\])+)\]|!?\[(?!\s*\])((?:\[[^[\]]*\]|\\[[\]]|[^[\]])*)\](?:\[\])?(?!\()/g;
        this._strongStartRegExp =
            /^(?:(\*\*(?=[*!"#$%&'()+\-.,/:;<=>?@[\]`{|}~]))|\*\*)(?![\s])|__/;
        this._strongMiddleRegExp =
            /^\*\*(?:(?:(?!__[^_]*?__|\*\*\[^\*\]*?\*\*)(?:[^*]|\\\*)|__[^_]*?__|\*\*\[^\*\]*?\*\*)|\*(?:(?!__[^_]*?__|\*\*\[^\*\]*?\*\*)(?:[^*]|\\\*)|__[^_]*?__|\*\*\[^\*\]*?\*\*)*?\*)+?\*\*$|^__(?![\s])((?:(?:(?!__[^_]*?__|\*\*\[^\*\]*?\*\*)(?:[^_]|\\_)|__[^_]*?__|\*\*\[^\*\]*?\*\*)|_(?:(?!__[^_]*?__|\*\*\[^\*\]*?\*\*)(?:[^_]|\\_)|__[^_]*?__|\*\*\[^\*\]*?\*\*)*?_)+?)__$/;
        this._strongEndAstRegExp =
            /[^!"#$%&'()+\-.,/:;<=>?@[\]`{|}~\s]\*\*(?!\*)|[!"#$%&'()+\-.,/:;<=>?@[\]`{|}~]\*\*(?!\*)(?:(?=[!"#$%&'()+\-.,/:;<=>?@[\]`{|}~_\s]|$))/g;
        this._strongEndUndRegExp = /[^\s]__(?!_)(?:(?=[!"#$%&'()+\-.,/:;<=>?@[\]`{|}~*\s])|$)/g;
        this._emStartRegExp = /^(?:(\*(?=[!"#$%&'()+\-.,/:;<=>?@[\]`{|}~]))|\*)(?![*\s])|_/;
        this._emMiddleRegExp =
            /^\*(?:(?:(?!__[^_]*?__|\*\*\[^\*\]*?\*\*)(?:[^*]|\\\*)|__[^_]*?__|\*\*\[^\*\]*?\*\*)|\*(?:(?!__[^_]*?__|\*\*\[^\*\]*?\*\*)(?:[^*]|\\\*)|__[^_]*?__|\*\*\[^\*\]*?\*\*)*?\*)+?\*$|^_(?![_\s])(?:(?:(?!__[^_]*?__|\*\*\[^\*\]*?\*\*)(?:[^_]|\\_)|__[^_]*?__|\*\*\[^\*\]*?\*\*)|_(?:(?!__[^_]*?__|\*\*\[^\*\]*?\*\*)(?:[^_]|\\_)|__[^_]*?__|\*\*\[^\*\]*?\*\*)*?_)+?_$/;
        this._emEndAstRegExp =
            /[^!"#$%&'()+\-.,/:;<=>?@[\]`{|}~\s]\*(?!\*)|[!"#$%&'()+\-.,/:;<=>?@[\]`{|}~]\*(?!\*)(?:(?=[!"#$%&'()+\-.,/:;<=>?@[\]`{|}~_\s]|$))/g;
        (this._emEndUndRegExp = /[^\s]_(?!_)(?:(?=[!"#$%&'()+\-.,/:;<=>?@[\]`{|}~*\s])|$)/g),
            (this._codespanRegExp = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/);
        this._brRegExp = /^( {2,}|\\)\n(?!\s*$)/;
        this._delRegExp = /^~+(?=\S)([\s\S]*?\S)~+/;
        this._textspanRegExp =
            /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<![`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+/=?_`{|}~-](?=[a-zA-Z0-9.!#$%&'*+/=?_`{|}~-]+@))|(?=[a-zA-Z0-9.!#$%&'*+/=?_`{|}~-]+@))/;
        this._punctuationRegExp = /^([\s*!"#$%&'()+\-.,/:;<=>?@[\]`{|}~])/;
        this._blockSkipRegExp = /\[[^\]]*?\]\([^)]*?\)|`[^`]*?`|<[^>]*?>/g;
        this._escapeTestRegExp = /[&<>"']/;
        this._escapeReplaceRegExp = /[&<>"']/g;
        this._escapeTestNoEncodeRegExp = /[<>"']|&(?!#?\w+;)/;
        this._escapeReplaceNoEncodeRegExp = /[<>"']|&(?!#?\w+;)/g;
        this._escapeReplacementsMap =
            {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;'};
    }

    html(source) {
        const tokens = [];
        const links = new Map();
        this._tokenize(
            source.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    '), tokens, links, true);
        this._tokenizeBlock(tokens, links);
        const slugs = new Map();
        const result = this._render(tokens, slugs, true);
        return result;
    }

    _tokenize(source, tokens, links, top) {
        source = source.replace(/^ +$/gm, '');
        while (source) {
            let match = this._newlineRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                if (match[0].length > 1) {
                    tokens.push({type: 'space'});
                }
                continue;
            }
            match = this._codeRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                const lastToken = tokens[tokens.length - 1];
                if (lastToken && lastToken.type === 'paragraph') {
                    lastToken.text += '\n' + match[0].trimRight();
                } else {
                    const text = match[0].replace(/^ {4}/gm, '').replace(/\n*$/, '');
                    tokens.push({type: 'code', text: text});
                }
                continue;
            }
            match = this._fencesRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                const language = match[2] ? match[2].trim() : match[2];
                let content = match[3] || '';
                const matchIndent = match[0].match(/^(\s+)(?:```)/);
                if (matchIndent !== null) {
                    const indent = matchIndent[1];
                    content = content.split('\n')
                                  .map((node) => {
                                      const match = node.match(/^\s+/);
                                      return match !== null && match[0].length >= indent.length ?
                                          node.slice(indent.length) :
                                          node;
                                  })
                                  .join('\n');
                }
                tokens.push({type: 'code', language: language, text: content});
                continue;
            }
            match = this._headingRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                tokens.push({type: 'heading', depth: match[1].length, text: match[2]});
                continue;
            }
            match = this._nptableRegExp.exec(source);
            if (match) {
                const header = this._splitCells(match[1].replace(/^ *| *\| *$/g, ''));
                const align = match[2].replace(/^ *|\| *$/g, '').split(/ *\| */);
                if (header.length === align.length) {
                    const cells = match[3] ? match[3].replace(/\n$/, '').split('\n') : [];
                    const token =
                        {type: 'table', header: header, align: align, cells: cells, raw: match[0]};
                    for (let i = 0; i < token.align.length; i++) {
                        if (/^ *-+: *$/.test(token.align[i])) {
                            token.align[i] = 'right';
                        } else if (/^ *:-+: *$/.test(token.align[i])) {
                            token.align[i] = 'center';
                        } else if (/^ *:-+ *$/.test(token.align[i])) {
                            token.align[i] = 'left';
                        } else {
                            token.align[i] = null;
                        }
                    }
                    token.cells =
                        token.cells.map((cell) => this._splitCells(cell, token.header.length));
                    source = source.substring(token.raw.length);
                    tokens.push(token);
                    continue;
                }
            }
            match = this._hrRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                tokens.push({type: 'hr'});
                continue;
            }
            match = this._blockquoteRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                const text = match[0].replace(/^ *> ?/gm, '');
                tokens.push(
                    {type: 'blockquote', text: text, tokens: this._tokenize(text, [], links, top)});
                continue;
            }
            match = this._listRegExp.exec(source);
            if (match) {
                let raw = match[0];
                const bull = match[2];
                const ordered = bull.length > 1;
                const parent = bull[bull.length - 1] === ')';
                const list = {
                    type: 'list',
                    raw: raw,
                    ordered: ordered,
                    start: ordered ? +bull.slice(0, -1) : '',
                    loose: false,
                    items: [],
                };
                const itemMatch = match[0].match(this._itemRegExp);
                let next = false;
                const length = itemMatch.length;
                for (let i = 0; i < length; i++) {
                    let item = itemMatch[i];
                    raw = item;
                    let space = item.length;
                    item = item.replace(/^ *([*+-]|\d+[.)]) ?/, '');
                    if (~item.indexOf('\n ')) {
                        space -= item.length;
                        item = item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '');
                    }
                    if (i !== length - 1) {
                        const bullet = this._bulletRegExp.exec(itemMatch[i + 1])[0];
                        if (ordered ? bullet.length === 1 ||
                                    (!parent && bullet[bullet.length - 1] === ')') :
                                      bullet.length > 1) {
                            const addBack = itemMatch.slice(i + 1).join('\n');
                            list.raw = list.raw.substring(0, list.raw.length - addBack.length);
                            i = length - 1;
                        }
                    }
                    let loose = next || /\n\n(?!\s*$)/.test(item);
                    if (i !== length - 1) {
                        next = item.charAt(item.length - 1) === '\n';
                        if (!loose) {
                            loose = next;
                        }
                    }
                    if (loose) {
                        list.loose = true;
                    }
                    const task = /^\[[ xX]\] /.test(item);
                    let checked = undefined;
                    if (task) {
                        checked = item[1] !== ' ';
                        item = item.replace(/^\[[ xX]\] +/, '');
                    }
                    list.items.push({
                        type: 'list_item',
                        raw,
                        task: task,
                        checked: checked,
                        loose: loose,
                        text: item,
                    });
                }
                source = source.substring(list.raw.length);
                for (const item of list.items) {
                    item.tokens = this._tokenize(item.text, [], links, false);
                }
                tokens.push(list);
                continue;
            }
            match = this._htmlRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                tokens.push({
                    type: 'html',
                    pre: match[1] === 'pre' || match[1] === 'script' || match[1] === 'style',
                    text: match[0],
                });
                continue;
            }
            if (top) {
                match = this._defRegExp.exec(source);
                if (match) {
                    source = source.substring(match[0].length);
                    match[3] = match[3] ? match[3].substring(1, match[3].length - 1) : match[3];
                    const tag = match[1].toLowerCase().replace(/\s+/g, ' ');
                    if (!links.has(tag)) {
                        links.set(tag, {href: match[2], title: match[3]});
                    }
                    continue;
                }
            }
            match = this._tableRegExp.exec(source);
            if (match) {
                const header = this._splitCells(match[1].replace(/^ *| *\| *$/g, ''));
                const align = match[2].replace(/^ *|\| *$/g, '').split(/ *\| */);
                if (header.length === align.length) {
                    const cells = match[3] ? match[3].replace(/\n$/, '').split('\n') : [];
                    const token =
                        {type: 'table', header: header, align: align, cells: cells, raw: match[0]};
                    for (let i = 0; i < token.align.length; i++) {
                        if (/^ *-+: *$/.test(token.align[i])) {
                            token.align[i] = 'right';
                        } else if (/^ *:-+: *$/.test(token.align[i])) {
                            token.align[i] = 'center';
                        } else if (/^ *:-+ *$/.test(token.align[i])) {
                            token.align[i] = 'left';
                        } else {
                            token.align[i] = null;
                        }
                    }
                    token.cells = token.cells.map(
                        (cell) => this._splitCells(
                            cell.replace(/^ *\| *| *\| *$/g, ''), token.header.length));
                    source = source.substring(token.raw.length);
                    tokens.push(token);
                    continue;
                }
            }
            match = this._lheadingRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                tokens.push(
                    {type: 'heading', depth: match[2].charAt(0) === '=' ? 1 : 2, text: match[1]});
                continue;
            }
            if (top) {
                match = this._paragraphRegExp.exec(source);
                if (match) {
                    source = source.substring(match[0].length);
                    tokens.push({
                        type: 'paragraph',
                        text: match[1].charAt(match[1].length - 1) === '\n' ?
                            match[1].slice(0, -1) :
                            match[1],
                    });
                    continue;
                }
            }
            match = this._textRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                const lastToken = tokens[tokens.length - 1];
                if (lastToken && lastToken.type === 'text') {
                    lastToken.text += '\n' + match[0];
                } else {
                    tokens.push({type: 'text', text: match[0]});
                }
                continue;
            }
            throw new Error('Unexpected \'' + source.charCodeAt(0) + '\'.');
        }
        return tokens;
    }

    _tokenizeInline(source, links, inLink, inRawBlock, prevChar) {
        const tokens = [];
        let maskedSource = source;
        if (links.size > 0) {
            while (maskedSource) {
                const match = this._reflinkSearchRegExp.exec(maskedSource);
                if (match) {
                    if (links.has(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                        maskedSource = maskedSource.slice(0, match.index) + '[' +
                            'a'.repeat(match[0].length - 2) + ']' +
                            maskedSource.slice(this._reflinkSearchRegExp.lastIndex);
                    }
                    continue;
                }
                break;
            }
        }
        while (maskedSource) {
            const match = this._blockSkipRegExp.exec(maskedSource);
            if (match) {
                maskedSource = maskedSource.slice(0, match.index) + '[' +
                    'a'.repeat(match[0].length - 2) + ']' +
                    maskedSource.slice(this._blockSkipRegExp.lastIndex);
                continue;
            }
            break;
        }
        while (source) {
            let match = this._escapeRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                tokens.push({type: 'escape', text: this._escape(match[1])});
                continue;
            }
            match = this._tagRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                if (!inLink && /^<a /i.test(match[0])) {
                    inLink = true;
                } else if (inLink && /^<\/a>/i.test(match[0])) {
                    inLink = false;
                }
                if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(match[0])) {
                    inRawBlock = true;
                } else if (inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(match[0])) {
                    inRawBlock = false;
                }
                tokens.push({type: 'html', raw: match[0], text: match[0]});
                continue;
            }
            match = this._linkRegExp.exec(source);
            if (match) {
                let index = -1;
                const ref = match[2];
                if (ref.indexOf(')') !== -1) {
                    let level = 0;
                    for (let i = 0; i < ref.length; i++) {
                        switch (ref[i]) {
                            case '\\':
                                i++;
                                break;
                            case '(':
                                level++;
                                break;
                            case ')':
                                level--;
                                if (level < 0) {
                                    index = i;
                                    i = ref.length;
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
                if (index > -1) {
                    const length = (match[0].indexOf('!') === 0 ? 5 : 4) + match[1].length + index;
                    match[2] = match[2].substring(0, index);
                    match[0] = match[0].substring(0, length).trim();
                    match[3] = '';
                }
                const title =
                    (match[3] ? match[3].slice(1, -1) : '').replace(this._escapesRegExp, '$1');
                const href = match[2]
                                 .trim()
                                 .replace(/^<([\s\S]*)>$/, '$1')
                                 .replace(this._escapesRegExp, '$1');
                const token = this._outputLink(match, href, title);
                source = source.substring(match[0].length);
                if (token.type === 'link') {
                    token.tokens = this._tokenizeInline(token.text, links, true, inRawBlock, '');
                }
                tokens.push(token);
                continue;
            }
            match = this._reflinkRegExp.exec(source) || this._nolinkRegExp.exec(source);
            if (match) {
                let link = (match[2] || match[1]).replace(/\s+/g, ' ');
                link = links.get(link.toLowerCase());
                if (!link || !link.href) {
                    const text = match[0].charAt(0);
                    source = source.substring(text.length);
                    tokens.push({type: 'text', text: text});
                } else {
                    source = source.substring(match[0].length);
                    const token = this._outputLink(match, link);
                    if (token.type === 'link') {
                        token.tokens =
                            this._tokenizeInline(token.text, links, true, inRawBlock, '');
                    }
                    tokens.push(token);
                }
                continue;
            }
            match = this._strongStartRegExp.exec(source);
            if (match &&
                (!match[1] ||
                 (match[1] && (prevChar === '' || this._punctuationRegExp.exec(prevChar))))) {
                const masked = maskedSource.slice(-1 * source.length);
                const endReg =
                    match[0] === '**' ? this._strongEndAstRegExp : this._strongEndUndRegExp;
                endReg.lastIndex = 0;
                let cap;
                while ((match = endReg.exec(masked)) !== null) {
                    cap = this._strongMiddleRegExp.exec(masked.slice(0, match.index + 3));
                    if (cap) {
                        break;
                    }
                }
                if (cap) {
                    const text = source.substring(2, cap[0].length - 2);
                    source = source.substring(cap[0].length);
                    tokens.push({
                        type: 'strong',
                        text: text,
                        tokens: this._tokenizeInline(text, links, inLink, inRawBlock, ''),
                    });
                    continue;
                }
            }
            match = this._emStartRegExp.exec(source);
            if (match &&
                (!match[1] ||
                 (match[1] && (prevChar === '' || this._punctuationRegExp.exec(prevChar))))) {
                const masked = maskedSource.slice(-1 * source.length);
                const endReg = match[0] === '*' ? this._emEndAstRegExp : this._emEndUndRegExp;
                endReg.lastIndex = 0;
                let cap;
                while ((match = endReg.exec(masked)) !== null) {
                    cap = this._emMiddleRegExp.exec(masked.slice(0, match.index + 2));
                    if (cap) {
                        break;
                    }
                }
                if (cap) {
                    const text = source.slice(1, cap[0].length - 1);
                    source = source.substring(cap[0].length);
                    tokens.push({
                        type: 'em',
                        text: text,
                        tokens: this._tokenizeInline(text, links, inLink, inRawBlock, ''),
                    });
                    continue;
                }
            }
            match = this._codespanRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                let content = match[2].replace(/\n/g, ' ');
                if (/[^ ]/.test(content) && content.startsWith(' ') && content.endsWith(' ')) {
                    content = content.substring(1, content.length - 1);
                }
                tokens.push({type: 'codespan', text: this._encode(content)});
                continue;
            }
            match = this._brRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                tokens.push({type: 'br'});
                continue;
            }
            match = this._delRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                const text = match[1];
                tokens.push({
                    type: 'del',
                    text: text,
                    tokens: this._tokenizeInline(text, links, inLink, inRawBlock, ''),
                });
                continue;
            }
            match = this._autolinkRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                const text = this._escape(match[1]);
                const href = match[2] === '@' ? 'mailto:' + text : text;
                tokens.push({
                    type: 'link',
                    text: text,
                    href: href,
                    tokens: [{type: 'text', raw: text, text}],
                });
                continue;
            }
            if (!inLink) {
                match = this._urlRegExp.exec(source);
                if (match) {
                    const email = match[2] === '@';
                    if (!email) {
                        let prevCapZero;
                        do {
                            prevCapZero = match[0];
                            match[0] = this._backpedalRegExp.exec(match[0])[0];
                        } while (prevCapZero !== match[0]);
                    }
                    const text = this._escape(match[0]);
                    const href =
                        email ? 'mailto:' + text : match[1] === 'www.' ? 'http://' + text : text;
                    source = source.substring(match[0].length);
                    tokens.push({
                        type: 'link',
                        text: text,
                        href: href,
                        tokens: [{type: 'text', text: text}],
                    });
                    continue;
                }
            }
            match = this._textspanRegExp.exec(source);
            if (match) {
                source = source.substring(match[0].length);
                prevChar = match[0].slice(-1);
                tokens.push({type: 'text', text: inRawBlock ? match[0] : this._escape(match[0])});
                continue;
            }
            throw new Error('Unexpected \'' + source.charCodeAt(0) + '\'.');
        }
        return tokens;
    }

    _tokenizeBlock(tokens, links) {
        for (const token of tokens) {
            switch (token.type) {
                case 'paragraph':
                case 'text':
                case 'heading': {
                    token.tokens = this._tokenizeInline(token.text, links, false, false, '');
                    break;
                }
                case 'table': {
                    token.tokens = {};
                    token.tokens.header = token.header.map(
                        (header) => this._tokenizeInline(header, links, false, false, ''));
                    token.tokens.cells = token.cells.map(
                        (cell) =>
                            cell.map((row) => this._tokenizeInline(row, links, false, false, '')));
                    break;
                }
                case 'blockquote': {
                    this._tokenizeBlock(token.tokens, links);
                    break;
                }
                case 'list': {
                    for (const item of token.items) {
                        this._tokenizeBlock(item.tokens, links);
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }

    _render(tokens, slugs, top) {
        let html = '';
        while (tokens.length > 0) {
            const token = tokens.shift();
            switch (token.type) {
                case 'space': {
                    continue;
                }
                case 'hr': {
                    html += '<hr>\n';
                    continue;
                }
                case 'heading': {
                    const level = token.depth;
                    const id = this._slug(slugs, this._renderInline(token.tokens, true));
                    html += '<h' + level + ' id="' + id + '">' + this._renderInline(token.tokens) +
                        '</h' + level + '>\n';
                    continue;
                }
                case 'code': {
                    const code = token.text;
                    const language = (token.language || '').match(/\S*/)[0];
                    html += '<pre><code' +
                        (language ? ' class="' +
                                 'language-' + this._encode(language) + '"' :
                                    '') +
                        '>' + (token.escaped ? code : this._encode(code)) + '</code></pre>\n';
                    continue;
                }
                case 'table': {
                    let header = '';
                    let cell = '';
                    for (let j = 0; j < token.header.length; j++) {
                        const content = this._renderInline(token.tokens.header[j]);
                        const align = token.align[j];
                        cell += '<th' + (align ? ' align="' + align + '"' : '') + '>' + content +
                            '</th>\n';
                    }
                    header += '<tr>\n' + cell + '</tr>\n';
                    let body = '';
                    for (let j = 0; j < token.cells.length; j++) {
                        const row = token.tokens.cells[j];
                        cell = '';
                        for (let k = 0; k < row.length; k++) {
                            const content = this._renderInline(row[k]);
                            const align = token.align[k];
                            cell += '<td' + (align ? ' align="' + align + '"' : '') + '>' +
                                content + '</td>\n';
                        }
                        body += '<tr>\n' + cell + '</tr>\n';
                    }
                    html += '<table>\n<thead>\n' + header + '</thead>\n' +
                        (body ? '<tbody>' + body + '</tbody>' : body) + '</table>\n';
                    continue;
                }
                case 'blockquote': {
                    html += '<blockquote>\n' + this._render(token.tokens, slugs, true) +
                        '</blockquote>\n';
                    continue;
                }
                case 'list': {
                    const ordered = token.ordered;
                    const start = token.start;
                    const loose = token.loose;
                    let body = '';
                    for (const item of token.items) {
                        let itemBody = '';
                        if (item.task) {
                            const checkbox = '<input ' + (item.checked ? 'checked="" ' : '') +
                                'disabled="" type="checkbox"' +
                                '> ';
                            if (loose) {
                                if (item.tokens.length > 0 && item.tokens[0].type === 'text') {
                                    item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                                    if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 &&
                                        item.tokens[0].tokens[0].type === 'text') {
                                        item.tokens[0].tokens[0].text =
                                            checkbox + ' ' + item.tokens[0].tokens[0].text;
                                    }
                                } else {
                                    item.tokens.unshift({type: 'text', text: checkbox});
                                }
                            } else {
                                itemBody += checkbox;
                            }
                        }
                        itemBody += this._render(item.tokens, slugs, loose);
                        body += '<li>' + itemBody + '</li>\n';
                    }
                    const type = ordered ? 'ol' : 'ul';
                    html += '<' + type + (ordered && start !== 1 ? ' start="' + start + '"' : '') +
                        '>\n' + body + '</' + type + '>\n';
                    continue;
                }
                case 'html': {
                    html += token.text;
                    continue;
                }
                case 'paragraph': {
                    html += '<p>' + this._renderInline(token.tokens) + '</p>\n';
                    continue;
                }
                case 'text': {
                    html += top ? '<p>' : '';
                    html += token.tokens ? this._renderInline(token.tokens) : token.text;
                    while (tokens.length > 0 && tokens[0].type === 'text') {
                        const token = tokens.shift();
                        html +=
                            '\n' + (token.tokens ? this._renderInline(token.tokens) : token.text);
                    }
                    html += top ? '</p>\n' : '';
                    continue;
                }
                default: {
                    throw new Error('Unexpected token type \'' + token.type + '\'.');
                }
            }
        }
        return html;
    }

    _renderInline(tokens, slug) {
        let html = '';
        for (const token of tokens) {
            switch (token.type) {
                case 'escape':
                case 'html':
                case 'text': {
                    html += token.text;
                    break;
                }
                case 'link': {
                    const text = this._renderInline(token.tokens, slug);
                    html += slug ? text :
                                   '<a href="' + token.href + '"' +
                            (token.title ? ' title="' + token.title + '"' : '') +
                            ' target="_blank">' + text + '</a>';
                    break;
                }
                case 'image': {
                    html += slug ? token.text :
                                   '<img src="' + token.href + '" alt="' + token.text + '"' +
                            (token.title ? ' title="' + token.title + '"' : '') + '>';
                    break;
                }
                case 'strong': {
                    const text = this._renderInline(token.tokens, slug);
                    html += slug ? text : '<strong>' + text + '</strong>';
                    break;
                }
                case 'em': {
                    const text = this._renderInline(token.tokens, slug);
                    html += slug ? text : '<em>' + text + '</em>';
                    break;
                }
                case 'codespan': {
                    html += slug ? token.text : '<code>' + token.text + '</code>';
                    break;
                }
                case 'br': {
                    html += slug ? '' : '<br>';
                    break;
                }
                case 'del': {
                    const text = this._renderInline(token.tokens, slug);
                    html += slug ? text : '<del>' + text + '</del>';
                    break;
                }
                default: {
                    throw new Error('Unexpected token type \'' + token.type + '\'.');
                }
            }
        }
        return html;
    }

    _outputLink(match, href, title) {
        title = title ? this._escape(title) : null;
        const text = match[1].replace(/\\([[\]])/g, '$1');
        return match[0].charAt(0) !== '!' ?
            {type: 'link', href: href, title: title, text: text} :
            {type: 'image', href: href, title: title, text: this._escape(text)};
    }

    _splitCells(tableRow, count) {
        const row = tableRow.replace(/\|/g, (match, offset, str) => {
            let escaped = false;
            let position = offset;
            while (--position >= 0 && str[position] === '\\') {
                escaped = !escaped;
            }
            return escaped ? '|' : ' |';
        });
        const cells = row.split(/ \|/);
        if (cells.length > count) {
            cells.splice(count);
        } else {
            while (cells.length < count) {
                cells.push('');
            }
        }
        return cells.map((cell) => cell.trim().replace(/\\\|/g, '|'));
    }

    _slug(slugs, value) {
        value = value.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi, (_, n) => {
            n = n.toLowerCase();
            if (n === 'colon') {
                return ':';
            }
            if (n.charAt(0) === '#') {
                return String.fromCharCode(
                    n.charAt(1) === 'x' ? parseInt(n.substring(2), 16) : +n.substring(1));
            }
            return '';
        });
        value = value.toLowerCase()
                    .trim()
                    .replace(/<[!/a-z].*?>/gi, '')
                    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
                    .replace(/\s/g, '-');
        let slug = value;
        let count = 0;
        if (slugs.has(value)) {
            count = slugs.get(value);
            do {
                count++;
                slug = value + '-' + count;
            } while (slugs.has(slug));
        }
        slugs.set(value, count);
        slugs.set(slug, 0);
        return slug;
    }

    _encode(content) {
        if (this._escapeTestRegExp.test(content)) {
            return content.replace(
                this._escapeReplaceRegExp, (ch) => this._escapeReplacementsMap[ch]);
        }
        return content;
    }

    _escape(content) {
        if (this._escapeTestNoEncodeRegExp.test(content)) {
            return content.replace(
                this._escapeReplaceNoEncodeRegExp, (ch) => this._escapeReplacementsMap[ch]);
        }
        return content;
    }
};

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports.Sidebar = sidebar.Sidebar;
    module.exports.ModelSidebar = sidebar.ModelSidebar;
    module.exports.NodeSidebar = sidebar.NodeSidebar;
    module.exports.DocumentationSidebar = sidebar.DocumentationSidebar;
    module.exports.FindSidebar = sidebar.FindSidebar;
    module.exports.Formatter = sidebar.Formatter;
}
