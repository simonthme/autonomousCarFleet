/**
 * Created by simonthome on 06/11/2016.
 */
'use strict';

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jwt-simple');

const Account = require('../api/model/account');
const config = require('./config');

const methods = {
  findOne(id) {
    return Account.findOne({id: id}).exec();
  }
};

module.exports = passport => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.constant.jwtSecret;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    methods.findOne(jwt_payload.sub)
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
