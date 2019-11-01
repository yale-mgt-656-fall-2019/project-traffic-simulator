const axios = require('axios');
const { parse, format } = require('url');

// Returns the first element that is not null or undefined
function firstOf(...args) {
    const badValues = new Set([null, undefined, NaN]);
    for (let index = 0; index < arguments.length; index += 1) {
        if (!badValues.has(args[index])) {
            return args[index];
        }
    }
    return undefined;
}

async function pingURLs(urls) {
    // Create array of promises and ensure they
    // will all run by handling rejections.
    const fetches = urls.map((url) => axios.get(url)).map((p) => p.catch(() => undefined));
    return Promise.all(fetches);
}

function cleanURL(inputURL) {
    const theURL = inputURL.trim();
    if (!theURL.startsWith('https://') && !theURL.startsWith('http://')) {
        throw new Error('URL must start with https or http.');
    }
    const normalizedUrl = parse(theURL);
    if (normalizedUrl.auth || normalizedUrl.username || normalizedUrl.password) {
        throw new Error('Username and password not allowed.');
    }
    // Remove duplicate slashes if not preceded by a protocol
    if (normalizedUrl.pathname) {
        normalizedUrl.pathname = normalizedUrl.pathname.replace(/(?<!https?:)\/{2,}/g, '/');
    }
    return format(normalizedUrl);
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function getSubmissions(apiURL, jwt) {
    const requestConfig = {
        url:
            '/rest/assignment_field_submissions?and=(assignment_slug.like.project*,assignment_field_slug.eq.app-url)&select=url:body,submission:assignment_submissions(id,team_nickname,assignment_slug):team_nickname',
        baseURL: apiURL,
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
    };
    const response = await axios.request(requestConfig);
    const rawSubmissions = response.data.map((s) => ({
        url: s.url,
        assignmentSlug: s.submission.assignment_slug,
        teamNickname: s.submission.team_nickname,
    }));
    const submissionDict = {};
    rawSubmissions.forEach((s) => {
        const oldSub = submissionDict[s.teamNickname];
        // TODO: don't just compare assignment slugs, compare the due
        // dates of assignments.
        if (!oldSub || oldSub.assignmentSlug < s.assignmentSlug) {
            submissionDict[s.teamNickname] = s;
        }
    });
    return Object.values(submissionDict);
}

module.exports = {
    firstOf,
    pingURLs,
    cleanURL,
    shuffle,
    getSubmissions,
};
