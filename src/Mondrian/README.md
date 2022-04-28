## Mondrian allocation trace viewer

This extension adds custom editor with reads `*.tracealloc.json` files and provides graphical viewer for allocation trace data with ability to choose a specific memory segment.

### Data format specification

Input data format is represented as JSON document which contains the following fields:

* `schema_version`: data format schema version (currently 1).
* `segments`: array of named memory segments, each segment contains following fields:
  * `title`: memory segment name.
  * `size`: memory segment size in bytes.
  * `allocations`: array of memory allocated zones with dimenstions and lifetimes:
    * `offset`: allocated memory zone offset in bytes.
    * `size`: allocated memory zone size in bytes.
    * `alive_from`: initial allocation lifetime position.
    * `alive_till`: final allocation lifetime position.
    * `origin`: name of model graph node related to this allocation.

Example of allocation trace data: `res/traces/sample.tracealloc.json`.
