var expect   = require('chai').expect
var passport = require('../')

describe('initialize middleware', function() {
  it('it should add itself', function() {
    var initialize = passport.initialize()
    var context = createContext()
    return initialize(context, function() {
      expect(context.passport).to.have.property('_passport')
    })
  })

  it('should define `req.user`', function() {
    var initialize = passport.initialize()
    var context = createContext()
    return initialize(context, function() {
      expect('user' in context.req).to.be.true

      context.passport.user = {}
      expect(context.req.user).to.equal(context.passport.user)
    })
  })

  it('should add helper aliases', function() {
    var initialize = passport.initialize()
    var context = createContext()
    var methods = ['login', 'logIn', 'logout', 'logOut', 'isAuthenticated', 'isUnauthenticated']
    return initialize(context, function() {
      methods.forEach(function(name) {
        expect(context.req[name]).to.exist
        expect(context[name]).to.exist
      })
    })
  })
})

var IncomingMessage = require('http').IncomingMessage
function createContext() {
  var context = {
    req: new IncomingMessage,
    request: {
    }
  }
  context.request.ctx = context

  return context
}