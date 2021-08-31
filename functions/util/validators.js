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

const compareMajors = (a1, a2) =>
  a1.filter((v) => a2.includes(v.split("-")[0]) || a2.includes(v.split("-")[1]))
    .length;

exports.compScore = (me, students) => {
  let mW = 8; // major
  let iW = 0.5; // interests
  let cW = 6; // courses
  let compScores = students.map((student) => {
    let compScore = 0;
    compScore += student.classYear === me.classYear ? 10 : 0;
    compScore += Math.abs(student.classYear - me.classYear) > 1 ? -10 : 0;
    compScore +=
      mW *
      compareMajors(
        me.majors.filter(Boolean),
        student.majors.filter(Boolean)
      ) **
        0.5;
    compScore +=
      student.varsitySports.filter(Boolean).length > 0 &&
      me.varsitySports.filter(Boolean).length > 0
        ? 6
        : 0;
    compScore += student.greekLife && me.greekLife ? 3 : 0;
    if (
      me.interests1.length + me.interests2.length + me.interests3.length ===
        9 &&
      student.interests1.length +
        student.interests2.length +
        student.interests3.length ===
        9
    ) {
      compScore +=
        iW *
        (compare(
          me.interests1.map((i) => i.interest),
          student.interests1.map((i) => i.interest)
        ) +
          compare(
            me.interests2.map((i) => i.interest),
            student.interests2.map((i) => i.interest)
          ) +
          compare(
            me.interests3.map((i) => i.interest),
            student.interests3.map((i) => i.interest)
          )) **
          2;
    }

    let courseOverlap = compare(
      me.courses.map((course) => course.code).filter(Boolean),
      student.courses.map((course) => course.code).filter(Boolean)
    );
    compScore += cW * courseOverlap ** 0.5;
    compScore += student.location === me.location ? 10 : 0;

    return {
      score: compScore,
      emailId: student.email.split("@")[0],
      imageUrl: student.imageUrl,
      name: student.firstName + " " + student.lastName,
      classYear: student.classYear,
      majors: student.majors,
      status: "nil",
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

exports.filterName = (fn, ln, query) => {
  fn = fn.toLowerCase().trim();
  ln = ln.toLowerCase().trim();
  query = query.toLowerCase().trim();
  if (fn.split(query)[0] === "") return true;
  if (ln === query) return true;
  if (query.split(" ").length === 2) {
    let query1 = query.split(" ")[0];
    let query2 = query.split(" ")[1];
    if (fn.split(query1)[0] === "" && ln.split(query2)[0] === "") return true;
  }
};
