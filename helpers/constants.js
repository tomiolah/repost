const ip = require('ip');

const port = process.env.port || 8080;

exports.crypto = {
  hashSize: 32,
  saltSize: 16,
  hashAlgo: 'sha512',
  iter: 1000,
};

exports.API_URL = `http://${ip.address()}:${port}/api`;
