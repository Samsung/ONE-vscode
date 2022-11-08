/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
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
// https://github.com/lutzroeder/netron/blob/ae449ff55642636e6a1eef092eda34ffcba1c684/source/view.js

view.View = class {
    constructor(host, id) {
        this._host = host;
        this._id = id ? ('-' + id) : '';
        this._options = {
            initializers: true,
            attributes: false,
            names: false,
            direction: 'vertical',
            mousewheel: 'scroll'
        };
        this._host.initialize(this)
            .then(() => {
                this._model = null;
                this._graphs = [];
                this._selection = [];
                this._sidebar = new sidebar.Sidebar(this._host, id);
                this._searchText = '';
                this._theme = undefined;
                this._modelFactoryService = new view.ModelFactoryService(this._host);
                this._getElementById('zoom-in-button').addEventListener('click', () => {
                    this.zoomIn();
                });
                this._getElementById('zoom-out-button').addEventListener('click', () => {
                    this.zoomOut();
                });
                this._getElementById('back-button').addEventListener('click', () => {
                    this.popGraph();
                });
                this._getElementById('name-button').addEventListener('click', () => {
                    this.showDocumentation(this.activeGraph);
                });
                this._getElementById('sidebar').addEventListener('mousewheel', (e) => {
                    this._preventDefault(e);
                }, {passive: true});
                this._host.document.addEventListener('keydown', () => {
                    this.clearSelection();
                });
                this._host.start();
                const container = this._getElementById('graph');
                container.addEventListener('scroll', (e) => this._scrollHandler(e));
                container.addEventListener('wheel', (e) => this._wheelHandler(e), {passive: false});
                container.addEventListener('mousedown', (e) => this._mouseDownHandler(e));
                switch (this._host.agent) {
                    case 'safari':
                        container.addEventListener(
                            'gesturestart', (e) => this._gestureStartHandler(e), false);
                        break;
                    default:
                        container.addEventListener(
                            'touchstart', (e) => this._touchStartHandler(e), {passive: true});
                        break;
                }
                // key state
                this._keyCtrl = false;
                this._keyShift = false;
            })
            .catch((err) => {
                this.error(err, null, null);
            });
    }

    updateThemeColor() {
        let body = this._host._document.body;
        let theme = body.getAttribute('data-vscode-theme-kind');
        if (theme === 'vscode-dark') {
            this._theme = theme;
        } else {
            this._theme = undefined;
        }
    }

    applyThemeColor() {
        let body = this._host._document.body;
        let theme = this._theme;
        if (theme === 'vscode-dark') {
            body.classList.add('vscode-dark');
        } else {
            body.classList.remove('vscode-dark');
        }
    }

    show(page) {
        this.updateThemeColor();

        if (!page) {
            page = (!this._model && !this.activeGraph) ? 'welcome' : 'default';
        }
        this._host.screen(page);
        if (this._sidebar) {
            this._sidebar.close();
        }
        let classValue = page;
        if (this._theme) {
            classValue = classValue + ' ' + this._theme;
        }
        this._host.document.body.setAttribute('class', classValue);
        if (page === 'default') {
            const container = this._getElementById('graph');
            if (container) {
                container.focus();
            }
        }
        if (page === 'welcome') {
            const element = this._getElementById('open-file-button');
            if (element) {
                element.focus();
            }
        }
        this._page = page;

        if (this._host._viewingNode !== null) {
            this.showNodeProperties(this._graphs[0]._nodes[this._host._viewingNode], null);
        }
    }

    cut() {
        this._host.document.execCommand('cut');
    }

    copy() {
        this._host.document.execCommand('copy');
    }

    paste() {
        this._host.document.execCommand('paste');
    }

    selectAll() {
        this._host.document.execCommand('selectall');
    }

    find() {
        if (this._graph) {
            let hostMode = this._host._mode;
            this.clearSelection();
            const graphElement = this._getElementById('canvas');
            const view = new sidebar.FindSidebar(this._host, graphElement, this._graph);
            view.on('search-text-changed', (sender, text) => {
                this._searchText = text;
            });
            view.on('select', (sender, selection) => {
                this.select(selection);
            });
            this._sidebar.open(view.content, 'Find');
            view.focus(this._searchText);
        }
    }

    get model() {
        return this._model;
    }

    get options() {
        return this._options;
    }

    toggle(name) {
        switch (name) {
            case 'names':
            case 'attributes':
            case 'initializers':
                this._options[name] = !this._options[name];
                this._reload();
                break;
            case 'direction':
                this._options.direction =
                    this._options.direction === 'vertical' ? 'horizontal' : 'vertical';
                this._reload();
                break;
            case 'mousewheel':
                this._options.mousewheel =
                    this._options.mousewheel === 'scroll' ? 'zoom' : 'scroll';
                break;
            default:
                throw new view.Error('Unsupported toogle \'' + name + '\'.');
        }
    }

    _reload() {
        this.show('welcome spinner');
        if (this._model && this._graphs.length > 0) {
            this._updateGraph(this._model, this._graphs).catch((error) => {
                if (error) {
                    this.error(error, 'Graph update failed.', 'welcome');
                }
            });
        }
    }

    _timeout(time) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    _getElementById(id) {
        return this._host.document.getElementById(id + this._id);
    }

    zoomIn() {
        this._updateZoom(this._zoom * 1.1);
    }

    zoomOut() {
        this._updateZoom(this._zoom * 0.9);
    }

    resetZoom() {
        this._updateZoom(1);
    }

    _preventDefault(e) {
        if (e.shiftKey || e.ctrlKey) {
            e.preventDefault();
        }
    }

    _updateZoom(zoom, e) {
        const container = this._getElementById('graph');
        const canvas = this._getElementById('canvas');
        const limit = this._options.direction === 'vertical' ?
            container.clientHeight / this._height :
            container.clientWidth / this._width;
        const min = Math.min(Math.max(limit, 0.15), 1);
        zoom = Math.max(min, Math.min(zoom, 1.4));
        const scrollLeft = this._scrollLeft || container.scrollLeft;
        const scrollTop = this._scrollTop || container.scrollTop;
        const x = (e ? e.pageX : (container.clientWidth / 2)) + scrollLeft;
        const y = (e ? e.pageY : (container.clientHeight / 2)) + scrollTop;
        const width = zoom * this._width;
        const height = zoom * this._height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        this._scrollLeft = Math.max(0, ((x * zoom) / this._zoom) - (x - scrollLeft));
        this._scrollTop = Math.max(0, ((y * zoom) / this._zoom) - (y - scrollTop));
        container.scrollLeft = this._scrollLeft;
        container.scrollTop = this._scrollTop;
        this._zoom = zoom;
    }

    _mouseDownHandler(e) {
        if (e.buttons === 1) {
            const document = this._host.document.documentElement;
            document.style.cursor = 'grabbing';
            const container = this._getElementById('graph');
            this._mousePosition =
                {left: container.scrollLeft, top: container.scrollTop, x: e.clientX, y: e.clientY};
            e.stopImmediatePropagation();
            const mouseMoveHandler = (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                const dx = e.clientX - this._mousePosition.x;
                const dy = e.clientY - this._mousePosition.y;
                this._mousePosition.moved = dx * dx + dy * dy > 0;
                if (this._mousePosition.moved) {
                    const container = this._getElementById('graph');
                    container.scrollTop = this._mousePosition.top - dy;
                    container.scrollLeft = this._mousePosition.left - dx;
                }
            };
            const mouseUpHandler = () => {
                document.style.cursor = null;
                container.removeEventListener('mouseup', mouseUpHandler);
                container.removeEventListener('mouseleave', mouseUpHandler);
                container.removeEventListener('mousemove', mouseMoveHandler);
                if (this._mousePosition && this._mousePosition.moved) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    delete this._mousePosition;
                    document.addEventListener('click', clickHandler, true);
                }
                // delay reset key status as view.Node's 'click' event is fired
                // after this method
                setTimeout(() => {
                    this._keyCtrl = false;
                    this._keyShift = false;
                }, 1);
            };
            const clickHandler = (e) => {
                e.stopPropagation();
                document.removeEventListener('click', clickHandler, true);
            };
            container.addEventListener('mousemove', mouseMoveHandler);
            container.addEventListener('mouseup', mouseUpHandler);
            container.addEventListener('mouseleave', mouseUpHandler);

            this._keyShift = e.shiftKey;
            this._keyCtrl = e.ctrlKey;
        }
    }

    _touchStartHandler(e) {
        if (e.touches.length === 2) {
            this._touchPoints = Array.from(e.touches);
            this._touchZoom = this._zoom;
        }
        const touchMoveHandler = (e) => {
            if (Array.isArray(this._touchPoints) && this._touchPoints.length === 2 &&
                e.touches.length === 2) {
                const distance = (points) => {
                    const dx = (points[1].clientX - points[0].clientX);
                    const dy = (points[1].clientY - points[0].clientY);
                    return Math.sqrt(dx * dx + dy * dy);
                };
                const d1 = distance(Array.from(e.touches));
                const d2 = distance(this._touchPoints);
                if (d2 !== 0) {
                    const points = this._touchPoints;
                    const e = {
                        pageX: (points[1].pageX + points[0].pageX) / 2,
                        pageY: (points[1].pageY + points[0].pageY) / 2
                    };
                    const zoom = d2 === 0 ? d1 : d1 / d2;
                    this._updateZoom(this._touchZoom * zoom, e);
                }
            }
        };
        const touchEndHandler = () => {
            container.removeEventListener('touchmove', touchMoveHandler, {passive: true});
            container.removeEventListener('touchcancel', touchEndHandler, {passive: true});
            container.removeEventListener('touchend', touchEndHandler, {passive: true});
            delete this._touchPoints;
            delete this._touchZoom;
        };
        const container = this._getElementById('graph');
        container.addEventListener('touchmove', touchMoveHandler, {passive: true});
        container.addEventListener('touchcancel', touchEndHandler, {passive: true});
        container.addEventListener('touchend', touchEndHandler, {passive: true});
    }

    _gestureStartHandler(e) {
        e.preventDefault();
        this._gestureZoom = this._zoom;
        const container = this._getElementById('graph');
        const gestureChangeHandler = (e) => {
            e.preventDefault();
            this._updateZoom(this._gestureZoom * e.scale, e);
        };
        const gestureEndHandler = (e) => {
            container.removeEventListener('gesturechange', gestureChangeHandler, false);
            container.removeEventListener('gestureend', gestureEndHandler, false);
            e.preventDefault();
            if (this._gestureZoom) {
                this._updateZoom(this._gestureZoom * e.scale, e);
                delete this._gestureZoom;
            }
        };
        container.addEventListener('gesturechange', gestureChangeHandler, false);
        container.addEventListener('gestureend', gestureEndHandler, false);
    }

    _scrollHandler(e) {
        if (this._scrollLeft && e.target.scrollLeft !== Math.floor(this._scrollLeft)) {
            delete this._scrollLeft;
        }
        if (this._scrollTop && e.target.scrollTop !== Math.floor(this._scrollTop)) {
            delete this._scrollTop;
        }
    }

    _wheelHandler(e) {
        if (e.shiftKey || e.ctrlKey || this._options.mousewheel === 'zoom') {
            const delta = -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) *
                (e.ctrlKey ? 10 : 1);
            this._updateZoom(this._zoom * Math.pow(2, delta), e);
            e.preventDefault();
        }
    }

    select(selection) {
        this.clearSelection();
        if (selection && selection.length > 0) {
            const container = this._getElementById('graph');
            let x = 0;
            let y = 0;
            for (const element of selection) {
                element.classList.add('select');
                this._selection.push(element);
                const rect = element.getBoundingClientRect();
                x += rect.left + (rect.width / 2);
                y += rect.top + (rect.height / 2);
            }
            x = x / selection.length;
            y = y / selection.length;
            const rect = container.getBoundingClientRect();
            const left = (container.scrollLeft + x - rect.left) - (rect.width / 2);
            const top = (container.scrollTop + y - rect.top) - (rect.height / 2);
            container.scrollTo({left: left, top: top, behavior: 'smooth'});
        }
    }

    clearSelection() {
        while (this._selection.length > 0) {
            const element = this._selection.pop();
            element.classList.remove('select');
        }
    }

    error(err, name, screen) {
        if (this._sidebar) {
            this._sidebar.close();
        }
        this._host.exception(err, false);

        // clang-format off
    const knowns = [
      { name: '', message: /^Invalid argument identifier/, url: 'https://github.com/lutzroeder/netron/issues/540' },
      { name: '', message: /^Cannot read property/, url: 'https://github.com/lutzroeder/netron/issues/647' },
      { name: '', message: /^Failed to render tensor/, url: 'https://github.com/lutzroeder/netron/issues/681' },
      { name: 'Error', message: /^EPERM: operation not permitted/, url: 'https://github.com/lutzroeder/netron/issues/551' },
      { name: 'Error', message: /^EACCES: permission denied/, url: 'https://github.com/lutzroeder/netron/issues/504' },
      { name: 'RangeError', message: /^Offset is outside the bounds of the DataView/, url: 'https://github.com/lutzroeder/netron/issues/563' },
      { name: 'RangeError', message: /^start offset of Int32Array/, url: 'https://github.com/lutzroeder/netron/issues/565' },
      { name: 'RangeError', message: /^Maximum call stack size exceeded/, url: 'https://github.com/lutzroeder/netron/issues/589' },
      { name: 'RangeError', message: /^Invalid string length/, url: 'https://github.com/lutzroeder/netron/issues/648' },
      { name: 'Error loading model.', message: /^Unsupported file content \(/, url: 'https://github.com/lutzroeder/netron/issues/550' },
      { name: 'Error loading model.', message: /^Unsupported Protocol Buffers content/, url: 'https://github.com/lutzroeder/netron/issues/593' },
      { name: 'Error loading model.', message: /^Unsupported Protocol Buffers text content/, url: 'https://github.com/lutzroeder/netron/issues/594' },
      { name: 'Error loading model.', message: /^Unsupported JSON content/, url: 'https://github.com/lutzroeder/netron/issues/595' },
      { name: 'Error loading Caffe model.', message: /^File format is not caffe\.NetParameter/, url: 'https://github.com/lutzroeder/netron/issues/563' },
      { name: 'Error loading Darknet model.', message: /^Invalid tensor shape/, url: 'https://github.com/lutzroeder/netron/issues/541' },
      { name: 'Error loading Keras model.', message: /^Unsupported data object header version/, url: 'https://github.com/lutzroeder/netron/issues/548' },
      { name: 'Error loading MNN model.', message: /^File format is not mnn\.Net/, url: 'https://github.com/lutzroeder/netron/issues/746' },
      { name: 'Error loading PyTorch model.', message: /^File does not contain root module or state dictionary/, url: 'https://github.com/lutzroeder/netron/issues/543' },
      { name: 'Error loading PyTorch model.', message: /^Module does not contain modules/, url: 'https://github.com/lutzroeder/netron/issues/544' },
      { name: 'Error loading PyTorch model.', message: /^Failed to resolve module/, url: 'https://github.com/lutzroeder/netron/issues/545' },
      { name: 'Error loading PyTorch model.', message: /^Unsupported function/, url: 'https://github.com/lutzroeder/netron/issues/546' },
      { name: 'Error loading PyTorch model.', message: /^Unsupported uninitialized argument/, url: 'https://github.com/lutzroeder/netron/issues/547' },
      { name: 'Error loading ONNX model.', message: /^File format is not onnx\.ModelProto/, url: 'https://github.com/lutzroeder/netron/issues/549' },
      { name: 'Error loading TensorFlow model.', message: /^File text format is not TensorFlow\.js graph-model/, url: 'https://github.com/lutzroeder/netron/issues/764' },
      { name: 'Error loading TensorFlow Lite model.', message: /^Offset is outside the bounds of the DataView/, url: 'https://github.com/lutzroeder/netron/issues/563' },
      { name: 'Error loading UFF model.', message: /^Unknown attribute/, url: 'https://github.com/lutzroeder/netron/issues/649' }
    ];
        // clang-format on
        const known = knowns.find(
            (known) => (known.name.length === 0 || known.name === err.name) &&
                err.message.match(known.message));
        const message = err.message +
            (known ? '\n\nPlease provide information about this issue at ' + known.url + '.' : '');
        name = name || err.name;
        this._host.error(name, message);
        this.show(screen !== undefined ? screen : 'welcome');
        if (known) {
            this._host.openURL(known.url);
        }
    }

    accept(file) {
        return this._modelFactoryService.accept(file);
    }

    open(context) {
        this._host.event('Model', 'Open', 'Size', context.stream ? context.stream.length : 0);
        this._sidebar.close();
        return this._timeout(2).then(() => {
            return this._modelFactoryService.open(context).then((model) => {
                const format = [];
                if (model.format) {
                    format.push(model.format);
                }
                if (model.producer) {
                    format.push('(' + model.producer + ')');
                }
                if (format.length > 0) {
                    this._host.event('Model', 'Format', format.join(' '));
                }
                return this._timeout(20).then(() => {
                    const graphs = Array.isArray(model.graphs) && model.graphs.length > 0 ?
                        [model.graphs[this._host._viewingSubgraph]] :
                        [];
                    return this._updateGraph(model, graphs);
                });
            });
        });
    }

    _updateActiveGraph(graph) {
        this._sidebar.close();
        if (this._model) {
            const model = this._model;
            this.show('welcome spinner');
            this._timeout(200).then(() => {
                return this._updateGraph(model, [graph]).catch((error) => {
                    if (error) {
                        this.error(error, 'Graph update failed.', 'welcome');
                    }
                });
            });
        }
    }

    get activeGraph() {
        return Array.isArray(this._graphs) && this._graphs.length > 0 ? this._graphs[0] : null;
    }

    _updateGraph(model, graphs) {
        const lastModel = this._model;
        const lastGraphs = this._graphs;
        this._model = model;
        this._graphs = graphs;
        const graph = this.activeGraph;
        return this._timeout(100).then(() => {
            if (graph && graph !== lastGraphs[0]) {
                const nodes = graph.nodes;
                if (nodes.length > 2048) {
                    if (!this._host.confirm(
                            'Large model detected.',
                            'This graph contains a large number of nodes and might take a long time to render. Do you want to continue?')) {
                        this._host.event('Graph', 'Render', 'Skip', nodes.length);
                        this.show(null);
                        return null;
                    }
                }
            }
            const update = () => {
                const nameButton = this._getElementById('name-button');
                const backButton = this._getElementById('back-button');
                if (this._graphs.length > 1) {
                    const graph = this.activeGraph;
                    nameButton.innerHTML = graph ? graph.name : '';
                    backButton.style.opacity = 1;
                    nameButton.style.opacity = 1;
                } else {
                    backButton.style.opacity = 0;
                    nameButton.style.opacity = 0;
                }
            };
            return this.renderGraph(this._model, this.activeGraph)
                .then(() => {
                    if (this._page !== 'default') {
                        this.show('default');
                    }
                    for (let idx = 0; idx < model.graphs.length; idx++) {
                        model._graphs[idx]['_subgraphIdx'] = idx;
                        for (let jdx = 0; jdx < model.graphs[idx].nodes.length; jdx++) {
                            model._graphs[idx]._nodes[jdx]['_subgraphIdx'] = idx;
                            if (model._graphs[idx]._nodes[jdx]._type?.category === 'custom') {
                                model._graphs[idx]._nodes[jdx]._isCustom = true;
                                vscode.postMessage({
                                    command: 'getCustomOpAttrT',
                                    data: {
                                        _subgraphIdx: idx,
                                        _nodeIdx: jdx,
                                    }
                                });
                            }
                        }
                    }
                    update();
                    return this._model;
                })
                .catch((error) => {
                    this._model = lastModel;
                    this._graphs = lastGraphs;
                    return this.renderGraph(this._model, this.activeGraph).then(() => {
                        if (this._page !== 'default') {
                            this.show('default');
                        }
                        update();
                        throw error;
                    });
                });
        });
    }

    pushGraph(graph) {
        if (graph !== this.activeGraph) {
            this._sidebar.close();
            this._updateGraph(this._model, [graph].concat(this._graphs));
        }
    }

    popGraph() {
        if (this._graphs.length > 1) {
            this._sidebar.close();
            return this._updateGraph(this._model, this._graphs.slice(1));
        }
        return null;
    }

    renderGraph(model, graph) {
        try {
            this._graph = null;

            const canvas = this._getElementById('canvas');
            while (canvas.lastChild) {
                canvas.removeChild(canvas.lastChild);
            }
            if (!graph) {
                return Promise.resolve();
            } else {
                this._zoom = 1;

                const groups = graph.groups;
                const nodes = graph.nodes;
                this._host.event('Graph', 'Render', 'Size', nodes.length);

                const options = {};
                options.nodesep = 20;
                options.ranksep = 20;
                const rotate = graph.nodes.every(
                    (node) => node.inputs
                                  .filter(
                                      (input) => input.arguments.every(
                                          (argument) => !argument.initializer))
                                  .length === 0 &&
                        node.outputs.length === 0);
                const horizontal = rotate ? this._options.direction === 'vertical' :
                                            this._options.direction !== 'vertical';
                if (horizontal) {
                    options.rankdir = 'LR';
                }
                if (nodes.length > 3000) {
                    options.ranker = 'longest-path';
                }

                const viewGraph = new view.Graph(this, model, groups, options);
                viewGraph.add(graph);

                // Workaround for Safari background drag/zoom issue:
                // https://stackoverflow.com/questions/40887193/d3-js-zoom-is-not-working-with-mousewheel-in-safari
                const background =
                    this._host.document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                background.setAttribute('id', 'background');
                background.setAttribute('fill', 'none');
                background.setAttribute('pointer-events', 'all');
                canvas.appendChild(background);

                const origin =
                    this._host.document.createElementNS('http://www.w3.org/2000/svg', 'g');
                origin.setAttribute('id', 'origin');
                canvas.appendChild(origin);

                viewGraph.build(this._host.document, origin);

                this._zoom = 1;

                return this._timeout(20).then(() => {
                    viewGraph.update();

                    const elements = Array.from(canvas.getElementsByClassName('graph-input') || []);
                    if (elements.length === 0) {
                        const nodeElements =
                            Array.from(canvas.getElementsByClassName('graph-node') || []);
                        if (nodeElements.length > 0) {
                            elements.push(nodeElements[0]);
                        }
                    }

                    const size = canvas.getBBox();
                    const margin = 100;
                    const width = Math.ceil(margin + size.width + margin);
                    const height = Math.ceil(margin + size.height + margin);
                    origin.setAttribute(
                        'transform',
                        'translate(' + margin.toString() + ', ' + margin.toString() + ') scale(1)');
                    background.setAttribute('width', width);
                    background.setAttribute('height', height);
                    this._width = width;
                    this._height = height;
                    delete this._scrollLeft;
                    delete this._scrollRight;
                    canvas.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);

                    this._zoom = 1;
                    this._updateZoom(this._zoom);

                    const container = this._getElementById('graph');
                    if (elements && elements.length > 0) {
                        // Center view based on input elements
                        const xs = [];
                        const ys = [];
                        for (let i = 0; i < elements.length; i++) {
                            const element = elements[i];
                            const rect = element.getBoundingClientRect();
                            xs.push(rect.left + (rect.width / 2));
                            ys.push(rect.top + (rect.height / 2));
                        }
                        let x = xs[0];
                        const y = ys[0];
                        if (ys.every(y => y === ys[0])) {
                            x = xs.reduce((a, b) => a + b, 0) / xs.length;
                        }
                        const graphRect = container.getBoundingClientRect();
                        const left =
                            (container.scrollLeft + x - graphRect.left) - (graphRect.width / 2);
                        const top =
                            (container.scrollTop + y - graphRect.top) - (graphRect.height / 2);
                        container.scrollTo({left: left, top: top, behavior: 'auto'});
                    } else {
                        const canvasRect = canvas.getBoundingClientRect();
                        const graphRect = container.getBoundingClientRect();
                        const left =
                            (container.scrollLeft + (canvasRect.width / 2) - graphRect.left) -
                            (graphRect.width / 2);
                        const top =
                            (container.scrollTop + (canvasRect.height / 2) - graphRect.top) -
                            (graphRect.height / 2);
                        container.scrollTo({left: left, top: top, behavior: 'auto'});
                    }
                    this._graph = viewGraph;
                    return;
                });
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    applyStyleSheet(element, name) {
        let rules = [];
        for (const styleSheet of this._host.document.styleSheets) {
            if (styleSheet && styleSheet.href && styleSheet.href.endsWith('/' + name)) {
                rules = styleSheet.cssRules;
                break;
            }
        }
        const nodes = element.getElementsByTagName('*');
        for (const node of nodes) {
            for (const rule of rules) {
                if (node.matches(rule.selectorText)) {
                    for (const item of rule.style) {
                        node.style[item] = rule.style[item];
                    }
                }
            }
        }
    }

    export(file) {
        const lastIndex = file.lastIndexOf('.');
        const extension = (lastIndex !== -1) ? file.substring(lastIndex + 1) : '';
        if (this.activeGraph && (extension === 'png' || extension === 'svg')) {
            const canvas = this._getElementById('canvas');
            const clone = canvas.cloneNode(true);
            this.applyStyleSheet(clone, 'view-grapher.css');
            clone.setAttribute('id', 'export');
            clone.removeAttribute('viewBox');
            clone.removeAttribute('width');
            clone.removeAttribute('height');
            clone.style.removeProperty('opacity');
            clone.style.removeProperty('display');
            const background = clone.querySelector('#background');
            const origin = clone.querySelector('#origin');
            origin.setAttribute('transform', 'translate(0,0) scale(1)');
            background.removeAttribute('width');
            background.removeAttribute('height');

            const parent = canvas.parentElement;
            parent.insertBefore(clone, canvas);
            const size = clone.getBBox();
            parent.removeChild(clone);
            parent.removeChild(canvas);
            parent.appendChild(canvas);
            const delta = (Math.min(size.width, size.height) / 2.0) * 0.1;
            const width = Math.ceil(delta + size.width + delta);
            const height = Math.ceil(delta + size.height + delta);
            origin.setAttribute(
                'transform',
                'translate(' + (delta - size.x).toString() + ', ' + (delta - size.y).toString() +
                    ') scale(1)');
            clone.setAttribute('width', width);
            clone.setAttribute('height', height);
            background.setAttribute('width', width);
            background.setAttribute('height', height);
            background.setAttribute('fill', '#fff');

            const data = new XMLSerializer().serializeToString(clone);

            if (extension === 'svg') {
                const blob = new Blob([data], {type: 'image/svg'});
                this._host.export(file, blob);
            }

            if (extension === 'png') {
                const image = new Image();
                image.onload = () => {
                    const max = Math.max(width, height);
                    const scale = Math.min(24000.0 / max, 2.0);
                    const canvas = this._host.document.createElement('canvas');
                    canvas.width = Math.ceil(width * scale);
                    canvas.height = Math.ceil(height * scale);
                    const context = canvas.getContext('2d');
                    context.scale(scale, scale);
                    context.drawImage(image, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            this._host.export(file, blob);
                        } else {
                            const err = new Error();
                            err.name = 'Error exporting image.';
                            err.message = 'Image may be too large to render as PNG.';
                            this._host.exception(err, false);
                            this._host.error(err.name, err.message);
                        }
                    }, 'image/png');
                };
                image.src = 'data:image/svg+xml;base64,' +
                    this._host.window.btoa(unescape(encodeURIComponent(data)));
            }
        }
    }

    showModelProperties() {
        if (this._model) {
            try {
                const modelSidebar =
                    new sidebar.ModelSidebar(this._host, this._model, this.activeGraph);
                modelSidebar.on('update-active-graph', (sender, graph) => {
                    this._updateActiveGraph(graph);
                    this._host._viewingSubgraph = graph._subgraphIdx;
                    this._host._viewingNode = null;
                });
                const content = modelSidebar.render();
                this._host._viewingNode = null;
                this._sidebar.open(content, 'Model Properties');
            } catch (error) {
                const content = ' in \'' + this._model.identifier + '\'.';
                if (error && !error.message.endsWith(content) &&
                    (error.context === undefined || error.context === true)) {
                    error.message = error.message.replace(/\.$/, '') + content;
                }
                this.error(error, 'Error showing model properties.', null);
            }
        }
    }

    showNodeProperties(node, input) {
        if (node) {
            try {
                const nodeSidebar = new sidebar.NodeSidebar(this._host, node);
                nodeSidebar.on('show-documentation', (/* sender, e */) => {
                    this.showDocumentation(node.type);
                });
                nodeSidebar.on('show-graph', (sender, graph) => {
                    this.pushGraph(graph);
                });
                nodeSidebar.on('export-tensor', (sender, tensor) => {
                    const defaultPath = tensor.name ?
                        tensor.name.split('/').join('_').split(':').join('_').split('.').join('_') :
                        'tensor';
                    this._host.save('NumPy Array', 'npy', defaultPath, (file) => {
                        try {
                            // eslint-disable-next-line
                            let data_type = tensor.type.dataType;
                            if (data_type === 'boolean') {
                                data_type = 'bool';
                            }
                            const execution = new python.Execution(null);
                            const bytes = execution.invoke('io.BytesIO', []);
                            const dtype = execution.invoke('numpy.dtype', [data_type]);
                            const array = execution.invoke('numpy.asarray', [tensor.value, dtype]);
                            execution.invoke('numpy.save', [bytes, array]);
                            bytes.seek(0);
                            const blob =
                                new Blob([bytes.read()], {type: 'application/octet-stream'});
                            this._host.export(file, blob);
                        } catch (error) {
                            this.error(error, 'Error saving NumPy tensor.', null);
                        }
                    });
                });
                nodeSidebar.on('error', (sender, error) => {
                    if (this._model) {
                        error.message = error.message.replace(/\.$/, '') + ' in \'' +
                            this._model.identifier + '\'.';
                    }
                    this.error(error, null, null);
                });
                if (input) {
                    nodeSidebar.toggleInput(input.name);
                }
                this._sidebar.open(nodeSidebar.render(), 'Node Properties');

                this._host._viewingNode = parseInt(node._location);
            } catch (error) {
                const content = ' in \'' + this._model.identifier + '\'.';
                if (error && !error.message.endsWith(content) &&
                    (error.context === undefined || error.context === true)) {
                    error.message = error.message.replace(/\.$/, '') + content;
                }
                this.error(error, 'Error showing node properties.', null);
            }
        }
    }

    showDocumentation(type) {
        if (type && (type.description || type.inputs || type.outputs || type.attributes)) {
            if (type.nodes && type.nodes.length > 0) {
                this.pushGraph(type);
            }
            const documentationSidebar = new sidebar.DocumentationSidebar(this._host, type);
            documentationSidebar.on('navigate', (sender, e) => {
                this._host.openURL(e.link);
            });
            const title = type.type === 'function' ? 'Function' : 'Documentation';
            this._host._viewingNode = null;
            this._sidebar.push(documentationSidebar.render(), title);
        }
    }
};

view.ModelFactoryService = class {
    constructor(host) {
        this._host = host;
        this._extensions = new Set(['.zip', '.tar', '.tar.gz', '.tgz', '.gz']);
        this._factories = [];
        this.register('./circle', ['.circle']);
    }
    register(id, factories, containers) {
        for (const extension of factories) {
            this._factories.push({extension: extension, id: id});
            this._extensions.add(extension);
        }
        for (const extension of containers || []) {
            this._extensions.add(extension);
        }
    }

    open(context) {
        return this._openSignature(context).then((context) => {
            const containers = new Map();
            let stream = context.stream;
            const entries = context.entries;
            if (!stream && entries && entries.size > 0) {
                containers.set('', entries);
            } else {
                const identifier = context.identifier;
                try {
                    const archive = gzip.Archive.open(stream);
                    if (archive) {
                        const entries = archive.entries;
                        containers.set('gzip', entries);
                        if (entries.size === 1) {
                            stream = entries.values().next().value;
                        }
                    }
                } catch (error) {
                    const message = error && error.message ? error.message : error.toString();
                    throw new view.ArchiveError(
                        message.replace(/\.$/, '') + ' in \'' + identifier + '\'.');
                }
                try {
                    const formats = new Map([['zip', zip], ['tar', tar]]);
                    for (const pair of formats) {
                        const format = pair[0];
                        const module = pair[1];
                        const archive = module.Archive.open(stream);
                        if (archive) {
                            containers.set(format, archive.entries);
                            containers.delete('gzip');
                            break;
                        }
                    }
                } catch (error) {
                    const message = error && error.message ? error.message : error.toString();
                    throw new view.ArchiveError(
                        message.replace(/\.$/, '') + ' in \'' + identifier + '\'.');
                }
            }

            const modelContext = new view.ModelContext(context, containers);
            /* eslint-disable consistent-return */
            return this._openContext(modelContext).then((model) => {
                if (model) {
                    return model;
                }
                if (containers.size > 0) {
                    return this._openEntries(containers.values().next().value).then((context) => {
                        if (context) {
                            return this._openContext(context);
                        }
                        this._unsupported(modelContext);
                    });
                }
                this._unsupported(modelContext);
            });
            /* eslint-enable consistent-return */
        });
    }

    _unsupported(context) {
        const identifier = context.identifier;
        const extension = identifier.split('.').pop().toLowerCase();
        const stream = context.stream;
        for (const module of [zip, tar, gzip]) {
            let archive = null;
            try {
                archive = module.Archive.open(stream);
            } catch (error) {
                // continue regardless of error
            }
            if (archive) {
                throw new view.Error(
                    'Archive contains no model files in \'' + identifier + '\'.', true);
            }
        }
        const skip = () => {
            const knownUnsupportedIdentifiers = new Set([
                'natives_blob.bin', 'v8_context_snapshot.bin', 'snapshot_blob.bin',
                'image_net_labels.json', 'package.json', 'models.json', 'LICENSE.meta',
                'input_0.pb', 'output_0.pb'
            ]);
            return knownUnsupportedIdentifiers.has(context.identifier);
        };
        const json = () => {
            const obj = context.open('json');
            if (obj) {
                // clang-format off
        const formats = [
          { name: 'Netron metadata', tags: [ '[].name', '[].schema' ] },
          { name: 'Netron metadata', tags: [ '[].name', '[].attributes' ] },
          { name: 'Netron metadata', tags: [ '[].name', '[].category' ] },
          { name: 'Darkflow metadata', tags: [ 'net', 'type', 'model' ] },
          { name: 'keras-yolo2 configuration', tags: [ 'model', 'train', 'valid' ] },
          { name: 'Vulkan SwiftShader ICD manifest', tags: [ 'file_format_version', 'ICD' ] },
          { name: 'DeepLearningExamples configuration', tags: [ 'attention_probs_dropout_prob', 'hidden_act', 'hidden_dropout_prob', 'hidden_size', ] },
          { name: 'NuGet assets', tags: [ 'version', 'targets', 'packageFolders' ] },
          { name: 'NuGet data', tags: [ 'format', 'restore', 'projects' ] },
          { name: 'NPM package', tags: [ 'name', 'version', 'dependencies' ] },
          { name: 'NetworkX adjacency_data', tags: [ 'directed', 'graph', 'nodes' ] },
          { name: 'Waifu2x data', tags: [ 'name', 'arch_name', 'channels' ] },
          { name: 'Waifu2x data', tags: [ '[].nInputPlane', '[].nOutputPlane', '[].weight', '[].bias' ] },
          { name: 'Brain.js data', tags: [ 'type', 'sizes', 'layers' ] },
          { name: 'Custom Vision metadata', tags: [ 'CustomVision.Metadata.Version' ] }
        ];
                // clang-format on
                const match = (obj, tag) => {
                    if (tag.startsWith('[].')) {
                        tag = tag.substring(3);
                        return (
                            Array.isArray(obj) &&
                            obj.some((item) => Object.prototype.hasOwnProperty.call(item, tag)));
                    }
                    return Object.prototype.hasOwnProperty.call(obj, tag);
                };
                for (const format of formats) {
                    if (format.tags.every((tag) => match(obj, tag))) {
                        throw new view.Error(
                            'Invalid file content. File contains ' + format.name + '.', true);
                    }
                }
                const content =
                    JSON.stringify(obj).substring(0, 100).replace(/\s/, '').substr(0, 48) + '...';
                throw new view.Error(
                    'Unsupported JSON content \'' +
                        (content.length > 64 ? content.substring(0, 100) + '...' : content) +
                        '\' for extension \'.' + extension + '\' in \'' + identifier + '\'.',
                    !skip());
            }
        };
        const pbtxt = () => {
            // clang-format off
      const formats = [
        { name: 'ImageNet LabelMap data', tags: [ 'entry', 'entry.target_class' ] },
        { name: 'StringIntLabelMapProto data', tags: [ 'item', 'item.id', 'item.name' ] },
        { name: 'caffe.LabelMap data', tags: [ 'item', 'item.name', 'item.label' ] },
        { name: 'Triton Inference Server configuration', tags: [ 'name', 'platform', 'input', 'output' ] },
        { name: 'TensorFlow OpList data', tags: [ 'op', 'op.name', 'op.input_arg' ] },
        { name: 'vitis.ai.proto.DpuModelParamList data', tags: [ 'model', 'model.name', 'model.kernel' ] },
        { name: 'object_detection.protos.DetectionModel data', tags: [ 'model', 'model.ssd' ] },
        { name: 'object_detection.protos.DetectionModel data', tags: [ 'model', 'model.faster_rcnn' ] },
        { name: 'tensorflow.CheckpointState data', tags: [ 'model_checkpoint_path', 'all_model_checkpoint_paths' ] },
        { name: 'apollo.perception.camera.traffic_light.detection.DetectionParam data', tags: [ 'min_crop_size', 'crop_method' ] },
        { name: 'tidl_meta_arch.TIDLMetaArch data', tags: [ 'caffe_ssd' ] }, // https://github.com/TexasInstruments/edgeai-mmdetection/blob/master/mmdet/utils/proto/mmdet_meta_arch.proto
        { name: 'tidl_meta_arch.TIDLMetaArch data', tags: [ 'tf_od_api_ssd' ] },
        { name: 'tidl_meta_arch.TIDLMetaArch data', tags: [ 'tidl_ssd' ] },
        { name: 'tidl_meta_arch.TIDLMetaArch data', tags: [ 'tidl_faster_rcnn' ] },
        { name: 'tidl_meta_arch.TIDLMetaArch data', tags: [ 'tidl_yolo' ] },
        { name: 'tidl_meta_arch.TIDLMetaArch data', tags: [ 'tidl_retinanet' ] },
        { name: 'domi.InsertNewOps data', tags: [ 'aipp_op' ] } // https://github.com/Ascend/parser/blob/development/parser/proto/insert_op.proto
      ];
            // clang-format on
            const tags = context.tags('pbtxt');
            if (tags.size > 0) {
                for (const format of formats) {
                    if (format.tags.every((tag) => tags.has(tag))) {
                        throw new view.Error(
                            'Invalid file content. File contains ' + format.name + '.', true);
                    }
                }
                const entries = [];
                entries.push(
                    ...Array.from(tags).filter((pair) => pair[0].toString().indexOf('.') === -1));
                entries.push(
                    ...Array.from(tags).filter((pair) => pair[0].toString().indexOf('.') !== -1));
                const content =
                    entries
                        .map(
                            (pair) => pair[1] === true ? pair[0] :
                                                         pair[0] + ':' + JSON.stringify(pair[1]))
                        .join(',');
                throw new view.Error(
                    'Unsupported Protocol Buffers text content \'' +
                        (content.length > 64 ? content.substring(0, 100) + '...' : content) +
                        '\' for extension \'.' + extension + '\' in \'' + identifier + '\'.',
                    !skip());
            }
        };
        const pb = () => {
            const tags = context.tags('pb+');
            if (Object.keys(tags).length > 0) {
                const formats = [
          { name: 'sentencepiece.ModelProto data', tags: [[1,[[1,2],[2,5],[3,0]]],[2,[[1,2],[2,2],[3,0],[4,0],[5,2],[6,0],[7,2],[10,5],[16,0],[40,0],[41,0],[42,0],[43,0]]],[3,[]],[4,[]],[5,[]]] },
          { name: 'mediapipe.BoxDetectorIndex data', tags: [[1,[[1,[[1,[[1,5],[2,5],[3,5],[4,5],[6,0],[7,5],[8,5],[10,5],[11,0],[12,0]]],[2,5],[3,[]]]],[2,false],[3,false],[4,false],[5,false]]],[2,false],[3,false]] },
          { name: 'third_party.tensorflow.python.keras.protobuf.SavedMetadata data', tags: [[1,[[1,[[1,0],[2,0]]],[2,0],[3,2],[4,2],[5,2]]]] },
          { name: 'pblczero.Net data', tags: [[1,5],[2,2],[3,[[1,0],[2,0],[3,0]],[10,[[1,[]],[2,[]],[3,[]],[4,[]],[5,[]],[6,[]]]],[11,[]]]] } // https://github.com/LeelaChessZero/lczero-common/blob/master/proto/net.proto
        ];
                const match = (tags, schema) => {
                    for (const pair of schema) {
                        const key = pair[0];
                        const inner = pair[1];
                        const value = tags[key];
                        if (value === undefined) {
                            continue;
                        }
                        if (inner === false) {
                            return false;
                        }
                        if (Array.isArray(inner)) {
                            if (typeof value !== 'object' || !match(value, inner)) {
                                return false;
                            }
                        } else if (inner !== value) {
                            if (inner === 2 && !Array.isArray(value) && Object(value) === (value) &&
                                Object.keys(value).length === 0) {
                                return true;
                            }
                            return false;
                        }
                    }
                    return true;
                };
                const tags = context.tags('pb+');
                for (const format of formats) {
                    if (match(tags, format.tags)) {
                        throw new view.Error(
                            'Invalid file content. File contains ' + format.name + '.', true);
                    }
                }
                const format = (tags) => {
                    const content = Object.entries(tags).map((pair) => {
                        const key = pair[0];
                        const value = pair[1];
                        return key.toString() + ':' +
                            (Object(value) === value ? '{' + format(value) + '}' :
                                                       value.toString());
                    });
                    return content.join(',');
                };
                const content = format(tags);
                throw new view.Error(
                    'Unsupported Protocol Buffers content \'' +
                        (content.length > 64 ? content.substring(0, 100) + '...' : content) +
                        '\' for extension \'.' + extension + '\' in \'' + identifier + '\'.',
                    !skip());
            }
        };
        const flatbuffers = () => {
            const tags = context.tags('flatbuffers');
            if (tags.has('file_identifier')) {
                // eslint-disable-next-line
                const file_identifier = tags.get('file_identifier');
                const formats = [
                    {
                        name: 'onnxruntime.experimental.fbs.InferenceSession data',
                        identifier: 'ORTM'
                    },
                    {name: 'tflite.Model data', identifier: 'TFL3'},
                    {name: 'FlatBuffers ENNC data', identifier: 'ENNC'},
                ];
                for (const format of formats) {
                    if (file_identifier === format.identifier) {
                        throw new view.Error(
                            'Invalid file content. File contains ' + format.name + '.', true);
                    }
                }
            }
        };
        const xml = () => {
            const tags = context.tags('xml');
            if (tags.size > 0) {
                const formats = [
                    {name: 'OpenCV storage data', tags: ['opencv_storage']},
                    {name: 'XHTML markup', tags: ['http://www.w3.org/1999/xhtml:html']}
                ];
                for (const format of formats) {
                    if (format.tags.some((tag) => tags.has(tag))) {
                        throw new view.Error(
                            'Invalid file content. File contains ' + format.name + '.', true);
                    }
                }
                throw new view.Error(
                    'Unsupported XML content \'' + tags.keys().next().value + '\' in \'' +
                        identifier + '\'.',
                    !skip());
            }
        };
        const unknown = () => {
            stream.seek(0);
            const buffer = stream.peek(Math.min(16, stream.length));
            const bytes =
                Array.from(buffer).map((c) => (c < 16 ? '0' : '') + c.toString(16)).join('');
            const content = stream.length > 268435456 ?
                '(' + bytes + ') [' + stream.length.toString() + ']' :
                '(' + bytes + ')';
            throw new view.Error(
                'Unsupported file content ' + content + ' for extension \'.' + extension +
                    '\' in \'' + identifier + '\'.',
                !skip());
        };
        json();
        pbtxt();
        pb();
        flatbuffers();
        xml();
        unknown();
    }

    _openContext(context) {
        const modules = this._filter(context).filter((module) => module && module.length > 0);
        const errors = [];
        let success = false;
        const nextModule = () => {
            if (modules.length > 0) {
                const id = modules.shift();
                return this._host.require(id).then((module) => {
                    const updateErrorContext = (error, context) => {
                        const content = ' in \'' + context.identifier + '\'.';
                        if (error && typeof error.message === 'string' &&
                            !error.message.endsWith(content) &&
                            (error.context === undefined || error.context === true)) {
                            error.message = error.message.replace(/\.$/, '') + content;
                        }
                    };
                    if (!module.ModelFactory) {
                        throw new view.Error('Failed to load module \'' + id + '\'.');
                    }
                    const modelFactory = new module.ModelFactory();
                    let match = undefined;
                    try {
                        match = modelFactory.match(context);
                        if (!match) {
                            return nextModule();
                        }
                    } catch (error) {
                        updateErrorContext(error, context);
                        return Promise.reject(error);
                    }
                    success = true;
                    return modelFactory.open(context, match)
                        .then((model) => {
                            if (!model.identifier) {
                                model.identifier = context.identifier;
                            }
                            return model;
                        })
                        .catch((error) => {
                            updateErrorContext(error, context);
                            errors.push(error);
                            return nextModule();
                        });
                });
            } else {
                if (success) {
                    if (errors.length === 1) {
                        const error = errors[0];
                        return Promise.reject(error);
                    }
                    return Promise.reject(
                        new view.Error(errors.map((err) => err.message).join('\n')));
                }
                return Promise.resolve(null);
            }
        };
        return nextModule();
    }

    _openEntries(entries) {
        try {
            const rootFolder = (files) => {
                const map = files.map((file) => file.split('/').slice(0, -1));
                const at = index => list => list[index];
                const rotate = list =>
                    list.length === 0 ? [] : list[0].map((item, index) => list.map(at(index)));
                const equals = list => list.every((item) => item === list[0]);
                const folder = rotate(map).filter(equals).map(at(0)).join('/');
                return folder.length === 0 ? folder : folder + '/';
            };
            const filter = (queue) => {
                let matches = [];
                const nextEntry = () => {
                    if (queue.length > 0) {
                        const entry = queue.shift();
                        const context = new view.ModelContext(new view.ArchiveContext(
                            this._host, null, folder, entry.name, entry.stream));
                        let modules = this._filter(context);
                        const nextModule = () => {
                            if (modules.length > 0) {
                                const id = modules.shift();
                                return this._host.require(id).then((module) => {
                                    if (!module.ModelFactory) {
                                        throw new view.ArchiveError(
                                            'Failed to load module \'' + id + '\'.', null);
                                    }
                                    const factory = new module.ModelFactory();
                                    if (factory.match(context)) {
                                        matches.push(entry);
                                        modules = [];
                                    }
                                    return nextModule();
                                });
                            } else {
                                return nextEntry();
                            }
                        };
                        return nextModule();
                    } else {
                        if (matches.length === 0) {
                            return Promise.resolve(null);
                        }
                        // MXNet
                        if (matches.length === 2 &&
                            matches.some((e) => e.name.toLowerCase().endsWith('.params')) &&
                            matches.some((e) => e.name.toLowerCase().endsWith('-symbol.json'))) {
                            matches =
                                matches.filter((e) => e.name.toLowerCase().endsWith('.params'));
                        }
                        // TensorFlow.js
                        if (matches.length > 0 &&
                            matches.some((e) => e.name.toLowerCase().endsWith('.bin')) &&
                            matches.some((e) => e.name.toLowerCase().endsWith('.json'))) {
                            matches = matches.filter((e) => e.name.toLowerCase().endsWith('.json'));
                        }
                        // ncnn
                        if (matches.length > 0 &&
                            matches.some((e) => e.name.toLowerCase().endsWith('.bin')) &&
                            matches.some((e) => e.name.toLowerCase().endsWith('.param'))) {
                            matches =
                                matches.filter((e) => e.name.toLowerCase().endsWith('.param'));
                        }
                        // ncnn
                        if (matches.length > 0 &&
                            matches.some((e) => e.name.toLowerCase().endsWith('.bin')) &&
                            matches.some((e) => e.name.toLowerCase().endsWith('.param.bin'))) {
                            matches =
                                matches.filter((e) => e.name.toLowerCase().endsWith('.param.bin'));
                        }
                        // Paddle
                        if (matches.length > 0 &&
                            matches.some((e) => e.name.toLowerCase().endsWith('.pdmodel')) &&
                            (matches.some((e) => e.name.toLowerCase().endsWith('.pdparams')) ||
                             matches.some((e) => e.name.toLowerCase().endsWith('.pdopt')) ||
                             matches.some((e) => e.name.toLowerCase().endsWith('.pdiparams')))) {
                            matches =
                                matches.filter((e) => e.name.toLowerCase().endsWith('.pdmodel'));
                        }
                        // Paddle Lite
                        if (matches.length > 0 &&
                            matches.some(
                                (e) => e.name.toLowerCase().split('/').pop() === '__model__.nb') &&
                            matches.some(
                                (e) => e.name.toLowerCase().split('/').pop() === 'param.nb')) {
                            matches = matches.filter(
                                (e) => e.name.toLowerCase().split('/').pop() === '__model__.nb');
                        }
                        // TensorFlow Bundle
                        if (matches.length > 1 &&
                            matches.some(
                                (e) => e.name.toLowerCase().endsWith('.data-00000-of-00001'))) {
                            matches = matches.filter(
                                (e) => !e.name.toLowerCase().endsWith('.data-00000-of-00001'));
                        }
                        // TensorFlow SavedModel
                        if (matches.length === 2 &&
                            matches.some(
                                (e) => e.name.toLowerCase().split('/').pop() ===
                                    'keras_metadata.pb')) {
                            matches = matches.filter(
                                (e) =>
                                    e.name.toLowerCase().split('/').pop() !== 'keras_metadata.pb');
                        }
                        if (matches.length > 1) {
                            return Promise.reject(
                                new view.ArchiveError('Archive contains multiple model files.'));
                        }
                        const match = matches.shift();
                        return Promise.resolve(new view.ModelContext(new view.ArchiveContext(
                            this._host, entries, folder, match.name, match.stream)));
                    }
                };
                return nextEntry();
            };
            const list = Array.from(entries).map((entry) => {
                return {name: entry[0], stream: entry[1]};
            });
            const files = list.filter((entry) => {
                if (entry.name.endsWith('/')) {
                    return false;
                }
                if (entry.name.split('/').pop().startsWith('.')) {
                    return false;
                }
                if (!entry.name.startsWith('./') && entry.name.startsWith('.')) {
                    return false;
                }
                return true;
            });
            const folder = rootFolder(files.map((entry) => entry.name));
            const queue = files.slice(0).filter(
                (entry) => entry.name.substring(folder.length).indexOf('/') < 0);
            return filter(queue).then((context) => {
                if (context) {
                    return Promise.resolve(context);
                }
                const queue = files.slice(0).filter(
                    (entry) => entry.name.substring(folder.length).indexOf('/') >= 0);
                return filter(queue);
            });
        } catch (error) {
            return Promise.reject(new view.ArchiveError(error.message));
        }
    }

    accept(identifier) {
        const extension =
            identifier.indexOf('.') === -1 ? '' : identifier.split('.').pop().toLowerCase();
        identifier = identifier.toLowerCase().split('/').pop();
        for (const extension of this._extensions) {
            if ((typeof extension === 'string' && identifier.endsWith(extension)) ||
                (extension instanceof RegExp && extension.exec(identifier))) {
                this._host.event('File', 'Accept', extension, 1);
                return true;
            }
        }
        this._host.event('File', 'Reject', extension, 1);
        return false;
    }

    _filter(context) {
        const identifier = context.identifier.toLowerCase().split('/').pop();
        const list = this._factories.filter(
            (entry) =>
                (typeof entry.extension === 'string' && identifier.endsWith(entry.extension)) ||
                (entry.extension instanceof RegExp && entry.extension.exec(identifier)));
        return Array.from(new Set(list.map((entry) => entry.id)));
    }

    _openSignature(context) {
        const stream = context.stream;
        if (stream) {
            let empty = true;
            let position = 0;
            while (empty && position < stream.length) {
                const buffer = stream.read(Math.min(4096, stream.length - position));
                position += buffer.length;
                if (!buffer.every((value) => value === 0x00)) {
                    empty = false;
                    break;
                }
            }
            stream.seek(0);
            if (empty) {
                return Promise.reject(new view.Error('File has no content.', true));
            }
            /* eslint-disable no-control-regex */
            // clang-format off
      const entries = [
        { name: 'ELF executable', value: /^\x7FELF/ },
        { name: 'PNG image', value: /^\x89PNG/ },
        { name: 'Git LFS header', value: /^version https:\/\/git-lfs.github.com/ },
        { name: 'Git LFS header', value: /^\s*oid sha256:/ },
        { name: 'HTML markup', value: /^\s*<html>/ },
        { name: 'HTML markup', value: /^\s*<!doctype\s*html>/ },
        { name: 'HTML markup', value: /^\s*<!DOCTYPE\s*html>/ },
        { name: 'HTML markup', value: /^\s*<!DOCTYPE\s*HTML>/ },
        { name: 'HTML markup', value: /^\s*<!DOCTYPE\s*HTML\s+(PUBLIC|SYSTEM)?/ },
        { name: 'Unity metadata', value: /^fileFormatVersion:/ },
        { name: 'Python source code', value: /^\s*import[ ]+(os|sys|types|torch|argparse|onnx|numpy|tensorflow)(,|;|\s)/ },
        { name: 'Python source code', value: /^\s*import[ ]+([a-z])+[ ]+as[ ]+/ },
        { name: 'Python source code', value: /^\s*from[ ]+(torch)[ ]+import[ ]+/ },
        { name: 'Python source code', value: /^\s*from[ ]+(keras)[ ]+import[ ]+/ },
        { name: 'Bash script', value: /^#!\/usr\/bin\/env\s/ },
        { name: 'Bash script', value: /^#!\/bin\/bash\s/ },
        { name: 'TSD header', value: /^%TSD-Header-###%/ },
        { name: 'AppleDouble data', value: /^\x00\x05\x16\x07/ },
        { name: 'TensorFlow Hub module', value: /^\x08\x03$/, identifier: 'tfhub_module.pb' },
        { name: 'OpenVX network binary graph data', value: /^VPMN/ } // network_binary.nb
      ];
            // clang-format on
            /* eslint-enable no-control-regex */
            const buffer = stream.peek(Math.min(4096, stream.length));
            const content = String.fromCharCode.apply(null, buffer);
            for (const entry of entries) {
                if (content.match(entry.value) &&
                    (!entry.identifier || entry.identifier === context.identifier)) {
                    return Promise.reject(new view.Error(
                        'Invalid file content. File contains ' + entry.name + '.', true));
                }
            }
        }
        return Promise.resolve(context);
    }
};

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports.View = view.View;
    module.exports.ModelFactoryService = view.ModelFactoryService;
}
