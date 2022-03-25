# Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import sys
import tensorflow as tf
import numpy as np
import h5py
import os

from pathlib import Path

def save_data_to_h5(modelname, input_names, output_names, input_data, output_data):
  filename = modelname + ".data.h5"
  print(filename)
  h5f = h5py.File(filename, "w")

  for i in range(len(input_names)):
    input_name = input_names[i]
    input_name_res = "input/" + str(i).zfill(5) + "-" + input_name.replace("/", "|")
    h5f.create_dataset(input_name_res, data=input_data[input_name])

  for i in range(len(output_names)):
    output_name = output_names[i]
    output_name_res = "output/" + str(i).zfill(5) + "-" + output_name.replace("/", "|")
    h5f.create_dataset(output_name_res, data=output_data[output_name])

  h5f.close()
  return

def exec_tflite_model(filepath, input_file=None):
  interpreter = tf.lite.Interpreter(filepath)
  interpreter.allocate_tensors()

  input_details = interpreter.get_input_details()
  input_names = []
  input_data = dict()

  for i in range(len(input_details)):
    input = input_details[i]
    input_name = input['name']
    input_type = input['dtype']
    input_shape = input['shape']

    # TODO: enable to use input file, not only random input
    if input_type == np.float32:
      random_data = np.random.random(input_shape).astype(input_type)
    elif input_type == np.uint8:
      random_data = np.random.randint(0, 256, size=input_shape).astype(input_type)
    elif input_type == np.bool:
      random_data = np.random.choice(a=[True, False], size=input_shape).astype(input_type)
    else:
      raise SystemExit("Unssuported input dtype")

    input_index = input['index']
    input_names.append(input_name)
    input_data[input_name] = random_data

    interpreter.set_tensor(input_index, input_data[input_name])

  # Run model
  interpreter.invoke()

  output_details = interpreter.get_output_details()
  output_data = dict()
  output_names = []

  for i in range(len(output_details)):
    output = output_details[i]
    output_name = output['name']
    output_tensor_idx = output['index']

    output_names.append(output_name)
    output_data[output_name] = interpreter.get_tensor(output_tensor_idx)

  # Save I/O data to h5
  filename = Path(filepath).name
  save_data_to_h5(filename, input_names, output_names, input_data, output_data)


if __name__ == "__main__":
  print(os.getcwd())
  if len(sys.argv) != 2:
    filepath = Path(sys.argv[0])
    sys.exit("Usage: " + filepath.name + " [model.tflite]")

  exec_tflite_model(sys.argv[1])
