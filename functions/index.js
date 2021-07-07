// Setup
const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const cors = require("cors");
app.use(cors());

const {
  signup,
  login,
  uploadImage,
  editUserDetails,
  getUserDetails,
  getAllProfiles,
  updateCourses,
  getStudents,
} = require("./handlers/users");

// User routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/image", FBAuth, uploadImage);
app.post("/edit", FBAuth, editUserDetails);
app.get("/user/:emailId", FBAuth, getUserDetails);
app.get("/profiles", getAllProfiles);
app.get("/update", FBAuth, updateCourses);
app.get("/course/:courseCode", FBAuth, getStudents);

// Function deployment to API via Express
exports.api = functions.region("us-east4").https.onRequest(app);
