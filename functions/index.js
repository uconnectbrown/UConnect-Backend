// Setup
const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const cors = require("cors");
app.use(cors());

const {
  signup, // signup
  login, // login
  uploadImage, // profileView
  editUserDetails, //profileView
  getOwnDetails, // profileView
  updateCourses, // profileView
  deleteCourse, // profileView
  getOwnCourses, // coursesView
  getAvatars, // coursesView
  getStudents, // courseView
  getUserDetails, // studentView
  getSenderInfo, // messageView
  getMessages, // messagesView
} = require("./handlers/users");

// User routes
app.post("/signup", signup); // signup
app.post("/login", login); // login
app.post("/image", FBAuth, uploadImage); // profileView
app.post("/edit", FBAuth, editUserDetails); // profileView
app.get("/user", FBAuth, getOwnDetails); // profileView
app.get("/update", FBAuth, updateCourses); // profileView
app.get("/delete/:courseCode", FBAuth, deleteCourse); // profileView
app.get("/user/courses", FBAuth, getOwnCourses); // coursesView
app.get("/avatars/:courseCode", FBAuth, getAvatars); // coursesView
app.get("/students/:courseCode", FBAuth, getStudents); // courseView
app.get("/user/:emailId", FBAuth, getUserDetails); // studentView
app.get("/senderInfo", FBAuth, getSenderInfo); // messageView
app.get("/messages/:courseCode", FBAuth, getMessages); // messagesView

// Function deployment to API via Express
exports.api = functions.region("us-east4").https.onRequest(app);
