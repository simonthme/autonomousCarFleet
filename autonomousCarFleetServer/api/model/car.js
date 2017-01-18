/**
 * Created by simonthome on 14/11/2016.
 */
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

const carSchema = new mongoose.Schema({
	name: String,
	accountId: String,
	used: Boolean,
	groupName: String,
	carNumber: Number,
	creationDate: Date
});

carSchema.plugin(autoIncrement.plugin, {
	model: 'Car',
	field: 'carNumber',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('Car', carSchema);
