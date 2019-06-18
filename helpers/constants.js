const ip = require('ip');

const port = process.env.port || 8000;

exports.crypto = {
  hashSize: 32,
  saltSize: 16,
  hashAlgo: 'sha512',
  iter: 1000,
};

exports.port = port;

exports.API_URL = `http://${ip.address()}:${port}/api`;

exports.minKarma = 0;
