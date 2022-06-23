![GitHub commit activity](https://img.shields.io/github/commit-activity/w/Samsung/ONE-vscode?color=light%20green)
[![Gitter](https://img.shields.io/gitter/room/Samsung/ONE-vscode?color=orange)](https://gitter.im/Samsung/ONE-vscode)

# **ONE**-vscode

Visual Studio Code Extension of [**ONE**](https://github.com/Samsung/ONE) compiler toolchain.

## Goal

We aim to provide a convenient UX to ONE users by combining the Visual Studio Code environment, which has recently been spotlighted by developers, and ONE's compiler toolchain.

Following the extension architecture of Visual Studio Code, we will develop a minimal extension that can work seamlessly with other features.

In addition, we are trying to have a well-designed structure ourselves so that various tools of ONE that will be developed in the future can be added without difficulty. Model visualizers, profilers, log analyzers, event tracers, etc. are good candidates for this future expansion.

Through these activities, ONE-vscode can provide a differentiation that cannot be experienced only with the existing CLI by linking the toolchain with the execution environment, ONE Runtime, or a target simulator corresponding to the backend compiler. This will eventually lead to fun and high productivity for developers.

## Overview and tutorials

- [ONE-vscode extension overview](./docs/Overview.md)
- [How to install?](./docs/HowToInstall.md)
- [How to use?](./docs/HowToUse.md)
- [Glossary](./docs/Glossary.md)

## Features

<img src="https://user-images.githubusercontent.com/7223627/175224054-0df3109a-f4ef-4a12-a7be-ab50f01b77af.png" width=500 />

- Install toolchain

<img src="https://user-images.githubusercontent.com/7223627/174947559-71ab213c-68c4-4700-bcec-e55f6a2203bf.gif" width=500 />

- Compile NN model using config file

- Setup available NPU backend device

- Inference backend model

- Profile backend model

## Contribution

(TBD)

## License

[Apache License 2.0](https://github.com/Samsung/ONE-vscode/blob/main/LICENSE)
