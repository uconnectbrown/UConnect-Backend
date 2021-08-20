// Setup
const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");
app.use(cors());

const {
  // Strictly backend
  generateFeatured,

  // Others
  signup, // Welcome
  getFeatured, // Landing
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

  createEvent, //events

  signupDummies, // dummy
} = require("./handlers/routes");

// User routes

// Strictly backend
app.get("/generate", generateFeatured);

// Others
app.post("/signup", signup); // Welcome
app.get("/featured/:emailId", getFeatured); // Landing
app.get("/all/:email", getAll); // Landing
app.post("/request/:senderId/:receiverId", request); // Student
app.post("/accept/:senderId/:receiverId", accept); // Student
app.get("/status/:emailId/:studentId", checkStatus); // Student
app.get("/pending/:emailId", getPending); // Connections
app.get("/connections/:emailId", getConnections); // Connections
app.get("/messages/:emailId", getMessages); // Messages
app.get("/chat/:roomId", getChat); // Messages

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

app.post("/events", createEvent); // events
app.get("/events/:eventId", deleteEvent); // events
app.get("/events", getEvents); // events
app.post("/events/:supporterId/:eventId"), supportEvent; // events

// Dummy routes
app.get("/signupDummies", signupDummies); // signup

// Function deployment to API via Express
exports.api = functions.region("us-east4").https.onRequest(app);
