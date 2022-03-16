// TODO: License

import glob from 'glob';
import Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void> {
  // fgrep: 'str' if we need to filter
  const mocha = new Mocha({ui: 'tdd', color: true});

  const testsRoot = path.resolve(__dirname, '.');

  // adds hooks first
  const hooks = 'hooks.js';
  mocha.addFile(path.resolve(testsRoot, hooks));

  return new Promise((c, e) => {
    glob('**/**.test.js', {cwd: testsRoot}, (err: Error|null, files: Array<string>) => {
      if (err) {
        return e(err);
      }

      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        mocha.run(failures => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        console.error(err);
        e(err);
      }
    });
  });
}
