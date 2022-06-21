[![Gitter](https://img.shields.io/gitter/room/Samsung/ONE-vscode?color=orange)](https://gitter.im/Samsung/ONE-vscode)

# **ONE**-vscode

Visual Studio Code Extension of [**ONE**](https://github.com/Samsung/ONE) compiler toolchain.

## Goal

We aim to provide a convenient UX to ONE users by combining the Visual Studio Code environment, which has recently been spotlighted by developers, and ONE's compiler toolchain.

Following the extension architecture of Visual Studio Code, we will develop a minimal extension that can work seamlessly with other features.

In addition, we are trying to have a well-designed structure ourselves so that various tools of ONE that will be developed in the future can be added without difficulty. Model visualizers, profilers, log analyzers, event tracers, etc. are good candidates for this future expansion.

Through these activities, ONE-vscode can provide a differentiation that cannot be experienced only with the existing CLI by linking the toolchain with the execution environment, ONE Runtime, or a target simulator corresponding to the backend compiler. This will eventually lead to fun and high productivity for developers.

## Prerequisit

ONE-vscode is an [extension](https://code.visualstudio.com/docs/editor/extension-marketplace) of [vscode](https://code.visualstudio.com/). To use ONE-vscode, you should install vscode first.

### vscode and its extensions

Let's install vscode according to [doc](https://code.visualstudio.com/docs/setup/setup-overview).

### ssh extension in vscode

Now [ONE](https://github.com/Samsung/ONE) officially releases on linux/ubuntu only. If your develop environment is on Windows, you should use ssh extension in vscode. Let's follow [tutorial](https://code.visualstudio.com/docs/remote/ssh-tutorial).

### workspace

Prepare workspace according to [doc](https://code.visualstudio.com/docs/editor/workspaces). ONE-vscode has been devloped based on workspace.

## How to install?

If you are a user not a developer, installing ONE-vscode is enough. Let's install ONE-vscode with vsix file.

### with vsix

```
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

### How to get vsix?

If you want to use the latest version of ONE-vscode, let's the following.

#### Install vsce

[vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) is `Visual Studio Code Extension`.
```
$ npm install -g vsce
```

git clone `ONE-vscode`
```
$ git clone https://github.com/Samsung/ONE-vscode.git
```

```
ONE-vscode$ npm install
...

ONE-vscode$ vsce package
Executing prepublish script 'npm run vscode:prepublish'...

> one-vscode@0.1.0 vscode:prepublish
> npm run compile


> one-vscode@0.1.0 compile
> tsc -p ./

This extension consists of 1282 files, out of which 653 are JavaScript files. For performance reasons, you should bundle your extension: https://aka.ms/vscode-bundle-extension . You should also exclude unnecessary files by adding them to your .vscodeignore: https://aka.ms/vscode-vscodeignore
 DONE  Packaged: /home/dragon/Works/ONE-vscode/one-vscode-0.1.0.vsix (1282 files, 340.49MB)
```

Now you get the latest vsix file.

## How to use?

### Install toolchains

... (ONE-view, ...)

### Compile models

...

## Concepts of ONE-vscode You Must Know

... (cand: backend, ONE-explorer, quantization, config file, steps(import, optimization, codegen, ...), anyway they are related to ONE-vscode not vscode)

1. ...
2. ...
