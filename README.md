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

Passport's values and methods are exposed as follows:

```js
app.use(async ctx => {
  ctx.isAuthenticated()
  ctx.isUnauthenticated()
  ctx.login()
  ctx.logout()
  ctx.state.user
})
```

## License

  [MIT](LICENSE)

[npm]: http://img.shields.io/npm/v/koa-passport.svg?style=flat-square
[dependencies]: http://img.shields.io/david/rkusa/koa-passport.svg?style=flat-square
[drone]: http://ci.rkusa.st/api/badges/rkusa/koa-passport/status.svg?style=flat-square
