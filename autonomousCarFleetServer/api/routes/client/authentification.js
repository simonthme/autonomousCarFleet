/**
 * Created by simonthome on 06/11/2016.
 */
'use strict';

const express = require('express');
const Promise = require('bluebird');
const jwt = require('jwt-simple');
const Account = require('../../model/account');
const config = require('../../../config/config');
const authMethods = require('../../helpers/authMethods');

module.exports = function () {
	const router = express.Router();
	router.put('/register', (req, res) => {
		console.log('IN ROUTER REGISTER');
		if (!req.body.userName || !req.body.password) {
			console.log('missing password or username');
			res.json({success: false, msg: 'Enter username or password'});
		} else {
			authMethods.saveAccount(req.body)
				.then(account => {
					console.log('client created' + JSON.stringify(account));
					res.json({
						success: true, msg: 'Succesfully created user', accountData: account});
				})
				.catch(err => {
					console.log('error creation ' + err);
				  res.json({
					  success: false, msg: 'Username already exists', body: req.body});
				});
		}
	});
	router.post('/login', (req, res) => {
		console.log('user name ' + req.body.userName);
		authMethods.findOne(req.body.userName)
			.then(account => {
				console.log(account);
				if (account) {
					if (account.password === null || account.password === '' || account.password === 'undefined') {
						res.json({success: false, msg: 'Missing Password'});
					} else {
						account.comparePassword(req.body.password, (err, isMatch) => {
							if (isMatch && !err) {
								const token = jwt.encode({userName: account.userName}, config.constant.jwtSecret);
								console.log('Login Success');
								res.json({
									success: true,
									msg: 'Login Successful',
									token: 'JWT ' + token,
									accountData: account
								});
							} else {
								console.log('Wrong Password');
								res.json({success: false, msg: 'Wrong password'});
							}
						});
					}
				} else {
					console.log("Wrong Email");
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
