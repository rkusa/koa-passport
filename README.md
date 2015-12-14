# koa-passport

[Passport](https://github.com/jaredhanson/passport) middleware for Koa

[![NPM][npm]](https://npmjs.org/package/koa-passport)
[![Dependency Status][dependencies]](https://david-dm.org/rkusa/koa-passport)
[![Build Status][drone]](https://ci.rkusa.st/rkusa/koa-passport)

koa-passport version  | koa version | branch | npm tag
--------------------- | ------------| ------ | -------
1.x                   | 1.x         | master | latest
2.x                   | 2.x         | v2.x   | next

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

[npm]: http://img.shields.io/npm/v/koa-passport.svg?style=flat-square
[dependencies]: http://img.shields.io/david/rkusa/koa-passport.svg?style=flat-square
[drone]: http://ci.rkusa.st/api/badges/rkusa/koa-passport/status.svg?style=flat-square
