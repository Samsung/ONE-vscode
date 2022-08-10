# Release Note 0.3.0

## ONE-vscode

### ONE Explorer View

- Add hide-and-show button
- Show more files
  - Memory trace files
  - Performance trace files
  - Circle log files
  - Extra backend model binary files
- Open files with dedicated editor/viewers
  - Circle files - 'Circle Viewer'
  - Memory trace files - 'Mondrian Viewer'
  - Performance trace files - 'Json Tracer'
  - Circle log files - 'Text Editor'

### Toolchain View

- Introduce `Default Toolchain` concept
- Support for configuring prerequisites
- Run configuration file with the selected default toolchain

### Target Device View

- Add devices on local connection
  - Supported devices
    - Local PC (Ubuntu 18.04)
    - SDB-connected Tizen devices
- Show usable executors under each device (ex. simulators)

### Cfg Editor

- Help message is shown when mouse is over the question mark icon
- Path of file can be set by clicking search icon
- Trivial bugfix

### Circle Viewer

- Provides graphical view of circle model
- Powered by famous [netron](https://github.com/lutzroeder/netron) source code

### Mondrian Viewer

- Provide graphical view of allocation trace files

### JSON Tracer

- Provide graphical view of chrome trace files
- Inspired by the trace viewer of [catapult](https://chromium.googlesource.com/catapult) source code
