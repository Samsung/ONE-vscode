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

import { assert } from "chai";
import { WorkFlow } from "../../Job/WorkFlow";
import { MockJob } from "../MockJob";

suite("Job", function () {
  suite("WorkFlow", function () {
    // jobs for WorkFlow
    const name0 = "job0";
    const name1 = "job1";
    const job0 = new MockJob(name0);
    const job1 = new MockJob(name1);
    suite("#constructor()", function () {
      test("is constructed as WorkFlow", function () {
        let workFlow = new WorkFlow();
        assert.isNotNull(workFlow);
        assert.isNotNull(workFlow.jobs);
        assert.isNotNull(workFlow.jobRunner);
      });
    });
    suite("#addJob()", function () {
      test("adds jobs", function () {
        let workFlow = new WorkFlow();
        workFlow.addJob(job0);
        workFlow.addJob(job1);
        assert.strictEqual(workFlow.jobs.length, 2);
        assert.strictEqual(workFlow.jobs[0].name, name0);
        assert.strictEqual(workFlow.jobs[1].name, name1);
      });
    });
    suite("#clearJobs()", function () {
      test("clears jobs", function () {
        let workFlow = new WorkFlow();
        workFlow.addJob(job0);
        workFlow.addJob(job1);
        workFlow.clearJobs();
        assert.strictEqual(workFlow.jobs.length, 0);
      });
    });
    suite("#start()", function () {
      test("start jobs", function (done) {
        let workFlow = new WorkFlow();
        workFlow.addJob(job0);
        workFlow.addJob(job1);
        assert.strictEqual(workFlow.jobs.length, 2);
        workFlow.jobRunner.on("cleanup", function () {
          // As all job executed on, no job in workflow jobRunner.
          assert.strictEqual(workFlow.jobRunner.jobs.length, 0);
          done();
        });
        workFlow.start();
      });
    });
  });
});
