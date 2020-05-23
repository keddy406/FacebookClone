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

const db = admin.firestore();



//get database
app.get('/screams', (req, res) => {
    db
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
    db
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
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };
    //TODO:validate data
    //check user exist
    let token,userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: 'this handle is already taken' })
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idtoken => {
            // let usercredentails store in database
            token= idtoken;
            const userCredentials = {
            handle: newUser.handle,
            email:newUser.email,
            createdAt:new Date().toISOString(),
            userId

            };
           return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(()=>{
            return res.status(201).json({token})
        })
        .catch(error => {
            console.error(error);
            //error code from postman get this error means email already in use
            if (error.code == "auth/email-already-in-use") {
                return res.status(400).json({ email: 'email is already in used' })
            }
            else {
                return res.status(500).json({ error: error.code });
            }
        })
});

//https://baseurl.com/api/ => change it  //tokyo region server
exports.api = functions.region('asia-northeast1').https.onRequest(app);