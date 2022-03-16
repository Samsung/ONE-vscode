# Tests

ONE-vscode's unittests are based on [mocha](https://mochajs.org/) and [@vscode/test-electron](https://github.com/microsoft/vscode-docs/blob/main/api/working-with-extensions/testing-extension.md).
- use @vscode/test-electron because ONE-vscode uses vscode api
  - use Extension Development Host which supports full access to the VS Code API
- interface of mocha: TDD (BDD to test UX will be introduced in the future)
- use `assert` of [chai](https://www.chaijs.com/api/assert/)

## structure

Tests are placed in `src/Tests`. The structure follows `src/`.
```
src/
  ...
  Project/
    Builder.ts
    Job.ts
    ...
  Utils/
    Helpers.ts
    ...
```
```
src/
  ...
  Project/
    Builder.ts
    Job.ts
    ...
  Utils/
    Helpers.ts
    ...
  Tests/
    ...
    Project/
      Builder.test.ts
      Job.test.ts
      ...
    Utils/
      Helpers.test.ts
      ...
```

## scripts

There are three scripts for tests.
- runTest.ts: the test script
  - uses the `@vscode/test-electron` API to simplify the process of downloading, unzipping, and launching VS Code with extension test parameters
  - `--extensionTestsPath` points to the test runner script
- index.ts: the test runner script
  - programmatically runs the test suite
  - exactly does glob() to find tests after adding `hooks` and then, runs them
- hooks.ts: global hooks

## How to run/debug tests?

```
ONE-vscode$ npm test
```

OR

Click F5 or run the `Extension Tests` with breaking points for debug.

# Limitation

According to [the official doc](https://github.com/microsoft/vscode-docs/blob/main/api/working-with-extensions/testing-extension.md#using-insiders-version-for-extension-development), tests cannot run by CLI.

# Trouble-shooting

## Problem

> futex facility returned an unexpected error code. Unable to open X display

### Solution 1

If you are a user on remote-env, reference [this](https://unix.stackexchange.com/questions/681398/how-to-run-an-x-app-vscode-as-another-user).
- Set the [`$DISPLAY`](https://askubuntu.com/questions/432255/what-is-the-display-environment-variable) variable correctly,
- give access to the [`~/.Xauthority file`](https://askubuntu.com/questions/300682/what-is-the-xauthority-file)
- share the socket within the [`/tmp/.X11-unix directory`](https://unix.stackexchange.com/questions/196677/what-is-tmp-x11-unix)

```
$ echo $DISPLAY
localhost:10.0

$ ls -lh ~/.Xauthority
-rw------- 1 dragon dragon 100  3월 14 12:42 /home/dragon/.Xauthority

$ file /tmp/.X11-unix/X0
/tmp/.X11-unix/X0: socket

$ ls -lh /tmp/.X11-unix/X0
srwxrwxrwx 1 dragon dragon 0 10월 20 17:52 /tmp/.X11-unix/X0
```

### Solution 2

Use [`xvfb-run`](https://github.com/Samsung/ONE-vscode/pull/360#issuecomment-1068845901).

```
$ sudo apt install xvfb
$ export DISPLAY=:44
$ xvfb-run --server-num 44 npm test
```

# Reference
- https://mochajs.org/
- https://www.chaijs.com/api/assert/
- https://github.com/microsoft/vscode-docs/blob/main/api/working-with-extensions/testing-extension.md
- https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-sample
- https://github.com/microsoft/vscode-test
