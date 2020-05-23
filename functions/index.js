const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//


//get database
exports.getScreams = functions.https.onRequest((req, res) => {
    admin.firestore().collection('screams').get()
        .then(data => {
            //create emty array and put all data in that
            let screams = [];
            data.forEach(doc => {
                screams.push(doc.data())
            })
            return res.json(screams);
        }).catch(error => console.error(error));
})
//create post
exports.createScreams = functions.https.onRequest((req, res) => {
    if (req.method != 'POST') {
        return res.status(400).json({ error: 'method not allowed' })
    }
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