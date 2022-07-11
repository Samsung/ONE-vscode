# How to use?

Let's compile an example by using ONE-vscode.

## Install the toolchain

First, you need the ONE toolchain. Let's install the ONE toolchain. (You should install the in-house backend to follow this.)

<img src="https://user-images.githubusercontent.com/7223627/174947559-71ab213c-68c4-4700-bcec-e55f6a2203bf.gif" width=600 />

## Set default toolchain

To compile model using ONE toolchain, you must specify the default toolchain. To specify a default toolchain, if you mouse up the toolchain item you want to use in Toolchain view, :heavy_check_mark: icon appears. Click this icon to specify it as default toolchain. If toolchain is specified as default toolchain, the icon changes.

| Toolchain | Default Toolchain |
|-----------|-------------------|
| <img src="https://user-images.githubusercontent.com/7223627/177962615-71e64f52-e684-432d-a053-07896a20a479.png" width=300 /> | <img src="https://user-images.githubusercontent.com/7223627/177963453-d22998a0-be21-4531-a70b-9057a204e7eb.png" width=300 /> |

## Prepare a NN model and a config file

Second, you need a NN model and a config file to run compiling. Now you can get one from [res/modelDir/truediv](../res/modelDir/truediv/). Add it to your workspace. Now you can see a model and a config.

<img src="https://user-images.githubusercontent.com/10216715/174798969-eee44fea-bd71-4e6a-8e2c-9e1de37ad74a.gif" width=600 />

## Compile models

Last, you can compile the model by pushing Run button.

Depends on backend, you may be able to infer or profile a model by 'running config'.

<img src="https://user-images.githubusercontent.com/10216715/174796457-4dae4a77-04e1-4e5c-9453-77ebfb65182a.gif" width=600 />

## Trouble-shooting

How to watch log?
- View -> output -> ONE-vscode

<img src="https://user-images.githubusercontent.com/10216715/174795531-9868f1e0-25ab-4ae3-bf65-fe8385a7ba76.gif" width=600 />
