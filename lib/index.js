var passport = module.exports = require('passport')

passport.framework(require('./framework/koa')())
