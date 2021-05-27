'use strict';
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  name: {type: String},
  author: {type: String},
});

const BookModel = mongoose.model('Book', BookSchema);

const UserSchema = new mongoose.Schema({
  username: {type: String},
  useremail: {type: String, unique: true},
  books: [BookSchema]
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = {
  UserModel,
  BookModel,
}