# dragonfly [![Build Status](https://travis-ci.org/qualiancy/dragonfly.png?branch=master)](https://travis-ci.org/qualiancy/dragonfly)

> Tiny error manager for big applications.

## Installation

`dragonfly` is available on [npm](http://npmjs.org).

    $ npm install dragonfly

## Usage

* **@param** _{String}_ name (required)

```js
var dragonfly = require('dragonfly')
  , errs = dragonfly('CustomError');
```

### .define (key)

* **@param** _{String}_ key (required)
* **@param** _{String}_ message 
* **@return** _{Definition}_  chainable object

Define a new error patern that can be constructed
from this dragonfly error repository. Returns a
definition for chaining. The key does not occur
in the constructed error object; it is simply for
lookup purposes.

```js
errs.create('not found')
  .message('Resource "#{path}" cannot be found.')
  .set('httpStatus', 404)
  .set('path', '/');
```

The slug `#{path}` will be replaced with either the
default value or the value defined on construction
for that key.


### .create (key[, props][, ssf])

* **@param** _{String}_ key (required)
* **@param** _{Object|null}_ template properties to overwrite
* **@param** _{Function}_ start stack function (default: `arguments.callee`)
* **@return** _{Error}_  newly constructed error based on template

Create an error using the template of a defined
error as the basis for the newly constructed error.

```js
var err = errs.create('not found');
```

Extra properties can also be specified to be merged
on to the newly constructed error. These will also
be used for any message replacements. Properties that
do not have set defaults are also included.

```js
var err = errs.create('not found', { path: '/blog', method: 'GET' });
err.should.have.property('message', 'Resource "/blog" cannot be found.');
err.should.have.property('httpStatus', 404);
err.should.have.property('method', 'GET');
```

A returned error can also be serialized for rendering
in a template or sent over the wire. The `.toJSON()` method accepts
one argument of boolean value indicating whether the `stack`
property should be included (default: `true`).

```js
var json = err.toJSON(false);
// {
//     name: 'NotFoundError'
//   , message: 'Resource "/blog" cannot be found.'
//   , httpStatus: 404
//   , path: '/blog'
//   , method: 'GET'
// }
```


## License

(The MIT License)

Copyright (c) 2012 Jake Luer <jake@qualiancy.com> (http://qualiancy.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
