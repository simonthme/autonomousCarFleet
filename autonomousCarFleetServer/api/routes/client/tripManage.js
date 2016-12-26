/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';

const express = require('express');

const Account = require('../../model/account');
const Promise = require('bluebird');
const config = require('../../../config/config');
const jwt = require('jwt-simple');
//const carMethods = require('../../helpers/carMethods');
const tripMethods = require('../../helpers/tripMethods');
const passport = require('passport');

module.exports = function () {
  const router = new express.Router();

  router.put('/' , passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log('in trip router put');
    req.body.accountId = req.header.accountId;
    if (!req.body.accountId || !req.body.carId) {
      res.json({success: false, msg: 'body is missing'});
    } else {
          tripMethods.newTrip(req.body)
            .then(trip => {
              if (trip) {
                res.json({success: true, msg: 'Trip successfully added', trip: trip});
              } else {
                res.json({success: false, msg: 'Trip not found'});
              }
            })
            .catch(err => {
              console.log(err);
              res.json({success: false, msg: 'Error saving trip'});
            })

    }
  });

  router.get('/car/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log(req.params.id);
    tripMethods.findTripsByCarId(req.params.id)
      .then(tripsArray => {
        if (tripsArray) {
          res.json({success: true, msg: 'Successfully found all trips', trips: tripsArray});
        } else {
          res.json({succes: false, msg: 'Trips not found'});
        }
      })
      .catch(err => {
        console.log(err);
        res.json({success: false, msg: 'Error getting all trips'});
      });
  });



    router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
      tripMethods.findAllTrips()
        .then(tripsArray => {
          if (tripsArray) {
            res.json({success: true, msg: 'Successfully found all trips', trips: tripsArray});
          } else {
            res.json({succes: false, msg: 'Trips not found'});
          }
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, msg: 'Error getting all trips'});
        });
    });

    router.get('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
      console.log(req.params.id);
      if (!req.params.id) {
        res.json({success: false, msg: 'missing params'});
      } else {
        tripMethods.findOneTrip(req.params.id)
          .then(trip => {
            if (trip) {
              res.json({success: true, msg: 'Successfully got trip', trip: trip});
            } else {
              res.json({success: false, msg: 'trip not found'});
            }
          })
          .catch(err => {
            console.log(err);
            res.json({success: false, msg: 'Error getting trip'});
          })
      }

    });

    router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
      console.log(req.params.id);
      if (!req.params.id) {
        res.json({success: false, msg: 'missing params'});
      } else {
        tripMethods.deleteOneTrip(req.params.id)
          .then(deletedTrip => {
            console.log(JSON.stringify(deletedTrip));
            res.json({success: true, msg: 'Trip deleted successfully'});
          })
          .catch(err => {
            console.log(err);
            res.json({success: false, msg: 'Error deleting trip'});
          });
      }
    });

    router.patch('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
      console.log('update trip');
      if (!req.params.id) {
        res.json({success: false, msg: 'missing params'});
      } else {
        tripMethods.findOneTrip(req.params.id)
          .then(trip => {
            if (trip) {
              trip.arrivalDate = req.body.arrivalDate;
              return tripMethods.updateOneTrip(trip._id, trip)
            } else {
              res.json({success: false, msg: 'trip not found'});
            }
          })
          .then(updateResponse => {
            console.log(updateResponse);
            res.json({success: true, msg: 'Successfully updated trip'});
          })
          .catch(err => {
            console.log(err);
            res.json({success: false, msg: 'error updating or finding trip'});
          })
      }
    });

return router;
};
