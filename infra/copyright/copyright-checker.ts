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

import {EOL} from 'os';
import {glob} from 'glob';
import {readFileSync, writeFileSync} from 'fs';

const copyrightRegex = new RegExp('Copyright \\(c\\) [0-9]{4} Samsung Electronics Co\\., Ltd\\. All Rights Reserved');

// Formats should be comma-separated
const fileFormatsToCheck = "ts,js,css,html";

const ignorePathList = [
    "**/node_modules/**",
    "**/out/**",
    "**/media/CircleGraph/external/**",
    "**/src/Utils/external/**",
    "**/media/CircleEditor/external/**"
];

glob("**/*.{" + fileFormatsToCheck + "}",
    {"ignore" : ignorePathList},
    function (err, paths) {
        var failedFiles = [] as string[];
        paths.forEach((path) => {
            const content = readFileSync(path, 'utf-8');
            if (copyrightRegex.test(content) == false)
            {
                failedFiles.push("- " + path);
            }
        });

        if (failedFiles.length > 0)
        {
            var resultMsg = "### Copyright Checker" + EOL;
            resultMsg += ":no_entry: Please check following files whose copyright statement is missing or invalid" + EOL;
            resultMsg += failedFiles.join(EOL);
            writeFileSync('copyright-checker.fail', resultMsg);
        }
    }
)
