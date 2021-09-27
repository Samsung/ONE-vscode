// send message to config panel
const sendMessage = function (command, payload) {
    vscode.postMessage({
      command: command,
      payload: payload,
    });
};