// Setup
const functions = require("firebase-functions");
const app = require("express")();
const cors = require("cors");
app.use(cors());

const {
  // Strictly backend
  generateFeatured,
  draftFeatured,
  signupDummies,
  refreshRequests,
  getEmails,
  getNotifications,

  // Others
  signup, // Welcome
  onboardingDone, //Home
  newFeatured, // Home
  getFeatured, // Home
  requestFeatured, // Home
  acceptFeatured, // Home
  undoFeatured, // Home
  searchName, // Home
  searchField, // Home
  request, // Student
  accept, // Student
  undoRequest, // Student
  checkStatus, // Student
  getPending, // Connections
  getConnections, // Connections

  getSenderInfo, // Message
  getMessages, // Messages
  getChat, //Messages

  uploadImage, // Profile
  editUserDetails, //Profile
  updateCourses, // Profile
  deleteCourse, // Profile
  updateVarsity, // Profile
  deleteVarsity, // Profile
  updatePickUp, // Profile
  deletePickUp, // Profile
  updateInstrument, // Profile
  deleteInstrument, // Profile

  getStudents, // courseView
  getUserDetails, // studentView
} = require("./handlers/routes");

// User routes

// Strictly backend
app.get("/generate", generateFeatured);
app.get("/draft", draftFeatured);
app.get("/getEmails", getEmails);

app.get("/signupDummies", signupDummies);
app.get("/refreshReq", refreshRequests);
app.get("/getNotis", getNotifications);

// Others
app.post("/signup", signup); // Profile Build
app.post("/edit/:emailId", editUserDetails); // Profile
app.get("/update/:emailId", updateCourses); // Profile
app.post("/image/:email", uploadImage); // Profile
app.get("/delete/:emailId/:courseCode", deleteCourse); // Profile
app.get("/updateV/:emailId", updateVarsity); // Profile
app.get("/deleteV/:emailId/:sportId", deleteVarsity); // Profile
app.get("/updateP/:emailId", updatePickUp); // Profile
app.get("/deleteP/:emailId/:sportId", deletePickUp); // Profile
app.get("/updateI/:emailId", updateInstrument); // Profile
app.get("/deleteI/:emailId/:instrumentId", deleteInstrument); // Profile
app.get("/newfeatured/:emailId", newFeatured); // Home
app.get("/featured/:emailId", getFeatured); // Home
app.get("/reqfeatured/:senderId/:receiverId", requestFeatured); // Home
app.get("/accfeatured/:senderId/:receiverId", acceptFeatured); // Home
app.get("/unfeatured/:senderId/:receiverId", undoFeatured); // Home

app.get("/searchName/:email/:query", searchName); // Home
app.post("/searchField/:email", searchField); // Home
app.get("/onboard/:emailId", onboardingDone); // Home

app.post("/request/:senderId/:receiverId", request); // Student
app.get("/undoRequest/:senderId/:receiverId", undoRequest); // Student
app.post("/accept/:senderId/:receiverId", accept); // Student
app.get("/status/:emailId/:studentId", checkStatus); // Student

app.get("/pending/:emailId", getPending); // Connections
app.get("/connections/:emailId", getConnections); // Connections

app.get("/senderInfo/:email", getSenderInfo); // Messages
app.get("/messages/:emailId", getMessages); // Messages
app.get("/chat/:roomId", getChat); // Messages

app.get("/students/:email/:courseCode", getStudents); // Course View
app.get("/user/:emailId", getUserDetails); // Profiles + Student

// app.post("/events", createEvent); // events
// app.get("/events/:eventId", deleteEvent); // events
// app.get("/events", getEvents); // events
// app.post("/events/:supporterId/:eventId"), supportEvent; // events

// Function deployment to API via Express
exports.api = functions.region("us-east4").https.onRequest(app);
