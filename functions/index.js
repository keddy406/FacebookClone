const functions = require('firebase-functions');

//add exrpess to make 4 method to do function individually
const express = require('express')
const app = express();

const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnscream,
    likeScream,
    unlikeScream,
    deletedScream }
    = require("./handles/screams")


const FBAuth = require('./util/fbAuth')
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser }
    = require('./handles/users')




//get database  //screams route
app.get('/screams', getAllScreams);
// post on scream
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream)
app.delete('/scream/:screamId', FBAuth, deletedScream)
app.get('/scream/:screamId/like', FBAuth, likeScream)
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream)
app.post('/scream/:screamId/comment', FBAuth, commentOnscream)

//user routes
//sign up route
app.post('/signup', signup);
//login
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)






//https://baseurl.com/api/ => change it  //tokyo region server
exports.api = functions.region('asia-northeast1').https.onRequest(app);