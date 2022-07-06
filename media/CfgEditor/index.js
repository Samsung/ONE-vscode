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

// IMPORTANT : Do not separate this file into multiple files
//
// This file had been divided into several files.
// However, this cause unintened behavior when cfg editor is opened at ssh environment.
// The exact cause is not configured, but integrating the separated files as one works well.
// Just guess that the performance was really different.
// In conclusion, if someone really wants to split this file into multiple,
// please ensure that cfg editor works well in ssh environment.

(function() {

/* eslint-disable @typescript-eslint/naming-convention */
const oneOptimizationList = {
  'O1': {'description': 'Enable O1 optimize options'},
  'fold_add_v2': {'description': 'This will fold AddV2 operators with constant inputs'},
  'fold_cast': {'description': 'This will fold Cast operators with constant input'},
  'fold_dequantize': {'description': 'This will fold dequantize op'},
  'fold_dwconv':
      {'description': 'This will fold Depthwise Convolution operator with constant inputs'},
  'fold_gather': {'description': 'This will fold Gather operator'},
  'fold_sparse_to_dense': {'description': 'This will fold SparseToDense operator'},
  'forward_reshape_to_unaryop':
      {'description': 'This will move Reshape after UnaryOp for centain condition'},
  'fuse_activation_function':
      {'description': 'This will fuse Activation function to a preceding operator'},
  'fuse_add_with_fully_connected':
      {'description': 'This will fuse Add operator to FullyConnected operator'},
  'fuse_add_with_tconv':
      {'description': 'This will fuse Add operator to Transposed Convolution operator'},
  'fuse_batchnorm_with_conv':
      {'description': 'This will fuse BatchNorm operators to Convolution operator'},
  'fuse_batchnorm_with_dwconv':
      {'description': 'This will fuse BatchNorm operators to Depthwise Convolution operator'},
  'fuse_batchnorm_with_tconv':
      {'description': 'This will fuse BatchNorm operators to Transposed Convolution operator'},
  'fuse_bcq': {'description': 'This will fuse operators and apply Binary Coded Quantization'},
  'fuse_instnorm': {'description': 'This will fuse operators to InstanceNorm operator'},
  'fuse_mean_with_mean': {
    'description':
        'This will fuse two Mean operations when they follow one by one. This will fold them into one operation and merge reduction indices.'
  },
  'fuse_transpose_with_mean': {
    'description':
        'This will fuse Mean operation with a preceding Transpose under certain conditions.'
  },
  'make_batchnorm_gamma_positive': {
    'description':
        'This will make negative gamma of BatchNorm into a small positive value (1e-10). Note that this pass can change the execution result of the model. So, use it only when the impact is known to be acceptable.'
  },
  'fuse_preactivation_batchnorm': {
    'description': 'This will fuse BatchNorm operators of pre-activations to Convolution operator'
  },
  'remove_fakequant': {'description': 'This will remove FakeQuant operators'},
  'remove_quantdequant': {'description': 'This will remove Quantize-Dequantize sequence'},
  'remove_redundant_quantize': {'description': 'This will remove redundant Quantize operators'},
  'remove_redundant_reshape':
      {'description': 'This will fuse or remove subsequent Reshape operators'},
  'remove_redundant_transpose':
      {'description': 'This will fuse or remove subsequent Transpose operators'},
  'remove_unnecessary_reshape': {'description': 'This will remove unnecessary reshape operators'},
  'remove_unnecessary_slice': {'description': 'This will remove unnecessary slice operators'},
  'remove_unnecessary_strided_slice':
      {'description': 'This will remove unnecessary strided slice operators'},
  'remove_unnecessary_split': {'description': 'This will remove unnecessary split operators'},
  'replace_cw_mul_add_with_depthwise_conv':
      {'description': 'This will replace channel-wise mul/add with DepthwiseConv2D operator'},
  'replace_sub_with_add': {'description': 'This will replace sub with add operator'},
  'resolve_customop_add': {'description': 'This will convert Custom(Add) to Add operator'},
  'resolve_customop_batchmatmul':
      {'description': 'This will convert Custom(BatchMatmul) to BatchMatmul operator'},
  'resolve_customop_matmul': {'description': 'This will convert Custom(Matmul) to Matmul operator'},
  'resolve_customop_max_pool_with_argmax':
      {'description': 'This will convert Custom(MaxPoolWithArgmax) to equivalent set of operators'},
  'shuffle_weight_to_16x1float32': {
    'description':
        'This will convert weight format of FullyConnected to SHUFFLED16x1FLOAT32. Note that it only converts weights whose row is a multiple of 16'
  },
  'replace_non_const_fc_with_batch_matmul':
      {'description': 'Replace FullyConnected with BatchMatMul when its weight is non-constant'},
  'substitute_pack_to_reshape': {'description': 'This will convert single input Pack to Reshape'},
  'substitute_padv2_to_pad': {'description': 'This will convert certain condition PadV2 to Pad'},
  'substitute_splitv_to_split':
      {'description': 'This will convert certain condition SplitV to Split operator'},
  'substitute_squeeze_to_reshape':
      {'description': 'This will convert certain condition Squeeze to Reshape'},
  'substitute_strided_slice_to_reshape':
      {'description': 'This will convert certain condition Strided_Slice to Reshape'},
  'substitute_transpose_to_reshape':
      {'description': 'This will convert single input Transpose to Reshape'},
  'expand_broadcast_const': {'description': 'This will expand broadcastable constant inputs'},
  'convert_nchw_to_nhwc': {
    'description':
        'Experimental: This will convert NCHW operators to NHWC under the assumption that input model is NCHW.'
  },
  'nchw_to_nhwc_input_shape': {
    'description': 'Convert the input shape of the model (argument for --convert_nchw_to_nhwc).'
  },
  'nchw_to_nhwc_output_shape': {
    'description': 'Convert the output shape of the model (argument for --convert_nchw_to_nhwc).'
  },
  'transform_min_max_to_relu6':
      {'description': 'Transform Minimum(6)-Maximum(0) pattern to Relu6 operator'},
  'transform_min_relu_to_relu6':
      {'description': 'Transform Minimum(6)-Relu pattern to Relu6 operator'}
};
/* eslint-enable @typescript-eslint/naming-convention */

const vscode = acquireVsCodeApi();

registerSteps();
registerImportOptions();
registerOptimizeOptions();
registerQuantizeOptions();
registerCodegenOptions();
registerProfileOptions();

// event from vscode extension
window.addEventListener('message', event => {
  const message = event.data;
  switch (message.type) {
    case 'displayCfgToEditor':
      displayCfgToEditor(message.text);
      break;
    default:
      break;
  }
});

function registerSteps() {
  const checkboxImport = document.getElementById('checkboxImport');
  const checkboxOptimize = document.getElementById('checkboxOptimize');
  const checkboxQuantize = document.getElementById('checkboxQuantize');
  const checkboxCodegen = document.getElementById('checkboxCodegen');
  const checkboxProfile = document.getElementById('checkboxProfile');
  const stepImport = document.getElementById('stepImport');
  const stepOptimize = document.getElementById('stepOptimize');
  const stepQuantize = document.getElementById('stepQuantize');
  const stepCodegen = document.getElementById('stepCodegen');
  const stepProfile = document.getElementById('stepProfile');

  checkboxImport.addEventListener('click', function() {
    updateSteps();
    updateImportInputModelType();
    applyUpdates();
  });
  checkboxOptimize.addEventListener('click', function() {
    updateSteps();
    updateOptimize();
    applyUpdates();
  });
  checkboxQuantize.addEventListener('click', function() {
    updateSteps();
    updateQuantizeActionType();
    applyUpdates();
  });
  checkboxCodegen.addEventListener('click', function() {
    updateSteps();
    updateCodegen();
    applyUpdates();
  });
  checkboxProfile.addEventListener('click', function() {
    updateSteps();
    updateProfile();
    applyUpdates();
  });

  stepImport.addEventListener('click', function() {
    updateStepUI('Import');
  });
  stepOptimize.addEventListener('click', function() {
    updateStepUI('Optimize');
  });
  stepQuantize.addEventListener('click', function() {
    updateStepUI('Quantize');
  });
  stepCodegen.addEventListener('click', function() {
    updateStepUI('Codegen');
  });
  stepProfile.addEventListener('click', function() {
    updateStepUI('Profile');
  });
}

function registerImportOptions() {
  const importInputModelType = document.getElementById('importInputModelType');
  importInputModelType.addEventListener('click', function() {
    updateImportUI();
    updateImportInputModelType();
    updateSteps();
    applyUpdates();
  });

  registerPBOptions();
  registerSAVEDOptions();
  registerKERASOptions();
  registerTFLITEOptions();
  registerONNXOptions();
}

function registerPBOptions() {
  const pbInputPath = document.getElementById('PBInputPath');
  const pbOutputPath = document.getElementById('PBOutputPath');
  const pbConverterVersion = document.getElementById('PBConverterVersion');
  const pbInputArrays = document.getElementById('PBInputArrays');
  const pbOutputArrays = document.getElementById('PBOutputArrays');
  const pbInputShapes = document.getElementById('PBInputShapes');

  // NOTE For radio button, 'change' event is applied from beginning.
  //      So 'click' event should be used to avoid the problem.
  pbConverterVersion.addEventListener('click', function() {
    updateImportPB();
    applyUpdates();
  });
  pbInputPath.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
  pbOutputPath.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
  pbInputArrays.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
  pbOutputArrays.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
  pbInputShapes.addEventListener('change', function() {
    updateImportPB();
    applyUpdates();
  });
}

function registerSAVEDOptions() {
  const savedInputPath = document.getElementById('SAVEDInputPath');
  const savedOutputPath = document.getElementById('SAVEDOutputPath');

  savedInputPath.addEventListener('change', function() {
    updateImportSAVED();
    applyUpdates();
  });
  savedOutputPath.addEventListener('change', function() {
    updateImportSAVED();
    applyUpdates();
  });
}

function registerKERASOptions() {
  const kerasInputPath = document.getElementById('KERASInputPath');
  const kerasOutputPath = document.getElementById('KERASOutputPath');

  kerasInputPath.addEventListener('change', function() {
    updateImportKERAS();
    applyUpdates();
  });
  kerasOutputPath.addEventListener('change', function() {
    updateImportKERAS();
    applyUpdates();
  });
}

function registerTFLITEOptions() {
  const tfliteInputPath = document.getElementById('TFLITEInputPath');
  const tfliteOutputPath = document.getElementById('TFLITEOutputPath');

  tfliteInputPath.addEventListener('change', function() {
    updateImportTFLITE();
    applyUpdates();
  });
  tfliteOutputPath.addEventListener('change', function() {
    updateImportTFLITE();
    applyUpdates();
  });
}

function registerONNXOptions() {
  const onnxInputPath = document.getElementById('ONNXInputPath');
  const onnxOutputPath = document.getElementById('ONNXOutputPath');
  const onnxSaveIntermediate = document.getElementById('ONNXSaveIntermediate');
  const onnxUnrollRNN = document.getElementById('ONNXUnrollRNN');
  const onnxUnrollLSTM = document.getElementById('ONNXUnrollLSTM');

  onnxInputPath.addEventListener('change', function() {
    updateImportONNX();
    applyUpdates();
  });
  onnxOutputPath.addEventListener('change', function() {
    updateImportONNX();
    applyUpdates();
  });
  onnxSaveIntermediate.addEventListener('click', function() {
    updateImportONNX();
    applyUpdates();
  });
  onnxUnrollRNN.addEventListener('click', function() {
    updateImportONNX();
    applyUpdates();
  });
  onnxUnrollLSTM.addEventListener('click', function() {
    updateImportONNX();
    applyUpdates();
  });
}

function registerOptimizeOptions() {
  const optimizeInputPath = document.getElementById('optimizeInputPath');
  const optimizeOutputPath = document.getElementById('optimizeOutputPath');
  const basicOptimizeTable = document.getElementById('basicOptimizeTable');

  optimizeInputPath.addEventListener('change', function() {
    updateOptimize();
    applyUpdates();
  });

  optimizeOutputPath.addEventListener('change', function() {
    updateOptimize();
    applyUpdates();
  });

  for (const optName in oneOptimizationList) {
    let row = document.createElement('vscode-data-grid-row');

    let cellSwitch = document.createElement('vscode-data-grid-cell');
    let checkbox = document.createElement('vscode-checkbox');
    checkbox.setAttribute('id', 'checkboxOptimize' + optName);
    cellSwitch.appendChild(checkbox);
    cellSwitch.setAttribute('grid-column', '1');
    row.appendChild(cellSwitch);

    let cellName = document.createElement('vscode-data-grid-cell');
    cellName.textContent = optName;
    cellName.setAttribute('grid-column', '2');
    row.appendChild(cellName);

    let cellDescription = document.createElement('vscode-data-grid-cell');
    cellDescription.textContent = oneOptimizationList[optName].description;
    cellDescription.setAttribute('grid-column', '3');
    row.appendChild(cellDescription);

    basicOptimizeTable.appendChild(row);
  }

  for (const optName in oneOptimizationList) {
    document.getElementById('checkboxOptimize' + optName).addEventListener('click', function() {
      updateOptimize();
      applyUpdates();
    });
  }
}

function registerQuantizeOptions() {
  const quantActionType = document.getElementById('quantizeActionType');
  quantActionType.addEventListener('click', function() {
    updateQuantizeUI();
    updateQuantizeActionType();
    applyUpdates();
  });

  registerDefaultQuantOptions();
  registerForceQuantOptions();
  registerCopyQuantOptions();
}

function registerDefaultQuantOptions() {
  const defaultQuantRadioButtonList = [
    'DefaultQuantInputModelDtype', 'DefaultQuantQuantizedDtype', 'DefaultQuantGranularity',
    'DefaultQuantInputDataFormat', 'DefaultQuantMode', 'DefaultQuantInputType',
    'DefaultQuantOutputType'
  ];
  const defaultQuantCheckboxList = [
    'DefaultQuantVerbose', 'DefaultQuantSaveIntermediate', 'DefaultQuantGenerateProfileData',
    'DefaultQuantTFStyleMaxpool'
  ];
  const defaultQuantTextFieldList = [
    'DefaultQuantInputPath',
    'DefaultQuantOutputPath',
    'DefaultQuantQuantConfig',
    'DefaultQuantInputData',
    'DefaultQuantMinPercentile',
    'DefaultQuantMaxPercentile',
  ];

  defaultQuantRadioButtonList.forEach((id) => {
    document.getElementById(id).addEventListener('click', function() {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
  defaultQuantCheckboxList.forEach((id) => {
    document.getElementById(id).addEventListener('click', function() {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
  defaultQuantTextFieldList.forEach((id) => {
    document.getElementById(id).addEventListener('change', function() {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
}

function registerForceQuantOptions() {
  const forceQuantCheckboxList = ['ForceQuantVerbose'];
  const forceQuantTextFieldList = [
    'ForceQuantInputPath', 'ForceQuantOutputPath', 'ForceQuantTensorName', 'ForceQuantScale',
    'ForceQuantZeroPoint'
  ];

  forceQuantCheckboxList.forEach((id) => {
    document.getElementById(id).addEventListener('click', function() {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
  forceQuantTextFieldList.forEach((id) => {
    document.getElementById(id).addEventListener('change', function() {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
}

function registerCopyQuantOptions() {
  const copyQuantCheckboxList = ['CopyQuantVerbose'];
  const copyQuantTextFieldList = [
    'CopyQuantInputPath', 'CopyQuantOutputPath', 'CopyQuantSrcTensorName', 'CopyQuantDstTensorName'
  ];

  copyQuantCheckboxList.forEach((id) => {
    document.getElementById(id).addEventListener('click', function() {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
  copyQuantTextFieldList.forEach((id) => {
    document.getElementById(id).addEventListener('change', function() {
      updateQuantizeDefault();
      applyUpdates();
    });
  });
}

function registerCodegenOptions() {
  const codegenBackend = document.getElementById('codegenBackend');
  const codegenCommand = document.getElementById('codegenCommand');

  codegenBackend.addEventListener('change', function() {
    updateCodegen();
    applyUpdates();
  });
  codegenCommand.addEventListener('change', function() {
    updateCodegen();
    applyUpdates();
  });
}

function registerProfileOptions() {
  const profileBackend = document.getElementById('profileBackend');
  const profileCommand = document.getElementById('profileCommand');

  profileBackend.addEventListener('change', function() {
    updateProfile();
    applyUpdates();
  });
  profileCommand.addEventListener('change', function() {
    updateProfile();
    applyUpdates();
  });
}

function displayCfgToEditor(cfg) {
  // 'one-build' is replaced to 'onecc' when loaded
  const onecc = cfg['onecc'];
  if (onecc) {
    if (onecc['one-import-tf'] === 'True') {
      document.getElementById('checkboxImport').checked = true;
      const oneImportTF = cfg['one-import-tf'];
      const modelFormat = oneImportTF ?.['model_format'];
      if (modelFormat === undefined || modelFormat === 'graph_def') {
        document.getElementById('importInputModelType').value = 'pb';
      } else if (modelFormat === 'saved_model') {
        document.getElementById('importInputModelType').value = 'saved';
      } else {
        document.getElementById('importInputModelType').value = 'keras';
      }
    } else if (onecc['one-import-tflite'] === 'True') {
      document.getElementById('checkboxImport').checked = true;
      document.getElementById('importInputModelType').value = 'tflite';
    } else if (onecc['one-import-onnx'] === 'True') {
      document.getElementById('checkboxImport').checked = true;
      document.getElementById('importInputModelType').value = 'onnx';
    } else if (onecc['one-import-bcq'] === 'True') {
      document.getElementById('checkboxImport').checked = true;
      // TODO Enable when one-import-bcq is supported
    } else {
      document.getElementById('checkboxImport').checked = false;
    }
    document.getElementById('checkboxOptimize').checked = cfgBoolean(onecc['one-optimize']);
    document.getElementById('checkboxQuantize').checked = cfgBoolean(onecc['one-quantize']);
    document.getElementById('checkboxCodegen').checked = cfgBoolean(onecc['one-codegen']);
    document.getElementById('checkboxProfile').checked = cfgBoolean(onecc['one-profile']);
  } else {
    document.getElementById('checkboxImport').checked = false;
    document.getElementById('checkboxOptimize').checked = false;
    document.getElementById('checkboxQuantize').checked = false;
    document.getElementById('checkboxCodegen').checked = false;
    document.getElementById('checkboxProfile').checked = false;
  }

  const oneImportTF = cfg['one-import-tf'];
  const modelFormat = oneImportTF ?.['model_format'];
  if (oneImportTF === undefined) {
    document.getElementById('PBInputPath').value = '';
    document.getElementById('PBOutputPath').value = '';
    document.getElementById('PBConverterVersion').value = '';
    document.getElementById('PBInputArrays').value = '';
    document.getElementById('PBOutputArrays').value = '';
    document.getElementById('PBInputShapes').value = '';
    document.getElementById('SAVEDInputPath').value = '';
    document.getElementById('SAVEDOutputPath').value = '';
    document.getElementById('KERASInputPath').value = '';
    document.getElementById('KERASOutputPath').value = '';
  } else if (modelFormat === undefined || modelFormat === 'graph_def') {
    document.getElementById('PBInputPath').value = cfgString(oneImportTF?.['input_path']);
    document.getElementById('PBOutputPath').value = cfgString(oneImportTF?.['output_path']);
    document.getElementById('PBConverterVersion').value =
        cfgString(oneImportTF?.['converter_version']);
    document.getElementById('PBInputArrays').value = cfgString(oneImportTF?.['input_arrays']);
    document.getElementById('PBOutputArrays').value = cfgString(oneImportTF?.['output_arrays']);
    document.getElementById('PBInputShapes').value = cfgString(oneImportTF?.['input_shapes']);
  } else if (modelFormat === 'saved_model') {
    document.getElementById('SAVEDInputPath').value = cfgString(oneImportTF?.['input_path']);
    document.getElementById('SAVEDOutputPath').value = cfgString(oneImportTF?.['output_path']);
  } else if (modelFormat === 'keras_model') {
    document.getElementById('KERASInputPath').value = cfgString(oneImportTF?.['input_path']);
    document.getElementById('KERASOutputPath').value = cfgString(oneImportTF?.['output_path']);
  }

  const oneImportTFLITE = cfg['one-import-tflite'];
  document.getElementById('TFLITEInputPath').value = cfgString(oneImportTFLITE?.['input_path']);
  document.getElementById('TFLITEOutputPath').value = cfgString(oneImportTFLITE?.['output_path']);

  const oneImportONNX = cfg['one-import-onnx'];
  document.getElementById('ONNXInputPath').value = cfgString(oneImportONNX?.['input_path']);
  document.getElementById('ONNXOutputPath').value = cfgString(oneImportONNX?.['output_path']);
  document.getElementById('ONNXSaveIntermediate').checked =
      cfgBoolean(oneImportONNX?.['save_intermediate']);
  document.getElementById('ONNXUnrollRNN').checked = cfgBoolean(oneImportONNX?.['unroll_rnn']);
  document.getElementById('ONNXUnrollLSTM').checked = cfgBoolean(oneImportONNX?.['unroll_lstm']);

  // TODO Support one-import-bcq

  updateImportUI();

  const oneOptimize = cfg['one-optimize'];
  document.getElementById('optimizeInputPath').value = cfgString(oneOptimize?.['input_path']);
  document.getElementById('optimizeOutputPath').value = cfgString(oneOptimize?.['output_path']);
  for (const optName in oneOptimizationList) {
    document.getElementById('checkboxOptimize' + optName).checked = cfgBoolean(oneOptimize?.[optName]);
  }

  const oneQuantize = cfg['one-quantize'];
  if (oneQuantize?.['force_quantparam'] === 'True') {
    document.getElementById('quantizeActionType').value = 'forceQuant';
    document.getElementById('ForceQuantInputPath').value = cfgString(oneQuantize?.['input_path']);
    document.getElementById('ForceQuantOutputPath').value = cfgString(oneQuantize?.['output_path']);
    document.getElementById('ForceQuantTensorName').value = cfgString(oneQuantize?.['tensor_name']);
    document.getElementById('ForceQuantScale').value = cfgString(oneQuantize?.['scale']);
    document.getElementById('ForceQuantZeroPoint').value = cfgString(oneQuantize?.['zero_point']);
    document.getElementById('ForceQuantVerbose').checked = cfgBoolean(oneQuantize?.['verbose']);
  } else if (oneQuantize?.['copy_quantparam'] === 'True') {
    document.getElementById('quantizeActionType').value = 'copyQuant';
    document.getElementById('CopyQuantInputPath').value = cfgString(oneQuantize?.['input_path']);
    document.getElementById('CopyQuantOutputPath').value = cfgString(oneQuantize?.['output_path']);
    document.getElementById('CopyQuantSrcTensorName').value = cfgString(oneQuantize?.['src_tensor_name']);
    document.getElementById('CopyQuantDstTensorName').value = cfgString(oneQuantize?.['dst_tensor_name']);
    document.getElementById('CopyQuantVerbose').checked = cfgBoolean(oneQuantize?.['verbose']);
  } else {
    document.getElementById('quantizeActionType').value = 'defaultQuant';
    document.getElementById('DefaultQuantInputPath').value = cfgString(oneQuantize?.['input_path']);
    document.getElementById('DefaultQuantOutputPath').value = cfgString(oneQuantize?.['output_path']);
    document.getElementById('DefaultQuantInputModelDtype').value = cfgString(oneQuantize?.['input_model_dtype'], 'float32');
    document.getElementById('DefaultQuantQuantizedDtype').value = cfgString(oneQuantize?.['quantized_dtype'], 'uint8');
    document.getElementById('DefaultQuantGranularity').value = cfgString(oneQuantize?.['granularity'], 'layer');
    document.getElementById('DefaultQuantQuantConfig').value = cfgString(oneQuantize?.['quant_config']);
    document.getElementById('DefaultQuantInputData').value = cfgString(oneQuantize?.['input_data']);
    document.getElementById('DefaultQuantInputDataFormat').value = cfgString(oneQuantize?.['input_data_format'], 'h5');
    document.getElementById('DefaultQuantMinPercentile').value = cfgString(oneQuantize?.['min_percentile'], '1.0');
    document.getElementById('DefaultQuantMaxPercentile').value = cfgString(oneQuantize?.['max_percentile'], '99.0');
    document.getElementById('DefaultQuantMode').value = cfgString(oneQuantize?.['mode'], 'percentile');
    document.getElementById('DefaultQuantInputType').value = cfgString(oneQuantize?.['input_type'], 'default');
    document.getElementById('DefaultQuantOutputType').value = cfgString(oneQuantize?.['output_type'], 'default');
    document.getElementById('DefaultQuantVerbose').checked = cfgBoolean(oneQuantize?.['verbose']);
    document.getElementById('DefaultQuantSaveIntermediate').checked = cfgBoolean(oneQuantize?.['save_intermediate']);
    document.getElementById('DefaultQuantGenerateProfileData').checked = cfgBoolean(oneQuantize?.['generate_profile_data']);
    document.getElementById('DefaultQuantTFStyleMaxpool').checked = cfgBoolean(oneQuantize?.['TF-style_maxpool']);
  }

  updateQuantizeUI();

  // one-codegen Section
  const oneCodegen = cfg['one-codegen'];
  document.getElementById('codegenBackend').value = cfgString(oneCodegen?.['backend']);
  document.getElementById('codegenCommand').value = cfgString(oneCodegen?.['command']);

  // one-profile Section
  const oneProfile = cfg['one-profile'];
  document.getElementById('profileBackend').value = cfgString(oneProfile?.['backend']);
  document.getElementById('profileCommand').value = cfgString(oneProfile?.['command']);
}

function cfgString(str, defaultStr = '') {
  if (str === null || str === undefined) {
    return defaultStr;
  }
  return str.trim();
}

function cfgBoolean(str) {
  if (str === null || str === undefined) {
    return false;
  }

  if (str === 'True') {
    return true;
  }

  return false;
}

function iniKeyValueString(iniKey, iniValue, noEffectValue = undefined) {
  if (iniValue === null || iniValue === undefined) {
    return '';
  }

  if (iniValue === false) {
    return '';
  } else if (iniValue === true) {
    return iniKey + '=True\n';
  }

  const trimmedValue = iniValue.trim();
  if (trimmedValue === '' || trimmedValue === noEffectValue) {
    return '';
  }

  return iniKey + '=' + trimmedValue + '\n';
}

function applyUpdates() {
  vscode.postMessage({type: 'updateDocument'});
}

function updateSteps() {
  vscode.postMessage({type: 'setParam', section: 'onecc', param: 'one-import-tf', value: 'False'});
  vscode.postMessage(
      {type: 'setParam', section: 'onecc', param: 'one-import-tflite', value: 'False'});
  vscode.postMessage({type: 'setParam', section: 'onecc', param: 'one-import-bcq', value: 'False'});
  vscode.postMessage(
      {type: 'setParam', section: 'onecc', param: 'one-import-onnx', value: 'False'});
  if (document.getElementById('checkboxImport').checked) {
    switch (document.getElementById('importInputModelType').value) {
      case 'pb':
      case 'saved':
      case 'keras':
        vscode.postMessage(
            {type: 'setParam', section: 'onecc', param: 'one-import-tf', value: 'True'});
        break;
      case 'tflite':
        vscode.postMessage(
            {type: 'setParam', section: 'onecc', param: 'one-import-tflite', value: 'True'});
        break;
      case 'onnx':
        vscode.postMessage(
            {type: 'setParam', section: 'onecc', param: 'one-import-onnx', value: 'True'});
        break;
      default:
        break;
    }
  }

  vscode.postMessage({
    type: 'setParam',
    section: 'onecc',
    param: 'one-optimize',
    value: document.getElementById('checkboxOptimize').checked ? 'True' : 'False'
  });
  vscode.postMessage({
    type: 'setParam',
    section: 'onecc',
    param: 'one-quantize',
    value: document.getElementById('checkboxQuantize').checked ? 'True' : 'False'
  });
  vscode.postMessage({
    type: 'setParam',
    section: 'onecc',
    param: 'one-codegen',
    value: document.getElementById('checkboxCodegen').checked ? 'True' : 'False'
  });
  vscode.postMessage({
    type: 'setParam',
    section: 'onecc',
    param: 'one-profile',
    value: document.getElementById('checkboxProfile').checked ? 'True' : 'False'
  });
}

function updateImportInputModelType() {
  switch (document.getElementById('importInputModelType').value) {
    case 'pb':
      updateImportPB();
      break;
    case 'saved':
      updateImportSAVED();
      break;
    case 'keras':
      updateImportKERAS();
      break;
    case 'tflite':
      updateImportTFLITE();
      break;
    case 'onnx':
      updateImportONNX();
      break;
    default:
      break;
  }
}

function updateImportPB() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('PBInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('PBOutputPath').value);
  content +=
      iniKeyValueString('converter_version', document.getElementById('PBConverterVersion').value);
  content += iniKeyValueString('input_arrays', document.getElementById('PBInputArrays').value);
  content += iniKeyValueString('output_arrays', document.getElementById('PBOutputArrays').value);
  content += iniKeyValueString('input_shapes', document.getElementById('PBInputShapes').value);

  vscode.postMessage({type: 'setSection', section: 'one-import-tf', param: content});
}

function updateImportSAVED() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('SAVEDInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('SAVEDOutputPath').value);
  content += iniKeyValueString('model_format', 'saved_model');

  vscode.postMessage({type: 'setSection', section: 'one-import-tf', param: content});
}

function updateImportKERAS() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('KERASInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('KERASOutputPath').value);
  content += iniKeyValueString('model_format', 'keras_model');

  vscode.postMessage({type: 'setSection', section: 'one-import-tf', param: content});
}

function updateImportTFLITE() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('TFLITEInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('TFLITEOutputPath').value);

  vscode.postMessage({type: 'setSection', section: 'one-import-tflite', param: content});
}

function updateImportONNX() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('ONNXInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('ONNXOutputPath').value);
  content += iniKeyValueString(
      'save_intermediate', document.getElementById('ONNXSaveIntermediate').checked);
  content += iniKeyValueString('unroll_rnn', document.getElementById('ONNXUnrollRNN').checked);
  content += iniKeyValueString('unroll_lstm', document.getElementById('ONNXUnrollLSTM').checked);

  vscode.postMessage({type: 'setSection', section: 'one-import-onnx', param: content});
}

function updateOptimize() {
  let content = '';
  content += iniKeyValueString('input_path', document.getElementById('optimizeInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('optimizeOutputPath').value);

  for (const optName in oneOptimizationList) {
    content +=
        iniKeyValueString(optName, document.getElementById('checkboxOptimize' + optName).checked);
  }

  vscode.postMessage({type: 'setSection', section: 'one-optimize', param: content});
}

function updateQuantizeActionType() {
  switch (document.getElementById('quantizeActionType').value) {
    case 'defaultQuant':
      updateQuantizeDefault();
      break;
    case 'forceQuant':
      updateQuantizeForce();
      break;
    case 'copyQuant':
      updateQuantizeCopy();
      break;
    default:
      break;
  }
}

function updateQuantizeDefault() {
  let content = '';
  content +=
      iniKeyValueString('input_path', document.getElementById('DefaultQuantInputPath').value);
  content +=
      iniKeyValueString('output_path', document.getElementById('DefaultQuantOutputPath').value);
  content += iniKeyValueString(
      'input_model_dtype', document.getElementById('DefaultQuantInputModelDtype').value, 'float32');
  content += iniKeyValueString(
      'quantized_dtype', document.getElementById('DefaultQuantQuantizedDtype').value, 'uint8');
  content += iniKeyValueString(
      'granularity', document.getElementById('DefaultQuantGranularity').value, 'layer');
  content +=
      iniKeyValueString('quant_config', document.getElementById('DefaultQuantQuantConfig').value);
  content +=
      iniKeyValueString('input_data', document.getElementById('DefaultQuantInputData').value);
  content += iniKeyValueString(
      'input_data_format', document.getElementById('DefaultQuantInputDataFormat').value, 'h5');
  content += iniKeyValueString(
      'min_percentile', document.getElementById('DefaultQuantMinPercentile').value, '1.0');
  content += iniKeyValueString(
      'max_percentile', document.getElementById('DefaultQuantMaxPercentile').value, '99.0');
  content +=
      iniKeyValueString('mode', document.getElementById('DefaultQuantMode').value, 'percentile');

  if (document.getElementById('DefaultQuantInputType').value !== 'default') {
    content +=
        iniKeyValueString('input_type', document.getElementById('DefaultQuantInputType').value);
  }

  if (document.getElementById('DefaultQuantOutputType').value !== 'default') {
    content +=
        iniKeyValueString('output_type', document.getElementById('DefaultQuantOutputType').value);
  }

  content += iniKeyValueString('verbose', document.getElementById('DefaultQuantVerbose').checked);
  content += iniKeyValueString(
      'save_intermediate', document.getElementById('DefaultQuantSaveIntermediate').checked);
  content += iniKeyValueString(
      'generate_profile_data', document.getElementById('DefaultQuantGenerateProfileData').checked);
  content += iniKeyValueString(
      'TF-style_maxpool', document.getElementById('DefaultQuantTFStyleMaxpool').checked);

  vscode.postMessage({type: 'setSection', section: 'one-quantize', param: content});
}

function updateQuantizeForce() {
  let content = '';
  content += iniKeyValueString('force_quantparam', true);
  content += iniKeyValueString('input_path', document.getElementById('ForceQuantInputPath').value);
  content +=
      iniKeyValueString('output_path', document.getElementById('ForceQuantOutputPath').value);
  content +=
      iniKeyValueString('tensor_name', document.getElementById('ForceQuantTensorName').value);
  content += iniKeyValueString('scale', document.getElementById('ForceQuantScale').value);
  content += iniKeyValueString('zero_point', document.getElementById('ForceQuantZeroPoint').value);
  content += iniKeyValueString('verbose', document.getElementById('ForceQuantVerbose').checked);

  vscode.postMessage({type: 'setSection', section: 'one-quantize', param: content});
}

function updateQuantizeCopy() {
  let content = '';
  content += iniKeyValueString('copy_quantparam', true);
  content += iniKeyValueString('input_path', document.getElementById('CopyQuantInputPath').value);
  content += iniKeyValueString('output_path', document.getElementById('CopyQuantOutputPath').value);
  content +=
      iniKeyValueString('src_tensor_name', document.getElementById('CopyQuantSrcTensorName').value);
  content +=
      iniKeyValueString('dst_tensor_name', document.getElementById('CopyQuantDstTensorName').value);
  content += iniKeyValueString('verbose', document.getElementById('CopyQuantVerbose').checked);

  vscode.postMessage({type: 'setSection', section: 'one-quantize', param: content});
}

function updateCodegen() {
  let content = '';
  content += iniKeyValueString('backend', document.getElementById('codegenBackend').value);
  content += iniKeyValueString('command', document.getElementById('codegenCommand').value);

  vscode.postMessage({type: 'setSection', section: 'one-codegen', param: content});
}

function updateProfile() {
  let content = '';
  content += iniKeyValueString('backend', document.getElementById('profileBackend').value);
  content += iniKeyValueString('command', document.getElementById('profileCommand').value);

  vscode.postMessage({type: 'setSection', section: 'one-profile', param: content});
}

function updateImportUI() {
  const modelType = document.getElementById('importInputModelType');
  const pbBasicOptions = document.getElementById('optionImportPBBasic');
  const pbAdvancedOptions = document.getElementById('optionImportPBAdvanced');
  const savedBasicOptions = document.getElementById('optionImportSAVEDBasic');
  const kerasBasicOptions = document.getElementById('optionImportKERASBasic');
  const tfliteBasicOptions = document.getElementById('optionImportTFLITEBasic');
  const onnxBasicOptions = document.getElementById('optionImportONNXBasic');
  const onnxAdvancedOptions = document.getElementById('optionImportONNXAdvanced');

  pbBasicOptions.style.display = 'none';
  pbAdvancedOptions.style.display = 'none';
  savedBasicOptions.style.display = 'none';
  kerasBasicOptions.style.display = 'none';
  tfliteBasicOptions.style.display = 'none';
  onnxBasicOptions.style.display = 'none';
  onnxAdvancedOptions.style.display = 'none';

  switch (modelType.value) {
    case 'pb':
      pbBasicOptions.style.display = 'block';
      pbAdvancedOptions.style.display = 'block';
      break;
    case 'saved':
      savedBasicOptions.style.display = 'block';
      break;
    case 'keras':
      kerasBasicOptions.style.display = 'block';
      break;
    case 'tflite':
      tfliteBasicOptions.style.display = 'block';
      break;
    case 'onnx':
      onnxBasicOptions.style.display = 'block';
      onnxAdvancedOptions.style.display = 'block';
      break;
    default:
      break;
  }
}

function updateQuantizeUI() {
  const actionType = document.getElementById('quantizeActionType');
  const defaultQuantBasicOptions = document.getElementById('optionQuantizeDefaultQuantBasic');
  const defaultQuantAdvancedOptions = document.getElementById('optionQuantizeDefaultQuantAdvanced');
  const forceQuantBasicOptions = document.getElementById('optionQuantizeForceQuantBasic');
  const forceQuantAdvancedOptions = document.getElementById('optionQuantizeForceQuantAdvanced');
  const copyQuantBasicOptions = document.getElementById('optionQuantizeCopyQuantBasic');
  const copyQuantAdvancedOptions = document.getElementById('optionQuantizeCopyQuantAdvanced');

  defaultQuantBasicOptions.style.display = 'none';
  defaultQuantAdvancedOptions.style.display = 'none';
  forceQuantBasicOptions.style.display = 'none';
  forceQuantAdvancedOptions.style.display = 'none';
  copyQuantBasicOptions.style.display = 'none';
  copyQuantAdvancedOptions.style.display = 'none';

  switch (actionType.value) {
    case 'defaultQuant':
      defaultQuantBasicOptions.style.display = 'block';
      defaultQuantAdvancedOptions.style.display = 'block';
      break;
    case 'forceQuant':
      forceQuantBasicOptions.style.display = 'block';
      forceQuantAdvancedOptions.style.display = 'block';
      break;
    case 'copyQuant':
      copyQuantBasicOptions.style.display = 'block';
      copyQuantAdvancedOptions.style.display = 'block';
      break;
    default:
      break;
  }
}

function updateStepUI(step) {
  const allOptionPanels = document.querySelectorAll('.optionPanel .options');
  allOptionPanels.forEach(function(panel) {
    panel.style.display = 'none';
  });

  const optionPanel = document.getElementById('option' + step);
  optionPanel.style.display = 'block';

  const allSteps = document.querySelectorAll('.statusbar .steps .step');
  allSteps.forEach(function(step) {
    step.classList.remove('current');
  });

  const stepbar = document.getElementById('stepbar' + step);
  stepbar.classList.add('current');
}
})();
