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

import {assert} from 'chai';
import {Locator, LocatorRunner} from '../../OneExplorer/ArtifactLocator';

suite('OneExplorer', function() {
  suite('ArtifactLocator', function() {
    suite('#Empty LocatorRunner', function() {
      test('NEG: Run an empty LocatorRunner', function() {
        let locatorRunner = new LocatorRunner();
        const locatedArtifacts = locatorRunner.run({}, '/');

        // Validation
        {
          // Returns an empty artifact list
          assert.isEmpty(locatedArtifacts);
        }
      });

      test('NEG: Run an empty LocatorRunner on non-empty object', function() {
        let locatorRunner = new LocatorRunner();
        const locatedArtifacts =
            locatorRunner.run({'mySection': {'myKey': 'no.txt no.txt yes.test'}}, '/');

        // Validation
        {
          // Returns an empty artifact list
          assert.isEmpty(locatedArtifacts);
        }
      });
    });

    suite('#Run LocatorRunner with searchWithExt', function() {
      test(`Run a simple locator`, function() {
        let locatorRunner = new LocatorRunner();

        // A simple locator to search '*.test' in any section/key
        locatorRunner.register({
          artifactAttr: {ext: '.test'},
          locator: new Locator(value => LocatorRunner.searchWithExt('.test', value))
        });

        const artifacts =
            locatorRunner.run({'mySection': {'myKey': 'no.txt no.txt yes.test'}}, '/');

        // Validation
        {
          assert.equal(artifacts[0].attr.ext, '.test');
          assert.equal(artifacts[0].path, '/yes.test');
        }
      });

      test(`NEG: Run with an empty directory path`, function() {
        let locatorRunner = new LocatorRunner();
        // A simple locator to search '*.test' in any section/key
        locatorRunner.register({
          artifactAttr: {ext: '.test'},
          locator: new Locator(value => LocatorRunner.searchWithExt('.test', value))
        });

        // Validation
        {
          assert.throw(
              () => locatorRunner.run({'mySection': {'myKey': 'no.txt no.txt yes.test'}}, ''));
        }
      });

      test(`NEG: Run with a non-absolute directory path`, function() {
        let locatorRunner = new LocatorRunner();
        // A simple locator to search '*.test' in any section/key
        locatorRunner.register({
          artifactAttr: {ext: '.test'},
          locator: new Locator(value => LocatorRunner.searchWithExt('.test', value))
        });

        // Validation
        {
          assert.throw(
              () => locatorRunner.run({'mySection': {'myKey': 'no.txt no.txt yes.test'}}, '.'));
        }
      });

      test(`Check file path joining`, function() {
        let locatorRunner = new LocatorRunner();
        // A simple locator to search '*.test' in any section/key
        locatorRunner.register({
          artifactAttr: {ext: '.test'},
          locator: new Locator(value => LocatorRunner.searchWithExt('.test', value))
        });

        const artifacts =
            locatorRunner.run({'mySection': {'myKey': 'no.txt no.txtt ../yes.test'}}, '/a/b/c');

        // Validation
        {
          assert.equal(artifacts[0].attr.ext, '.test');
          assert.notEqual(artifacts[0].path, '/a/b/c/../yes.test');
          assert.equal(artifacts[0].path, '/a/b/yes.test');
        }
      });

      test(`Search with extended ext`, function() {
        let locatorRunner = new LocatorRunner();
        // A simple locator to search '*.test' in any section/key
        locatorRunner.register({
          artifactAttr: {ext: '.test.log'},
          locator: new Locator(value => LocatorRunner.searchWithExt('.test.log', value))
        });

        const artifacts =
            locatorRunner.run({'mySection': {'myKey': 'no.txt no.txtt ../yes.test.log'}}, '/a/b/c');

        // Validation
        {
          assert.equal(artifacts[0].attr.ext, '.test.log');
          assert.notEqual(artifacts[0].path, '/a/b/c/../yes.test.log');
          assert.equal(artifacts[0].path, '/a/b/yes.test.log');
        }
      });
    });

    suite('#Run LocatorRunner with searchWithCommandOption', function() {
      test(`Search by command option`, function() {
        let locatorRunner = new LocatorRunner();
        // A simple locator to search '*.test' in any section/key
        locatorRunner.register({
          artifactAttr: {ext: '.test'},
          locator: new Locator(value => LocatorRunner.searchWithCommandOption(value, '--test'))
        });

        const artifacts = locatorRunner.run(
            {'mySection': {'myKey': 'no.txt no.txtt --test ../yes.test'}}, '/a/b/c');

        // Validation
        {
          assert.equal(artifacts[0].attr.ext, '.test');
          assert.notEqual(artifacts[0].path, '/a/b/c/../yes.test');
          assert.equal(artifacts[0].path, '/a/b/yes.test');
        }
      });

      test(`NEG: Search by an empty command option`, function() {
        let locatorRunner = new LocatorRunner();
        // A simple locator to search '*.test' in any section/key
        locatorRunner.register({
          artifactAttr: {ext: '.test'},
          locator: new Locator(value => LocatorRunner.searchWithCommandOption(value, ''))
        });

        // Validation
        {
          assert.throw(
              () => locatorRunner.run(
                  {'mySection': {'myKey': 'no.txt no.txtt --test yes.test'}}, '/a/b/c'));
        }
      });
    });

    suite('#LocatorRunner with custom function', function() {
      test(`NEG: Run with a function throwing exception`, function() {
        let locatorRunner = new LocatorRunner();
        // Register a locator which always throws
        locatorRunner.register({
          artifactAttr: {ext: '.test'},
          locator: new Locator(value => {
            throw Error('Test');
          })
        });

        // Validation
        {
          // Check if the locator actually throws
          assert.throw(
              () => locatorRunner.run(
                  {'mySection': {'myKey': 'no.txt no.txtt ../yes.test'}}, '/a/b/c'),
              'Test');
        }
      });
    });
  });
});
