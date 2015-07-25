# koa-passport

[Passport](https://github.com/jaredhanson/passport) middleware for Koa

[![NPM][npm]](https://npmjs.org/package/koa-passport)
[![Dependency Status][dependencies]](https://david-dm.org/rkusa/koa-passport)
[![Build Status][drone]](https://ci.rkusa.st/github.com/rkusa/koa-passport)

## Usage

```js
// body parser
var bodyParser = require('koa-bodyparser')
app.use(bodyParser())

// Sessions
var session = require('koa-session')
app.keys = ['secret']
app.use(session(app))

var passport = require('koa-passport')
app.use(passport.initialize())
app.use(passport.session())
```

[Example Application](https://github.com/rkusa/koa-passport-example)

## MIT License

Copyright (c) 2014 Markus Ast

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm]: http://img.shields.io/npm/v/koa-passport.svg?style=flat-square
[dependencies]: http://img.shields.io/david/rkusa/koa-passport.svg?style=flat-square
[drone]: http://ci.rkusa.st/api/badge/github.com/rkusa/koa-passport/status.svg?branch=master&style=flat-square
