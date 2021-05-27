'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const client = jwksClient({
  jwksUri: 'https://dev-8qzdxf9v.us.auth0.com/.well-known/jwks.json',
});

function getKey(header, callback){
  client.getSigningKey(header.kid, function (err, key){
    const signingKey = key.publicKey || key.rsaPublicKey; 
    callback(null, signingKey);
  });
}

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

const UserImport = require('./models/User');

// const Peyton = new User({ 
//   useremail: 'middpeyton@gmail.com', 
//   books: [{name: 'Station 11'}, {name: 'Harry Potter'}, {name: 'Lord of the Rings'}]
// })

// const userProfile = new User({
//   useremail: 'middpeyton@gmail.com',
//   books: [
//     {name: 'Spiderman',
//     description: 'Superhero',
//     status: 'Have not read'},
//     {name: 'Lord of the Rings',
//     description: 'Fantasy',
//     status: 'Have read'}, 
//     {name: 'Harry Potter',
//     description: 'Fantasy',
//     status: 'Have read'}]
// });

// userProfile.save().then(() => console.log('successful connection'));

  // TODO: 
  // STEP 1: get the jwt from the headers
  // STEP 2. use the jsonwebtoken library to verify that it is a valid jwt
  // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
  // STEP 3: to prove that everything is working correctly, send the opened jwt back to the front-end

  function verifyToken(token, callback) {
    jwt.verify(token, getKey, {}, function(err, user) {
      if(err){
       console.error('Something went wrong.');
       return callback(err);
  }
  callback(user);

  })
}

app.get('/books', async (request, response) => {

  console.log(request.headers);

  const token = request.headers.authorization.split(' ')[1];
  console.log(token);

  verifyToken(token, findBooks);

  async function findBooks(user) {

    console.log(user);

    const email = user.email;
    const name = user.name;

    await UserImport.UserModel.find({ username: name }, (err, person) => {
      if (err) console.error(err);
      if(!person.length){
      person[0] = { username: name, useremail: email, books: []}
      const newPerson = new UserImport.UserModel(person[0])
      console.log(newPerson);
      newPerson.save().then(() => console.log('successfully saved person'));
      }
      
      console.log(person[0]);
    response.send(person[0].books);
  });
}
});


app.post('/books', (request, response) => {

  let newTitle = request.query.bookTitle;
  let newAuthor = request.query.bookAuthor;

  const bookData = {name: newTitle, author: newAuthor}
  const token = request.headers.authorization.split(' ')[1];

  verifyToken(token, addBook);

  async function addBook(user) {

    let usersFromDB = await UserImport.UserModel.find({ useremail: user.email });
    console.log(usersFromDB);
    let newBook = await UserImport.BookModel.create(bookData);

    console.log(newBook);

    usersFromDB[0].books.push(newBook);

    await usersFromDB[0].save();

    response.send(usersFromDB[0].books);
  }
});

app.delete('/books/:bookId', (request, response) => {
  const bookName = request.params.bookId;

  verifyToken(token, deleteBook);

  async function deleteBook(user) {

    console.log(user)

    let usersFromDB = await UserImport.UserModel.find({ useremail: user.email });

    let singleUser = usersFromDB[0];

    singleUser.books = singleUser.books.filter(book => bookName !== request.params.id);

    singleUser.save().then(userData => {
      console.log(userData.books)
      response.send(userData.books);
    });
  }
})



//   try{
//     let booksFromDB = await User.find({});
//     response.send(booksFromDB)
//     console.log(booksFromDB)
//   } catch (e) {
//     response.status(500).send('Something is broken!')
//   }
// });

// books: [ {name: 'Book1', description: 'A goodbook', status: 'read'}, {name: 'Book2', description: 'A badbook', status: 'unread'} ]

app.listen(PORT, () => console.log(`listening on ${PORT}`));
