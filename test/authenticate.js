const user = { id: 1, username: 'test' }

const supertest = require('supertest')
const passport = require('../')

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  done(null, user)
})

const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
  // retrieve user ...
  if (username === 'test' && password === 'test') {
    done(null, user)
  } else {
    done(null, false)
  }
}))

const Koa = require('koa')
const app = new Koa()
app.use(require('koa-bodyparser')())


let session
app.use(function(ctx, next) {
  ctx.session = session = {
    regenerate(done) {
      for (const key of Object.keys(session)) {
        if (key === 'regenerate') {
          continue
        }
        delete session[key]
      }
      ctx.session.save = function(done) {
        process.nextTick(done)
      }
      process.nextTick(done)
    }
  }
  return next()
})

app.use(passport.initialize())
app.use(passport.session())

let context
app.use(function(ctx, next) {
  context = ctx
  return next()
})

const route = require('koa-route')
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
  return passport.authenticate('local', function(err, user, info) {
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
  const port = process.env.PORT || 4000
  let server, client
  beforeAll(function(done) {
    server = app.listen(port, done)
    client = supertest(server)
  })
  afterAll(function(done) {
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
      expect(context.req.user).toBeUndefined()
      expect(context.state.user).toBeUndefined()
    })
  })

  describe('login using the middleware', function() {
    it('should refuse wrong credentials', function() {
      return client
      .post('/login')
      .send({ username: 'test', password: 'asdf' })
      .expect(302)
      .then(() => {
        const redirectTo = context.response.get('Location')
        expect(redirectTo).toEqual('/failed')
        expect(session).toEqual({regenerate: expect.any(Function)})
        expect(context.isAuthenticated()).toBe(false)
        expect(context.isUnauthenticated()).toBe(true)
        expect(context.state.user).toBeUndefined()
      })
    })

    it('should accept valid credentials', function() {
      return client
      .post('/login')
      .send({ username: 'test', password: 'test' })
      .expect(302)
      .then(() => {
        const redirectTo = context.response.get('Location')
        expect(redirectTo).toEqual('/secured')
        expect(context.isAuthenticated()).toBe(true)
        expect(context.isUnauthenticated()).toBe(false)
        expect(context.state.user).toEqual(user)
        expect(session).toEqual({
          passport: { user: 1 },
          regenerate: expect.any(Function),
          save: expect.any(Function)
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
        return context.login(user).then(() => {
          expect(session).toEqual({
            passport: { user: 1 },
            regenerate: expect.any(Function),
            save: expect.any(Function)
          })
          expect(context.isAuthenticated()).toBe(true)
          expect(context.isUnauthenticated()).toBe(false)
          expect(context.state.user).toEqual(user)
        })
      })
    })
  })

  describe('logout', function() {
    it('should work', function() {
      return client
      .get('/')
      .expect(204)
      .then(() => {
        return context.login(user).then(async () => {
          const p = context.logout()
          expect(p).toBeInstanceOf(Promise)
          await p

          expect(session).toEqual({
            regenerate: expect.any(Function),
            save: expect.any(Function)
          })
          expect(context.isAuthenticated()).toBe(false)
          expect(context.isUnauthenticated()).toBe(true)
          expect(context.state.user).toBe(null)
        })
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
        expect(session).toEqual({regenerate: expect.any(Function)})
        expect(context.isAuthenticated()).toBe(false)
        expect(context.isUnauthenticated()).toBe(true)
        expect(context.state.user).toBeUndefined()
        expect()
      })
    })

    it('should accept valid credentials', function() {
      return client
      .post('/custom')
      .send({ username: 'test', password: 'test' })
      .expect(200, '{"success":true}')
      .then(() => {
        expect(context.isAuthenticated()).toBe(true)
        expect(context.isUnauthenticated()).toBe(false)
        expect(context.state.user).toEqual(user)
        expect(session).toEqual({
          passport: { user: 1 },
          regenerate: expect.any(Function),
          save: expect.any(Function)
        })
      })
    })
  })
})