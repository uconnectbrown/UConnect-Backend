// Setup
const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");
const {
  signup,
  login,
  uploadImage,
  editUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

// User routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/image", FBAuth, uploadImage);
app.post("/user", FBAuth, editUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

// Function deployment to API via Express
exports.api = functions.region("us-east1").https.onRequest(app);
