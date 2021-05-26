'use strict';
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  name: {type: String},
  description: {type: String},
  status: {type: String}
});

const UserSchema = new mongoose.Schema({
  username: {type: String},
  useremail: {type: String},
  books: [BookSchema]
});

module.exports = mongoose.model('User', UserSchema);