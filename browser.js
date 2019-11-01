const puppeteer = require('puppeteer');
const validator = require('validator');
const util = require('./util.js');
const { hashStringToInt } = require('./stats.js');

if (!process.env.DEVELOPMENT) {
    console.log = () => {};
    console.debug = () => {};
}

function getVisitorProfile(seed) {
    const referrers = [
        'http://som.yale.edu/',
        'http://divinity.yale.edu/',
        'http://medicine.yale.edu/',
        'http://law.yale.edu/',
        'http://search.yale.edu/',
    ];
    const visitor_profiles = [
        {
            name: 'Regular visitor #1',
            prevalence: 0.3,
            clickThroughProbability: 0.4,
            donationProbability: 0.25,
        },
        {
            name: 'Low click through, high donation',
            prevalence: 0.1,
            clickThroughProbability: 0.2,
            donationProbability: 0.5,
        },
        {
            name: 'High click-through, low donation',
            prevalence: 0.05,
            clickThroughProbability: 0.7,
            donationProbability: 0.1,
        },
        {
            name: 'Regular visitor #2',
            prevalence: 0.3,
            clickThroughProbability: 0.4,
            donationProbability: 0.25,
        },
        {
            name: 'High click-through, high donation',
            prevalence: 0.25,
            clickThroughProbability: 0.7,
            donationProbability: 0.5,
        },
    ];
    const groupNumber = getTeamGrouping(seed, 'foosalt', visitor_profiles.length);

    const rnd = Math.random();
    let cummulativePrevalence = 0;
    let selectedProfile = visitor_profiles[0];
    let selectedReferrer = referrers[0];

    // Get a visitor profile randomly based on their prevalence
    //
    for (let i = 0; i < visitor_profiles.length; i += 1) {
        cummulativePrevalence += visitor_profiles[i].prevalence;
        if (cummulativePrevalence > rnd) {
            break;
        }
        selectedProfile = visitor_profiles[i];
        selectedReferrer = referrers[(i + groupNumber) % referrers.length];
    }
    return {
        profile: selectedProfile,
        referer: selectedReferrer,
    };
}

/*  Produce a nice psuedo-random number.
 *  See http://indiegamr.com/generate-repeatable-random-numbers-in-js/
 */
function seededRandomInt(seed, theMin, theMax) {
    const max = theMax || 1;
    const min = theMin || 0;

    const x = (seed * 9301 + 49297) % 233280;
    const rnd = x / 233280;

    let val = Math.floor(min + rnd * (max - min));
    val = Math.min(max, val);
    val = Math.max(min, val);
    return val;
}

function getTeamGrouping(seed, salt, maxNumber) {
    const hash = hashStringToInt(`${seed}${salt}`);
    const hashWithInts = parseInt(hash.replace(/[^0-9]/g, ''), 10);
    return seededRandomInt(hashWithInts, 0, maxNumber);
}

function chooseRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function chooseSeededRandom(arr, seed) {
    return arr[getTeamGrouping(seed, 'foo', arr.length)];
}

async function visitHomepage(page, referer, targetURL) {
    await page.goto(referer);
    const linkID = 'mgt656';

    // The puppeteer `click` method seems to be broken.
    // Here, we're going to trigger the click in the
    // client and then wait out the nagivation.
    const nav = page.waitForNavigation({
        waitUntil: ['networkidle0'],
    });
    const wait2s = page.waitFor(2000);
    await page.evaluate(
        (href, theLinkID) => {
            // eslint-disable-next-line no-undef
            const link = document.createElement('a');
            link.setAttribute('href', href);
            link.setAttribute('id', theLinkID);
            // eslint-disable-next-line no-undef
            document.body.appendChild(link);
            link.click();
        },
        targetURL,
        linkID,
    );
    await Promise.all([nav, wait2s]);
}

async function takeScreenshot(page, path) {
    console.log('Saving screenshot to', path, 'for URL: ', page.url());
    return page.screenshot({
        path,
    });
}

async function makeDonation(page, teamName, visitor, donationProbability, screenshots) {
    const donationSelector = 'a#donate';
    const donationLink = await page.$(donationSelector);
    if (!donationLink) {
        console.log('Found donation link: false');
        return;
    }
    console.log('Found donation link: true');

    let p = util.firstOf(donationProbability, visitor.profile.donationProbability);
    const donationText = await page.$eval(donationSelector, (el) => el.text);
    console.log('Donation text:', donationText);

    // Users for this particular team will have a preference -- they are
    // more likely to donate if they see one of the following soliciations
    // to donate. Here, we're checking if the current solication matches
    // the visitor's preference and we're increasing the probability of
    // donating if that is the case.
    const donationTextOptions = ['donate', 'support'];
    const donationPreference = chooseSeededRandom(donationTextOptions, teamName);
    console.log('Donation preference:', donationPreference);
    const matchesPreference = donationText.toLowerCase().includes(donationPreference);
    if (matchesPreference) {
        p = 1.5 * p;
    }
    console.log('Donation preference matches: ', matchesPreference);
    console.log('Donation probability:', Math.min(p, 1.0));
    if (Math.random() > p) {
        console.log('Made donation: false');
        return;
    }
    console.log('Made donation: true');
    try {
        await Promise.all([donationLink.click(), page.waitForNavigation()]);
        if (screenshots) {
            await takeScreenshot(page, 'donation-screenshot.png');
        }
    } catch (error) {
        console.error(error);
    }
}

async function visitEventDetail(
    page,
    teamName,
    visitor,
    clickThroughProbability,
    donationProbability,
    screenshots,
) {
    console.log('Viewing', page.url());
    let eventLinks;
    try {
        eventLinks = await page.$$('ul a[href^="/events/"]');
    } catch (e) {
        console.warn(e);
        eventLinks = [];
    }

    if (screenshots) {
        await takeScreenshot(page, 'homepage-screenshot.png');
    }
    console.log('Events found:', eventLinks.length);
    if (eventLinks.length === 0) {
        return;
    }
    const p = util.firstOf(clickThroughProbability, visitor.profile.clickThroughProbability);
    console.log('Click through probability:', p);
    if (Math.random() > p) {
        console.log('Clicked on event: false');
        return;
    }
    console.log('Clicked on event: true');
    const link = chooseRandom(eventLinks);
    try {
        await Promise.all([link.click(), page.waitForNavigation()]);
        console.log('Viewing:', page.url());
        if (screenshots) {
            await takeScreenshot(page, 'event-detail-screenshot.png');
        }
        try {
            await makeDonation(page, teamName, visitor, donationProbability, screenshots);
        } catch (error) {
            console.log(error);
        }
    } catch (e) {
        console.error(e);
    }
}

async function visitSite(
    browser,
    teamName,
    targetURL,
    salt,
    clickThroughProbability,
    donationProbability,
    screenshots,
) {
    const page = await browser.newPage();
    const visitor = getVisitorProfile(teamName + salt);
    console.log('Visitor:');
    console.dir(visitor);
    await visitHomepage(page, visitor.referer, targetURL);
    await visitEventDetail(
        page,
        teamName,
        visitor,
        clickThroughProbability,
        donationProbability,
        screenshots,
    );
}

async function runForURL(
    teamName,
    targetURL,
    salt,
    clickThroughProbability,
    donationProbability,
    screenshots,
) {
    console.log('----------------');
    console.log('Team:', teamName);
    console.log('Url:', targetURL);
    const browser = await puppeteer.launch();
    await visitSite(
        browser,
        teamName,
        targetURL,
        salt,
        clickThroughProbability,
        donationProbability,
        screenshots,
    );
    await browser.close();
    console.log('----------------');
}

async function run(
    assignmentFile,
    salt,
    clickThroughProbability,
    donationProbability,
    screenshots,
) {
    try {
        let assignments;
        try {
            assignments = require(assignmentFile);
        } catch (error) {
            console.error(error);
            console.error('Expected assignment file');
            process.exit(1);
        }
        assignments = util.shuffle(assignments);

        // Ping the URLs to make sure they are online
        const urls = assignments.map((a) => util.cleanURL(a.url)).filter((x) => validator.isURL(x));
        await util.pingURLs(urls);

        for (let index = 0; index < assignments.length; index += 1) {
            const assignment = assignments[index];
            const teamName = assignment.team_nickname;
            const url = util.cleanURL(assignment.url || '');
            if (validator.isURL(url)) {
                // eslint-disable-next-line no-await-in-loop
                await runForURL(
                    teamName,
                    url,
                    salt,
                    clickThroughProbability,
                    donationProbability,
                    screenshots,
                );
            } else {
                console.warn('No url for team', teamName);
            }
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = {
    run,
    getVisitorProfile,
    runForURL,
};
