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
  getOwnDetails,
  updateCourses,
  deleteCourse,
  getStudents,
  getMessages,
} = require("./handlers/users");

// User routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/image", FBAuth, uploadImage);
app.post("/edit", FBAuth, editUserDetails);
app.get("/user/:emailId", FBAuth, getUserDetails);
app.get("/update", FBAuth, updateCourses);
app.get("/course/:courseCode", FBAuth, getStudents);
app.get("/delete/:courseCode", FBAuth, deleteCourse);
app.get("/messages/:courseCode", FBAuth, getMessages);
app.get("/user", FBAuth, getOwnDetails);

// Function deployment to API via Express
exports.api = functions.region("us-east4").https.onRequest(app);
