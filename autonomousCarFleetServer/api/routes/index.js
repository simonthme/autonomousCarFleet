/**
 * Created by simonthome on 06/11/2016.
 */
'use strict';
const router = require('express').Router();

const config = require('../../config/config');
const authRoutes = require('./client/authentication')(router);
const Account = require('../model/account');
const carManageRoutes = require('./client/carManage')(router);
const tripManageRoutes = require('./client/tripManage')(router);
const groupManageRoutes = require('./client/groupManage')(router);
const jwt = require('jwt-simple');

module.exports = (function () {


  const getToken = function (headers) {
    if (headers && headers.authorization) {
      const parted = headers.authorization.split(' ');
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
    if (req.path == '/login' || req.path == '/register') {
      return next();
    }
    const token = getToken(req.headers);
    if (token) {

      const decoded = jwt.decode(token, config.constant.jwtSecret);
      Account.findOne({
        userName: decoded.userName
      }, function(err, account) {
        if (err) throw err;
        if (!account) {
          return res.status(403).send({success: false, msg: 'Authentication failed. Account not found.'});
        } else {
          req.header.accountId = account._id;
          next();
        }
      });
    } else {
      return res.status(403).send({success: false, msg: 'No token provided.'});
    }
  });

  router.use('/', authRoutes);
  router.use('/car', carManageRoutes);
  router.use('/trip', tripManageRoutes);
  router.use('/group', groupManageRoutes);

  return router;
})();
