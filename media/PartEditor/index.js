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

var editor = {};

const vscode = acquireVsCodeApi();

/**
 * @brief editor.Backend stores Backend records
 */
editor.Backend = class {
  constructor(name) {
    this.name = name;
  }
};

/**
 * @brief editor.Operator stores model operator records
 */
editor.Operator = class {
  constructor(name, code) {
    this.name = name;
    this.code = code;
  }
};

editor.Editor = class {
  constructor() {
    this.window = window;
    this.document = window.document;
    this.backends = [];   // array of editor.Backend
    this.operators = [];  // array of editor.Operator
  }

  initialize() {
    this.register();
    this.requestBackends();
  }

  register() {
    this.window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.command) {
        case 'resultBackends':
          this.handleResultBackends(message);
          break;

        case 'resultOpNames':
          this.handleResultOpNames(message);
          break;
      }
    });
  }

  requestBackends() {
    vscode.postMessage({command: 'requestBackends'});
  }

  requestOpNames() {
    vscode.postMessage({command: 'requestOpNames'});
  }

  /**
   * @brief fill 'circle-be' combobox with backends
   */
  handleResultBackends(message) {
    // NOTE idx 0 is default which we do not add to the list
    this.backends.push(new editor.Backend('(default)'));

    const backendNames = message.backends.split(/\r?\n/);

    // initial fill op backend listbox
    const listbox = this.document.getElementById('circle-be');
    for (let idx = 1; idx < backendNames.length; idx++) {
      const backend = backendNames[idx];
      // filter out empty string
      if (backend.length > 0) {
        let opt = this.document.createElement('option');
        opt.text = `(${idx}) ` + backend;
        opt.value = idx;
        listbox.options.add(opt);

        this.backends.push(new editor.Backend(backend));
      }
    };

    this.requestOpNames();
  }

  /**
   * @brief fill 'circle-nodes' listbox with operator names of the model
   */
  handleResultOpNames(message) {
    this.operators = [];

    const itemOpNames = message.names.split(/\r?\n/);

    // initial fill operators listbox with name and code as 0
    const listbox = this.document.getElementById('circle-nodes');
    for (let idx = 0; idx < itemOpNames.length; idx++) {
      const name = itemOpNames[idx];
      if (name.length > 0) {
        let opt = this.document.createElement('option');
        opt.text = '(0) ' + name;
        opt.value = idx;
        listbox.options.add(opt);

        // add name with default code(0) as of now
        // code will be updated after document partition is received
        this.operators.push(new editor.Operator(name, 0));
      }
    };

    // TODO request partition information
  }
};

window.addEventListener('load', () => {
  console.log('window: event: load');
  window.__editor__ = new editor.Editor();
  window.__editor__.initialize();
});
