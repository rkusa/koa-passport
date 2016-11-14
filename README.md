# koa-passport

[Passport](https://github.com/jaredhanson/passport) middleware for Koa

[![NPM][npm]](https://npmjs.org/package/koa-passport)
[![Dependency Status][dependencies]](https://david-dm.org/rkusa/koa-passport)
[![Build Status][travis]](https://travis-ci.org/rkusa/koa-passport)

koa-passport version  | koa version | branch | npm tag
--------------------- | ------------| ------ | -------
1.x                   | 1.x         | v1.x   | latest
2.x                   | 2.x         | v2.x   | next
3.x                   | 2.x         | master |

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

## License

  [MIT](LICENSE)

[npm]: http://img.shields.io/npm/v/koa-passport.svg
[dependencies]: http://img.shields.io/david/rkusa/koa-passport.svg
[travis]: https://travis-ci.org/rkusa/koa-passport.svg?branch=master
