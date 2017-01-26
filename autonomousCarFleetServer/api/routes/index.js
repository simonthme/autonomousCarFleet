/**
 * Created by simonthome on 06/11/2016.
 */
'use strict';
const router = require('express').Router();
const jwt = require('jwt-simple');
const config = require('../../config/config');
const Account = require('../model/account');
const authRoutes = require('./client/authentification')(router);
const carManageRoutes = require('./client/car-manage')(router);
const tripManageRoutes = require('./client/trip-manage')(router);
const groupManageRoutes = require('./client/group-manage')(router);

module.exports = (() => {
  const getToken = headers => {
    if (headers && headers.authorization) {
      const parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else { // eslint-disable-line no-else-return
        return null;
      }
    } else { // eslint-disable-line no-else-return
      return null;
    }
  };
  router.use((req, res, next) => {
    if (req.path === '/login' || req.path === '/register') {
      return next();
    }
    const token = getToken(req.headers);
    if (token) {
      const decoded = jwt.decode(token, config.constant.jwtSecret);
      Account.findOne({
        userName: decoded.userName
      }, (err, account) => {
        if (err) {
          throw err;
        }
        if (!account) { // eslint-disable-line no-negated-condition
          return res.status(403).send({success: false,
            msg: 'Authentification failed. Account not found.'});
        } else { // eslint-disable-line no-else-return
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
