### Introduction

This is an introductory page explaining the contribution process for beginners. 

### How to contribute?

#### Sign-off

[ONE-vscode-Developer's Certificate of Origin](https://github.com/Samsung/ONE-vscode/wiki/ONE-vscode-Developer\'s-Certificate-of-Origin)

All the ONE-vscode contributors abide by this Certificate of Origin.
This signing off means that you certifies yourself about this.

At the end of your commit, please add this line.

> ONE-vscode-DCO-1.0-Signed-off-by: Random O Developer <random@developer.example.org>

NOTE that you need to embrace your email with '<' and '>'.

Without this Sign-off, your commit will fail the CI.

For your convenience, add a git hook as explained in the [ONE-vscode-Developer's Certificate of Origin](https://github.com/Samsung/ONE-vscode/wiki/ONE-vscode-Developer\'s-Certificate-of-Origin) page.

#### Format

This project uses a formatter to keep consistency in its style.
We use `prettier`.
Your Pull Request will fail the CI if you don't follow this formatter's style. 
It is included in our npm dependency, so additional installation of formatter is not needed.

```bash
cd ONE-vscode
bash infra/format
```

#### Run Unit Test Locally

If any of existing unit tests fails, CI rejects your pull request.
To prevent this, you can run unit tests on your computer before you make your pr.

```bash
npm run test
```

This command will install all the required tools to run your test and pop up a vscode development host.

If you are connecting to your remote development environment, vscode development host cannot pop up, not proceeding the test.
However, there is a way. This will run the test without display.

```bash
npm run test-no-screen
```

#### Add Unit Test (Recommended)

Mind that your PR must pass the mocha test.
It's always recommended that you write your own unit test with your PR.
Please find `src/Tests` directory. It has the same directory tree with source. All the corresponding files includes corresponding unit tests.