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
import { updateImportUI, updateQuantizeUI } from "./updateUI.js";

export function displayCfgToEditor(cfg) {
  // 'one-build' is replaced to 'onecc' when loaded
  const onecc = cfg["onecc"];
  if (onecc) {
    if (onecc["one-import-tf"] === "True") {
      document.getElementById("checkboxImport").checked = true;
      const oneImportTF = cfg["one-import-tf"];
      const modelFormat = oneImportTF?.["model_format"];
      if (modelFormat === undefined || modelFormat === "graph_def") {
        document.getElementById("importInputModelType").value = "pb";
      } else if (modelFormat === "saved_model") {
        document.getElementById("importInputModelType").value = "saved";
      } else {
        document.getElementById("importInputModelType").value = "keras";
      }
    } else if (onecc["one-import-tflite"] === "True") {
      document.getElementById("checkboxImport").checked = true;
      document.getElementById("importInputModelType").value = "tflite";
    } else if (onecc["one-import-onnx"] === "True") {
      document.getElementById("checkboxImport").checked = true;
      document.getElementById("importInputModelType").value = "onnx";
    } else if (onecc["one-import-bcq"] === "True") {
      document.getElementById("checkboxImport").checked = true;
      // TODO Enable when one-import-bcq is supported
    } else if (onecc["one-import-edgetpu"] === "True") {
      document.getElementById("checkboxImport").checked = true;
      document.getElementById("importInputModelType").value = "edgetpu";
    } else {
      document.getElementById("checkboxImport").checked = false;
    }
    document.getElementById("checkboxOptimize").checked = cfgBoolean(
      onecc["one-optimize"]
    );
    document.getElementById("checkboxQuantize").checked = cfgBoolean(
      onecc["one-quantize"]
    );
    document.getElementById("checkboxCodegen").checked = cfgBoolean(
      onecc["one-codegen"]
    );
    document.getElementById("checkboxProfile").checked = cfgBoolean(
      onecc["one-profile"]
    );
  } else {
    document.getElementById("checkboxImport").checked = false;
    document.getElementById("checkboxOptimize").checked = false;
    document.getElementById("checkboxQuantize").checked = false;
    document.getElementById("checkboxCodegen").checked = false;
    document.getElementById("checkboxProfile").checked = false;
  }

  const oneImportTF = cfg["one-import-tf"];
  const modelFormat = oneImportTF?.["model_format"];
  if (oneImportTF === undefined) {
    document.getElementById("PBInputPath").value = "";
    document.getElementById("PBOutputPath").value = "";
    document.getElementById("PBConverterVersion").value = "";
    document.getElementById("PBInputArrays").value = "";
    document.getElementById("PBOutputArrays").value = "";
    document.getElementById("PBInputShapes").value = "";
    document.getElementById("SAVEDInputPath").value = "";
    document.getElementById("SAVEDOutputPath").value = "";
    document.getElementById("KERASInputPath").value = "";
    document.getElementById("KERASOutputPath").value = "";
  } else if (modelFormat === undefined || modelFormat === "graph_def") {
    document.getElementById("PBInputPath").value = cfgString(
      oneImportTF?.["input_path"]
    );
    document.getElementById("PBOutputPath").value = cfgString(
      oneImportTF?.["output_path"]
    );
    document.getElementById("PBConverterVersion").value = cfgString(
      oneImportTF?.["converter_version"]
    );
    document.getElementById("PBInputArrays").value = cfgString(
      oneImportTF?.["input_arrays"]
    );
    document.getElementById("PBOutputArrays").value = cfgString(
      oneImportTF?.["output_arrays"]
    );
    document.getElementById("PBInputShapes").value = cfgString(
      oneImportTF?.["input_shapes"]
    );
  } else if (modelFormat === "saved_model") {
    document.getElementById("SAVEDInputPath").value = cfgString(
      oneImportTF?.["input_path"]
    );
    document.getElementById("SAVEDOutputPath").value = cfgString(
      oneImportTF?.["output_path"]
    );
  } else if (modelFormat === "keras_model") {
    document.getElementById("KERASInputPath").value = cfgString(
      oneImportTF?.["input_path"]
    );
    document.getElementById("KERASOutputPath").value = cfgString(
      oneImportTF?.["output_path"]
    );
  }

  const oneImportTFLITE = cfg["one-import-tflite"];
  document.getElementById("TFLITEInputPath").value = cfgString(
    oneImportTFLITE?.["input_path"]
  );
  document.getElementById("TFLITEOutputPath").value = cfgString(
    oneImportTFLITE?.["output_path"]
  );

  const oneImportONNX = cfg["one-import-onnx"];
  document.getElementById("ONNXInputPath").value = cfgString(
    oneImportONNX?.["input_path"]
  );
  document.getElementById("ONNXOutputPath").value = cfgString(
    oneImportONNX?.["output_path"]
  );
  document.getElementById("ONNXSaveIntermediate").checked = cfgBoolean(
    oneImportONNX?.["save_intermediate"]
  );
  document.getElementById("ONNXUnrollRNN").checked = cfgBoolean(
    oneImportONNX?.["unroll_rnn"]
  );
  document.getElementById("ONNXUnrollLSTM").checked = cfgBoolean(
    oneImportONNX?.["unroll_lstm"]
  );
  
  // TODO Support one-import-bcq

  // TODO Support import EdgeTPU
  const oneImportEdgeTPU = cfg["one-import-edgetpu"];
  document.getElementById("EdgeTPUInputPath").value = cfgString(
    oneImportEdgeTPU?.["input_path"]
  );
  document.getElementById("EdgeTPUOutputPath").value = cfgString(
    oneImportEdgeTPU?.["output_path"]
  );  
  document.getElementById("EdgeTPUHelp").checked = cfgBoolean(
    oneImportEdgeTPU?.["help"]
  );
  document.getElementById("EdgeTPUIntermediateTensorsInputArrays").value = cfgString(
    oneImportEdgeTPU?.["intermediate_tensors"]
  );
  document.getElementById("EdgeTPUShowOperations").checked = cfgBoolean(
    oneImportEdgeTPU?.["show_operations"]
  );
  document.getElementById("EdgeTPUMinRuntimeVersion").value = cfgString(
    oneImportEdgeTPU?.["min_runtime_version"],
    "14"
  );
  document.getElementById("EdgeTPUSearchDelegate").checked = cfgBoolean(
    oneImportEdgeTPU?.["search_delegate"]
  );


  updateImportUI();

  const oneOptimize = cfg["one-optimize"];
  document.getElementById("optimizeInputPath").value = cfgString(
    oneOptimize?.["input_path"]
  );
  document.getElementById("optimizeOutputPath").value = cfgString(
    oneOptimize?.["output_path"]
  );
  for (const optName in oneOptimizationList) {
    document.getElementById("checkboxOptimize" + optName).checked = cfgBoolean(
      oneOptimize?.[optName]
    );
  }

  const oneQuantize = cfg["one-quantize"];
  if (oneQuantize?.["force_quantparam"] === "True") {
    document.getElementById("quantizeActionType").value = "forceQuant";
    document.getElementById("ForceQuantInputPath").value = cfgString(
      oneQuantize?.["input_path"]
    );
    document.getElementById("ForceQuantOutputPath").value = cfgString(
      oneQuantize?.["output_path"]
    );
    document.getElementById("ForceQuantTensorName").value = cfgString(
      oneQuantize?.["tensor_name"]
    );
    document.getElementById("ForceQuantScale").value = cfgString(
      oneQuantize?.["scale"]
    );
    document.getElementById("ForceQuantZeroPoint").value = cfgString(
      oneQuantize?.["zero_point"]
    );
    document.getElementById("ForceQuantVerbose").checked = cfgBoolean(
      oneQuantize?.["verbose"]
    );
  } else if (oneQuantize?.["copy_quantparam"] === "True") {
    document.getElementById("quantizeActionType").value = "copyQuant";
    document.getElementById("CopyQuantInputPath").value = cfgString(
      oneQuantize?.["input_path"]
    );
    document.getElementById("CopyQuantOutputPath").value = cfgString(
      oneQuantize?.["output_path"]
    );
    document.getElementById("CopyQuantSrcTensorName").value = cfgString(
      oneQuantize?.["src_tensor_name"]
    );
    document.getElementById("CopyQuantDstTensorName").value = cfgString(
      oneQuantize?.["dst_tensor_name"]
    );
    document.getElementById("CopyQuantVerbose").checked = cfgBoolean(
      oneQuantize?.["verbose"]
    );
  } else {
    document.getElementById("quantizeActionType").value = "defaultQuant";
    document.getElementById("DefaultQuantInputPath").value = cfgString(
      oneQuantize?.["input_path"]
    );
    document.getElementById("DefaultQuantOutputPath").value = cfgString(
      oneQuantize?.["output_path"]
    );
    document.getElementById("DefaultQuantInputModelDtype").value = cfgString(
      oneQuantize?.["input_model_dtype"],
      "float32"
    );
    document.getElementById("DefaultQuantQuantizedDtype").value = cfgString(
      oneQuantize?.["quantized_dtype"],
      "uint8"
    );
    document.getElementById("DefaultQuantGranularity").value = cfgString(
      oneQuantize?.["granularity"],
      "layer"
    );
    document.getElementById("DefaultQuantQuantConfig").value = cfgString(
      oneQuantize?.["quant_config"]
    );
    document.getElementById("DefaultQuantInputData").value = cfgString(
      oneQuantize?.["input_data"]
    );
    document.getElementById("DefaultQuantInputDataFormat").value = cfgString(
      oneQuantize?.["input_data_format"],
      "h5"
    );
    document.getElementById("DefaultQuantMinPercentile").value = cfgString(
      oneQuantize?.["min_percentile"],
      "1.0"
    );
    document.getElementById("DefaultQuantMaxPercentile").value = cfgString(
      oneQuantize?.["max_percentile"],
      "99.0"
    );
    document.getElementById("DefaultQuantMode").value = cfgString(
      oneQuantize?.["mode"],
      "percentile"
    );
    document.getElementById("DefaultQuantInputType").value = cfgString(
      oneQuantize?.["input_type"],
      "default"
    );
    document.getElementById("DefaultQuantOutputType").value = cfgString(
      oneQuantize?.["output_type"],
      "default"
    );
    document.getElementById("DefaultQuantVerbose").checked = cfgBoolean(
      oneQuantize?.["verbose"]
    );
    document.getElementById("DefaultQuantSaveIntermediate").checked =
      cfgBoolean(oneQuantize?.["save_intermediate"]);
    document.getElementById("DefaultQuantGenerateProfileData").checked =
      cfgBoolean(oneQuantize?.["generate_profile_data"]);
    document.getElementById("DefaultQuantTFStyleMaxpool").checked = cfgBoolean(
      oneQuantize?.["TF-style_maxpool"]
    );
  }

  updateQuantizeUI();

  // one-codegen Section
  const oneCodegen = cfg["one-codegen"];
  document.getElementById("codegenBackend").value = cfgString(
    oneCodegen?.["backend"]
  );
  document.getElementById("codegenCommand").value = cfgString(
    oneCodegen?.["command"]
  );

  // one-profile Section
  const oneProfile = cfg["one-profile"];
  document.getElementById("profileBackend").value = cfgString(
    oneProfile?.["backend"]
  );
  document.getElementById("profileCommand").value = cfgString(
    oneProfile?.["command"]
  );
}

function cfgString(str, defaultStr = "") {
  if (str === null || str === undefined) {
    return defaultStr;
  }
  return str.trim();
}

function cfgBoolean(str) {
  if (str === null || str === undefined) {
    return false;
  }

  if (str === "True") {
    return true;
  }

  return false;
}
