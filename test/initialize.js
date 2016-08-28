'use strict'

const expect   = require('chai').expect
const passport = require('../')

describe('initialize middleware', function() {
  it('it should add itself', function() {
    const initialize = passport.initialize()
    const context = createContext()
    return initialize(context, function() {
      expect(context.state).to.have.property('_passport')
    })
  })

  it('should define `req.user`', function() {
    const initialize = passport.initialize()
    const context = createContext()
    return initialize(context, function() {
      expect('user' in context.req).to.be.true

      context.state.user = {}
      expect(context.req.user).to.equal(context.state.user)
    })
  })

  it('should add helper aliases', function() {
    const initialize = passport.initialize()
    const context = createContext()
    const methods = ['login', 'logIn', 'logout', 'logOut', 'isAuthenticated', 'isUnauthenticated']
    return initialize(context, function() {
      methods.forEach(function(name) {
        expect(context.req[name]).to.not.exist
        expect(context[name]).to.exist
      })
    })
  })
})

const IncomingMessage = require('http').IncomingMessage
function createContext() {
  const context = {
    req: new IncomingMessage,
    request: {},
    state: {},
  }
  context.request.ctx = context

  return context
}