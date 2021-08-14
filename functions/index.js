// Setup
const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");
app.use(cors());

const {
  // Strictly backend
  generateFeatured,

  // Others
  signup, // signup
  getFeatured, // landing
  getPending, // connections
  getConnections, // connections
  getAll, // universityView
  request, // studentView
  accept, // studentView
  checkInc, //studentView
  checkOut, //studentView
  checkCon, //studentView
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
  signupDummies, // dummy
} = require("./handlers/routes");

// User routes

// Strictly backend
app.get("/generate", generateFeatured);

// Others
app.post("/signup", signup); // signup
app.get("/featured/:email", getFeatured); // landing
app.get("/pending/:email", getPending); // connections
app.get("/connections/:email", getConnections); // connections
app.get("/all/:email", getAll); // universityView
app.post("/request/:sender/:receiver", request); // studentView
app.get("/accept/:sender/:receiver", accept); // landing
app.get("/inc/:emailId/:studentId", checkInc); // studentView
app.get("/out/:emailId/:studentId", checkOut); // studentView
app.get("/con/:emailId/:studentId", checkCon); // studentView
app.get("/all/:email", getAll); // universityView
app.post("/image/:email", uploadImage); // profileView
app.post("/edit/:email", editUserDetails); // profileView
app.get("/update/:email", updateCourses); // profileView
app.get("/delete/:email/:courseCode", deleteCourse); // profileView
app.get("/courses/:email", getOwnCourses); // coursesView
app.get("/avatars/:email/:courseCode", getAvatars); // coursesView
app.get("/students/:email/:courseCode", getStudents); // courseView
app.get("/user/:emailId", getUserDetails); // studentView
app.get("/senderInfo/:email", getSenderInfo); // messageView
app.get("/messages/:email/:courseCode", getMessages); // messagesView

// Dummy routes
app.get("/signupDummies", signupDummies); // signup

// Function deployment to API via Express
exports.api = functions.region("us-east4").https.onRequest(app);
