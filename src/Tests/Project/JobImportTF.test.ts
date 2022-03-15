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

import * as chai from 'chai';
import {Job} from '../../Project/Job';
import {JobImportTF} from '../../Project/JobImportTF';

const assert = chai.assert;

suite('Project', function() {
  suite('JobImportTF', function() {
    suite('#contructor()', function() {
      test('is contructed with jobtype', function() {
        let job = new JobImportTF();
        assert.strictEqual(job.jobType, Job.Type.tImportTF);
      });
    });
    suite('#valid()', function() {
      test('returns true always', function() {
        let job = new JobImportTF();
        assert.isTrue(job.valid);
      });
    });
    suite('#tool()', function() {
      test('returns toolname as string', function() {
        let job = new JobImportTF();
        let toolName = 'one-import-tf';
        assert.strictEqual(job.tool, toolName);
      });
    });
    suite('#toolArgs()', function() {
      test('returns args as ToolArgs', function() {
        let inputPath = 'input_path';
        let outputPath = 'output_path';
        let inputArrays = 'input_arrays';
        let outputArrays = 'output_arrays';
        let inputShapes = 'input_shapes';
        let converterVersion = 'converter_version';
        let modelFormat = 'model_format';
        let saveIntermediate: boolean = true;

        let job = new JobImportTF();
        // mandatory
        job.inputPath = inputPath;
        job.outputPath = outputPath;
        // optional
        job.inputArrays = inputArrays;
        job.outputArrays = outputArrays;
        job.inputShapes = inputShapes;
        job.converterVersion = converterVersion;
        job.modelFormat = modelFormat;
        job.saveIntermediate = saveIntermediate;
        assert.isTrue(job.valid);

        let expected: Array<string> = [
          '--input_path', inputPath, '--output_path', outputPath, '--input_arrays', inputArrays,
          '--output_arrays', outputArrays, '--input_shapes', inputShapes, '--converter_version',
          converterVersion, '--model_format', modelFormat, '--save_intermediate'
        ];
        let args = job.toolArgs;
        assert.includeOrderedMembers(args, expected);
      });
    });
  });
});
