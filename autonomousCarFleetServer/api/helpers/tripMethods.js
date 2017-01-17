/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';

const Trip = require('../model/trip');
const Promise  = require('bluebird');
const distance = require('google-distance');
const carMethods = require('./carMethods');
const async = require('async');



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
          groupName: '',
          departureAddress: data.origin,
          arrivalAddress: data.destination,
          distance: data.distance,
          distanceValue: data.distanceValue,
          duration: data.duration,
          durationValue: data.durationValue,
          departureDate: trip.departureDate,
          creationDate: date,
        });
        newTrip.save()
          .then(tripData => resolve(tripData))
          .catch(err => reject(err));
      });
    })
  },
  newGroupTrip(trip) {
    return new Promise((resolve, reject) => {
      carMethods.findGroupCars(trip.accountId, trip.groupName)
        .then(cars => {
          let tempTrips = [];
          async.each(cars, (car, callback) => {
            const date = new Date();
            distance.get(
              {
                origin: trip.departureAddress,
                destination: trip.arrivalAddress,
              }, (err, data) => {
                const newTrip = new Trip({
                  accountId: trip.accountId,
                  carId: car._id,
                  groupName: trip.groupName,
                  departureAddress: data.origin,
                  arrivalAddress: data.destination,
                  distance: data.distance,
                  distanceValue: data.distanceValue,
                  duration: data.duration,
                  durationValue: data.durationValue,
                  departureDate: trip.departureDate,
                  creationDate: date,
                });
                newTrip.save()
                  .then(tripData => {
                    console.log(JSON.stringify(tripData));
                    tempTrips.push(tripData);
                    callback();
                  })
                  .catch(err => reject(err));
              });
          }, (err) => {
            if (err) {
              reject();
            } else {
              console.log(JSON.stringify(tempTrips));
              resolve(tempTrips);
            }
          });
        })
    });
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