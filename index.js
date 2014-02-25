/**
 * Module dependencies.
 */
var passport = module.exports = require('passport');

/**
 * Passport main methods.
 */
var latest = !!passport.Authenticator
  , session = passport.session.bind(passport)
  , initialize = passport.initialize.bind(passport)
  , authenticate = passport.authenticate.bind(passport);

/**
 * Our custom Passport's initialization middleware.
 * 
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
passport.initialize = function(options) {
  var middleware = initialize(options)
  return function*(next) {
    this.req.session = this.session
    yield middleware.bind(middleware, this.req, this.res)
    yield next
  }
}

/**
 * Middleware that will restore login state from a session.
 *
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
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

  options = options || {};

  // the custom callback, that is provided to passport's
  // authenticate method.
  function callback(err, user, info, failure) {
    // the `done` property will be set on every middleware call.
    callback.done(err,  {
      user: user,
      info: info,
      failure: failure
    });
  }

  var args = [strategy, options, callback];

  // in passport 0.2.x authenticate accepts
  // passport object as first parameter, we need
  // to make sure we push it as first argument.
  if (latest) args.unshift(this);
  
  // the middleware itself
  var middleware = this._framework && this._framework.authenticate
    ? this._framework.authenticate.apply(this, args)
    : authenticate.apply(this, args);

  // the wrapped midleware
  function auth(done) {
    // Set the `done` property of the custom callback.
    // The method, set to this property, will be called
    // once the callback itself gets called.
    callback.done = done;
    middleware.call(middleware, this.req, this.res, done);
  }

  // short cut for loginin the user.
  function logIn(user) {
    return function(done) {
      // we call req logIn method to add
      // user to the session and make passport
      // do its thing.
      this.req.logIn(user, options, done)
    }
  }

  // shortcut for transforming auth information.
  function transformAuthInfo(info) {
    return function(done) {
      var args = [info];

      // in passport 0.2.x transformAuthInfo accepts
      // the req object as second parameter, we need
      // to make sure we only pass this value for this
      // this version.
      if (latest) args.push(this.req);

      // we push the callback as last argument.
      args.push(done);

      // we are good to call the transform method with
      // out arguments.
      passport.transformAuthInfo.apply(passport, args);
    }
  }

  // the Koa middleware
  return function*(next) {
    
    // res is the result, the custom callback for the passport
    // authenticate methods receives.
    var res = yield auth;

    // if no result then nothing to do here.
    if (!res) return yield next;

    var req = this.req
      , user = res.user
      , info = res.info;

    // login failed
    if (user === false) {
      if (options.failureRedirect) {
        return this.redirect(options.failureRedirect)
      } else {
        this.status = 401;
      }
    }

    // login succeeded.
    else {
      
      // we need to call login to actually login the user.
      yield logIn(user);

      // make sure we assign to the correct user session property.
      if (options.assignProperty) {
        req[options.assignProperty] = user;
      } else {

        // transform authentication information.
        if (options.authInfo !== false) {
          req.authInfo = yield transformAuthInfo(info);
        }

        if (options.successReturnToOrRedirect) {
          var url = options.successReturnToOrRedirect;
          if (this.session && this.session.returnTo) {
            url = this.session.returnTo;
            delete this.session.returnTo;
          }
          this.redirect(url);
        } else if (options.successRedirect) {
          this.redirect(options.successRedirect);
        } else {
          yield next;
        }
      }
    }
  }
}

passport.authorize = function(strategy, options) {
  return passport.authenticate(strategy, options)
}