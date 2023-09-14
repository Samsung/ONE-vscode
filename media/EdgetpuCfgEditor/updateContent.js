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

import oneOptimizationList from "./one-optimizations.json" assert { type: "json" };
import { postMessageToVsCode } from "./vscodeapi.js";

function iniKeyValueString(iniKey, iniValue, noEffectValue = undefined) {
  if (iniValue === null || iniValue === undefined) {
    return "";
  }

  if (iniValue === false) {
    return "";
  } else if (iniValue === true) {
    return iniKey + "=True\n";
  }

  const trimmedValue = iniValue.trim();
  if (trimmedValue === "" || trimmedValue === noEffectValue) {
    return "";
  }

  return iniKey + "=" + trimmedValue + "\n";
}

export function applyUpdates() {
  postMessageToVsCode({ type: "updateDocument" });
}

export function updateCompiler(){
  postMessageToVsCode({
    type: "setParam",
    section: "compiler",
    param: "onecc",
    value: "False",
  });
  postMessageToVsCode({
    type: "setParam",
    section: "compiler",
    param: "edgetpu-compiler",
    value: "False",
  });

    switch (document.getElementById("compilerSelector").value){
      case "ONEcc" :
        postMessageToVsCode({
          type: "setParam",
          section: "compiler",
          param: "edgetpu-compiler",
          value: "True"
        });
        break;
      case "EdgeTPU" :
        postMessageToVsCode({
          type: "setParam",
          section: "compiler",
          param: "onecc",
          value: "True"
        });
       break;        
      default:
        break;
    }
}

export function updateSteps() {
  postMessageToVsCode({
    type: "setParam",
    section: "onecc",
    param: "one-import-tf",
    value: "False",
  });
  postMessageToVsCode({
    type: "setParam",
    section: "onecc",
    param: "one-import-tflite",
    value: "False",
  });
  postMessageToVsCode({
    type: "setParam",
    section: "onecc",
    param: "one-import-bcq",
    value: "False",
  });
  postMessageToVsCode({
    type: "setParam",
    section: "onecc",
    param: "one-import-onnx",
    value: "False",
  });
  if (document.getElementById("checkboxImport").checked) {
    switch (document.getElementById("importInputModelType").value) {
      case "pb":
      case "saved":
      case "keras":
        postMessageToVsCode({
          type: "setParam",
          section: "onecc",
          param: "one-import-tf",
          value: "True",
        });
        break;
      case "tflite":
        postMessageToVsCode({
          type: "setParam",
          section: "onecc",
          param: "one-import-tflite",
          value: "True",
        });
        break;
      case "onnx":
        postMessageToVsCode({
          type: "setParam",
          section: "onecc",
          param: "one-import-onnx",
          value: "True",
        });
        break;
      default:
        break;
    }
  }

  postMessageToVsCode({
    type: "setParam",
    section: "onecc",
    param: "one-optimize",
    value: document.getElementById("checkboxOptimize").checked
      ? "True"
      : "False",
  });
  postMessageToVsCode({
    type: "setParam",
    section: "onecc",
    param: "one-quantize",
    value: document.getElementById("checkboxQuantize").checked
      ? "True"
      : "False",
  });
  postMessageToVsCode({
    type: "setParam",
    section: "onecc",
    param: "one-codegen",
    value: document.getElementById("checkboxCodegen").checked
      ? "True"
      : "False",
  });
  postMessageToVsCode({
    type: "setParam",
    section: "onecc",
    param: "one-profile",
    value: document.getElementById("checkboxProfile").checked
      ? "True"
      : "False",
  }); 
}

export function updateEdgeTPUStep(){
  postMessageToVsCode({
    type: "setParam",
    section: "edgetpu-compiler",
    param: "edgetpu-compile",
    value: document.getElementById("checkboxEdgeTPUCompile").checked
    ? "True"
    : "False",
  }); 
  postMessageToVsCode({
    type: "setParam",
    section: "edgetpu-compiler",
    param: "edgetpu-profile",
    value: document.getElementById("checkboxEdgeTPUProfile").checked
    ? "True"
    : "False",
  }); 
}

export function updateImportInputModelType() {
  switch (document.getElementById("importInputModelType").value) {
    case "pb":
      updateImportPB();
      break;
    case "saved":
      updateImportSAVED();
      break;
    case "keras":
      updateImportKERAS();
      break;
    case "tflite":
      updateImportTFLITE();
      break;
    case "onnx":
      updateImportONNX();
      break;
    default:
      break;
  }
}

export function updateImportPB() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("PBInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("PBOutputPath").value
  );
  content += iniKeyValueString(
    "converter_version",
    document.getElementById("PBConverterVersion").value
  );
  content += iniKeyValueString(
    "input_arrays",
    document.getElementById("PBInputArrays").value
  );
  content += iniKeyValueString(
    "output_arrays",
    document.getElementById("PBOutputArrays").value
  );
  content += iniKeyValueString(
    "input_shapes",
    document.getElementById("PBInputShapes").value
  );

  postMessageToVsCode({
    type: "setSection",
    section: "one-import-tf",
    param: content,
  });
}

export function updateImportSAVED() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("SAVEDInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("SAVEDOutputPath").value
  );
  content += iniKeyValueString("model_format", "saved_model");

  postMessageToVsCode({
    type: "setSection",
    section: "one-import-tf",
    param: content,
  });
}

export function updateImportKERAS() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("KERASInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("KERASOutputPath").value
  );
  content += iniKeyValueString("model_format", "keras_model");

  postMessageToVsCode({
    type: "setSection",
    section: "one-import-tf",
    param: content,
  });
}

export function updateImportTFLITE() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("TFLITEInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("TFLITEOutputPath").value
  );

  postMessageToVsCode({
    type: "setSection",
    section: "one-import-tflite",
    param: content,
  });
}

export function updateImportONNX() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("ONNXInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("ONNXOutputPath").value
  );
  content += iniKeyValueString(
    "save_intermediate",
    document.getElementById("ONNXSaveIntermediate").checked
  );
  content += iniKeyValueString(
    "unroll_rnn",
    document.getElementById("ONNXUnrollRNN").checked
  );
  content += iniKeyValueString(
    "unroll_lstm",
    document.getElementById("ONNXUnrollLSTM").checked
  );

  postMessageToVsCode({
    type: "setSection",
    section: "one-import-onnx",
    param: content,
  });
}

function addPostfixToFileName(filePath = "", postfix = "") {
  if (filePath.trim() === "") {
    return "";
  }
  const parts = filePath.split(".");
  let newFilePath = "";
  if (parts.length < 2) {
    newFilePath = `${filePath}${postfix}`;
  } else {
    const fileName = parts.slice(0, -1).join(".");
    const fileExtension = parts[parts.length - 1];
    const newFileName = `${fileName}${postfix}`;
    newFilePath = `${newFileName}.${fileExtension}`;
  }

  return newFilePath;
}

export function updateEdgeTPUCompile() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("EdgeTPUInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    addPostfixToFileName(
      document.getElementById("EdgeTPUInputPath").value,
      "_edgetpu"
    )
  );
  content += iniKeyValueString(
    "intermediate_tensors",
    document.getElementById("EdgeTPUIntermediateTensorsInputArrays").value
  );
  content += iniKeyValueString(
    "show_operations",
    document.getElementById("EdgeTPUShowOperations").checked
  );
  content += iniKeyValueString(
    "min_runtime_version",
    document.getElementById("EdgeTPUMinRuntimeVersion").value,
    "14"
  );
  content += iniKeyValueString(
    "search_delegate",
    document.getElementById("EdgeTPUSearchDelegate").checked
  );
  content += iniKeyValueString(
    "delegate_search_step",
    document.getElementById("EdgeTPUSearchDelegate").checked
      ? document.getElementById("EdgeTPUDelegateSearchStep").value < 1
        ? "1"
        : document.getElementById("EdgeTPUDelegateSearchStep").value
      : undefined
  );

  postMessageToVsCode({
    type: "setSection",
    section: "edgetpu-compile",
    param: content,
  });
}

export function updateOptimize() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("optimizeInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("optimizeOutputPath").value
  );

  for (const optName in oneOptimizationList) {
    content += iniKeyValueString(
      optName,
      document.getElementById("checkboxOptimize" + optName).checked
    );
  }

  postMessageToVsCode({
    type: "setSection",
    section: "one-optimize",
    param: content,
  });
}


export function updateQuantizeActionType() {
  switch (document.getElementById("quantizeActionType").value) {
    case "defaultQuant":
      updateQuantizeDefault();
      break;
    case "forceQuant":
      updateQuantizeForce();
      break;
    case "copyQuant":
      updateQuantizeCopy();
      break;
    default:
      break;
  }
}

export function updateQuantizeDefault() {
  let content = "";
  content += iniKeyValueString(
    "input_path",
    document.getElementById("DefaultQuantInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("DefaultQuantOutputPath").value
  );
  content += iniKeyValueString(
    "input_model_dtype",
    document.getElementById("DefaultQuantInputModelDtype").value,
    "float32"
  );
  content += iniKeyValueString(
    "quantized_dtype",
    document.getElementById("DefaultQuantQuantizedDtype").value,
    "uint8"
  );
  content += iniKeyValueString(
    "granularity",
    document.getElementById("DefaultQuantGranularity").value,
    "layer"
  );
  content += iniKeyValueString(
    "quant_config",
    document.getElementById("DefaultQuantQuantConfig").value
  );
  content += iniKeyValueString(
    "input_data",
    document.getElementById("DefaultQuantInputData").value
  );
  content += iniKeyValueString(
    "input_data_format",
    document.getElementById("DefaultQuantInputDataFormat").value,
    "h5"
  );
  content += iniKeyValueString(
    "min_percentile",
    document.getElementById("DefaultQuantMinPercentile").value,
    "1.0"
  );
  content += iniKeyValueString(
    "max_percentile",
    document.getElementById("DefaultQuantMaxPercentile").value,
    "99.0"
  );
  content += iniKeyValueString(
    "mode",
    document.getElementById("DefaultQuantMode").value,
    "percentile"
  );

  if (document.getElementById("DefaultQuantInputType").value !== "default") {
    content += iniKeyValueString(
      "input_type",
      document.getElementById("DefaultQuantInputType").value
    );
  }

  if (document.getElementById("DefaultQuantOutputType").value !== "default") {
    content += iniKeyValueString(
      "output_type",
      document.getElementById("DefaultQuantOutputType").value
    );
  }

  content += iniKeyValueString(
    "verbose",
    document.getElementById("DefaultQuantVerbose").checked
  );
  content += iniKeyValueString(
    "save_intermediate",
    document.getElementById("DefaultQuantSaveIntermediate").checked
  );
  content += iniKeyValueString(
    "generate_profile_data",
    document.getElementById("DefaultQuantGenerateProfileData").checked
  );
  content += iniKeyValueString(
    "TF-style_maxpool",
    document.getElementById("DefaultQuantTFStyleMaxpool").checked
  );

  postMessageToVsCode({
    type: "setSection",
    section: "one-quantize",
    param: content,
  });
}

export function updateQuantizeForce() {
  let content = "";
  content += iniKeyValueString("force_quantparam", true);
  content += iniKeyValueString(
    "input_path",
    document.getElementById("ForceQuantInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("ForceQuantOutputPath").value
  );
  content += iniKeyValueString(
    "tensor_name",
    document.getElementById("ForceQuantTensorName").value
  );
  content += iniKeyValueString(
    "scale",
    document.getElementById("ForceQuantScale").value
  );
  content += iniKeyValueString(
    "zero_point",
    document.getElementById("ForceQuantZeroPoint").value
  );
  content += iniKeyValueString(
    "verbose",
    document.getElementById("ForceQuantVerbose").checked
  );

  postMessageToVsCode({
    type: "setSection",
    section: "one-quantize",
    param: content,
  });
}

export function updateQuantizeCopy() {
  let content = "";
  content += iniKeyValueString("copy_quantparam", true);
  content += iniKeyValueString(
    "input_path",
    document.getElementById("CopyQuantInputPath").value
  );
  content += iniKeyValueString(
    "output_path",
    document.getElementById("CopyQuantOutputPath").value
  );
  content += iniKeyValueString(
    "src_tensor_name",
    document.getElementById("CopyQuantSrcTensorName").value
  );
  content += iniKeyValueString(
    "dst_tensor_name",
    document.getElementById("CopyQuantDstTensorName").value
  );
  content += iniKeyValueString(
    "verbose",
    document.getElementById("CopyQuantVerbose").checked
  );

  postMessageToVsCode({
    type: "setSection",
    section: "one-quantize",
    param: content,
  });
}

export function updateCodegen() {
  let content = "";
  content += iniKeyValueString(
    "backend",
    document.getElementById("codegenBackend").value
  );
  content += iniKeyValueString(
    "command",
    document.getElementById("codegenCommand").value
  );

  postMessageToVsCode({
    type: "setSection",
    section: "one-codegen",
    param: content,
  });
}

export function updateProfile() {
  let content = "";
  content += iniKeyValueString(
    "backend",
    document.getElementById("profileBackend").value
  );
  content += iniKeyValueString(
    "command",
    document.getElementById("profileCommand").value
  );

  postMessageToVsCode({
    type: "setSection",
    section: "one-profile",
    param: content,
  });
}
