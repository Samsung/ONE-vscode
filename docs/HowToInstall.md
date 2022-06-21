# How to install?

## Prerequisit

ONE-vscode is an [extension](https://code.visualstudio.com/docs/editor/extension-marketplace) of [vscode](https://code.visualstudio.com/). To use ONE-vscode, you should install vscode first.

### vscode and its extensions

Let's install vscode according to [doc](https://code.visualstudio.com/docs/setup/setup-overview). (You should also install npm for vscode.)

### ssh extension in vscode

Now [ONE](https://github.com/Samsung/ONE) officially releases on linux/ubuntu only. If your development environment is on Windows, you should use ssh extension in vscode. Let's follow [tutorial](https://code.visualstudio.com/docs/remote/ssh-tutorial).

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
