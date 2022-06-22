![GitHub commit activity](https://img.shields.io/github/commit-activity/w/Samsung/ONE-vscode?color=light%20green)
[![Gitter](https://img.shields.io/gitter/room/Samsung/ONE-vscode?color=orange)](https://gitter.im/Samsung/ONE-vscode)

# **ONE**-vscode

Visual Studio Code Extension of [**ONE**](https://github.com/Samsung/ONE) compiler toolchain.

## Goal

We aim to provide a convenient UX to ONE users by combining the Visual Studio Code environment, which has recently been spotlighted by developers, and ONE's compiler toolchain.

Following the extension architecture of Visual Studio Code, we will develop a minimal extension that can work seamlessly with other features.

In addition, we are trying to have a well-designed structure ourselves so that various tools of ONE that will be developed in the future can be added without difficulty. Model visualizers, profilers, log analyzers, event tracers, etc. are good candidates for this future expansion.

Through these activities, ONE-vscode can provide a differentiation that cannot be experienced only with the existing CLI by linking the toolchain with the execution environment, ONE Runtime, or a target simulator corresponding to the backend compiler. This will eventually lead to fun and high productivity for developers.

## Getting started

- [How to install?](./docs/HowToInstall.md)
- [How to use?](./docs/HowToUse.md)
- [Terms](./docs/Terms.md)

## Extension features

You can see `ONE` logo on Acitivity Bar. (If you are not familiar with terms of vscode, you can read [document](https://code.visualstudio.com/docs/getstarted/userinterface).)

![]()

###  One view explorer

ONE-vscode supports an specialized explorer for NN model files and config files.
![]()

###  Toolchain view explorer

ONE-vscode supports an specialized explorer for ONE toolchain.
![]()

### Compile

ONE-vscode supports compiling NN model by a config file with ONE toolchain.
![]()

### Config editor

ONE-vscode supports an config editor for config files.
![]()

### In the future

- Target devices view explorer
- Value test

## Contribution

(TBD)

## License

[Apache License 2.0](https://github.com/Samsung/ONE-vscode/blob/main/LICENSE)

![acitivity_bar_ONE](https://user-images.githubusercontent.com/10216715/174931217-2eaf6091-4b0d-4d9d-a9d0-f44b80300e71.png)
![acitivity_bar_ONE_compile](https://user-images.githubusercontent.com/10216715/174931224-4039c32a-aea7-4a1a-bd86-cb30edb8831e.png)
![acitivity_bar_ONE_config](https://user-images.githubusercontent.com/10216715/174931229-c0649c60-0308-4916-8ee7-691c30a7859b.png)
![acitivity_bar_ONE_explorer](https://user-images.githubusercontent.com/10216715/174931232-62ce9853-c153-4c27-b94d-1a885eb4bef2.png)
![acitivity_bar_ONE_target_devices](https://user-images.githubusercontent.com/10216715/174931234-73dd7513-f8c7-49f7-8675-9cec05b247f2.png)
![acitivity_bar_ONE_toolchain](https://user-images.githubusercontent.com/10216715/174931237-bdedf079-bd2d-4600-8697-f171f87ea159.png)

