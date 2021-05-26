'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
   console.log('SUCCESSFULLY CONNECTED!')
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Mongoose is connected')
});

const User = require('./models/User');

// const Peyton = new User({ 
//   useremail: 'middpeyton@gmail.com', 
//   books: [{name: 'Station 11'}, {name: 'Harry Potter'}, {name: 'Lord of the Rings'}]
// })

const userProfile = new User({
  useremail: 'mohsin.behi@gmail.com',
  books: [
    {name: 'Spiderman',
    description: 'Superhero',
    status: 'Have not read'},
    {name: 'Lord of the Rings',
    description: 'Fantasy',
    status: 'Have read'}, 
    {name: 'Harry Potter',
    description: 'Fantasy',
    status: 'Have read'}]
})

userProfile.save().then(() => console.log('successful connection'));

  // TODO: 
  // STEP 1: get the jwt from the headers
  // STEP 2. use the jsonwebtoken library to verify that it is a valid jwt
  // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
  // STEP 3: to prove that everything is working correctly, send the opened jwt back to the front-end
  // const token = request.headers.authorization.split(' ')[1];
  // console.log(token);

  // jwt.verify(token, getKey, {}, function(err, user) {
  //   if(err){
  //     response.send('invalid token');
  //   }


app.get('/books', async (request, response) => {
  try{
    let booksFromDB = await User.find({});
    response.send(booksFromDB)
    console.log(booksFromDB)
  } catch (e) {
    response.status(500).send('Something is broken!')
  }
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
