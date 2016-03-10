var passport = require('passport')
var Passport = require('passport').Passport
var framework = require('./framework/koa')()

passport.framework(framework)

var KoaPassport = function () {
  Passport.call(this)
  this.framework(framework)
}
require('util').inherits(KoaPassport, Passport)

// Export default singleton.
module.exports = passport

// Expose constructor
module.exports.KoaPassport = KoaPassport
