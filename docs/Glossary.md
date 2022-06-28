# Glossary

A glossary for(or used in) ONE-vscode

## Concepts of ONE-vscode that You Must Know

There are concepts only used in ONE-vscode. Let's investigate them.

### Backend

The word `Backend` is used to a concept to wrap `Toolchain` and others that related to `Toolchain`.

### Toolchain

`Toolchain` is a collection of tools. Now you could think it as `ONE` itself.

<img src="https://user-images.githubusercontent.com/7223627/172834540-945ed5f9-82b0-4388-bd46-4ea10587d701.gif" width=600 />

### ONE Explorer View

`ONE Explorer View` is a tree view for NN models and config file.

<img src="https://user-images.githubusercontent.com/10216715/176106887-8eb4c22a-0804-41ea-978a-f01642b61791.gif" width=600 />

### Compile

`Compile` in ONE-vscode is doing `Compile Steps` in a config file with `Toolchain`.

<img src="https://user-images.githubusercontent.com/10216715/174796457-4dae4a77-04e1-4e5c-9453-77ebfb65182a.gif" width=600 />

#### Compile Steps

- Import: Import a NN model to convert it to `circle` model.
- Optimization: Try optimizing as possible by using `circle2circle`.
- Quantization: Quantize `circle` model.
- Codegen: Generate code as output for backend.
- Profile: Profile it.

### ONE Config File(*.cfg)

The above `Compile Steps` is described in a ONE config file. The ONE config file is basically based on [ini](https://en.wikipedia.org/wiki/INI_file) format.

<img src="https://user-images.githubusercontent.com/24720192/172993683-677690f3-49b5-454e-8912-31b89b8cdc2e.gif" width=600 />
