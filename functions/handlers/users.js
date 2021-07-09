// Setup
const { db, admin } = require("../util/admin");
const config = require("../util/config");
const { uuid } = require("uuidv4");
const firebase = require("firebase");
firebase.initializeApp(config);
const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails,
} = require("../util/validators");

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
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    preferredPronouns: req.body.preferredPronouns,
    varsitySports: req.body.varsitySports,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = "no-img.png";

  let token, userId;
  db.doc(`/profiles/${newUser.email}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ email: "this email is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
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
        userId,
      };

      return db.doc(`/profiles/${newUser.email}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};

// Log user in
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      } else return res.status(500).json({ error: err.code });
    });
};

// Edit user details
exports.editUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);
  db.doc(`/profiles/${req.user.email}`)
    .update(userDetails)
    .then(() => {
      return res.json({ messages: "Details edited succesfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Get all users
exports.getAllProfiles = (req, res) => {
  db.collection("profiles")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let profiles = [];
      data.forEach((doc) => {
        profiles.push({
          email: doc.data().email,
          class: doc.data().class,
        });
      });
      return res.json(profiles);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Get any user's details
exports.getUserDetails = (req, res) => {
  let userData = {};
  let fullEmail = req.params.emailId + "@brown.edu";
  db.doc(`/profiles/${fullEmail}`)
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

// Update courses
exports.updateCourses = (req, res) => {
  let courses = {};
  let promises = [];
  let firstName, lastName, classYear, imageUrl, email;
  let majors = [];
  let interests = [];
  db.doc(`/profiles/${req.user.email}`)
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
        };
        promises.push(
          db
            .collection("courses")
            .doc(`${courseCodes[i]}`)
            .collection("students")
            .doc(`${req.user.email}`)
            .set({ userCardData })
        );
      }
      console.log(courseCodes);
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
  let courseCode = req.params.courseCode;
  db.collection("courses")
    .doc(courseCode)
    .collection("students")
    .doc(req.user.email)
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
        return db.doc(`/profiles/${req.user.email}`).update({ imageUrl });
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
