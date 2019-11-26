function getEnv(key) {
    if (key in process.env) {
        return process.env[key];
    }
    throw new Error(`Could not find ${key} in environment!`);
}

module.exports = {
    jwt: getEnv('JWT'),
    classURL: getEnv('CLASS_URL'),
    salt: getEnv('SALT'),
    probabilities: {
        clickThrough: {
            mean: getEnv('CLICK_THROUGH_PROB_MEAN'),
            stddev: getEnv('CLICK_THROUGH_PROB_STDDEV'),
        },
        donation: {
            mean: getEnv('DONATION_PROB_MEAN'),
            stddev: getEnv('DONATION_PROB_STDDEV'),
        },
    },
    classNumber: getEnv('CLASS_NUMBER'),
    awsS3Bucket: getEnv('AWS_S3_BUCKET'),
    awsAccessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
};
