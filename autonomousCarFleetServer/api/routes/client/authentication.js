/**
 * Created by simonthome on 06/11/2016.
 */
'use strict';

const express = require('express');

const Account = require('../../model/account');
const Promise = require('bluebird');
const config = require('../../../config/config');
const jwt = require('jwt-simple');

const methods = {
  findOne(userName) {
    return Account.findOne({userName: userName}).exec();
  },
  saveAccount(account) {
    return new Promise((resolve, reject) => {
      const date = new Date();

      const accountData = {
        accountName: account.accountName,
        userName: account.userName,
        password: account.password,
        creationDate: date.getTime()
      };
      console.log(JSON.stringify(accountData));

      var newAccount = new Account(accountData);
      newAccount.save()
        .then(accountData => resolve(accountData))
        .catch(err => reject(err));
    });
  }
};


module.exports = function () {
  const router = express.Router();

  router.put('/register', (req, res) => {
    console.log("IN ROUTER REGISTER");
    if (!req.body.userName || !req.body.password) {
      console.log('missing password or username');
      res.json({success: false, msg: 'Enter username or password'});
    } else {
      methods.saveAccount(req.body)
        .then(account => {
          console.log('client created' + JSON.stringify(account));
          res.json(
            {success: true, msg: 'Succesfully created user', accountData: account});
        })
        .catch(err => {
          console.log('error creation ' + err);
          res.json(
            {success: false, msg: 'Username already exists', body: req.body});
        });
    }
  });

  router.post('/login', (req, res) => {
    console.log('user name ' + req.body.userName);
    methods.findOne(req.body.userName)
      .then(account => {
        console.log(account);
        if (account) {
          if (account.password === null || account.password === '' ||
            account.password === 'undefined') {
            res.json({success: false, msg: 'Missing password'});
          } else {
            account.comparePassword(req.body.password, (err, isMatch) => {
              if (isMatch && !err) {
                const token = jwt.encode({emailAddress: account.emailAddress}, config.constant.jwtSecret);
                console.log('Login success');
                res.json({
                  success: true,
                  msg: 'Login successful',
                  token: 'JWT ' + token,
                  accountData: account
                });
              } else {
                console.log("wrong password");
                res.json({success: false, msg: 'Wrong password'});
              }
            });
          }
        } else {
          console.log("wrong email");
          res.send({success: false, msg: 'Wrong email'});
        }
      })
      .catch(err => {
        console.log(err);
        res.json({success: false, msg: 'error in findone'});
      });
  });

  return router;
};