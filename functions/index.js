// Setup
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const express = require("express");
const app = express();

// Cloud Functions

// get all profiles
app.get("/profiles", (req, res) => {
  admin
    .firestore()
    .collection("profiles")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let profiles = [];
      data.forEach((doc) => {
        profiles.push({
          profileId: doc.id,
          userHandle: doc.data().userHandle,
          email: doc.data().email,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(profiles);
    })
    .catch((err) => console.error(err));
});

// create new profile
app.post("/profile", (req, res) => {
  const newProfile = {
    userHandle: req.body.userHandle,
    email: req.body.email,
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection("profiles")
    .add(newProfile)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created succesfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

exports.api = functions.region("us-east1").https.onRequest(app);
