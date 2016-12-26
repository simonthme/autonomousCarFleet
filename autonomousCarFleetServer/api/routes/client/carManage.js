/**
 * Created by simonthome on 14/11/2016.
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

  router.put('/', passport.authenticate('jwt', {session: false}), (req, res) => {

    req.body.accountId = req.header.accountId;
    console.log('put car route: ' + JSON.stringify(req.body));
    if (!req.body.name || !req.body.accountId) {
      res.json({success: false, msg: 'body is missing'});
    } else {
      carMethods.addCar(req.body)
        .then(car => {
          if (car) {
            res.json({success: true, msg: 'Car successfully added', car: car});
          } else {
            res.json({success: false, msg: 'Car not found'});
          }
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, msg: 'Error saving car'});
        })
    }
  });

  router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log('in cars get');
    const accountId = req.header.accountId;
    console.log(accountId);
    carMethods.findAllCars(accountId)
      .then(carsArray => {
        console.log(carsArray);
        if (carsArray.length > 0) {
          res.json({success: true, msg: 'Successfully found all cars', cars: carsArray});
        } else {
          res.json({succes: false, msg: 'Cars not found'});
        }
      })
      .catch(err => {
        console.log(err);
        res.json({success: false, msg: 'Error getting all cars'});
      });
  });

  router.get('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log(req.params.id);
    if (!req.params.id) {
      res.json({success: false, msg: 'missing params'});
    } else {
      carMethods.findOneCar(req.params.id)
        .then(car => {
          if (car) {
            res.json({success: true, msg: 'Successfully got car', car: car});
          } else {
            res.json({success: false, msg: 'car not found'});
          }
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, msg: 'Error getting car'});
        })
    }

  });

  // router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  //   console.log('before account id');
  //   //const accountId = req.header.accountId;
  //   console.log(accountId);
  //   // carMethods.findAccountCars(accountId)
  //   //   .then(carArray => {
  //   //     if (carArray.length > 0) {
  //   //       res.json({success: true, msg:'Successfully found cars for current account', carArray: carArray});
  //   //     } else {
  //   //       res.json({success: false, msg:'No cars found'});
  //   //     }
  //   //   })
  //   //   .catch(err => {
  //   //     console.log(err);
  //   //     res.json({success: false, msg:'Error finding cars per account'});
  //   //   })
  //
  // });

  router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log(req.params.id);
    if (!req.params.id) {
      res.json({success: false, msg: 'missing params'});
    } else {
      carMethods.deleteOneCar(req.params.id)
        .then(deletedCar => {
          console.log(JSON.stringify(deletedCar));
          res.json({success: true, msg: 'Car deleted successfully'});
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, msg: 'Error deleting car'});
        });
    }
  });

  router.patch('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    if (!req.params.id) {
      res.json({success: false, msg: 'missing params'});
    } else {
      carMethods.findOneCar(req.params.id)
        .then(car => {
          if (car) {
            car.name = req.body.name;
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
  return router;

};