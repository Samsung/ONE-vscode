# **ONE**-vscode tutorial

In this tutorial, you will use `ONE` driver to compile a model, and refer to and profile the generated backend model in Visual Studio Code. By using the ONE-vscode extension, you make VS Code into a great ONE IDE.

`ONE` driver is a command tool that generates binary running in the NPU backend, executes it and profiles it. Therefore, NPU backend is required to use ONE driver. The currently available backends are as follows:
- TRIX
If you want to use your NPU backend in ONE vscode, this can be implemented by redefining the Backend very simply. See the following guide, [How to define new Backend for ONE-vscode](docs/HowToDefineNewBackend.md), for help.

This tutorial introduces you to VS Code as a ONE environment, primarily how to compile a model, inference and profile a generated model and show the profile data through the following tasks:
- Install toolchain
- Compile NN model using config file
- Setup available NPU backend device
- Inference backend model
- Profile backend model

## UX Guidelines

<img src="https://user-images.githubusercontent.com/7223627/175224054-0df3109a-f4ef-4a12-a7be-ab50f01b77af.png" width=500 />

If you are not familiar with terms of vscode, you can read [userinterface](https://code.visualstudio.com/docs/getstarted/userinterface) in vscode.

### One view container

### One explorer view

### Toolchain explorer view

### Device explorer view

### Output log view

## Features

### Install toolchain

<img src="https://user-images.githubusercontent.com/7223627/174947559-71ab213c-68c4-4700-bcec-e55f6a2203bf.gif" width=500 />

### Compile NN model using config file

### Setup available NPU backend device

### Inference backend model

### Profile backend model
