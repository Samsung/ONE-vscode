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

import {Job} from './Job';
import {JobCodegen} from './JobCodegen';
import {JobImportBCQ} from './JobImportBCQ';
import {JobImportONNX} from './JobImportONNX';
import {JobImportTF} from './JobImportTF';
import {JobImportTFLite} from './JobImportTFLite';
import {JobOptimize} from './JobOptimize';
import {JobPack} from './JobPack';
import {JobQuantize} from './JobQuantize';

export interface JobVisitorBase {
  visitCodegen(job: JobCodegen): any;
  visitImportBCQ(job: JobImportBCQ): any;
  visitImportONNX(job: JobImportONNX): any;
  visitImportTF(job: JobImportTF): any;
  visitImportTFLite(job: JobImportTFLite): any;
  visitOptimize(job: JobOptimize): any;
  visitPack(job: JobPack): any;
  visitQuantize(job: JobQuantize): any;
}

export class JobVisitor implements JobVisitorBase {
  // clang-format off
  public visitCodegen(job: JobCodegen): any { return undefined; }
  public visitImportBCQ(job: JobImportBCQ): any { return undefined; }
  public visitImportONNX(job: JobImportONNX): any { return undefined; }
  public visitImportTF(job: JobImportTF): any { return undefined; }
  public visitImportTFLite(job: JobImportTFLite): any { return undefined; }
  public visitOptimize(job: JobOptimize): any { return undefined; }
  public visitPack(job: JobPack): any { return undefined; }
  public visitQuantize(job: JobQuantize): any { return undefined; }
  // clang-format on
}

export function acceptJob(job: Job, visitor: JobVisitor): any {
  switch (job.jobType) {
    case Job.Type.tImportTF:
      return visitor.visitImportTF(job as JobImportTF);
    case Job.Type.tImportTFLite:
      return visitor.visitImportTFLite(job as JobImportTF);
    case Job.Type.tImportONNX:
      return visitor.visitImportONNX(job as JobImportONNX);
    case Job.Type.tImportBCQ:
      return visitor.visitImportBCQ(job as JobImportBCQ);
    case Job.Type.tOptimize:
      return visitor.visitOptimize(job as JobOptimize);
    case Job.Type.tQuantize:
      return visitor.visitQuantize(job as JobQuantize);
    case Job.Type.tPack:
      return visitor.visitPack(job as JobPack);
    case Job.Type.tCodegen:
      return visitor.visitCodegen(job as JobCodegen);
    default:
      break;
  }
  throw Error('JobVisitor needs implementation');
}
