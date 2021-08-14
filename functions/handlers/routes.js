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
        promises.push(
          db
            .collection("profiles")
            .get()
            .then((data) => {
              let studentProfiles = [];
              let myProfile = {};
              data.forEach((doc) => {
                if (doc.id !== emailIds[i]) {
                  studentProfiles.push(doc.data());
                } else if (doc.id === emailIds[i]) {
                  myProfile = doc.data();
                }
              });
              let students = [];
              let scores = compScore(myProfile, studentProfiles);
              if (scores.length > 1000) {
                students = chooseRandom(
                  scores.slice(0, Math.ceil(scores.length / 10)),
                  10
                );
              } else if (scores.length > 100) {
                students = chooseRandom(scores.slice(0, 100, 10));
              } else {
                students = chooseRandom(scores, 10);
              }

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

// Other Routes

// Sign user up
exports.signup = (req, res) => {
  const newUser = {
    // Basic Info
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    classYear: req.body.classYear,
    majors: req.body.majors,
    preferredPronouns: req.body.preferredPronouns,
    email: req.body.email,
    // Interests
    interests1: req.body.interests1,
    interests2: req.body.interests2,
    interests3: req.body.interests3,
    // Courses
    courses: req.body.courses,
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
        preferredPronouns: newUser.preferredPronouns,
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
        pets: ["", "", ""],
        favorites: { book: "", movie: "", show: "", artist: "" },
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

// Get featured profiles
exports.getFeatured = (req, res) => {
  let emailId = req.params.email.split("@")[0];
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

// Get pending requests
exports.getPending = (req, res) => {
  let emailId = req.params.email.split("@")[0];
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

// Get all students in UConnect
exports.getAll = (req, res) => {
  let email = req.params.email;
  db.collection("profiles")
    .get()
    .then((data) => {
      let students = [];
      data.forEach((doc) => {
        if (doc.data().email !== email) {
          students.push(doc.data());
        }
      });
      return res.json(students);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Send a request
exports.request = (req, res) => {
  let senderId = req.params.sender.split("@")[0];
  let receiverId = req.params.receiver.split("@")[0];

  let promises = [
    db
      .collection("profiles")
      .doc(senderId)
      .collection("sent")
      .doc(receiverId)
      .set({ sent: new Date().toISOString() }),

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
  let senderId = req.params.sender.split("@")[0];
  let receiverId = req.params.receiver.split("@")[0];
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
      .set({}),

    db
      .collection("profiles")
      .doc(senderId)
      .collection("connections")
      .doc(receiverId)
      .set({}),
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

// Check incoming
exports.checkInc = (req, res) => {
  let emailId = req.params.emailId;
  let studentId = req.params.studentId;
  db.collection("profiles")
    .doc(emailId)
    .collection("pending")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        if (doc.id === studentId) {
          return res.json(true);
        }
      });
    })
    .then(() => {
      return res.json(false);
    })
    .catch((err) => res.json({ error: err.code }));
};

// Check outgoing
exports.checkOut = (req, res) => {
  let emailId = req.params.emailId;
  let studentId = req.params.studentId;
  db.collection("profiles")
    .doc(studentId)
    .collection("pending")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        if (doc.id === emailId) {
          return res.json(true);
        }
      });
    })
    .then(() => {
      return res.json(false);
    })
    .catch((err) => res.json({ error: err.code }));
};

// Check connections
exports.checkCon = (req, res) => {
  let emailId = req.params.emailId;
  let studentId = req.params.studentId;
  db.collection("profiles")
    .doc(emailId)
    .collection("connections")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        if (doc.id === studentId) {
          return res.json(true);
        }
      });
    })
    .then(() => {
      return res.json(false);
    })
    .catch((err) => res.json({ error: err.code }));
};

// Get connections
exports.getConnections = (req, res) => {
  let emailId = req.params.email.split("@")[0];
  let connections = [];
  db.collection("profiles")
    .doc(emailId)
    .collection("connections")
    .get()
    .then((data) => {
      data.forEach((doc) => {
        connections.push(doc.id);
      });
      return res.json({ connections });
    })
    .catch((err) => {
      return res.json({ error: err.code });
    });
};

// Edit user details
exports.editUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);
  let emailId = req.params.email.split("@")[0];
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
      let compScores = compScore(myProfile, studentProfiles);
      studentProfiles.forEach(function (element, index) {
        element.compScores = compScores[index];
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
  let emailId = req.params.email.split("@")[0];
  let promises = [];
  let firstName, lastName, classYear, imageUrl, email, greekLife;
  let majors = [];
  let varsitySports = [];
  let interests1 = [];
  let interests2 = [];
  let interests3 = [];
  let instruments = [];
  let pickUpSports = [];
  let pets = [];
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
      pets = doc.data().pets;
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
          pets,
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

// Delete course from database
exports.deleteCourse = (req, res) => {
  let emailId = req.params.email.split("@")[0];
  let courseCode = req.params.courseCode;
  db.collection("courses")
    .doc(courseCode)
    .collection("students")
    .doc(emailId)
    .delete()
    .then(() => {
      return res.json({ messages: "Course successfully deleted" });
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

// Get all messages in given course
exports.getMessages = (req, res) => {
  let courseCode = req.params.courseCode;
  let emailId = req.params.email.split("@")[0];
  db.collection("profiles")
    .doc(emailId)
    .collection(`${courseCode} messages`)
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
      preferredPronouns: "",
      email: `${firstName_}@brown.edu`,
      // Interests
      interests1: [1, 2, 3].map(
        (index) => interests1_[Math.floor(Math.random() * interests1_.length)]
      ),
      interests2: [1, 2, 3, 4].map(
        (index) => interests2_[Math.floor(Math.random() * interests2_.length)]
      ),
      interests3: [1, 2, 3].map(
        (index) => interests3_[Math.floor(Math.random() * interests3_.length)]
      ),
      // Courses
      courses: [
        { code: "CODE 0001", color: "#16a085", name: "Class 1" },
        { code: "CODE 0002", color: "#16a085", name: "Class 2" },
        { code: "CODE 0003", color: "#16a085", name: "Class 3" },
        { code: "CODE 0004", color: "#16a085", name: "Class 4" },
        { code: "", color: "", name: "" },
      ],
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) return res.status(400).json(errors);

    const noImg = "no-img.png";

    let emailId = newUser.email.split("@")[0];

    db.doc(`/profiles/${firstName_}`)
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
          preferredPronouns: newUser.preferredPronouns,
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
          pets: ["", "", ""],
          favorites: { book: "", movie: "", show: "", artist: "" },
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
          pets: userCredentials.pets,
          courses: userCredentials.courses,
        };

        promises = [
          db.doc(`/profiles/${emailId}`).set(userCredentials),
          db
            .collection("courses")
            .doc(`CODE0001`)
            .collection("students")
            .doc(firstName_)
            .set({ userCardData }),
          db
            .collection("courses")
            .doc(`CODE0002`)
            .collection("students")
            .doc(firstName_)
            .set({ userCardData }),
          db
            .collection("courses")
            .doc(`CODE0003`)
            .collection("students")
            .doc(firstName_)
            .set({ userCardData }),
          db
            .collection("courses")
            .doc(`CODE0004`)
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
        return res.status(201).json({ message: "User successfully created" });
      })
      .catch((err) => {
        console.error(err);
      });
  }
};
