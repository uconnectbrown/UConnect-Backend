// imports and set up
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Cloud Functions

// get all Profiles
exports.getProfiles = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("profiles")
    .get()
    .then((data) => {
      let profiles = [];
      data.forEach((doc) => {
        profiles.push(doc.data());
      });
      return res.json(profiles);
    })
    .catch((err) => console.error(err));
});
