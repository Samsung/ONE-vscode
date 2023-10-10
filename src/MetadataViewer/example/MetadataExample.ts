/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
NOTE this is example logic that you can get sample MetaData
TODO Replace this sample logic into real logic
*/
export function getMetadata(_path: any) {
  return {
    "test.log": {
      "Toolchain Version": ["one-compiler 1.24.0", "triv24-compiler 1.0.0", "triv24-mte 1.0.0", "npu-engine 2.6.1", "libmrpsim 3.9.20", "triv24-sim 1.3.2"],
      "Target Arch": "2.4.3:T4",
      "Origins": [
        [ "UNet/enc1/Relu6" ],
        [ "UNet/enc1/Relu6" ],
        [ "UNet/enc1/Relu6" ],
        [ "UNet/enc2/Relu6" ],
        [ "UNet/enc1/Relu6" ],
        [ "UNet/enc2/Relu6" ],
        [ "UNet/enc2/Relu6" ],
        [ "UNet/enc3/Relu6" ],
        [ "UNet/enc2/Relu6" ],
        [ "UNet/enc3/Relu6" ],
        [ "UNet/enc3/Relu6" ],
        [ "UNet/depthwise" ],
        [ "UNet/enc3/Relu6" ],
        [ "UNet/depthwise" ],
        [ "UNet/enc3/Relu6" ],
        [ "UNet/depthwise" ],
        [ "UNet/enc4/Relu6" ],
        [ "UNet/depthwise" ],
        [ "UNet/enc4/Relu6" ],
        [ "UNet/depthwise" ],
        [ "UNet/enc4/Relu6" ],
        [ "UNet/enc4/Relu6" ],
        [ "UNet/enc5/Relu6" ],
        [ "UNet/enc4/Relu6" ],
        [ "UNet/enc5/Relu6" ],
        [ "UNet/enc5/Relu6" ],
        [ "UNet/enc5/Relu6" ],
        [ "UNet/enc6/Relu6" ],
        [ "UNet/enc5/Relu6" ],
        [ "UNet/enc6/Relu6" ],
        [ "UNet/enc6/Relu6" ],
        [ "UNet/dec6/Relu6/TransposeConv" ],
        [ "UNet/enc6/Relu6" ],
        [ "UNet/dec6/Relu6/TransposeConv" ],
        [],
        [ "UNet/dec6/Relu6/TransposeConv" ],
        [ "UNet/dec6/Relu6/Relu6" ],
        [ "UNet/dec6/Relu6/Relu6" ],
        [ "UNet/dec6/Relu6/Relu6" ],
        [],
        [],
        [ "UNet/dec5/Relu6/TransposeConv" ],
        [],
        [ "UNet/dec5/Relu6/TransposeConv" ],
        [ "UNet/dec5/Relu6/TransposeConv" ],
        [],
        [ "UNet/dec5/Relu6/TransposeConv" ],
        [ "UNet/dec5/Relu6/Relu6" ],
        [ "UNet/dec5/Relu6/Relu6" ],
        [ "UNet/dec5/Relu6/Relu6" ],
        [],
        [],
        [ "UNet/dec4/Relu6/TransposeConv" ],
        [],
        [ "UNet/dec4/Relu6/TransposeConv" ],
        [ "UNet/dec4/Relu6/TransposeConv" ],
        [],
        [ "UNet/dec4/Relu6/TransposeConv" ],
        [ "UNet/dec4/Relu6/Relu6" ],
        [ "UNet/dec4/Relu6/Relu6" ],
        [ "UNet/dec4/Relu6/Relu6" ],
        [],
        [],
        [ "UNet/dec3/Relu6/TransposeConv" ],
        [],
        [ "UNet/dec3/Relu6/TransposeConv" ],
        [ "UNet/dec3/Relu6/TransposeConv" ],
        [ "UNet/dec3/Relu6/TransposeConv" ],
        [ "UNet/dec3/Relu6/TransposeConv" ],
        [ "UNet/dec3/Relu6/Relu6" ],
        [ "UNet/dec3/Relu6/Relu6" ],
        [ "UNet/dec3/Relu6/TransposeConv" ],
        [ "UNet/dec3/Relu6/Relu6" ],
        [ "UNet/dec3/Relu6/TransposeConv" ],
        [ "UNet/dec3/Relu6/TransposeConv" ],
        [ "UNet/dec3/Relu6/Relu6" ],
        [ "UNet/dec3/Relu6/Relu6" ],
        [ "UNet/depthwise" ],
        [ "UNet/dec3/Relu6/Relu6" ],
        [ "UNet/depthwise" ],
        [ "UNet/depthwise" ],
        [],
        [ "UNet/depthwise" ],
        [ "UNet/depthwise" ],
        [],
        [],
        [ "UNet/dec2_1/Relu6/TransposeConv" ],
        [],
        [ "UNet/dec2_1/Relu6/TransposeConv" ],
        [ "UNet/dec2_1/Relu6/TransposeConv" ],
        [ "UNet/dec1_1/conv2d_transpose" ],
        [ "UNet/dec2_1/Relu6/TransposeConv" ],
        [ "UNet/dec2_1/Relu6/Relu6" ],
        [ "UNet/dec2_1/Relu6/Relu6" ],
        [ "UNet/dec1_1/conv2d_transpose" ],
        [ "UNet/dec1_1/conv2d_transpose" ],
        [ "UNet/dec1_1/conv2d_transpose" ],
        [ "mask_flatten" ],
        [ "mask_flatten" ]
     ],
    },
  };
}
