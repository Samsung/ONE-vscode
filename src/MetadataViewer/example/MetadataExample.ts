/*
NOTE this is example logic is that you can get sample MetaData
TODO Replace this sample logic into real logic
*/ 
export function getMetadata(path:any) {
  return {
    "test.log": {
      "file-extension": "log",
      "created-time": new Date().toLocaleString(),
      "modified-time": new Date().toLocaleString(),
      "is-deleted": false,

      "toolchain-version": "toolchain v1.3.0",
      "onecc-version": "1.20.0",
      "operations": {
        "op-total": 4,
        "ops": ['conv2d', 'relu', 'conv', 'spp']
      },
      "cfg-settings": {
        "onecc": {
          "one-import-tf": true,
          "one-import-tflite": false,
          "one-import-onnx": false,
          "one-quantize":true
        },
        "one-import-tf": {
          "converter-version": "v2",
          "input-array": "a",
          "output-array": "a",
          "input-shapes": "1,299,299"
        },
        "one-quantize":{
          "quantized-dtype":'int16',
          "input-data-format":'list',
          "min-percentile":'11',
          "max-percentile":'100',
          "mode":'movingAvg',
        }
      }
    }
  };
}
