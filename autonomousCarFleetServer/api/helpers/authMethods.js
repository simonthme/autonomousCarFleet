/**
 * Created by simonthome on 12/12/2016.
 */
'use strict';

const express = require('express');

const Account = require('../model/account');
const Promise = require('bluebird');
const config = require('../../config/config');
const jwt = require('jwt-simple');

 const authMethods = {
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
        creationDate: date,
      };
      console.log(JSON.stringify(accountData));

      const newAccount = new Account(accountData);
      newAccount.save()
        .then(accountData => resolve(accountData))
        .catch(err => reject(err));
    });
  }
};

 module.exports = authMethods;