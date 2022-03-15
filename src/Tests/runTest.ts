// TODO: License

import {runTests} from '@vscode/test-electron';
import * as path from 'path';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(extensionDevelopmentPath, 'out', 'Tests', 'index');
    const testWorkspace = path.resolve(extensionDevelopmentPath);
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath: extensionTestsPath,
      launchArgs: [testWorkspace]
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
