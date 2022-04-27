## Mondrian allocation trace viewer

This extension adds custom editor with reads `*.tracealloc.json` files and provides graphical viewer for allocation trace data with ability to choose a specific memory segment.

### Data format specification

Trace allocation format is described in [JSON schema](https://json-schema.org/) format:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "schema_version": {
      "title": "Schema version",
      "description": "Allocation data format version",
      "type": "integer",
      "minimum": 0,
      "required": true
    },
    "segments": {
      "title": "Memory segments",
      "description": "Array of named memory segments",
      "type": "array",
      "required": true,
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "title": "Name",
            "description": "Memory segment name",
            "type": "string",
            "required": true,
            "minLength": 1
          },
          "size": {
            "title": "Size",
            "description": "Memory segment size in bytes",
            "type": "integer",
            "minimum": 0,
            "required": true
          },
          "allocations": {
            "title": "Memory allocations",
            "description": "Array of memory allocated zones with dimenstions and lifetimes",
            "type": "array",
            "required": true,
            "items": {
              "type": "object",
              "properties": {
                "offset": {
                  "title": "Offset",
                  "description": "Allocated memory zone offset in bytes",
                  "type": "integer",
                  "minimum": 0,
                  "required": true
                },
                "size": {
                  "title": "Size",
                  "description": "Allocated memory zone size in bytes",
                  "type": "integer",
                  "minimum": 1,
                  "required": true
                },
                "alive_from": {
                  "title": "Alive from",
                  "description": "Initial allocation lifetime tick",
                  "type": "integer",
                  "required": true
                },
                "alive_till": {
                  "title": "Alive till",
                  "description": "Final allocation lifetime tick",
                  "type": "integer",
                  "required": true
                },
                "origin": {
                  "title": "Origin",
                  "description": "Name of graph node related to this allocation",
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  }
}
```
