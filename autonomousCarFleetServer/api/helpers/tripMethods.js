/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';

const Trip = require('../model/trip');
const Promise  = require('bluebird');
const distance = require('google-distance');



const tripMethods = {
  newTrip(trip) {
    return new Promise((resolve, reject) => {
      const date = new Date();
      distance.get(
        {
          origin: trip.departureAddress,
          destination: trip.arrivalAddress,
        }, (err, data) => {

        // const tripData =
        // console.log('console' + JSON.stringify(tripData));

        const newTrip = new Trip({
          accountId: trip.accountId,
          carId: trip.carId,
          departureAddress: data.origin,
          arrivalAddress: data.destination,
          distance: data.distance,
          distanceValue: data.distanceValue,
          duration: data.duration,
          durationValue: data.durationValue,
          departureDate: new Date().getTime(),
          creationDate: date,
        });
        newTrip.save()
          .then(tripData => resolve(tripData))
          .catch(err => reject(err));
      });
    })
  },
  findAllTrips() {
    return Trip.find({}).exec();
  },
  findTripsByCarId(id) {
    return Trip.find({carId: id}).exec();
  },
  findOneTrip(id) {
    return Trip.findOne({_id: id}).exec();
  },

  deleteOneTrip(id) {
    return Trip.remove({_id: id}).exec();
  },

  updateOneTrip(id, trip) {
    return Trip.update({_id: id}, trip).exec();
  }
};

module.exports = tripMethods;