/**
 * Created by simonthome on 23/12/2016.
 */
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
	accountId: String,
	carId: String,
	groupName: String,
	departureAddress: String,
	arrivalAddress: String,
	distance: String,
	distanceValue: Number,
	duration: String,
	durationValue: Number,
	departureDate: Date,
	arrivalDate: Date,
	creationDate: Date
});

module.exports = mongoose.model('Trip', tripSchema);
