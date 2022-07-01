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
  constructor(name, color) {
    this.name = name;
    this.color = color;
  }
};

/**
 * @brief editor.Operator stores model operator records
 */
editor.Operator = class {
  constructor(name, opcode, becode) {
    this.name = name;      // name of operator
    this.opcode = opcode;  // name of opcode, e.g. 'CONV_2D'
    this.becode = becode;  // backend code of operator
  }
};

editor.Editor = class {
  constructor() {
    this.window = window;
    this.document = window.document;
    this.backends = [];   // array of editor.Backend
    this.operators = [];  // array of editor.Operator
    this.partition = {};  // current partition from document
    this.beToCode = {};   // backend string to code, for search performance
  }

  initialize() {
    this.register();
    // NOTE sequence of init is;
    // (1) fill backends to 'circle-be' combobox
    // (2) fill operators to 'circle-nodes'' listbox
    // (3) get document partition and apply to listbox
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

        case 'resultPartition':
          this.handleResultPartition(message);
          break;

        case 'updatePartition':
          // when .part file was edited through text editor
          this.handleUpdatePartition(message);
          break;
      }
    });

    // backend combobox change
    this.document.getElementById('circle-be').addEventListener('change', () => {
      this.updateDefaultCheckbox();
      this.updateBeComboColor();
    });

    // change 'default' backend to current backend of combobox
    this.document.getElementById('circle-be-def').addEventListener('click', (e) => {
      this.updateDefaultBackend();
      this.updateDocument();
    });

    // set backend by clicking 'Set' button
    this.document.getElementById('set-be').addEventListener('click', (e) => {
      this.updateSelectedBackend();
      this.updateDocument();
    });

    // clear backend by clicking 'Clear' button
    this.document.getElementById('clear-be').addEventListener('click', (e) => {
      this.updateSelectedBackendCode(0);
      this.updateDocument();
    });

    // show graph view with identical node selection
    this.document.getElementById('circle-graph').addEventListener('click', (e) => {
      let names = this.getSelectionNames();
      vscode.postMessage({command: 'selectByGraph', selection: names});
    });
  }

  currentBackendName() {
    let belistbox = this.document.getElementById('circle-be');
    let idx = belistbox.selectedIndex;
    let beCode = belistbox.options[idx].value;
    return this.backends[beCode].name;
  }

  requestBackends() {
    vscode.postMessage({command: 'requestBackends'});
  }

  requestOpNames() {
    vscode.postMessage({command: 'requestOpNames'});
  }

  requestPartition() {
    vscode.postMessage({command: 'requestPartition'});
  }

  updateDocument() {
    let partition = this.makePartitionSection();
    let opname = this.makeOpNameSection();

    vscode.postMessage({command: 'updateDocument', partition: partition, opname: opname});
  }

  updateBeComboColor() {
    let becombobox = this.document.getElementById('circle-be');
    let idx = becombobox.selectedIndex;
    let beCode = becombobox.options[idx].value;
    let color = this.backends[beCode].color;
    becombobox.style = 'color:' + color;
  }

  /**
   * @brief fill 'circle-be' combobox with backends
   */
  handleResultBackends(message) {
    const backendNames = message.backends.split(/\r?\n/);
    const backendColors = message.colors.split(/\r?\n/);

    // NOTE idx 0 is default which we do not add to the list
    this.backends.push(new editor.Backend(backendNames[0], backendColors[0]));

    // initial fill op backend listbox
    const listbox = this.document.getElementById('circle-be');
    for (let idx = 1; idx < backendNames.length; idx++) {
      const backend = backendNames[idx];
      const becolor = backendColors[idx];
      // filter out empty string
      if (backend.length > 0) {
        let opt = this.document.createElement('option');
        opt.text = `(${idx}) ${backend}`;
        opt.value = idx;
        opt.style = 'color:' + becolor;
        listbox.options.add(opt);

        this.backends.push(new editor.Backend(backend, becolor));
        this.beToCode[backend] = idx;
      }
    };

    this.updateBeComboColor();
    this.requestOpNames();
  }

  /**
   * @brief fill 'circle-nodes' listbox with operator names of the model
   */
  handleResultOpNames(message) {
    this.operators = [];

    const itemOpNames = message.names.split(/\r?\n/);

    // initial fill operators listbox with name and becode as 0
    const listbox = this.document.getElementById('circle-nodes');
    for (let idx = 0; idx < itemOpNames.length; idx++) {
      if (itemOpNames[idx].length > 0) {
        const codename = itemOpNames[idx].split(',');
        const opcode = codename[0];
        const name = codename[1];
        let opt = this.document.createElement('option');
        opt.text = `(0) [${opcode}] ${name}`;
        opt.value = idx;
        listbox.options.add(opt);

        // add name with default becode(0) as of now
        // becode will be updated after document partition is received
        this.operators.push(new editor.Operator(name, opcode, 0));
      }
    };

    this.requestPartition();
  }

  /**
   * @brief apply document partition to operators listbox
   */
  handleResultPartition(message) {
    this.partition = message.part;

    this.updateOperatorsBackend();
    this.refershOpListbox();
    this.updateDefaultCheckbox();
  }

  handleUpdatePartition(message) {
    this.partition = message.part;

    this.updateOperatorsBackend();
    this.refershOpListbox();
  }

  getSelectionNames() {
    let listbox = this.document.getElementById('circle-nodes');
    let names = '';
    for (let i = 0; i < listbox.options.length; i++) {
      let opt = listbox.options[i];
      if (opt.selected) {
        let idx = opt.value;
        if (names !== '') {
          names = names + '\n';
        }
        names = names + this.operators[idx].name;
      }
    }
    return names;
  }

  updateDefaultCheckbox() {
    // get the backend code
    let belistbox = this.document.getElementById('circle-be');
    let idx = belistbox.selectedIndex;
    let beCode = belistbox.options[idx].value;
    let beName = this.backends[beCode].name;
    let checkbox = this.document.getElementById('circle-be-def');

    checkbox.checked = (beName === this.partition.partition.default);
    // we cannot turn off default when CPU to something else
    checkbox.disabled = (checkbox.checked && idx === 0);
  }

  updateSelectedBackend() {
    // get the backend code
    let belistbox = this.document.getElementById('circle-be');
    let idx = belistbox.selectedIndex;
    let beCode = belistbox.options[idx].value;

    this.updateSelectedBackendCode(beCode);
  }

  updateSelectedBackendCode(beCode) {
    let listbox = this.document.getElementById('circle-nodes');
    for (let i = 0; i < listbox.options.length; i++) {
      let opt = listbox.options[i];
      if (opt.selected) {
        let idx = opt.value;
        let name = this.operators[idx].name;
        let opcode = this.operators[idx].opcode;
        opt.text = `(${beCode}) [${opcode}] ${name}`;
        this.operators[idx].becode = beCode;
        opt.style = 'color:' + this.backends[beCode].color;
      }
    }
  }

  /**
   * @brief change default backend to current item of combobox
   * @note  we cannot uncheck for first item(CPU)
   */
  updateDefaultBackend() {
    let checkbox = this.document.getElementById('circle-be-def');
    if (checkbox.checked) {
      // checkbox is checked so change to current combobox items
      let belistbox = this.document.getElementById('circle-be');
      let idx = belistbox.selectedIndex;
      let beCode = belistbox.options[idx].value;
      let beName = this.backends[beCode].name;
      this.partition.partition.default = beName;
      // we cannot turn off default when CPU to something else
      checkbox.disabled = (idx === 0);
    } else {
      // set to first backend
      let beName = this.backends[0].name;
      this.partition.partition.default = beName;
    }
  }

  /**
   * @brief apply document partition to this.operators becode
   */
  updateOperatorsBackend() {
    // must clear first as this.partition.OPNAME may not have all nodes
    this.clearOperatorsCode();

    for (let name in this.partition.OPNAME) {
      let backend = this.partition.OPNAME[name];
      let beCode = this.backendCode(backend);
      if (beCode !== -1) {
        this.setOperatorBeCode(name, beCode);
      } else {
        this.setOperatorBeCode(name, 0);
      }
    };
  }

  /**
   * @brief update listbox item text with backend code as prefix
   */
  refershOpListbox() {
    let listbox = this.document.getElementById('circle-nodes');
    for (let i = 0; i < listbox.options.length; i++) {
      let opt = listbox.options[i];

      let idx = opt.value;
      let beCode = this.operators[idx].becode;
      let opcode = this.operators[idx].opcode;
      let name = this.operators[idx].name;
      opt.text = `(${beCode}) [${opcode}] ${name}`;
      opt.style = 'color:' + this.backends[beCode].color;
    }
  }

  /**
   * @brief clear operator becode to default(0)
   */
  clearOperatorsCode() {
    for (let idx = 0; idx < this.operators.length; idx++) {
      this.operators[idx].becode = 0;
    }
  }

  /**
   * @brief return backend code from backend name ('CPU', ...)
   * @return -1 if not found
   */
  backendCode(value) {
    if (typeof value === 'string') {
      value = value.toUpperCase();
      if (this.beToCode.hasOwnProperty(value)) {
        return this.beToCode[value];
      }
    }
    return -1;
  }

  /**
   * @brief set operator becode to backend code
   */
  setOperatorBeCode(operator, beCode) {
    for (let idx = 0; idx < this.operators.length; idx++) {
      let op = this.operators[idx];
      if (operator === op.name) {
        this.operators[idx].becode = beCode;
        return;
      }
    }
  }

  /**
   * @brief produce [OPNAME] section body
   */
  makeOpNameSection() {
    let items = {};
    for (let idx = 0; idx < this.operators.length; idx++) {
      let beCode = this.operators[idx].becode;
      if (beCode !== 0) {
        let backend = this.backends[beCode].name;
        items[this.operators[idx].name] = backend;
      }
    }
    return items;
  }

  /**
   * @brief produce [partition] section body
   */
  makePartitionSection() {
    let items = {};
    items.backends = this.partition.partition.backends;
    items.default = this.partition.partition.default;
    items.comply = this.partition.partition.comply;
    return items;
  }
};

window.addEventListener('load', () => {
  window.__editor__ = new editor.Editor();
  window.__editor__.initialize();
});
