const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update({ region: 'us-east-1' });
const creds = new AWS.Credentials({
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.secretAccessKey,
});

AWS.config.update({ credentials: creds });

module.exports = AWS;
