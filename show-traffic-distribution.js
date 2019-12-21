const validator = require('validator');
const config = require('./config.js');
const util = require('./util.js');

const { getSubmissions } = require('./util.js');
const { getVisitorStats } = require('./browser.js');

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

function distForSubmission(sub, salt) {
    const {
        seed,
        referers,
        dirichletDraw,
        donationPreference,
    } = getVisitorStats(sub.teamNickname, salt);
    return {
        seed,
        referers,
        dirichletDraw,
        donationPreference,
    };
}

function statToCSVRow(teamNickname, stats) {
    return [teamNickname, ...stats.dirichletDraw, stats.donationPreference];
}

function getHost(u) {
    const myURL = new URL(u);
    return myURL.host;
}

(async () => {
    let submissions;
    try {
        submissions = await getSubmissions(config.classURL, config.jwt);
        submissions.forEach((s, i) => {
            const stats = distForSubmission(s, config.salt);
            const row = statToCSVRow(s.teamNickname, stats);
            if (i === 0) {
                console.log(
                    [
                        'team_nickname',
                        ...stats.referers.map(getHost),
                        'donation_preference',
                    ].join(','),
                );
            }
            console.log(row.join(','));
        });
    } catch (e) {
        console.error(e);
        console.error('Could not fetch submissions');
        process.exit();
    }
})();
