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

// Draft featured profiles
exports.draftFeatured = (req, res) => {
  let emailIds = [];
  let promises = [];
  let draft = [[{ a: "b" }, { b: "c" }]];
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
              console.log(students);

              students.push({ id: emailIds[i] });
              return draft.push(students);
            })
          // .then((students) => {
          //   return db.collection("profiles").doc(emailIds[i]).update({
          //     featured: students,
          //   });
          // })
        );
      }
      return promises;
    })
    .then((promises) => {
      Promise.all(promises);
    })
    .then(() => {
      return res.json({ results: draft });
    })
    // .then(() => {
    //   return res.json({ message: "Featured profiles updated successfully" });
    // })
    .catch((err) => {
      res.json({ error: err.code });
    });
};

// get all emails that currently having a pending request
exports.getNotifications = (req, res) => {
  let emailIds = [];
  let promises = [];
  let notis = [];
  return (
    db
      .collection("profiles")
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
              .collection("pending")
              .get()
              .then((data) => {
                if (data.size > 0) {
                  return emailIds[i] + "@brown.edu";
                }
              })
          );
        }
        return promises;
      })
      .then((promises) => {
        return Promise.all(promises);
      })
      .then((data) => {
        return res.json(data.filter(Boolean));
      })
      // .then(() => {
      //   return res.json({ message: "Featured profiles updated successfully" });
      // })
      .catch((err) => {
        res.json({ error: err.code });
      })
  );
};

// Get all emails
exports.getEmails = (req, res) => {
  let emails = [];
  db.collection("profiles")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        emails.push(doc.data().email);
      });
      return res.json(emails);
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
              students = chooseRandom(scores.slice(0, 16), 4);
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

// Test Comp Scores
exports.testCompScores = (req, res) => {
  db.collection("profiles")
    .get()
    .then((data) => {
      let studentProfiles = [];
      let myProfile = {};
      data.forEach((doc) => {
        if (doc.id !== "ethan_huang1") {
          studentProfiles.push(doc.data());
        } else if (doc.id === "ethan_huang1") {
          myProfile = doc.data();
        }
      });
      let scores = compScore(myProfile, studentProfiles);
      scores = scores.map((score) => score.compatability).sort();
      return res.json(scores);
    });
};

// Refresh requests
exports.refreshRequests = (req, res) => {
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
        promises.push(
          db.collection("profiles").doc(emailIds[i]).update({ requests: 5 })
        );
      }
      return promises;
    })
    .then((promises) => {
      Promise.all(promises);
    })
    .then(() => {
      return res.json({ message: "Requests updated successfully" });
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
        if (
          doc.id !== emailId &&
          doc.data().imageUrl !==
            "https://firebasestorage.googleapis.com/v0/b/uconnect-5eebd.appspot.com/o/no-img.png?alt=media"
        ) {
          studentProfiles.push(doc.data());
        } else if (doc.id === emailId) {
          myProfile = doc.data();
        }
      });
      let students = [];
      let scores = compScore(myProfile, studentProfiles);
      students = chooseRandom(scores.slice(0, 4), 4);
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
        requests: 10,
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
      return res.json({ message: "Onboarding complete" });
    })
    .catch((err) => {
      console.log(err);
    });
};

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

// Undo featured
exports.undoFeatured = (req, res) => {
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
            featured[i].status = "nil";
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
            featured[i].status = "nil";
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
      res.json({ message: "Request undone successfully" });
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
      .set({
        sent: new Date().toISOString(),
        emailId: receiverId,
        imageUrl: req.body.receiverImageUrl,
        name: req.body.receiverName,
        classYear: req.body.receiverClassYear,
      }),

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
// Undo a request
exports.undoRequest = (req, res) => {
  let senderId = req.params.senderId;
  let receiverId = req.params.receiverId;

  let promises = [
    db
      .collection("profiles")
      .doc(senderId)
      .collection("sent")
      .doc(receiverId)
      .delete(),

    db
      .collection("profiles")
      .doc(senderId)
      .collection("statuses")
      .doc(receiverId)
      .delete(),

    db
      .collection("profiles")
      .doc(receiverId)
      .collection("statuses")
      .doc(senderId)
      .delete(),

    db
      .collection("profiles")
      .doc(receiverId)
      .collection("pending")
      .doc(senderId)
      .delete(),

    db
      .collection("profiles")
      .doc(senderId)
      .update({ requests: admin.firestore.FieldValue.increment(1) }),
  ];

  Promise.all([promises])
    .then(() => {
      return res.json({ messages: "Request undone successfully" });
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
      .doc(senderId)
      .collection("sent")
      .doc(receiverId)
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

// Get all students in given course
exports.getStudents = (req, res) => {
  let courseCode = req.params.courseCode;
  let email = req.params.email;

  db.collection("courses")
    .doc("codes")
    .collection(courseCode)
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
            .doc("codes")
            .collection(`${courseCodes[i]}`)
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

exports.updateConnections = (req, res) => {
  let emailId = req.params.emailId;
  let promises = [];
  let connections = [];
  let imageUrl = req.body.imageUrl;
  let classYear = req.body.classYear;
  let name = req.body.name;
  db.collection("profiles")
    .doc(emailId)
    .collection("connections")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        connections.push(doc.id);
      });
      return connections;
    })
    .then((c) => {
      for (let i = 0; i < c.length; i++) {
        promises.push(
          db
            .collection("profiles")
            .doc(c[i])
            .collection("connections")
            .doc(emailId)
            .update({ imageUrl, name, classYear })
        );
      }
      return promises;
    })
    .then((promises) => {
      Promise.all([promises]);
    })
    .then(() => {
      return res.json({ messages: "Connections updated successfully" });
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
            .collection("ecs")
            .doc("varsitySports")
            .collection(`${sportIds[i]}`)
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
      return res.json({ messages: "Varsity sports updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Update pickup
exports.updatePickUp = (req, res) => {
  let emailId = req.params.emailId;
  let promises = [];
  let pickUpSports = [];
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      pickUpSports = doc.data().pickUpSports;
      return pickUpSports;
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
            .collection("ecs")
            .doc("pickUpSports")
            .collection(`${sportIds[i]}`)
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
      return res.json({ messages: "Pick up sports updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Update instrument
exports.updateInstrument = (req, res) => {
  let emailId = req.params.emailId;
  let promises = [];
  let instruments = [];
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      instruments = doc.data().instruments;
      return instruments;
    })
    .then((instruments) => {
      let instrumentIds = instruments
        .map((instrument) => instrument.replace(/\s/g, ""))
        .filter((instrument) => instrument.length > 1);
      for (let i = 0; i < instrumentIds.length; i++) {
        const userCardData = {
          emailId,
        };
        promises.push(
          db
            .collection("ecs")
            .doc("instruments")
            .collection(`${instrumentIds[i]}`)
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
      return res.json({ messages: "Instruments updated successfully" });
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
  db.collection("ecs")
    .doc("varsitySports")
    .collection(sportId)
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

// Delete user from pickUpSport
exports.deletePickUp = (req, res) => {
  let emailId = req.params.emailId;
  let sportId = req.params.sportId;
  db.collection("ecs")
    .doc("pickUpSports")
    .collection(sportId)
    .doc(emailId)
    .delete()
    .then(() => {
      return res.json({
        messages: "User successfully removed from pickup sport",
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Delete user from instrument
exports.deleteInstrument = (req, res) => {
  let emailId = req.params.emailId;
  let instrumentId = req.params.instrumentId;
  db.collection("ecs")
    .doc("instruments")
    .collection(instrumentId)
    .doc(emailId)
    .delete()
    .then(() => {
      return res.json({
        messages: "User successfully removed from instrument",
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
    .doc("codes")
    .collection(courseCode)
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
    // if (
    //   mimetype !== "image/jpeg" &&
    //   mimetype !== "image/jpg" &&
    //   mimetype !== "image/png" &&
    //   mimetype !== "image/heic" &&
    //   mimetype !== "image/heif"
    // ) {
    //   return res.status(400).json({ error: "Wrong file type submitted" });
    // }
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
    .orderBy("lastSent", "desc")
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
            .doc("codes")
            .collection("ECON0110")
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
