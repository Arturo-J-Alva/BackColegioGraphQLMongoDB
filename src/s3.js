const AWS = require('aws-sdk');
const config = require('./config/configUploaders');

module.exports = new AWS.S3(config.s3);