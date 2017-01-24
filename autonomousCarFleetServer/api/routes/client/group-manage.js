/**
 * Created by simonthome on 11/01/2017.
 */
'use strict';

const express = require('express');
const passport = require('passport');
const carMethods = require('../../helpers/car-methods');

module.exports = function () {
  const router = new express.Router();
  router.patch('/:id', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      if (!req.params.id) {
        res.json({success: false, msg: 'missing params'});
      } else {
        carMethods.findOneCar(req.params.id)
          .then(car => {
            if (car) {
              car.groupName = req.body.groupName;
              return carMethods.updateOneCar(car._id, car);
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
          });
      }
    });
  router.patch('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const accountId = req.header.accountId;
      carMethods.findGroupCars(accountId, req.body.groupName)
        .then(cars => {
          if (cars.length > 0) {
            cars.forEach(car => {
              car.used = true;
              return carMethods.updateOneCar(car._id, car);
            });
          } else {
            res.json({success: false, msg: 'No cars found in group'});
          }
        })
        .then(updateResponse => {
          res.json({success: true, msg: 'successfully updated cars in group'});
        })
        .catch(err => {
          res.json({success: false, msg: 'error updating cars in group'});
        });
    });
  router.post('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const accountId = req.header.accountId;
      console.log(req.body.groupName);
      carMethods.findGroupCars(accountId, req.body.groupName)
        .then(carsArray => {
          console.log(carsArray);
          if (carsArray.length > 0) {
            res.json({success: true, msg: 'Successfully found group cars',
              carsArray});
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
