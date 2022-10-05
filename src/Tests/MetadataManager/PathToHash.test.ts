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

import {TestBuilder} from '../TestBuilder';
import {PathToHash} from '../../MetadataManager/PathToHash';


suite('PathToHash', function(){
    let testBuilder: TestBuilder;
    setup(()=>{
        testBuilder = new TestBuilder(this);
        testBuilder.setUp();
    });

    teardown(()=>{
        testBuilder.tearDown();
    });


    suite('#getInstance', function(){

    });
    // This function includes scanRecursively(), getFlatMap(), and MetadataSyncronizer
    suite('#init', function(){

    });
    suite('#scanRecursively',function(){

    });
    suite('#getFlatmap',function(){

    });
    suite('#getHash',function(){

    });
    suite('#getAllHashesUnderFolder',function(){

    });
    suite('#add',function(){

    });
    suite('#delete',function(){

    });
    suite('#deleteEmptyDirPath',function(){

    });

    // for test this function, is it should be exported from PathToHash?
    suite('MetadataSynchronizer', function(){
        suite('#createMetadata',function(){

        });
        suite('#deleteMetadata', function(){

        });
        // This function includes createMetadata and deleteMetadata, is it right to test?
        suite('#run', function(){

        });
    });
});