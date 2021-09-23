/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

const html = function (styleUri, webview, scriptUri, nonce) {
  return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <title>json-tracer</title>
          <link rel="stylesheet" type="text/css" href="${styleUri}">
          <meta http-equiv="Content-Security-Policy" content="default-src ${webview.cspSource}; style-src ${webview.cspSource}; img-src ${webview.cspSource} https: http: data: blob:; script-src 'unsafe-inline' http: https:;">
        </head>
  
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root">
            <main>
              <nav>
                <div class="left-btns">
                  <button class="capture-btn">capture</button>
                  <button class="load-btn">Load</button>
                  <div class="file-name"></div>
                  <div class="set-data"></div>
                </div>
                <div class="right-btns">
                  <button class="zoom-in-btn" value="50">ZoomIn</button>
                  <button class="zoom-out-btn" value="-50">ZoomOut</button>
                  <input type="range" min="100" max="200" value="100">
                </div>
              </nav>
              <article class="dash-board">
                <div class="graph"></div>
              </article>
              <article class="detail-container">
                <header>
                  <span>Detail</span>
                </header>
                <section>
                  <div class="selected"></div>
                </section>
              </article>
            </main>
          </div>
          <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
        </body>
        </html>`;
};

module.exports = html;