// Setup
const { db, admin } = require("../util/admin");
const config = require("../util/config");
const { uuid } = require("uuidv4");
const firebase = require("firebase");
firebase.initializeApp(config);

// Resources
const {
  compScore,
  validateSignupData,
  reduceUserDetails,
  chooseRandom,
  filterName,
} = require("../util/validators");

// Dummy user generation
const {
  firstNames,
  lastNames,
  classYears,
  majors_,
  interests1_,
  interests2_,
  interests3_,
} = require("../util/dummyInfo");

// ROUTES START HERE

// Strictly Backend

// Delete all pending, statuses, sent, connections
exports.resetConnections = (req, res) => {
  let promises = [];
  let emailIds = [];
  db.collection("profiles")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        emailIds.push(doc.id);
      });
      return emailIds;
    })

    .then((emailIds) => {
      for (let i = 0; i < emailIds.length; i++) {
        promises.push(
          db
            .collection("profiles")
            .doc(emailIds[i])
            .collection("statuses")
            .delete()
        );
        promises.push(
          db
            .collection("profiles")
            .doc(emailIds[i])
            .collection("connections")
            .delete()
        );
        promises.push(
          db.collection("profiles").doc(emailIds[i]).collection("sent").delete()
        );
        promises.push(
          db
            .collection("profiles")
            .doc(emailIds[i])
            .collection("pending")
            .delete()
        );
      }
      return promises;
    })
    .then((promises) => {
      Promise.all(promises);
    })
    .then(() => {
      return res.json({ message: "Connections reset successfully" });
    })
    .catch((err) => {
      res.json({ error: err.code });
    });
};

// Generate featured profiles
exports.generateFeatured = (req, res) => {
  let emailIds = [];
  let promises = [];
  db.collection("profiles")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        emailIds.push(doc.id);
      });
      return emailIds;
    })
    .then((emailIds) => {
      for (let i = 0; i < emailIds.length; i++) {
        let notValid = [];
        db.collection("profiles")
          .doc(emailIds[i])
          .collection("statuses")
          .get()
          .then((data) => {
            data.forEach((doc) => {
              notValid.push(doc.id);
            });
          });
        promises.push(
          db
            .collection("profiles")
            .get()
            .then((data) => {
              let studentProfiles = [];
              let myProfile = {};
              data.forEach((doc) => {
                if (doc.id !== emailIds[i] && !notValid.includes(doc.id)) {
                  studentProfiles.push(doc.data());
                } else if (doc.id === emailIds[i]) {
                  myProfile = doc.data();
                }
              });
              let students = [];
              let scores = compScore(myProfile, studentProfiles);
              students = chooseRandom(scores.slice(0, 3), 3);
              return students;
            })
            .then((students) => {
              return db.collection("profiles").doc(emailIds[i]).update({
                featured: students,
              });
            })
        );
      }
      return promises;
    })
    .then((promises) => {
      Promise.all(promises);
    })
    .then(() => {
      return res.json({ message: "Featured profiles updated successfully" });
    })
    .catch((err) => {
      res.json({ error: err.code });
    });
};

// Generate featured profiles for new users
exports.newFeatured = (req, res) => {
  let emailId = req.params.emailId;
  db.collection("profiles")
    .get()
    .then((data) => {
      let studentProfiles = [];
      let myProfile = {};
      data.forEach((doc) => {
        if (doc.id !== emailId) {
          studentProfiles.push(doc.data());
        } else if (doc.id === emailId) {
          myProfile = doc.data();
        }
      });
      let students = [];
      let scores = compScore(myProfile, studentProfiles);
      students = chooseRandom(scores.slice(0, 3), 3);
      return students;
    })
    .then((students) => {
      return db.collection("profiles").doc(emailId).update({
        featured: students,
      });
    })
    .then(() => {
      return res.json({ message: "Featured profiles added successfully" });
    })
    .catch((err) => {
      res.json({ error: err.code });
    });
};

// Other Routes

// Sign user up
exports.signup = (req, res) => {
  const newUser = {
    // Basic Info
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    classYear: req.body.classYear,
    majors: req.body.majors,
    pronouns: req.body.pronouns,
    location: req.body.location,
    email: req.body.email,
    // Interests
    interests1: req.body.interests1,
    interests2: req.body.interests2,
    interests3: req.body.interests3,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = "no-img.png";

  let emailId = newUser.email.split("@")[0];

  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ email: "User exists" });
      }
    })
    .then(() => {
      const userCredentials = {
        // Basic Info
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        classYear: newUser.classYear,
        majors: newUser.majors,
        pronouns: newUser.pronouns,
        email: newUser.email,
        location: newUser.location,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        // Interests
        interests1: newUser.interests1,
        interests2: newUser.interests2,
        interests3: newUser.interests3,
        // Courses
        courses: [
          { code: "", name: "", color: "" },
          { code: "", name: "", color: "" },
          { code: "", name: "", color: "" },
          { code: "", name: "", color: "" },
          { code: "", name: "", color: "" },
        ],
        // Optional
        bio: "",
        varsitySports: ["", ""],
        groups: ["", "", ""],
        greekLife: "",
        instruments: ["", "", ""],
        pickUpSports: ["", "", ""],
        // Other
        requests: 3,
        firstTime: true,
      };

      return db.doc(`/profiles/${emailId}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ message: "User successfully created" });
    })
    .catch((err) => {
      console.error(err);
    });
};

// Finish onboarding
exports.onboardingDone = (req, res) => {
  let emailId = req.params.emailId;
  db.collection("profiles")
    .doc(emailId)
    .update({ firstTime: false })
    .then(() => { 
      return res.json({ message: "Onboarding complete"});
    })
    .catch((err) => {
      console.log(err);
    });
}

// Get featured profiles
exports.getFeatured = (req, res) => {
  let emailId = req.params.emailId;
  let featured = [];
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      featured = doc.data().featured;
      return res.json({ featured });
    })
    .catch((err) => {
      return res.json({ error: err.code });
    });
};

// Request featured
exports.requestFeatured = (req, res) => {
  let senderId = req.params.senderId;
  let receiverId = req.params.receiverId;
  let featured1 = [];
  let featured2 = [];
  let promises = [
    db
      .doc(`/profiles/${senderId}`)
      .get()
      .then((doc) => {
        return (featured1 = doc.data().featured);
      })
      .then((featured) => {
        for (let i = 0; i < featured.length; i++) {
          if (featured[i].emailId === receiverId) {
            featured[i].status = "out";
          }
        }
        return featured;
      })
      .then((featured) => {
        return db
          .collection("profiles")
          .doc(senderId)
          .update({ featured: featured });
      }),
    db
      .doc(`/profiles/${receiverId}`)
      .get()
      .then((doc) => {
        return (featured2 = doc.data().featured);
      })
      .then((featured) => {
        for (let i = 0; i < featured.length; i++) {
          if (featured[i].emailId === senderId) {
            featured[i].status = "inc";
          }
        }
        return featured;
      })
      .then((featured) => {
        return db
          .collection("profiles")
          .doc(receiverId)
          .update({ featured: featured });
      }),
  ];
  Promise.all(promises)
    .then(() => {
      res.json({ message: "Request sent successfully" });
    })
    .catch((err) => console.log(err));
};

// Accept featured
exports.acceptFeatured = (req, res) => {
  let senderId = req.params.senderId;
  let receiverId = req.params.receiverId;
  let featured1 = [];
  let featured2 = [];
  let promises = [
    db
      .doc(`/profiles/${receiverId}`)
      .get()
      .then((doc) => {
        return (featured1 = doc.data().featured);
      })
      .then((featured) => {
        for (let i = 0; i < featured.length; i++) {
          if (featured[i].emailId === senderId) {
            featured[i].status = "con";
          }
        }
        return featured;
      })
      .then((featured) => {
        return db
          .collection("profiles")
          .doc(receiverId)
          .update({ featured: featured });
      }),
    db
      .doc(`/profiles/${senderId}`)
      .get()
      .then((doc) => {
        return (featured2 = doc.data().featured);
      })
      .then((featured) => {
        for (let i = 0; i < featured.length; i++) {
          if (featured[i].emailId === receiverId) {
            featured[i].status = "con";
          }
        }
        return featured;
      })
      .then((featured) => {
        return db
          .collection("profiles")
          .doc(senderId)
          .update({ featured: featured });
      }),
  ];
  Promise.all(promises)
    .then(() => {
      res.json({ message: "Request accepted successfully" });
    })
    .catch((err) => console.log(err));
};

// Get pending requests
exports.getPending = (req, res) => {
  let emailId = req.params.emailId;
  let pending = [];
  db.collection("profiles")
    .doc(emailId)
    .collection("pending")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        pending.push(doc.data());
      });
      return res.json({ pending });
    })
    .catch((err) => {
      return res.json({ error: err.code });
    });
};

// Get connections
exports.getConnections = (req, res) => {
  let emailId = req.params.emailId;
  let connections = [];
  db.collection("profiles")
    .doc(emailId)
    .collection("connections")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        connections.push(doc.data());
      });
      return res.json({ connections });
    })
    .catch((err) => {
      return res.json({ error: err.code });
    });
};

// Search by name
exports.searchName = (req, res) => {
  let email = req.params.email;
  let query = req.params.query;
  let myProfile = {};
  let studentProfiles = [];
  db.collection("profiles")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        if (doc.data().email !== email) {
          studentProfiles.push(doc.data());
        } else if (doc.data().email === email) {
          myProfile = doc.data();
        }
      });

      studentProfiles = studentProfiles.filter((student) =>
        filterName(student.firstName, student.lastName, query)
      );
      let scores = compScore(myProfile, studentProfiles);
      return res.json(scores);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Search connections
exports.searchConnections = (req, res) => {
  let emailId = req.params.emailId;
  let query = req.params.query;
  let studentProfiles = [];
  db.collection("profiles")
    .doc(emailId)
    .collection("connections")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        studentProfiles.push(doc.data());
      });
      studentProfiles = studentProfiles.filter((student) =>
        filterName(
          student.name.split(" ")[0],
          student.name.split(" ")[1],
          query
        )
      );
      return res.json(studentProfiles);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Search connections
exports.searchCourseName = (req, res) => {
  let email = req.params.email;
  let query = req.params.query;
  let code = req.params.code;
  let studentProfiles = [];
  db.collection("courses")
    .doc(code)
    .collection("students")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        if (doc.data().userCardData.email !== email) {
          studentProfiles.push(doc.data().userCardData);
        }
      });
      studentProfiles = studentProfiles.filter((student) =>
        filterName(student.firstName, student.lastName, query)
      );
      return res.json(studentProfiles);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Search by field
exports.searchField = (req, res) => {
  let email = req.params.email;
  let options = req.body.options;
  let param = req.body.param;
  let myProfile = {};
  let studentProfiles = [];
  db.collection("profiles")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        if (doc.data().email !== email) {
          studentProfiles.push(doc.data());
        } else if (doc.data().email === email) {
          myProfile = doc.data();
        }
      });
      studentProfiles = studentProfiles.filter((student) => {
        if (student[param].length > 1) {
          return options.filter((v) => student[param].includes(v)).length > 0;
        } else return options.includes(student[param]);
      });
      let scores = compScore(myProfile, studentProfiles);
      return res.json(scores);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Search by field in course
exports.searchCourseField = (req, res) => {
  let email = req.params.email;
  let code = req.params.code;
  let options = req.body.options;
  let param = req.body.param;
  let studentProfiles = [];
  db.collection("courses")
    .doc(code)
    .collection("students")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        if (doc.data().userCardData.email !== email) {
          studentProfiles.push(doc.data().userCardData);
        }
      });
      studentProfiles = studentProfiles.filter((student) => {
        if (student[param].length > 1) {
          return options.filter((v) => student[param].includes(v)).length > 0;
        } else return options.includes(student[param]);
      });
      return res.json(studentProfiles);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Send a request
exports.request = (req, res) => {
  let senderId = req.params.senderId;
  let receiverId = req.params.receiverId;

  let promises = [
    db
      .collection("profiles")
      .doc(senderId)
      .collection("sent")
      .doc(receiverId)
      .set({ sent: new Date().toISOString() }),

    db
      .collection("profiles")
      .doc(senderId)
      .collection("statuses")
      .doc(receiverId)
      .set({ status: "out" }),

    db
      .collection("profiles")
      .doc(receiverId)
      .collection("statuses")
      .doc(senderId)
      .set({ status: "inc" }),

    db
      .collection("profiles")
      .doc(receiverId)
      .collection("pending")
      .doc(senderId)
      .set({
        sent: new Date().toISOString(),
        emailId: senderId,
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        classYear: req.body.classYear,
      }),

    db
      .collection("profiles")
      .doc(senderId)
      .update({ requests: admin.firestore.FieldValue.increment(-1) }),
  ];

  Promise.all([promises])
    .then(() => {
      return res.json({ messages: "Request sent successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Accept request
exports.accept = (req, res) => {
  let senderId = req.params.senderId;
  let receiverId = req.params.receiverId;
  let promises = [
    db
      .collection("profiles")
      .doc(receiverId)
      .collection("pending")
      .doc(senderId)
      .delete(),

    db
      .collection("profiles")
      .doc(receiverId)
      .collection("connections")
      .doc(senderId)
      .set({
        emailId: senderId,
        name: req.body.senderName,
        imageUrl: req.body.senderImageUrl,
        classYear: req.body.senderClassYear,
      }),

    db
      .collection("profiles")
      .doc(senderId)
      .collection("connections")
      .doc(receiverId)
      .set({
        emailId: receiverId,
        name: req.body.receiverName,
        imageUrl: req.body.receiverImageUrl,
        classYear: req.body.receiverClassYear,
      }),

    db
      .collection("profiles")
      .doc(receiverId)
      .collection("statuses")
      .doc(senderId)
      .set({ status: "con" }),

    db
      .collection("profiles")
      .doc(senderId)
      .collection("statuses")
      .doc(receiverId)
      .set({ status: "con" }),

      db
      .collection("profiles")
      .doc(senderId)
      .update({ requests: admin.firestore.FieldValue.increment(1) }),
  ];
  Promise.all([promises])
    .then(() => {
      return res.json({ messages: "Request accepted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Check status
exports.checkStatus = (req, res) => {
  let emailId = req.params.emailId;
  let studentId = req.params.studentId;
  db.collection("profiles")
    .doc(emailId)
    .collection("statuses")
    .doc(studentId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.json(doc.data().status);
      } else return res.json("nil");
    })
    .catch((err) => res.json({ error: err.code }));
};

// Edit user details
exports.editUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);
  let emailId = req.params.emailId;
  db.doc(`/profiles/${emailId}`)
    .update(userDetails)
    .then(() => {
      return res.json({ messages: "Details edited succesfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// // Create event
// exports.createEvent = (req, res) => {
//   let eventId = uuid();
//   db.collection("events")
//     .doc(`${eventId}`)
//     .set({
//       name: req.body.name,
//       date: req.body.date,
//       location: req.body.location,
//       postedBy: req.body.postedBy,
//       hostedBy: req.body.hostedBy,
//     })
//     .then(() => {
//       return res.json({ messages: "Event created succesfully" });
//     })
//     .catch((err) => res.json({ error: err.code }));
// };

// // Delete event
// exports.deleteEvent = (req, res) => {
//   let eventId = req.params.eventId;
//   db.collection("events")
//     .doc(`${eventId}`)
//     .delete()
//     .then(() => {
//       return res.json({ messages: "Event deleted succesfully" });
//     })
//     .catch((err) => res.json({ error: err.code }));
// };

// // Get events
// exports.getEvents = (res) => {
//   db.collection("events")
//     .get()
//     .then((data) => {
//       let events = [];
//       data.forEach((doc) => {
//         events.push(doc.data());
//       });
//       return res.json(events);
//     })
//     .catch((err) => res.json({ error: err.code }));
// };

// // Support event
// exports.supportEvent = (req, res) => {
//   let eventId = req.params.eventId;
//   let supporterId = req.params.supporterId;
//   db.collection("events")
//     .doc(`${eventId}`)
//     .collection("fans")
//     .doc(`${supporterId}`)
//     .set({
//       sent: new Date().toISOString(),
//       emailId: supproterId,
//       name: req.body.name,
//       imageUrl: req.body.imageUrl,
//       classYear: req.body.classYear,
//     })
//     .then(() => {
//       return res.json({ messages: "Event supported succesfully" });
//     })
//     .catch((err) => res.json({ error: err.code }));
// };

// Get own user's courses
exports.getOwnCourses = (req, res) => {
  let courses = [];
  let emailId = req.params.email.split("@")[0];
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        courses = doc.data().courses;
        return res.json(courses);
      } else {
        return res.status(404).json({ error: "Courses not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Get all avatars in a given course
exports.getAvatars = (req, res) => {
  let courseCode = req.params.courseCode;
  let email = req.params.email;
  db.collection("courses")
    .doc(courseCode)
    .collection("students")
    .get()
    .then((data) => {
      let students = [];
      data.forEach((doc) => {
        if (doc.data().userCardData.email !== email) {
          students.push(doc.data().userCardData.imageUrl);
        }
      });
      return res.json(students);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Get all students in given course
exports.getStudents = (req, res) => {
  let courseCode = req.params.courseCode;
  let email = req.params.email;

  db.collection("courses")
    .doc(courseCode)
    .collection("students")
    .get()
    .then((data) => {
      let studentProfiles = [];
      let myProfile = {};
      data.forEach((doc) => {
        if (doc.data().userCardData.email !== email) {
          studentProfiles.push(doc.data().userCardData);
        } else if (doc.data().userCardData.email === email) {
          myProfile = doc.data().userCardData;
        }
      });
      return res.json(studentProfiles);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Get any user's details
exports.getUserDetails = (req, res) => {
  let userData = {};
  let emailId = req.params.emailId;
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return res.json(userData);
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Update courses
exports.updateCourses = (req, res) => {
  let emailId = req.params.emailId;
  let promises = [];
  let firstName, lastName, classYear, imageUrl, email, greekLife;
  let majors = [];
  let varsitySports = [];
  let interests1 = [];
  let interests2 = [];
  let interests3 = [];
  let instruments = [];
  let courses = [];
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      firstName = doc.data().firstName;
      lastName = doc.data().lastName;
      classYear = doc.data().classYear;
      imageUrl = doc.data().imageUrl;
      email = doc.data().email;
      greekLife = doc.data().greekLife;
      majors = doc.data().majors;
      varsitySports = doc.data().varsitySports;
      interests1 = doc.data().interests1;
      interests2 = doc.data().interests2;
      interests3 = doc.data().interests3;
      instruments = doc.data().instruments;
      pickUpSports = doc.data().pickUpSports;
      courses = doc.data().courses;
      return courses;
    })
    .then((courses) => {
      let courseCodes = courses
        .map((course) => course.code.replace(/\s/g, ""))
        .filter((courseCode) => courseCode.length > 4);
      for (let i = 0; i < courseCodes.length; i++) {
        const userCardData = {
          firstName,
          lastName,
          classYear,
          imageUrl,
          email,
          greekLife,
          majors,
          varsitySports,
          interests1,
          interests2,
          interests3,
          instruments,
          pickUpSports,
          courses,
        };
        promises.push(
          db
            .collection("courses")
            .doc(`${courseCodes[i]}`)
            .collection("students")
            .doc(emailId)
            .set({ userCardData })
        );
      }
      return promises;
    })
    .then((promises) => {
      Promise.all([promises]);
    })
    .then(() => {
      return res.json({ messages: "Courses updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Update varsity
exports.updateVarsity = (req, res) => {
  let emailId = req.params.emailId;
  let promises = [];
  let varsitySports = [];
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      varsitySports = doc.data().varsitySports;
      return varsitySports;
    })
    .then((sports) => {
      let sportIds = sports
        .map((sport) => sport.replace(/\s/g, ""))
        .filter((sport) => sport.length > 1);
      for (let i = 0; i < sportIds.length; i++) {
        const userCardData = {
          emailId,
        };
        promises.push(
          db
            .collection("varsitySports")
            .doc(`${sportIds[i]}`)
            .collection("profiles")
            .doc(emailId)
            .set({ userCardData }),

          db
            .collection("varsitySports")
            .doc(`${sportIds[i]}`)
            .set({ dummy: true })
        );
      }
      return promises;
    })
    .then((promises) => {
      Promise.all([promises]);
    })
    .then(() => {
      return res.json({ messages: "Varsity sports updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Delete user from varsitySport
exports.deleteVarsity = (req, res) => {
  let emailId = req.params.emailId;
  let sportId = req.params.sportId;
  db.collection("varsitySports")
    .doc(sportId)
    .collection("profiles")
    .doc(emailId)
    .delete()
    .then(() => {
      return res.json({
        messages: "User successfully removed from varsity sport",
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Delete user from course
exports.deleteCourse = (req, res) => {
  let emailId = req.params.emailId;
  let courseCode = req.params.courseCode;
  db.collection("courses")
    .doc(courseCode)
    .collection("students")
    .doc(emailId)
    .delete()
    .then(() => {
      return res.json({ messages: "User successfully removed from course" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// TODO: delete previously uploaded images from storage
// Upload profile picture
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  const emailId = req.params.email.split("@")[0];

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};
  // string for image token
  let generatedToken = uuid();

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    let imageUrl;
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
            // generate token to be appended to imageUrl
            firebaseStorageDownloadTokens: generatedToken,
          },
        },
      })
      .then(() => {
        // append token to url
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${generatedToken}`;
        return db.doc(`/profiles/${emailId}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ imageUrl });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong" });
      });
  });
  busboy.end(req.rawBody);
};

// Get all messages for current user
exports.getMessages = (req, res) => {
  let emailId = req.params.emailId;
  db.collection("profiles")
    .doc(emailId)
    .collection("messages")
    .orderBy("mostRecent", "desc")
    .get()
    .then((data) => {
      let messages = [];
      data.forEach((doc) => {
        messages.push(doc.data());
      });
      return res.json(messages);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Get all messages in given chat room
exports.getChat = (req, res) => {
  let roomId = req.params.roomId;
  db.collection("messages")
    .doc(roomId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let messages = [];
      data.forEach((doc) => {
        messages.push(doc.data());
      });
      return res.json(messages);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Get own user's sender info
exports.getSenderInfo = (req, res) => {
  const emailId = req.params.email.split("@")[0];
  let senderInfo = {};
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        senderInfo.firstName = doc.data().firstName;
        senderInfo.lastName = doc.data().lastName;
        senderInfo.imageUrl = doc.data().imageUrl;
        senderInfo.emailId = doc.data().email.split("@")[0];
        senderInfo.courses = doc.data().courses;
        return res.json(senderInfo);
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Dummy User Generation

// Sign user up
exports.signupDummies = (req, res) => {
  for (let i = 0; i < 50; i++) {
    const firstName_ =
      firstNames[Math.floor(Math.random() * firstNames.length)];
    const newUser = {
      // Basic Info
      firstName: firstName_,
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      classYear: classYears[Math.floor(Math.random() * classYears.length)],
      majors: [majors_[Math.floor(Math.random() * majors_.length)], "", ""],
      pronouns: "",
      email: `${firstName_}@brown.edu`.toLowerCase(),
      // Interests
      interests1: "",
      interests2: "",
      interests3: "",
      // Courses
      courses: [
        {
          code: "ECON 0110",
          color: "#16a085",
          name: "Principles of Economics",
        },
        { code: "", color: "", name: "" },
        { code: "", color: "", name: "" },
        { code: "", color: "", name: "" },
        { code: "", color: "", name: "" },
      ],
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) return res.status(400).json(errors);

    const noImg = "no-img.png";

    let emailId = newUser.email.split("@")[0];

    db.doc(`/profiles/${emailId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return res.status(400).json({ email: "User exists" });
        }
      })
      .then(() => {
        const userCredentials = {
          // Basic Info
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          classYear: newUser.classYear,
          majors: newUser.majors,
          pronouns: newUser.pronouns,
          email: newUser.email,
          createdAt: new Date().toISOString(),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
          // Interests
          interests1: newUser.interests1,
          interests2: newUser.interests2,
          interests3: newUser.interests3,
          // Courses
          courses: newUser.courses,
          // Optional
          bio: "",
          varsitySports: ["", ""],
          groups: ["", "", ""],
          greekLife: "",
          instruments: ["", "", ""],
          pickUpSports: ["", "", ""],
          // Miscellaneous
          firstTime: true,
        };
        const userCardData = {
          firstName: userCredentials.firstName,
          lastName: userCredentials.lastName,
          classYear: userCredentials.classYear,
          imageUrl: userCredentials.imageUrl,
          email: userCredentials.email,
          groups: userCredentials.groups,
          greekLife: userCredentials.greekLife,
          majors: userCredentials.majors,
          varsitySports: userCredentials.varsitySports,
          interests1: userCredentials.interests1,
          interests2: userCredentials.interests2,
          interests3: userCredentials.interests3,
          instruments: userCredentials.instruments,
          pickUpSports: userCredentials.pickUpSports,
          courses: userCredentials.courses,
        };

        promises = [
          db.doc(`/profiles/${emailId}`).set(userCredentials),
          db
            .collection("courses")
            .doc(`ECON0110`)
            .collection("students")
            .doc(firstName_)
            .set({ userCardData }),
        ];
        return promises;
      })
      .then((promises) => {
        Promise.all([promises]);
      })
      .then(() => {
        return res.status(201).json({ message: "Users successfully created" });
      })
      .catch((err) => {
        console.error(err);
      });
  }
};
