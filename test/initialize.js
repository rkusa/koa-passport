const passport = require('../')

describe('initialize middleware', function() {
  it('it should add itself', function() {
    const initialize = passport.initialize()
    const context = createContext()
    return initialize(context, function() {
      expect(context.state).toHaveProperty('_passport')
    })
  })

  it('should define `req.user`', function() {
    const initialize = passport.initialize()
    const context = createContext()
    return initialize(context, function() {
      expect('user' in context.req).toBe(true)

      context.state.user = {}
      expect(context.req.user).toEqual(context.state.user)
    })
  })

  it('should add helper aliases', function() {
    const initialize = passport.initialize()
    const context = createContext()
    const methods = ['login', 'logIn', 'logout', 'logOut', 'isAuthenticated', 'isUnauthenticated']
    return initialize(context, function() {
      methods.forEach(function(name) {
        expect(context.req[name]).toBeUndefined()
        expect(context[name]).toBeDefined()
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