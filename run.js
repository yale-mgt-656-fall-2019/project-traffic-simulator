const validator = require('validator');
const config = require('./config.js');
const util = require('./util.js');

const {
    getSubmissions,
} = require('./util.js');
const {
    runForURL,
} = require('./browser.js');

async function runForSubmission(sub) {
    return runForURL(
        sub.teamNickname,
        sub.url,
        config.salt,
        config.probabilities.clickThrough.mean,
        config.probabilities.donation.mean,
        false,
    );
}

async function runForSubmissions(subs) {
    for (let index = 0; index < subs.length; index += 1) {
        const sub = subs[index];
        if (validator.isURL(sub.url)) {
            // eslint-disable-next-line no-await-in-loop
            await runForSubmission(sub);
        }
    }
}

(async () => {
    let submissions;
    try {
        submissions = util.shuffle(await getSubmissions(config.classURL, config.jwt));
        runForSubmissions(submissions);
    } catch (e) {
        console.error(e);
        console.error('Could not fetch submissions');
        process.exit();
    }
})();