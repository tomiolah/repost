const crypto = require('crypto');

const constants = require('./constants').crypto;

exports.createHash = async (password) => {
  const salt = await crypto.randomBytes(constants.saltSize);

  try {
    const hash = await crypto.pbkdf2Sync(
      password,
      salt,
      constants.iter,
      constants.hashSize,
      constants.hashAlgo,
    );

    return Buffer.concat([hash, salt]).toString('hex');
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.checkHash = (password, hws) => {
  const expectedHash = hws.substring(0, constants.hashSize * 2);
  const salt = Buffer.from(hws.substring(constants.hashSize * 2), 'hex');

  const binaryHash = crypto.pbkdf2Sync(
    password,
    salt,
    constants.iter,
    constants.hashSize,
    constants.hashAlgo,
  );

  try {
    const derivedKey  = binaryHash.toString('hex');
    return (expectedHash === derivedKey);
  } catch (err) {
    console.error(err);
    return false;
  }
};
