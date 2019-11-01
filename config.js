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
};
