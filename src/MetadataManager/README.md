## Meta Provider

This extension stores and manages metadata information of files used in ONE-vscode extension and provides two types of viewers for the metadata. One is metadata viewer and the other is file relation viewer. All of this features are provided for the convenience of file management and as a solution about unstable tree view caused by config file dependencies in ONE Explorer. More details about metadata and file relationship is described in the following section.

### Metadata

Metadata is hidden information for managing files. This informations are used to identify each file of uniqueness. In this extension, the metadata in the file are managed externally and stored at the directory (.meta) in working directory of VScode. The metadata is divided into two categories: Common data types and ONE-related types.

Common type metadata include information such as:
* `file-extension`: type of file 
* `created-time`: time of creation
* `modified-time`: time of modification

ONE-related type metadata is exists only for target files when the target is generated from model and config file using ONE-vscode extension. The metadata include information such as:
* `onecc-version`: onecc version
* `toolchain-version`: toolchain version 
* `cfg-settings`: config file information that is used to file generation step.

### Relationship between Files

We define the relationship between the files for ONE-vscode as a tree like a directory because of consistency with ONE-explorer. The file that is required to generate target is defined as parents file of target. The file that is derived from target is defined as child of target.
For example, when you open a directory includes some deep learning model files (.tflite, .pb, .onnx.. etc) and config files (.cfg) in the the ONE-vscode extension, you can see the config file is under the model files. If you execute the 'run cfg' command or button, also you can see some production files (.circle, .log) are created and they are under the config file. At this point, we call the deep learning model file parents of production files and call the production file the child of model.

In our relationship, There are some restrictions.
* The files that includes only certain extensions are accepted as a target.
* Each file has only one parents.
* Model file is a root of relation tree.
* Config file is not considered as a member of relationship.
* Log file is always child of circle file.

### How Does Metadata Manager Work?

Metadata Manger has three major operation to manage target files.

1. Metadata validation test is performed when ONE-vscode extension is started.
2. The metadata manager keep watches on create, delete, change events and maintains the consistency of metadata.
3. When requested by the user, the metadata manager preprocesses metadata and passes it to viewers.
