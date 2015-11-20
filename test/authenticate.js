var supertest = require('supertest-as-promised')
var expect    = require('chai').expect

var user = { id: 1, username: 'test' }

var passport = require('../')

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  done(null, user)
})

var LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
  // retrieve user ...
  if (username === 'test' && password === 'test') {
    done(null, user)
  } else {
    done(null, false)
  }
}))

const Koa = require('koa')
var app = new Koa()
app.use(require('koa-bodyparser')())

var session
app.use(function(ctx, next) {
  ctx.session = session = {}
  return next()
})

app.use(passport.initialize())
app.use(passport.session())

var context
app.use(function(ctx, next) {
  context = ctx
  return next()
})

var route = require('koa-route')
app.use(route.get('/', function(ctx) {
  ctx.status = 204
}))

app.use(route.post('/login',
  passport.authenticate('local', {
    successRedirect: '/secured',
    failureRedirect: '/failed'
  })
))

app.use(route.post('/custom', function(ctx, next) {
  return passport.authenticate('local', function(user, info) {
    if (user === false) {
      ctx.status = 401
      ctx.body = { success: false }
    } else {
      ctx.body = { success: true }
      return ctx.login(user)
    }
  })(ctx, next)
}))

describe('authenticate middleware', function() {
  var port = process.env.PORT || 4000
  var server, client
  before(function(done) {
    server = app.listen(port, done)
    client = supertest(server)
  })
  after(function(done) {
    server.close(done)
  })
  process.on('exit', function() {
    try {
      server.close()
    } catch(e) {}
  })

  it('should let unauthorized requests pass through', function() {
    return client
    .get('/')
    .expect(204)
    .then(() => {
      expect(context.req.user).to.be.undefined
    })
  })

  describe('login using the middleware', function() {
    it('should refuse wrong credentials', function() {
      return client
      .post('/login')
      .send({ username: 'test', password: 'asdf' })
      .expect(302)
      .then(() => {
        var redirectTo = context.response.get('Location')
        expect(redirectTo).to.equal('/failed')
        expect(session).to.eql({})
        expect(context.isAuthenticated()).to.be.false
        expect(context.isUnauthenticated()).to.be.true
        expect()
      })
    })

    it('should accept valid credentials', function() {
      return client
      .post('/login')
      .send({ username: 'test', password: 'test' })
      .expect(302)
      .then(() => {
        var redirectTo = context.response.get('Location')
        expect(redirectTo).to.equal('/secured')
        expect(context.isAuthenticated()).to.be.true
        expect(context.isUnauthenticated()).to.be.false
        expect(session).to.eql({
          passport: { user: 1 }
        })
      })
    })
  })

  describe('login using `.login()` method', function() {
    it('should work', function() {
      return client
      .get('/')
      .expect(204)
      .then(() => {
        context.login(user).then(() => {
          expect(session).to.eql({
            passport: { user: 1 }
          })
          expect(context.isAuthenticated()).to.be.true
          expect(context.isUnauthenticated()).to.be.false
        })
      })
    })
  })

  describe('logout', function() {
    it('should work', function() {
      return context.login(user).then(() => {
        context.logout()

        expect(session).to.eql({ passport: {} })
        expect(context.isAuthenticated()).to.be.false
        expect(context.isUnauthenticated()).to.be.true
      })
    })
  })

  describe('custom callback', function() {
    it('should refuse wrong credentials', function() {
      return client
      .post('/custom')
      .send({ username: 'test', password: 'asdf' })
      .expect(401, '{"success":false}')
      .then(() => {
        expect(session).to.eql({})
        expect(context.isAuthenticated()).to.be.false
        expect(context.isUnauthenticated()).to.be.true
        expect()
      })
    })

    it('should accept valid credentials', function() {
      return client
      .post('/custom')
      .send({ username: 'test', password: 'test' })
      .expect(200, '{"success":true}')
      .then(() => {
        expect(context.isAuthenticated()).to.be.true
        expect(context.isUnauthenticated()).to.be.false
        expect(session).to.eql({
          passport: { user: 1 }
        })
      })
    })
  })
})