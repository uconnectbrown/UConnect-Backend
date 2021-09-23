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

const compareMajors = (a1, a2) => {
  let m1 = [];
  a1.map((v) => {
    if (v.split("-").length === 1) {
      m1.push([v]);
    } else {
      m1.push([v.split("-")[0], v.split("-")[1]]);
    }
  });
  let m2 = [];
  a2.map((v) => {
    if (v.split("-").length === 1) {
      m2.push(v);
    } else {
      m2.push(v.split("-")[0]);
      m2.push(v.split("-")[1]);
    }
  });
  let overlap = 0;
  for (let i = 0; i < m1.length; i++) {
    overlap += m1[i].filter((v) => m2.includes(v)).length > 0 ? 1 : 0;
  }
  return overlap;
};

exports.compScore = (me, students) => {
  let mW = 6; // major
  let iW = 2 / 3; // interests
  let cW = 4; // courses
  let noise = [-5, -4, -3, -2, -1, 0, 1, 2];
  let compScores = students.map((student) => {
    let interestOverlap = 0;
    let courseOverlap = 0;
    let shareGreek, shareInstruments, sharePickUp, shareVarsity;
    let compScore = 0;
    compScore += student.classYear === me.classYear ? 4 : 0;
    compScore += Math.abs(student.classYear - me.classYear) > 1 ? -2 : 0;
    compScore +=
      mW *
      compareMajors(
        me.majors.filter(Boolean),
        student.majors.filter(Boolean)
      ) **
        0.5;
    compScore +=
      me.location.country !== "United States of America" &&
      me.location.country === student.location.country &&
      me.location.country
        ? 8
        : 0;
    compScore +=
      me.location.country === "United States of America" &&
      student.location.country === "United States of America" &&
      me.location.state === student.location.state &&
      me.location.state
        ? 6
        : 0;
    compScore +=
      student.varsitySports.filter(Boolean).length > 0 &&
      me.varsitySports.filter(Boolean).length > 0
        ? 6
        : 0;
    if (
      student.varsitySports.filter(Boolean).length > 0 &&
      me.varsitySports.filter(Boolean).length > 0
    ) {
      shareVarsity = true;
    } else {
      shareVarsity = false;
    }

    interestOverlap =
      compare(
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
      );
    compScore += iW * interestOverlap ** 2;

    courseOverlap = compare(
      me.courses.map((course) => course.code).filter(Boolean),
      student.courses.map((course) => course.code).filter(Boolean)
    );
    compScore += cW * courseOverlap ** 0.5;

    if (
      student.pickUpSports.filter(Boolean).length > 0 &&
      me.pickUpSports.filter(Boolean).length > 0
    ) {
      sharePickUp = true;
      compScore += 4;
    } else {
      sharePickUp = false;
    }
    if (
      student.instruments.filter(Boolean).length > 0 &&
      me.instruments.filter(Boolean).length > 0
    ) {
      shareInstruments = true;
      compScore += 4;
    } else {
      shareInstruments = false;
    }

    compatability =
      compScore > 1.25 ? Math.round(100 * (1 - 1.25 / compScore)) : 25;

    compatability += noise[Math.floor(Math.random() * noise.length)];

    compatability = Math.min(compatability, 99);

    return {
      score: compScore,
      compatability,
      emailId: student.email.split("@")[0],
      imageUrl: student.imageUrl,
      name: student.firstName + " " + student.lastName,
      classYear: student.classYear,
      majors: student.majors,
      status: "nil",
      interestOverlap: interestOverlap,
      courseOverlap: courseOverlap,
      shareVarsity: shareVarsity,
      sharePickUp: sharePickUp,
      shareInstruments: shareInstruments,
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
