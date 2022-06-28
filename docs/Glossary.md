# Glossary

A glossary for(or used in) ONE-vscode

## Concepts of ONE-vscode that You Must Know

There are concepts only used in ONE-vscode. Let's investigate them.

### Backend

The word `Backend` is used to a concept to wrap `Toolchain` and others that related to `Toolchain`.

### Toolchain

`Toolchain` is a collection of tools. Now you could think it as `ONE` itself.

<img src="https://user-images.githubusercontent.com/7223627/172834540-945ed5f9-82b0-4388-bd46-4ea10587d701.gif" width=500 />

### ONE-explorer

`ONE-explorer` is a tree view for NN models and config file.

<img src="https://user-images.githubusercontent.com/17171963/172789165-1a66e890-5f8f-49db-98fa-57f61f62281c.gif" width=500 />

### Compile

`Compile` in ONE-vscode is doing `Compile Steps` in a config file with `Toolchain`.

<img src="https://user-images.githubusercontent.com/10216715/174796457-4dae4a77-04e1-4e5c-9453-77ebfb65182a.gif" width=500 />

#### Compile Steps

- Import: Import a NN model to convert it to `circle` model.
- Optimization: Try optimizing as possible by using `circle2circle`.
- Quantization: Quantize `circle` model.
- Codegen: Generate code as output for backend.
- Profile: Profile it.

### Config File(*.cfg)

The above `Compile Steps` is described in a config file. The config file is basically based on [ini](https://en.wikipedia.org/wiki/INI_file).

<img src="https://user-images.githubusercontent.com/24720192/172993683-677690f3-49b5-454e-8912-31b89b8cdc2e.gif" width=500 />
