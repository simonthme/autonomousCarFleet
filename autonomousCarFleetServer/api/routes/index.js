/**
 * Created by simonthome on 06/11/2016.
 */
const router = require('express').Router();

const config = require('../../config/config');
const authRoutes = require('./client/authentication')(router);
const Account = require('../model/account');

module.exports = (function () {


  var getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  router.use(function(req, res, next) {
    console.log(req.path);
    if (req.path == '/login' || req.path == '/register') {
      return next();
    }
    var token = getToken(req.headers);
    if (token) {
      var decoded = jwt.decode(token, config.constant.jwtSecret);
      console.log('requete de ' + decoded.userName);
      Account.findOne({
        userName: decoded.userName
      }, function(err, account) {
        if (err) throw err;
        if (!account) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          req.header.userId = account._id;
          next();
        }
      });
    } else {
      return res.status(403).send({success: false, msg: 'No token provided.'});
    }
  });

  router.use('/', authRoutes);

  return router;
})();
