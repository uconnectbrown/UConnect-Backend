// Checks for empty string
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

// Checks for valid edit request
const validEdit = (data) => {
  if (data === undefined || data === null) return false;
  else return true;
};

// Checks for valid email
const isEmail = (email) => {
  const regEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const compare = (a1, a2) => a1.filter((v) => a2.includes(v)).length;

exports.compScore = (me, students) => {
  let mW = 10; // major
  let iW = 5; // interests
  let inW = 10; // instruments
  let puW = 10; // pick up sports
  let pW = 10; // pets
  let cW = 5; // courses
  let compScores = students.map((student) => {
    let compScore = 0;
    compScore += student.classYear === me.classYear ? 20 : 0;
    compScore +=
      mW * compare(me.majors.filter(Boolean), student.majors.filter(Boolean));
    compScore +=
      student.varsitySports.filter(Boolean).length > 0 &&
      me.varsitySports.filter(Boolean).length > 0
        ? 20
        : 0;
    compScore += student.greekLife && me.greekLife ? 10 : 0;
    compScore +=
      iW *
      (compare(me.interests1, student.interests1) +
        compare(me.interests2, student.interests2) +
        compare(me.interests3, student.interests3));
    compScore +=
      inW *
      compare(
        me.instruments.filter(Boolean),
        student.instruments.filter(Boolean)
      );
    compScore +=
      puW *
      compare(
        me.pickUpSports.filter(Boolean),
        student.pickUpSports.filter(Boolean)
      );
    compScore +=
      pW * compare(me.pets.filter(Boolean), student.pets.filter(Boolean));
    let courseOverlap = compare(
      me.courses.map((course) => course.code).filter(Boolean),
      student.courses.map((course) => course.code).filter(Boolean)
    );
    compScore += cW * courseOverlap;

    return {
      score: compScore,
      emailId: student.email.split("@")[0],
      imageUrl: student.imageUrl,
      name: student.firstName + " " + student.lastName,
      classYear: student.classYear,
      majors: student.majors,
    };
  });
  return compScores.sort((a, b) =>
    a["score"] < b["score"] ? 1 : b["score"] < a["score"] ? -1 : 0
  );
};

exports.chooseRandom = (arr, num = 1) => {
  const res = [];
  for (let i = 0; i < num; ) {
    const random = Math.floor(Math.random() * arr.length);
    if (res.indexOf(arr[random]) !== -1) {
      continue;
    }
    res.push(arr[random]);
    i++;
  }
  return res;
};

// Checks for valid signup data using above functions
exports.validateSignupData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.reduceUserDetails = (data) => {
  let userDetails = {};

  if (validEdit(data.classYear)) userDetails.classYear = data.classYear;
  if (validEdit(data.courses)) userDetails.courses = data.courses;
  if (validEdit(data.firstName)) userDetails.firstName = data.firstName;
  if (validEdit(data.lastName)) userDetails.lastName = data.lastName;
  if (validEdit(data.majors)) userDetails.majors = data.majors;
  if (validEdit(data.pronouns)) userDetails.pronouns = data.pronouns;
  if (validEdit(data.location)) userDetails.location = data.location;
  if (validEdit(data.bio)) userDetails.bio = data.bio;
  if (validEdit(data.groups)) userDetails.groups = data.groups;
  if (validEdit(data.varsitySports))
    userDetails.varsitySports = data.varsitySports;
  if (validEdit(data.greekLife)) userDetails.greekLife = data.greekLife;
  if (validEdit(data.interests1)) userDetails.interests1 = data.interests1;
  if (validEdit(data.interests2)) userDetails.interests2 = data.interests2;
  if (validEdit(data.interests3)) userDetails.interests3 = data.interests3;
  if (validEdit(data.instruments)) userDetails.instruments = data.instruments;
  if (validEdit(data.pickUpSports))
    userDetails.pickUpSports = data.pickUpSports;
  if (validEdit(data.pets)) userDetails.pets = data.pets;
  if (validEdit(data.favorites)) userDetails.favorites = data.favorites;
  return userDetails;
};
