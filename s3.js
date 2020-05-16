const AWS = require('aws-sdk');
const config = require('./config/s3');

module.exports = new AWS.S3(config.s3);