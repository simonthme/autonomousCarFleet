/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';

const Promise = require('bluebird');
const distance = require('google-distance');
const async = require('async');
const Trip = require('../model/trip');
const carMethods = require('./car-methods');

const tripMethods = {
  newTrip(trip) {
    return new Promise((resolve, reject) => {
      const date = new Date();
      let group = '';
      if (trip.groupName) {
        group = trip.groupName;
      }
      distance.get({
        origin: trip.departureAddress,
        destination: trip.arrivalAddress
      }, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const newTrip = new Trip({
            accountId: trip.accountId,
            carId: trip.carId,
            groupName: group,
            departureAddress: data.origin,
            arrivalAddress: data.destination,
            distance: data.distance,
            distanceValue: data.distanceValue,
            duration: data.duration,
            durationValue: data.durationValue,
            departureDate: trip.departureDate,
            intermediaryTrip: trip.intermediaryTrip,
            creationDate: date
          });
          newTrip.save()
            .then(tripData => resolve(tripData))
            .catch(err => reject(err));
        }
      });
    });
  },
  newGroupTrip(trip) {
    return new Promise((resolve, reject) => {
      carMethods.findGroupCars(trip.accountId, trip.groupName)
        .then(cars => {
          const tempTrips = [];
          async.each(cars, (car, callback) => {
            const date = new Date();
            distance.get({
              origin: trip.departureAddress,
              destination: trip.arrivalAddress
            }, (err, data) => {
              if (err) {
                console.log(err);
              } else {
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
                  intermediaryTrip: trip.intermediaryTrip,
                  creationDate: date
                });
                newTrip.save()
                  .then(tripData => {
                    tempTrips.push(tripData);
                    callback();
                  })
                  .catch(err => reject(err));
              }
            });
          }, err => {
            if (err) {
              reject();
            } else {
              resolve(tempTrips);
            }
          });
        });
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
  },
  findOneLastTrip(id) {
    return Trip.findOne({carId: id}).sort({arrivalDate: -1}).exec();
  },
  findGroupLastTrip(accountId, groupName) {
    return new Promise((resolve, reject) => {
      carMethods.findGroupCars(accountId, groupName)
        .then(cars => {
          const tempLastGroupTrips = [];
          async.each(cars, (car, callback) => {
            this.findOneLastTrip(car._id)
              .then(trip => {
                tempLastGroupTrips.push(trip);
                callback();
              });
          }, err => {
            if (err) {
              console.log(err);
              reject();
            } else {
              resolve(tempLastGroupTrips);
            }
          });
        });
    });
  }
};

module.exports = tripMethods;
