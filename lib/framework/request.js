// Koa and Express are fundamental different in how they deal with extensions
// to the incoming request.
// Express pollutes Node's IncomingRequest directly, while Koa keeps Node's
// IncomingRequest untouched and adds is own high-level request object.
// These both approaches are not directly compatible with each other, since
// properties/methods found in Express' `req` object are now spread between
// Koa's context, Koa's request object and the original incoming request.
// This makes moking the Express `req` object an ugly task. With ES6 we could
// simply use a Proxy, e.g.:
//
// function createReqMock(ctx) {
//   // Use a proxy that forwards `req` reads to either `ctx.passport`,
//   // Node's request, Koa's request or Koa's context. Writes are persistet
//   // into `ctx.passport`.
//   return Proxy.create(handler(ctx.passport, {
//     get: function(receiver, key) {
//       return ctx.passport[key] || ctx.req[key] || ctx.request[key] || ctx[key]
//     }
//   }))
// }
//
// However, the current Proxy implementation does not allow debugging.
// See: https://github.com/rkusa/koa-passport/issues/17
//
// Until this is fixed, koa-passport tries to properly delegate every possible
// used property/method.

'use strict'

// Property/Method names to be delegated
let keys = [
  // passport
  '_passport',
  'user',
  'account',
  'login',
  'logIn',
  'logout',
  'logOut',
  'isAuthenticated',
  'isUnauthenticated',
  'authInfo',

  // http.IncomingMessage
  'httpVersion',
  'headers',
  'trailers',
  'setTimeout',
  'method',
  'url',
  'statusCode',
  'socket',
  'connection',

  // Koa's context
  'cookies',
  'throw',

  // Others. Are not supported directly - require proper plugins/middlewares.
  'param',
  'route',
  'xhr',
  'baseUrl',
  'session',
  'body',
  'flash'
]

// remove duplicates
keys = keys.filter(function(key, i, self) {
  return self.indexOf(key) === i
})

// create a delegate for each key
const properties = module.exports = {
  // mock express' .get('trust proxy')
  app: {
    // getter returning a mock for `req.app` containing
    // the `.get()` method
    get: function() {
      const ctx = this.ctx
      return {
        get: function(key) {
          if (key === 'trust proxy') {
            return ctx.app.proxy
          }

          return undefined
        }
      }
    }
  }
}

keys.forEach(function(key) {
  properties[key] = {
    get: function() {
      const obj = getObject(this.ctx, key)
      if (!obj) return undefined

      // if its a function, call with the proper context
      if (typeof obj[key] === 'function') {
        return function() {
          return obj[key].apply(obj, arguments)
        }
      }

      // otherwise, simply return it
      return obj[key]
    },
    set: function(value) {
      const obj = getObject(this.ctx, key) || this.ctx.passport
      obj[key] = value
    }
  }
})

// test where the key is available, either in `ctx.passport`, Node's request,
// Koa's request or Koa's context
function getObject(ctx, key) {
  if (ctx.passport && (key in ctx.passport)) {
    return ctx.passport
  }

  if (key in ctx.request) {
    return ctx.request
  }

  if (key in ctx.req) {
    return ctx.req
  }

  if (key in ctx) {
    return ctx
  }

  return undefined
}
