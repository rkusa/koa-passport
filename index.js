var passport = module.exports = require('passport')

var initialize = passport.initialize.bind(passport)
passport.initialize = function(options) {
  var middleware = initialize(options)
  return function*(next) {
    this.req.session = this.session
    yield middleware.bind(middleware, this.req, this.res)
    yield next
  }
}

var session = passport.session.bind(passport)
  , authenticate = passport.authenticate.bind(passport)
passport.session = function(options) {
  var middleware = authenticate('session', options)
  return function*(next) {
    yield middleware.bind(middleware, this.req, this.res)
    yield next
  }
}

// For the `authenticate` method, it is not possible to use
// a simple wrapper as done for `initialize` and `session`.
// This is because, co is waiting for every yielded function
// to complete using the provided callback.
// For the `authenticate` method, the connect's `next`
// callback would complete the yield expression.
// Unfortunately, when the authentication fails, the `next`
// method is never be called, since res.redirect('') is called
// instead.
//
// For connect, res.redirect() is sufficient to end traversing
// the middleware stack. But for koa not. A request in Koa is
// complete, once their is no yield remaining. That is, we
// have to use the custom callback mechanism that passport's
// `authenticate` method provides.
//
// A custom callback for passport's `authenticate` method
// must be provided when building the middleware, e.g.,
// passport.authenticate('local', opts, customCallback).
// The workaround used below, achieves to not have to
// build this middleware on every request.

passport.authenticate = function(strategy, options) {
  // the custom callback, that is provided to passport's
  // authenticate method
  function callback(err, res) {
    // the `done` property will be set on every middleware call
    callback.done(err, res)
  }

  // the middleware itself
  var middleware = this._framework && this._framework.authenticate
    ? this._framework.authenticate(strategy, options, callback).bind(this)
    : authenticate(strategy, options, callback).bind(this)

  // the wrapped midleware
  function auth(req, res, done) {
    // Set the `done` property of the custom callback.
    // The method, set to this property, will be called
    // once the callback itself gets called.
    callback.done = done
    middleware.call(middleware, req, res, done)
  }

  // the Koa middleware
  return function*(next) {
    var res = yield auth.bind(auth, this.req, this.res)
    // res is the result, the custom callback for the passport
    // authenticate methods receives

    // login failed
    if (res === false) {
      if (options.failureRedirect) {
        return this.redirect(options.failureRedirect)
      } else {
        this.status = 401
      }
    }
    // login succeeded
    else {
      yield this.req.logIn.bind(this.req, res, options)
      if (options.successReturnToOrRedirect) {
        var url = options.successReturnToOrRedirect
        if (this.session && this.session.returnTo) {
          url = this.session.returnTo
          delete this.session.returnTo
        }
        return this.redirect(url)
      } else if (options.successRedirect) {
        return this.redirect(options.successRedirect)
      } else {
        yield next
      }
    }
  }
}

passport.authorize = function(strategy, options) {
  return passport.authenticate(strategy, options)
}