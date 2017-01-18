/**
 * Created by simonthome on 06/11/2016.
 */
const express = require('express');

const app = express();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./api/routes/index');
mongoose.Promise = require('bluebird');

const connection = mongoose.connect(config.constant.mongoUrl)
  .then(console.log('Connection OK !!'))
  .catch(err => console.log('Connection ERROR !!' + err));

app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(passport.initialize());
require('./config/passport')(passport);

const port = process.env.PORT || 3000;

app.use('/api', routes);

app.listen(port);

console.log('Magic happens on port ' + port);
