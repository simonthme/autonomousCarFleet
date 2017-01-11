/**
 * Created by simonthome on 11/01/2017.
 */
'use strict';

const express = require('express');

const Account = require('../../model/account');
const Promise = require('bluebird');
const config = require('../../../config/config');
const jwt = require('jwt-simple');
const carMethods = require('../../helpers/carMethods');
const passport = require('passport');

module.exports = function () {
  const router = new express.Router();

  router.patch('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    if (!req.params.id) {
      res.json({success: false, msg: 'missing params'});
    } else {
      carMethods.findOneCar(req.params.id)
        .then(car => {
          if (car) {
            car.groupName = req.body.groupName;
            return carMethods.updateOneCar(car._id, car)
          } else {
            res.json({success: false, msg: 'car not found'});
          }
        })
        .then(updateResponse => {
          console.log(updateResponse);
          res.json({success: true, msg: 'Successfully updated car'});
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, msg: 'error updating or finding car'});
        })
    }
  });

  router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const accountId = req.header.accountId;
    console.log(req.body.groupName);
    carMethods.findGroupCars(accountId, req.body.groupName)
      .then(carsArray => {
        console.log(carsArray);
        if (carsArray.length > 0) {
          res.json({success: true, msg: 'Successfully found group cars', cars: carsArray});
        } else {
          res.json({succes: false, msg: 'Cars not found'});
        }
      })
      .catch(err => {
        console.log(err);
        res.json({success: false, msg: 'Error getting all cars'});
      });
  });

  return router;
};