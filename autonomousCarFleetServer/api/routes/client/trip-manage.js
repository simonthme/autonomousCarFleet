/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';

const express = require('express');
const passport = require('passport');
//  const carMethods = require('../../helpers/carMethods');
const tripMethods = require('../../helpers/trip-methods');

module.exports = function () {
  const router = new express.Router();
  router.put('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      req.body.accountId = req.header.accountId;
      if (!req.body.accountId || !req.body.carId) {
        res.json({success: false, msg: 'body is missing'});
      } else {
        tripMethods.newTrip(req.body)
          .then(trip => {
            if (trip) {
              res.json({success: true, msg: 'Trip successfully added', trip});
            } else {
              res.json({success: false, msg: 'Trip not found'});
            }
          })
          .catch(err => {
            console.log(err);
            res.json({success: false, msg: 'Error saving trip'});
          });
      }
    });
  router.put('/group', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      req.body.accountId = req.header.accountId;
      if (!req.body.accountId || !req.body.groupName) {
        res.json({success: false, msg: 'body is missing'});
      } else {
        tripMethods.newGroupTrip(req.body)
          .then(trip => {
            if (trip) {
              res.json({success: true, msg: 'Trip successfully added', trip});
            } else {
              res.json({success: false, msg: 'Trip not found'});
            }
          })
          .catch(err => {
            console.log(err);
            res.json({success: false, msg: 'Error saving trip'});
          });
      }
    });
  router.get('/car/:id', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      tripMethods.findTripsByCarId(req.params.id)
        .then(tripsArray => {
          if (tripsArray) {
            res.json({success: true, msg: 'Successfully found all trips',
              trips: tripsArray});
          } else {
            res.json({success: false, msg: 'Trips not found'});
          }
        })
       .catch(err => {
         console.log(err);
         res.json({success: false, msg: 'Error getting all trips'});
       });
    });
  router.get('/last/:id', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      tripMethods.findOneLastTrip(req.params.id)
        .then(trip => {
          if (trip) {
            res.json({success: true, msg: 'Successfully found last trip',
              trip});
          } else {
            res.json({success: true, msg: 'No trip found', trip: ''});
          }
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, msg: 'Error getting last trip'});
        });
    });
  router.post('/last', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      const accountId = req.header.accountId;
      tripMethods.findGroupLastTrip(accountId, req.body.groupName)
        .then(trips => {
          if (trips) {
            res.json({success: true, msg: 'Successfully found last group trips',
              trips});
          } else {
            res.json({success: true, msg: 'No trips found', trips: ''});
          }
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, msg: 'Error getting last trip'});
        });
    });
  router.get('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      tripMethods.findAllTrips()
        .then(tripsArray => {
          if (tripsArray.length > 0) {
            res.json({success: true, msg: 'Successfully found all trips',
              trips: tripsArray});
          } else {
            res.json({success: false, msg: 'Trips not found'});
          }
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, msg: 'Error getting all trips'});
        });
    });
  router.get('/:id', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      if (!req.params.id) { // eslint-disable-line no-negated-condition
        res.json({success: false, msg: 'missing params'});
      } else {
        tripMethods.findOneTrip(req.params.id)
          .then(trip => {
            if (trip) {
              res.json({success: true, msg: 'Successfully got trip',
                trip});
            } else {
              res.json({success: false, msg: 'trip not found'});
            }
          })
          .catch(err => {
            console.log(err);
            res.json({success: false, msg: 'Error getting trip'});
          });
      }
    });
  router.delete('/:id', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      if (!req.params.id) { // eslint-disable-line no-negated-condition
        res.json({success: false, msg: 'missing params'});
      } else {
        tripMethods.deleteOneTrip(req.params.id)
          .then(() => {
            res.json({success: true, msg: 'Trip deleted successfully'});
          })
          .catch(err => {
            console.log(err);
            res.json({success: false, msg: 'Error deleting trip'});
          });
      }
    });
  router.patch('/:id', passport.authenticate('jwt', {session: false}),
    (req, res) => {
      if (!req.params.id) { // eslint-disable-line no-negated-condition
        res.json({success: false, msg: 'missing params'});
      } else {
        tripMethods.findOneTrip(req.params.id)
          .then(trip => {
            if (trip) {
              trip.arrivalDate = req.body.arrivalDate;
              console.log('TRIP ARRIVAL DATE: ' + trip.arrivalDate);
              return tripMethods.updateOneTrip(trip._id, trip);
            } else { // eslint-disable-line no-else-return
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
          });
      }
    });
  return router;
};
