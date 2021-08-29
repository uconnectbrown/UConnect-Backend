// Setup
const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");
app.use(cors());

const {
  // Strictly backend
  generateFeatured,
  resetConnections,
  signupDummies,

  // Others
  signup, // Welcome
  getFeatured, // Landing
  requestFeatured, // Landing
  acceptFeatured, // Landing
  getAll, // Landing
  request, // Student
  accept, // Student
  checkStatus, // Student
  getPending, // Connections
  getConnections, // Connections
  getSenderInfo, // Message
  getMessages, // Messages
  getChat, //Messages

  uploadImage, // profileView
  editUserDetails, //profileView
  updateCourses, // profileView
  deleteCourse, // profileView
  getOwnCourses, // coursesView
  getAvatars, // coursesView
  getStudents, // courseView
  getUserDetails, // studentView
} = require("./handlers/routes");

// User routes

// Strictly backend
app.get("/generate", generateFeatured);
app.get("/reset", resetConnections);
app.get("/signupDummies", signupDummies); // signup

// Others
app.post("/signup", signup); // Profile Build
app.post("/edit/:emailId", editUserDetails); // Profile
app.get("/update/:emailId", updateCourses); // Profile

app.get("/featured/:emailId", getFeatured); // Landing
app.get("/reqfeatured/:senderId/:receiverId", requestFeatured); // Landing
app.get("/accfeatured/:senderId/:receiverId", acceptFeatured); // Landing

app.get("/all/:email", getAll); // Landing
app.post("/request/:senderId/:receiverId", request); // Student
app.post("/accept/:senderId/:receiverId", accept); // Student
app.get("/status/:emailId/:studentId", checkStatus); // Student
app.get("/pending/:emailId", getPending); // Connections
app.get("/connections/:emailId", getConnections); // Connections
app.get("/senderInfo/:email", getSenderInfo); // Messages
app.get("/messages/:emailId", getMessages); // Messages
app.get("/chat/:roomId", getChat); // Messages

app.post("/image/:email", uploadImage); // profileView
app.get("/delete/:email/:courseCode", deleteCourse); // profileView
app.get("/courses/:email", getOwnCourses); // coursesView
app.get("/avatars/:email/:courseCode", getAvatars); // coursesView
app.get("/students/:email/:courseCode", getStudents); // courseView
app.get("/user/:emailId", getUserDetails); // studentView
app.get("/messages/:email/:courseCode", getMessages); // messagesView

// app.post("/events", createEvent); // events
// app.get("/events/:eventId", deleteEvent); // events
// app.get("/events", getEvents); // events
// app.post("/events/:supporterId/:eventId"), supportEvent; // events

// Function deployment to API via Express
exports.api = functions.region("us-east4").https.onRequest(app);
