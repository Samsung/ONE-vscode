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
import { spawnSync } from "child_process";

import {
  pipedSpawnSync,
  pipedSpawnSyncStdout,
} from "../../Utils/PipedSpawnSync";

suite("Utils", function () {
  suite("#pipedSpawnSync", function () {
    test("basic pipedSpawnSync", function () {
      try {
        let wc = pipedSpawnSync(
          "echo",
          ["123"],
          { cwd: "." },
          "grep",
          ["123"],
          { cwd: "." }
        );
        assert.isTrue(wc.stdout.toString().startsWith("123"));
      } catch (err) {
        assert.fail("Should not reach here");
      }
    });

    test("NEG: first cmd fails in pipedSpawnSync", function () {
      try {
        pipedSpawnSync("invalid_cmd", ["123"], {}, "grep", ["not_exist"], {});
        assert.fail("should not reach here");
      } catch (err) {
        assert.ok(true, "Should be thrown");
      }
    });

    test("NEG: second cmd fails in pipedSpawnSync", function () {
      try {
        let grep = pipedSpawnSync(
          "echo",
          ["123"],
          {},
          "grep",
          ["not_exist"],
          {}
        );
        assert.notEqual(grep.status, 0);
      } catch (err) {
        assert.fail("Should not reach here");
      }
    });

    test("NEG: do not use sudo -S in pipedSpawnSync", function () {
      // make sure that sudo pw is not cached
      spawnSync("sudo", ["-k"]);

      try {
        pipedSpawnSync(
          "echo",
          ["incorrect_pw"],
          {},
          "sudo",
          ["-S", "true"],
          {}
        );
        assert.fail("should not reach here");
      } catch (err) {
        // success
      }
    });
  });

  suite("#pipedSpawnSyncStdout", function () {
    test("basic pipedSpawnSyncStdout", function () {
      try {
        let grep = pipedSpawnSyncStdout(
          "echo",
          ["123"],
          { cwd: "." },
          "grep",
          ["123"],
          { cwd: "." }
        );
        assert.isTrue(grep.startsWith("123"));
      } catch (err) {
        assert.fail("Should not reach here");
      }
    });

    test("NEG: first cmd fails in pipedSpawnSyncStdout", function () {
      try {
        pipedSpawnSyncStdout(
          "invalid_cmd",
          ["123"],
          {},
          "grep",
          ["not_exist"],
          {}
        );
        assert.fail("should not reach here");
      } catch (err) {
        assert.ok(true, "Should be thrown");
      }
    });

    test("NEG: second cmd fails in pipedSpawnSyncStdout", function () {
      try {
        pipedSpawnSyncStdout("echo", ["123"], {}, "grep", ["not_exist"], {});
        assert.fail("should not reach here");
      } catch (err) {
        assert.ok(true, "Should be thrown");
      }
    });

    test("NEG: do not use sudo -S in pipedSpawnSyncStdout", function () {
      // make sure that sudo pw is not cached
      spawnSync("sudo", ["-k"]);

      try {
        pipedSpawnSyncStdout(
          "echo",
          ["incorrect_pw"],
          {},
          "sudo",
          ["-S", "true"],
          {}
        );
        assert.fail("should not reach here");
      } catch (err) {
        // success
      }
    });
  });
});
