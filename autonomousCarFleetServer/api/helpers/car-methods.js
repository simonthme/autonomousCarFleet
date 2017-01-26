/**
 * Created by simonthome on 12/12/2016.
 */
'use strict';

const Promise = require('bluebird');
const Car = require('../model/car');

const carMethods = {
  addCar(car) {
    return new Promise((resolve, reject) => {
      const date = new Date();
      const carData = {
        name: car.name,
        accountId: car.accountId,
        used: false,
        creationDate: date
      };
      const newCar = new Car(carData);
      newCar.save()
        .then(carData => resolve(carData))
        .catch(err => reject(err));
    });
  },
  findAllCars(id) {
    return Car.find({accountId: id}).exec();
  },
  findOneCar(id) {
    return Car.findOne({_id: id}).exec();
  },
  deleteOneCar(id) {
    return Car.remove({_id: id}).exec();
  },
  updateOneCar(id, car) {
    return Car.update({_id: id}, car).exec();
  },
  findGroupCars(id, groupName) {
    return Car.find({accountId: id, groupName}).exec();
  }
};

module.exports = carMethods;
