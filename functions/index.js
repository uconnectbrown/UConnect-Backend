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
  checkStatus, // studentView
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
app.get("/featured/:emailId", getFeatured); // landing
app.get("/pending/:emailId", getPending); // connections
app.get("/connections/:emailId", getConnections); // connections
app.get("/all/:email", getAll); // universityView
app.post("/request/:senderId/:receiverId", request); // studentView
app.post("/accept/:senderId/:receiverId", accept); // landing
app.get("/status/:emailId/:studentId", checkStatus); // studentView
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
