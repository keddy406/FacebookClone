const functions = require('firebase-functions');
const admin = require('firebase-admin');
//add exrpess to make 4 method to do function individually
const express = require('express')
const app = express();

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//


const firebaseConfig = {
    apiKey: "AIzaSyDk5H5sU3BgyKEdIJZ7pkW98nC0N4cOicw",
    authDomain: "facebookclone-531c3.firebaseapp.com",
    databaseURL: "https://facebookclone-531c3.firebaseio.com",
    projectId: "facebookclone-531c3",
    storageBucket: "facebookclone-531c3.appspot.com",
    messagingSenderId: "51643556227",
    appId: "1:51643556227:web:00fd1d1cefd34831dd56b6"
  };
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);


//get database
app.get('/screams', (req, res) => {
    admin.firestore()
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            //create emty array and put all data in that
            let screams = [];
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                })
            })
            return res.json(screams);
        }).catch(error => console.error(error));
});



//create post
app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString(),
    };
    admin.firestore()
        .collection('screams')
        .add(newScream)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully` })
        })
        .catch((error) => {
            res.status(500).json({ error: 'something wrong' })
            console.error(error);
        });
});

//sign up route
app.post('/signup',(req, res)=>{
    const newUser ={
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };
    //TODO:validate data
    firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email,newUser.password)
    .then((data)=>{
        return res
        .status(201)
        .json({message:`user${data.user.uid} signed up successfully`});
    })
    .catch((error)=>{
        console.error(error);
        return res.status(500).json({error: error.code})
    })
})

//https://baseurl.com/api/ => change it  //tokyo region server
exports.api = functions.region('asia-northeast1').https.onRequest(app);