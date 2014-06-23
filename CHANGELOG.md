# Changelog

## 0.5.0

* internal improvements (neither modify Node's request nor Koa's request object by mocking the `req` object with a proxy that forwards reads to either Node's request object, Koa's request object or Koa's context)
* `--harmony-proxies` has to enabled now

## 0.4.0

* Add support for custom authentication methods, e.g.:

```js
public.post('/login', function*(next) {
  var ctx = this
  yield* passport.authenticate('local', function*(err, user, info) {
    if (err) throw err
    if (user === false) {
      ctx.status = 401
      ctx.body = { success: false }
    } else {
      yield ctx.login(user)
      ctx.body = { success: true }
    }
  }).call(this, next)
})
```

## 0.3.2

* add generator function names for Koa debugging purposes

## 0.3.1

* make ctx.login() yieldable

## 0.3.0

* adapt recent Koa API changes

## 0.2.0

* `passport 0.2.x compatibility