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

//validate data helper function
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
}
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

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
    //validate data
    let errors = {};
    if (isEmpty(newUser.email)) {
        errors.emiail = 'Must not be empty'
    } else if (!isEmail(newUser.email)) {
        errors.email = "Must be a valid address"
    }
    if (isEmpty(newUser.password)) errors.password = "Must not be empty";
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Password must match';
    if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";
    //print error message
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
    //check user exist
    let token, userId;
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
            token = idtoken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId

            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token })
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

//login
app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    let errors = [];
    if (isEmpty(user.email)) errors.email = 'Must not be empty'
    if (isEmpty(user.password)) errors.password = "Must not be empty"

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                return res.status(403).json({ general: 'Wrong credentials, please try again' })
            }else return res.status(500).json({ error: err.code });
        })
})

//https://baseurl.com/api/ => change it  //tokyo region server
exports.api = functions.region('asia-northeast1').https.onRequest(app);