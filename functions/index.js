const functions = require('firebase-functions');

//add exrpess to make 4 method to do function individually
const express = require('express')
const app = express();

const { getAllScreams, postOneScream } = require("./handles/screams")
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const { signup, login } = require('./handles/users')
const FBAuth = require('./util/fbAuth')


//get database  //screams route
app.get('/screams', getAllScreams);

// post on scream
app.post('/scream', FBAuth, postOneScream);

//user routes
//sign up route
app.post('/signup', signup);
//login
app.post('/login', login);







//https://baseurl.com/api/ => change it  //tokyo region server
exports.api = functions.region('asia-northeast1').https.onRequest(app);