# Tests

ONE-vscode's unittests are based on [mocha](https://mochajs.org/) and [@vscode/test-electron](https://github.com/microsoft/vscode-docs/blob/main/api/working-with-extensions/testing-extension.md).
- interface of mocha: TDD (BDD to test UX will be introduced in the future)
- use @vscode/test-electron because ONE-vscode uses vscode api
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
- runTest.ts: test driver
- hooks.ts: global hooks
- index.ts: does glob() to find tests after adding `hooks`

## How to run tests?

```
ONE-vscode$ npm test
```

### How to debug tests?

Click F5 or run the `Run Extension Tests` with breaking points.

# Reference
- https://mochajs.org/
- https://www.chaijs.com/api/assert/
- https://github.com/microsoft/vscode-docs/blob/main/api/working-with-extensions/testing-extension.md
- https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-sample
- https://github.com/microsoft/vscode-test
