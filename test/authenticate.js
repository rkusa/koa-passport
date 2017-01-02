var supertest = require('supertest')
var expect    = require('chai').expect
var co        = require('co')

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

var app = require('koa')()
app.use(require('koa-bodyparser')())

var session
app.use(function*(next) {
  this.session = session = {}
  yield next
})

app.use(passport.initialize())
app.use(passport.session())

var context
app.use(function*(next) {
  context = this
  yield next
})

var route = require('koa-route')
app.use(route.get('/', function*() {
  this.status = 204
}))

app.use(route.post('/login',
  passport.authenticate('local', {
    successRedirect: '/secured',
    failureRedirect: '/failed'
  })
))

app.use(route.post('/custom', function*(next) {
  var ctx = this
  yield* passport.authenticate('local', function*(err, user, info) {
    if (err) throw err
    if (user === false) {
      ctx.status = 401
      ctx.body = { success: false }
    } else {
      yield ctx.login(user)
      ctx.body = { success: true }
    }
  }).call(this, next)
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

  it('should let unauthorized requests pass through', co.wrap(function*() {
    yield client
      .get('/')
      .expect(204)

    expect(context.req.user).to.be.undefined
  }))

  describe('login using the middleware', function() {
    it('should refuse wrong credentials', co.wrap(function*() {
      yield client
        .post('/login')
        .send({ username: 'test', password: 'asdf' })
        .expect(302)

      var redirectTo = context.response.get('Location')
      expect(redirectTo).to.equal('/failed')
      expect(session).to.eql({})
      expect(context.isAuthenticated()).to.be.false
      expect(context.isUnauthenticated()).to.be.true
      expect()
    }))

    it('should accept valid credentials', co.wrap(function*() {
      yield client
        .post('/login')
        .send({ username: 'test', password: 'test' })
        .expect(302)

      redirectTo = context.response.get('Location')
      expect(redirectTo).to.equal('/secured')
      expect(context.isAuthenticated()).to.be.true
      expect(context.isUnauthenticated()).to.be.false
      expect(session).to.eql({
        passport: { user: 1 }
      })
    }))
  })

  describe('login using `.login()` method', function() {
    it('should work', co.wrap(function*() {
      yield client
        .get('/')
        .expect(204)

      yield context.login(user)
      expect(session).to.eql({
        passport: { user: 1 }
      })
      expect(context.isAuthenticated()).to.be.true
      expect(context.isUnauthenticated()).to.be.false
    }))
  })

  describe('logout', function() {
    it('should work', co.wrap(function*() {
      yield context.login(user)
      context.logout()

      expect(session).to.eql({ passport: {} })
      expect(context.isAuthenticated()).to.be.false
      expect(context.isUnauthenticated()).to.be.true
    }))
  })

  describe('custom callback', function() {
    it('should throw when providing a non-generator function', function(done) {
      co(function*() {
        yield* passport.authenticate('local', function() {}).call(context)
      }).catch(function(err) {
        expect(err).to.exist
        expect(err.message).to.equal('Your custom authentication callback must be a Generator Function')
        done()
      })
    })

    it('should refuse wrong credentials', co.wrap(function*() {
      yield client
        .post('/custom')
        .send({ username: 'test', password: 'asdf' })
        .expect(401, '{"success":false}')

      expect(session).to.eql({})
      expect(context.isAuthenticated()).to.be.false
      expect(context.isUnauthenticated()).to.be.true
      expect()
    }))

    it('should accept valid credentials', co.wrap(function*() {
      yield client
        .post('/custom')
        .send({ username: 'test', password: 'test' })
        .expect(200, '{"success":true}')

      expect(context.isAuthenticated()).to.be.true
      expect(context.isUnauthenticated()).to.be.false
      expect(session).to.eql({
        passport: { user: 1 }
      })
    }))
  })
})