// Setup
const { db, admin } = require("../util/admin");
const config = require("../util/config");
const { uuid } = require("uuidv4");
const firebase = require("firebase");
firebase.initializeApp(config);
const { validateSignupData, reduceUserDetails } = require("../util/validators");
const auth = firebase.auth();

// Sign user up
exports.signup = (req, res) => {
  const newUser = {
    affinitySports: req.body.affinitySports,
    bio: req.body.bio,
    class: req.body.class,
    courses: req.body.courses,
    email: req.body.email,
    favorites: req.body.favorites,
    firstName: req.body.firstName,
    greekLife: req.body.greekLife,
    groups: req.body.groups,
    interests: req.body.interests,
    lastName: req.body.lastName,
    majors: req.body.majors,
    preferredPronouns: req.body.preferredPronouns,
    varsitySports: req.body.varsitySports,
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
        affinitySports: newUser.affinitySports,
        bio: newUser.bio,
        class: newUser.class,
        courses: newUser.courses,
        favorites: newUser.favorites,
        firstName: newUser.firstName,
        greekLife: newUser.greekLife,
        groups: newUser.groups,
        interests: newUser.interests,
        lastName: newUser.lastName,
        majors: newUser.majors,
        preferredPronouns: newUser.preferredPronouns,
        varsitySports: newUser.varsitySports,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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
  db.collection("courses")
    .doc(courseCode)
    .collection("students")
    .get()
    .then((data) => {
      let students = [];
      data.forEach((doc) => {
        students.push(doc.data().userCardData.imageUrl);
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

  db.collection("courses")
    .doc(courseCode)
    .collection("students")
    .get()
    .then((data) => {
      let students = [];
      data.forEach((doc) => {
        students.push(doc.data().userCardData);
      });
      return res.json(students);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Get any user's details
exports.getUserDetails = (req, res) => {
  let userData = {};
  let emailId = req.params.email.split("@")[0];
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
  let courses = {};
  let firstName, lastName, classYear, imageUrl, email, greekLife;
  let majors = [];
  let interests = [];
  let groups = [];
  let affinitySports = [];
  let varsitySports = [];
  db.doc(`/profiles/${emailId}`)
    .get()
    .then((doc) => {
      courses = doc.data().courses;
      firstName = doc.data().firstName;
      lastName = doc.data().lastName;
      majors = doc.data().majors;
      interests = doc.data().interests;
      classYear = doc.data().class;
      imageUrl = doc.data().imageUrl;
      email = doc.data().email;
      groups = doc.data().groups;
      affinitySports = doc.data().affinitySports;
      greekLife = doc.data().greekLife;
      varsitySports = doc.data().varsitySports;
      return courses;
    })
    .then((courses) => {
      let courseCodes = courses
        .map((course) => course.courseCode.replace(/\s/g, ""))
        .filter((courseCode) => courseCode.length > 4);

      for (let i = 0; i < courseCodes.length; i++) {
        const userCardData = {
          firstName,
          lastName,
          majors,
          interests,
          classYear,
          imageUrl,
          email,
          groups,
          affinitySports,
          greekLife,
          varsitySports,
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
