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

passport.authenticate = function(strategy, options) {
  function callback(err, res) {
    callback.done(err, res)
  }
  var middleware = this._framework && this._framework.authenticate
    ? this._framework.authenticate(strategy, options, callback).bind(this)
    : authenticate(strategy, options, callback).bind(this)

  function auth(req, res, done) {
    callback.done = done
    middleware.call(middleware, req, res, done)
  }

  return function*(next) {
    var res = yield auth.bind(auth, this.req, this.res)
    if (res === false) {
      if (options.failureRedirect) {
        return this.redirect(options.failureRedirect)
      } else {
        this.status = 401
      }
    } else {
      yield this.req.logIn.bind(this.req, res, options)
      if (options.successReturnToOrRedirect) {
        var url = options.successReturnToOrRedirect
        if (this.session && this.session.returnTo) {
          url = this.session.returnTo
          delete this.session.returnTo
        }
        return this.redirect(url)
      }
      if (options.successRedirect) {
        return this.redirect(options.successRedirect)
      }
    }
  }
}