// Setup
const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");
app.use(cors());

const {
  signup, // signup
  uploadImage, // profileView
  editUserDetails, //profileView
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
app.post("/image/:email", uploadImage); // profileView
app.post("/edit/:email", editUserDetails); // profileView
app.get("/update/:email", updateCourses); // profileView
app.get("/delete/:email/:courseCode", deleteCourse); // profileView
app.get("/courses/:email", getOwnCourses); // coursesView
app.get("/avatars/:courseCode", getAvatars); // coursesView
app.get("/students/:courseCode", getStudents); // courseView
app.get("/user/:email", getUserDetails); // studentView
app.get("/senderInfo/:email", getSenderInfo); // messageView
app.get("/messages/:email/:courseCode", getMessages); // messagesView

// Function deployment to API via Express
exports.api = functions.region("us-east4").https.onRequest(app);
