/**
 * Module dependencies.
 */
var passport = require('passport')

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
    this.req.session = this.session
    this.req.query = this.request.query
    this.req.body = this.request.body

    // add aliases for passport's request extensions to `ctx`
    var ctx = this
    ctx.login = ctx.logIn = function(user, options) {
      return function(done) {
        ctx.req.login(user, options, done)
      }
    }
    ctx.logout = ctx.logOut = ctx.req.logout.bind(ctx.req)
    ctx.isAuthenticated = ctx.req.isAuthenticated.bind(ctx.req)
    ctx.isUnauthenticated = ctx.req.isUnauthenticated.bind(ctx.req)

    yield middleware.bind(middleware, this.req, this)
    yield next
  }
}

/**
 * assport's authenticate middleware for Koa.
 *
 * @param {String|Array} name
 * @param {Object} options
 * @param {Function} callback
 * @return {GeneratorFunction}
 * @api private
 */
function authenticate(passport, name, options, callback) {
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

      // call the connect middleware
      middleware(ctx.req, res, done)
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
