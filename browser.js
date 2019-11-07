const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const {
    dChoice,
    uChoice,
    addSaltToSeed,
} = require('./stats.js');

puppeteer.use(pluginStealth());

// if (!process.env.DEVELOPMENT && require.main === module) {
//     console.log = () => {};
//     console.debug = () => {};
// }

async function takeScreenshot(page, path) {
    console.log('Saving screenshot to', path, 'for URL: ', page.url());
    return page.screenshot({
        path,
    });
}

async function makeDonation(page, donationPreference, donationProbability, screenshots) {
    const donationSelector = 'a[href*="donate"]';
    const donationLink = await page.$(donationSelector);
    if (!donationLink) {
        console.log('Found donation link: false');
        return;
    }
    console.log('Found donation link: true');

    let p = donationProbability;
    const donationText = await page.$eval(donationSelector, (el) => el.text);
    console.log('Donation text:', donationText.trim());

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
    console.log(`Donation probability: ${Math.min(p, 1.0)} (${p})`);
    if (Math.random() > p) {
        console.log('Made donation: false');
        return;
    }
    console.log('Made donation: true');
    try {
        const results = await Promise.all([
            donationLink.click(),
            page.waitForNavigation({
                timeout: 5000,
                waitUntil: 'networkidle2',
            }),
        ]);
        const response = results[1];
        if (response.status() !== 200) {
            console.log('Did not get 200 clicking on donation link');
            return;
        }
        if (screenshots) {
            await takeScreenshot(page, 'donation-screenshot.png');
        }
    } catch (error) {
        console.error(`Could not click donation link ${error}`);
    }
}

async function visitEventDetail(
    page,
    referer,
    teamName,
    clickThroughProbability,
    donationProbability,
    donationPreference,
    screenshots,
) {
    console.log('Viewing', page.url());
    const eventLinkSelector = 'a[href^="/events/"]';
    try {
        const filterLinks = (links) => {
            const validLinks = links.filter((el) => /\d+$/.test(el.href));
            if (validLinks.length > 0) {
                const selectedElement = validLinks[Math.floor(Math.random() * validLinks.length)];
                selectedElement.setAttribute('id', 'event-to-click');
            }
        };
        await page.$$eval(eventLinkSelector, filterLinks);
    } catch (e) {
        console.warn(e);
    }

    if (screenshots) {
        await takeScreenshot(page, 'homepage-screenshot.png');
    }
    // console.log('Events found:', eventLinks.length);
    // if (eventLinks.length === 0) {
    //     return;
    // }
    const p = clickThroughProbability;
    console.log('Click through probability:', p);
    if (Math.random() > p) {
        console.log('Clicked on event: false');
        return;
    }
    console.log('Clicked on event: true');
    // const link = uChoice(eventLinks);
    try {
        const results = await Promise.all([
            page.click('#event-to-click'),
            page.waitForNavigation({
                timeout: 5000,
                waitUntil: 'networkidle2',
            }),
        ]);
        const response = results[1];
        if (response.status() !== 200) {
            console.log('Did not get 200 clicking on event detail link');
            return;
        }
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

    const referers = [
        'http://som.yale.edu/',
        'http://divinity.yale.edu/',
        'http://medicine.yale.edu/',
        'http://law.yale.edu/',
        'http://search.yale.edu/',
    ];
    const alpha = 1;
    const seed = addSaltToSeed(teamName, salt);
    const referer = dChoice(referers, alpha, seed);
    const donationTextOptions = ['donate', 'support'];
    const donationPreference = uChoice(donationTextOptions, seed);
    console.log(`Donation preference: ${donationPreference}`);

    let page;
    let response;
    try {
        page = await browser.newPage();
        response = await page.goto(targetURL, {
            timeout: 10000,
            waitUntil: 'networkidle2',
            referer,
        });
    } catch (e) {
        console.error(`Error opening ${targetURL}. ${encodeURIComponent}`);
        return;
    }
    if (response.status() !== 200) {
        console.log('Site is down, quitting');
        return;
    }

    await visitEventDetail(
        page,
        referer,
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
    runForURL,
};