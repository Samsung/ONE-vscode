# How to build from source?

If you want to use the latest version of ONE-vscode, let's do the following:

## STEP1. Install vsce

[vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) is `Visual Studio Code Extension`.
- You should install [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) before installing vsce

```console
$ npm install -g vsce
```

## STEP2. Clone repository

git clone `ONE-vscode`

```console
$ git clone https://github.com/Samsung/ONE-vscode.git
```

## STEP3. Create vsix package

```console
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
