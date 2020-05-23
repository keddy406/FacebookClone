const functions = require('firebase-functions');
const admin = require('firebase-admin');
//add exrpess to make 4 method to do function individually
const express = require('express')
const app = express();

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

//get database
app.get('/screams',(req, res)=>{
    admin.firestore()
    .collection('screams')
    .orderBy('createdAt','desc')
    .get()
    .then(data => {
        //create emty array and put all data in that
        let screams = [];
        data.forEach(doc => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle:doc.data().userHandle,
                createdAt: doc.data().createdAt,
            })
        })
        return res.json(screams);
    }).catch(error => console.error(error));
});



//create post
app.post('/scream',(req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    };
    admin.firestore()
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` })
        })
        .catch(error => {
            res.status(500).json({ error: 'something wrong' })
            console.error(error);
        });
});


//https://baseurl.com/api/ => change it 
exports.api = functions.https.onRequest(app);