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
  if (validEdit(data.preferredPronouns))
    userDetails.preferredPronouns = data.preferredPronouns;
  if (validEdit(data.bio)) userDetails.bio = data.bio;
  if (validEdit(data.groups)) userDetails.groups = data.groups;
  if (validEdit(data.varsitySports))
    userDetails.varsitySports = data.varsitySports;
  if (validEdit(data.greekLife)) userDetails.greekLife = data.greekLife;
  if (validEdit(data.interests1)) userDetails.interests1 = data.interests1;
  if (validEdit(data.interests2)) userDetails.interests2 = data.interests2;
  if (validEdit(data.interests3)) userDetails.interests3 = data.interests3;
  if (validEdit(data.instruments)) userDetails.instruments = data.instruments;
  return userDetails;
};
