'use strict'

const passport = require('passport')
const Passport = require('passport').Passport
const framework = require('./framework/koa')()

passport.framework(framework)

class KoaPassport extends Passport {
  constructor() {
    super()
    this.framework(framework)
  }
}

// Export default singleton.
module.exports = passport

// Expose constructor
module.exports.KoaPassport = KoaPassport
