/**
 * Created by simonthome on 06/11/2016.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-as-promised');

const account = new mongoose.Schema({
  accountName: String,
  userName: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  creationDate: Date
});

const methods = {
  genSalt(number) {
    return bcrypt.genSalt(number);
  },
  hash(password, salt) {
    return bcrypt.hash(password, salt);
  },
  compare(password, passwordUser) {
    return bcrypt.compare(password, passwordUser);
  }
};

account.pre('save', function (next) {
  const user = this;
  if ((this.isModified('password') || this.isNew) && user.password !== null &&
    typeof user.password !== 'undefined') {
    methods.genSalt(10)
      .then(salt => {
        methods.hash(user.password, salt)
          .then(hash => {
            user.password = hash;
            next();
          })
          .catch(err => {
            return next(err);
          });
      })
      .catch(err => {
        return next(err);
      });
  } else {
    return next();
  }
});

account.methods.comparePassword = function (password, cb) {
  methods.compare(password, this.password)
    .then(isMatch => {
      cb(null, isMatch);
    })
    .catch(err => {
      return cb(err);
    });
};

module.exports = mongoose.model('Account', account);
