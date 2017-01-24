/**
 * Created by simonthome on 06/11/2016.
 */
'use strict';

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Account = require('../api/model/account');
const config = require('./config');

const methods = {
  findOne(id) {
    return Account.findOne(id).exec();
  }
};

module.exports = passport => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.constant.jwtSecret;
  passport.use(new JwtStrategy(opts, (jwtpayload, done) => {
    methods.findOne(jwtpayload.sub)
      .then(account => {
        if (account) {
          done(null, account);
        } else {
          done(null, false);
        }
      })
      .catch(err => {
        return done(err, false);
      });
  }));
};
