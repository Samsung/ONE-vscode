# How to install?

## Prerequisite

ONE-vscode is an [extension](https://code.visualstudio.com/docs/editor/extension-marketplace) of [vscode](https://code.visualstudio.com/). To use ONE-vscode, you should install vscode first.

### VS Code and its extensions

Let's install vscode.
- You can download vscode [HERE](https://code.visualstudio.com/download)
- Official document: [setup](https://code.visualstudio.com/docs/setup/setup-overview)

### ssh extension in vscode

Now [ONE](https://github.com/Samsung/ONE) officially releases on linux/ubuntu only. If your development environment is on Windows, you should use ssh extension in vscode. Let's follow [tutorial](https://code.visualstudio.com/docs/remote/ssh-tutorial).

### Environment setting on linux/ubuntu

Linux machine must have `aptitude` package.

### workspace

Prepare workspace according to the [document](https://code.visualstudio.com/docs/editor/workspaces). ONE-vscode has been developed based on workspace.
Typically, a workspace for ONE-vscode has the following files:
- your model files
  - Tensorflow model file(*.pb, saved model or Keras model)
  - Tensorflow Lite model (*.tflite)
  - Onnx model (*.onnx)
- ONE *.cfg files
- intermediate files during compilation (e.g., *.circle) or compiled output files after compilation

## How to install?

If you are a user(who just wants to use ONE-vscode not to develop ONE-vscode), installing ONE-vscode and a backend extension is enough. Let's install ONE-vscode with vsix file.

### Installing with GUI

Extensions(Ctrl+Shift+x) -> Views and More Actions -> Install from VSIX

<img src="https://user-images.githubusercontent.com/10216715/174781792-fa3fbe47-708b-4977-974c-578b65f689ee.gif" width=600 />

### Installing with CLI

```console
$ ls
one-vscode-0.1.0.vsix

$ code --install-extension ./one-vscode-0.1.0.vsix
Installing extensions...
...
Extension 'one-vscode-0.1.0.vsix' was successfully installed.

$ code --list-extensions
ms-vscode-remote.remote-containers
ms-vscode-remote.remote-ssh
ms-vscode-remote.remote-ssh-edit
ms-vscode-remote.remote-wsl
ms-vscode-remote.vscode-remote-extensionpack
Samsung.one-vscode  # YOU MUST SEE THIS
```

### How to get the vsix package?

Find the official vsix package: [Release Page](https://github.com/Samsung/ONE-vscode/releases)

Some developers may want to build the latest vsix file by themselves. In such case, read [How To Build From Source](./HowToBuildFromSource.md) document.

### Installing a backend extension

To make ONE-vscode work feature-rich, you should install a backend extension. Now it supports by the in-house project.

### Reload

Please reload vscode after intalling ONE-vscode.
