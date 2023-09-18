// /*
//  * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *    http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// import { assert } from "chai";
// import { DefaultToolchain } from "../../Toolchain/DefaultToolchain";
// import { ToolchainEnv } from "../../Toolchain/ToolchainEnv";
// import { MockCompiler } from "../MockCompiler";

// suite("Toolchain", function () {
//   suite("DefaultToolchain", function () {
//     const compiler = new MockCompiler();
//     const env = new ToolchainEnv(compiler);

//     suite("#getInstance()", function () {
//       test("gets instance", function () {
//         const defaultToolchain = DefaultToolchain.getInstance();
//         assert.isDefined(defaultToolchain);
//       });
//     });

//     suite("#set()", function () {
//       test("sets toolchainEnv and toolchain", function () {
//         const defaultToolchain = DefaultToolchain.getInstance();
//         const toolchains = env.listInstalled();
//         assert.isAbove(toolchains.length, 0);
//         defaultToolchain.set(env, toolchains[0]);
//         assert.strictEqual(defaultToolchain.getToolchainEnv(), env);
//         assert.strictEqual(defaultToolchain.getToolchain(), toolchains[0]);
//       });
//     });

//     suite("#unset()", function () {
//       test("unsets toolchainEnv and toolchain", function () {
//         const defaultToolchain = DefaultToolchain.getInstance();
//         const toolchains = env.listInstalled();
//         assert.isAbove(toolchains.length, 0);
//         defaultToolchain.set(env, toolchains[0]);
//         assert.strictEqual(defaultToolchain.getToolchainEnv(), env);
//         assert.strictEqual(defaultToolchain.getToolchain(), toolchains[0]);

//         defaultToolchain.unset();
//         assert.isUndefined(defaultToolchain.getToolchainEnv());
//         assert.isUndefined(defaultToolchain.getToolchain());
//       });
//     });
//   });
// });
