# koa-passport

[Passport](https://github.com/jaredhanson/passport) middleware for Koa

[![NPM][npm]](https://npmjs.org/package/koa-passport)
[![Dependency Status][dependencies]](https://david-dm.org/rkusa/koa-passport)
[![Build Status][drone]](https://ci.rkusa.st/rkusa/koa-passport)

**Notice: `koa-passport@2` supports `koa@2`, for `koa@1` please use `koa-passport@1`.**

## Usage

```js
// body parser
const bodyParser = require('koa-bodyparser')
app.use(bodyParser())

// Sessions
const convert = require('koa-convert') // necessary until koa-generic-session has been updated to support koa@2
const session = require('koa-generic-session')
app.keys = ['secret']
app.use(convert(session()))

const passport = require('koa-passport')
app.use(passport.initialize())
app.use(passport.session())
```

[Example Application](https://github.com/rkusa/koa-passport-example)

## License

  [MIT](LICENSE)

[npm]: http://img.shields.io/npm/v/koa-passport.svg?style=flat-square
[dependencies]: http://img.shields.io/david/rkusa/koa-passport.svg?style=flat-square
[drone]: http://ci.rkusa.st/api/badges/rkusa/koa-passport/status.svg?style=flat-square
