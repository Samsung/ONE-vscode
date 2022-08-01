// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import * as http from "http";
import * as httpServer from 'http-server';
import * as fetch from 'node-fetch';
import * as open from 'open';
import * as os from 'os';
import * as path from 'path';
import {stringify} from 'querystring';
import * as vscode from 'vscode';
const perfetto = 'https://ui.perfetto.dev';
// import {WindowPostMessageProxy} from 'window-post-message-proxy';

export async function postAMessage() {
  let buffer: ArrayBuffer = new ArrayBuffer(1000);
  const message = {'perfetto': {buffer: 'PING', title: 'My Message'}};
  const process = await open.default(perfetto);  //{wait:true});
  process.addListener('close', (evt) => {
    console.log('closed!');
  });
  process.addListener('message', (m, socket) => {
    if (m === 'socket') {
      if (socket) {
        // Check that the client socket exists.
        // It is possible for the socket to be closed between the time it is
        // sent and the time it is received in the child process.

        // socket.end(`Request processd with ${process.argv[2]} priority`);
        console.log('socket');
      }
    }
    console.log('no socket');
  });
  process.addListener('error', (evt) => {
    console.log('error!');
  });
  process.on('close', () => {
    fetch
        .default(perfetto, {
          method: 'POST',
          body: JSON.stringify({'perfetto': {buffer: buffer, title: 'My Message'}}),
          headers: {'Content-Type': 'application/json'}
        })
        .then((data) => console.log(data));
  });
  console.log('connected?: ', process.connected);

  // NOTE(dayo): 'open' can only open the url in the brower cross-platfom wisely.
  // It cannot do further works on the opened page (getting html or so)
}


// NOTE(dayo): This one works!
export function openInBrowser(traceUri: vscode.Uri) {
  const port = // MY PORT NUMBER
  const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-trace-viewer-'));
  console.log(tmpdir);
  fs.copyFileSync(traceUri.fsPath, path.join(tmpdir, 'index.json'));

	const logging = (req: http.IncomingMessage, res: http.ServerResponse, err: Error)=>{
		if(req){
			console.log("REW");
			console.log(req);
		}
		if(res){
			console.log("RES");
			console.log(console);
		}
		if(err){
			console.log("ERR");
			console.log(err);
		}
	};

  let server = httpServer.createServer({'corsHeaders': 'https://ui.perfettto.dev/', 'root': tmpdir, 'showDir': false, 'cors': false, 'logFn': logging});

  server.listen(port);

  const url = `http://127.0.0.1:${port}/index.json`;
  open.default(`https://ui.perfetto.dev/#!/?url=${url}`).then(() => {
    setTimeout(() => {
      console.log(`cleaning up ${tmpdir}!`);
      server.close();
      fs.rmdirSync(tmpdir, {
        'recursive': true,
      });
    }, 1000);
  });
}
