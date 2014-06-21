/**
 * Module dependencies.
 */
var passport = require('passport')
var co = require('co')

/**
 * Passport's default/connect middleware.
 */
var _initialize = require('passport/lib/middleware/initialize')
  , _authenticate = require('passport/lib/middleware/authenticate')

/**
 * Passport's initialization middleware for Koa.
 *
 * @return {GeneratorFunction}
 * @api private
 */
function initialize(passport) {
  var middleware = _initialize(passport)
  return function* passportInitialize(next) {
    // koa <-> connect compatibility
    this.request.session = this.session

    // add aliases for passport's request extensions to `ctx`
    var ctx = this
    ctx.login = ctx.logIn = function(user, options) {
      return function(done) {
        ctx.req.login(user, options, done)
      }
    }
    ctx.request.login = ctx.request.logIn = ctx.req.login.bind(ctx.request)
    ctx.logout = ctx.logOut = ctx.request.logout = ctx.req.logout.bind(ctx.request)
    ctx.isAuthenticated = ctx.request.isAuthenticated = ctx.req.isAuthenticated.bind(ctx.request)
    ctx.isUnauthenticated = ctx.request.isUnauthenticated = ctx.req.isUnauthenticated.bind(ctx.request)

    yield middleware.bind(middleware, this.request, this)
    yield next
  }
}

/**
 * Passport's authenticate middleware for Koa.
 *
 * @param {String|Array} name
 * @param {Object} options
 * @param {GeneratorFunction} callback
 * @return {GeneratorFunction}
 * @api private
 */
function authenticate(passport, name, options, callback) {
  // normalize arguments
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  options = options || {}

  if (callback) {
    if (callback.constructor.name !== 'GeneratorFunction') {
      throw TypeError('Your custom authentication callback must be a Generator Function')
    }

    // When the callback is set, neither `next`, `res.redirect` or `res.end`
    // are called. That is, a workaround to catch the `callback` is required.
    // The `passportAuthenticate()` method below will therefore set
    // `callback.done`. Then, once the authentication finishes, the modified
    // callback yields the original one and afterwards triggers `callback.done`
    // to inform `passportAuthenticate()` that we are ready.
    var _callback = callback
    callback = function callback(err, user, info) {
      co(function*() {
        yield _callback(err, user, info)
        callback.done(null, false)
      })()
    }
  }

  var middleware = _authenticate(passport, name, options, callback)
  return function* passportAuthenticate(next) {
    var ctx = this

    // this functions wraps the connect middleware
    // to catch `next`, `res.redirect` and `res.end` calls
    var cont = yield function(done) {
      // mock the `res` object
      var res = {
        redirect: function(url) {
          ctx.redirect(url)
          done(null, false)
        },
        setHeader: ctx.set.bind(ctx),
        end: function(content) {
          if (content) ctx.body = content
          done(null, false)
        },
        set statusCode(status) {
          ctx.status = status
        },
        get statusCode() {
          return ctx.status
        }
      }

      if (callback) {
        callback.done = done
      }
      // call the connect middleware
      middleware(ctx.request, res, done)
    }

    // cont equals `false` when `res.redirect` or `res.end` got called
    // in this case, yield next to continue through Koa's middleware stack
    if (cont !== false) {
      yield next
    }
  }
}

/**
 * Framework support for Koa.
 *
 * This module provides support for using Passport with Koa. It exposes
 * middleware that conform to the `fn*(next)` signature and extends
 * Node's built-in HTTP request object with useful authentication-related
 * functions.
 *
 * @return {Object}
 * @api protected
 */
module.exports = function() {
  return {
    initialize: initialize,
    authenticate: authenticate
  }
}
