# A handy JSON-LD context for Solid
This module contains a [JSON-LD context](https://www.w3.org/TR/json-ld/#the-context)
for use with [Solid](https://solid.mit.edu/) apps and libraries.

[![npm version](https://img.shields.io/npm/v/@solid/context.svg)](https://www.npmjs.com/package/@solid/context)

This is _not_ “the” Solid context (there is no such thing),
but rather a useful one for your projects.
<br>
For example, [LDflex for Solid](https://github.com/solid/query-ldflex/)
relies on this module.

## Usage
You can `require` the context:
```javascript
const context = require('@solid/context');
```

Or `import` it:
```javascript
import context from '@solid/context';
```

Or refer to the file:
```javascript
const context = require('@solid/context/context.json');
```

## Installation
```bash
npm install @solid/context
```

## License
©2018–present [Ruben Verborgh](https://ruben.verborgh.org/),
[MIT License](https://github.com/solid/context/blob/master/LICENSE.md).
