# koa-passport

[Passport](https://github.com/jaredhanson/passport) middleware for Koa

[![NPM][npm]](https://npmjs.org/package/koa-passport)

koa-passport version  | passport version | koa version | branch
--------------------- | ---------------- | ------------| ------
6.x, 5.x              | 6.x, 5.x         | 2.x         | main
4.x                   | 4.x              | 2.x         | v3.x
3.x, 2.x              | 2.x              | 2.x         | v2.x
1.x                   | 1.x              | 1.x         | v1.x

## Usage

```js
// body parser
const bodyParser = require('koa-bodyparser')
app.use(bodyParser())

// Sessions
const session = require('koa-session')
app.keys = ['secret']
app.use(session({}, app))

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
  await ctx.login()
  ctx.logout()
  ctx.state.user
})
```

## License

  [MIT](LICENSE)

[npm]: http://img.shields.io/npm/v/koa-passport.svg
[dependencies]: http://img.shields.io/david/rkusa/koa-passport.svg
[travis]: https://travis-ci.org/rkusa/koa-passport.svg?branch=master
