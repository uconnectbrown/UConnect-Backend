const admin = require("firebase-admin");
const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
admin.initializeApp();

const db = admin.firestore();

module.exports = { admin, db, functions, sgMail };
