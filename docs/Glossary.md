# Glossary

A glossary for(or used in) ONE-vscode

## Concepts of ONE-vscode that You Must Know

There are concepts only used in ONE-vscode. Let's investigate them.

### Toolchain

`Toolchain` is a collection of tools. Now you could think it as `ONE` itself.

### Backend

The word `Backend` is used to a concept to wrap `Toolchain` and others that related to `Toolchain`.

### ONE Explorer View

`ONE Explorer View` is a tree view for NN models and config file.

### Compile

`Compile` in ONE-vscode is doing `Compile Steps` in a config file with `Toolchain`.

#### Compile Steps

- Import: Import a NN model to convert it to `circle` model.
- Optimization: Try optimizing as possible by using `circle2circle`.
- Quantization: Quantize `circle` model.
- Codegen: Generate code as output for backend.
- Profile: Profile it.

### ONE Config File(*.cfg)

The above `Compile Steps` is described in a ONE config file. The ONE config file is basically based on [ini](https://en.wikipedia.org/wiki/INI_file) format.
