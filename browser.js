const puppeteer = require('puppeteer');
const validator = require('validator');
const util = require('./util.js');
const { hashStringToInt, dChoice, uChoice } = require('./stats.js');

if (!process.env.DEVELOPMENT && require.main === module) {
    console.log = () => {};
    console.debug = () => {};
}

async function takeScreenshot(page, path) {
    console.log('Saving screenshot to', path, 'for URL: ', page.url());
    return page.screenshot({
        path,
    });
}

async function makeDonation(page, donationPreference, donationProbability, screenshots) {
    const donationSelector = 'a#donate';
    const donationLink = await page.$(donationSelector);
    if (!donationLink) {
        console.log('Found donation link: false');
        return;
    }
    console.log('Found donation link: true');

    let p = donationProbability;
    const donationText = await page.$eval(donationSelector, (el) => el.text);
    console.log('Donation text:', donationText);

    // Users for this particular team will have a preference -- they are
    // more likely to donate if they see one of the following soliciations
    // to donate. Here, we're checking if the current solication matches
    // the visitor's preference and we're increasing the probability of
    // donating if that is the case.
    console.log('Donation preference:', donationPreference);
    const matchesPreference = donationText.toLowerCase().includes(donationPreference);
    if (matchesPreference) {
        p *= 1.5;
    } else {
        p *= 0.5;
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
    clickThroughProbability,
    donationProbability,
    donationPreference,
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
    const p = clickThroughProbability;
    console.log('Click through probability:', p);
    if (Math.random() > p) {
        console.log('Clicked on event: false');
        return;
    }
    console.log('Clicked on event: true');
    const link = uChoice(eventLinks);
    try {
        await Promise.all([link.click(), page.waitForNavigation()]);
        console.log('Viewing:', page.url());
        if (screenshots) {
            await takeScreenshot(page, 'event-detail-screenshot.png');
        }
        try {
            await makeDonation(page, donationPreference, donationProbability, screenshots);
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

    const referrers = [
        'http://som.yale.edu/',
        'http://divinity.yale.edu/',
        'http://medicine.yale.edu/',
        'http://law.yale.edu/',
        'http://search.yale.edu/',
    ];
    const alpha = 1;
    const referrer = dChoice(teamName, salt, referrers, alpha);
    const donationTextOptions = ['donate', 'support'];
    const donationPreference = dChoice(teamName, salt, donationTextOptions, alpha);
    await visitEventDetail(
        referrer,
        page,
        teamName,
        clickThroughProbability,
        donationProbability,
        donationPreference,
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

module.exports = {
    getVisitorProfile,
    runForURL,
};
