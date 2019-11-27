// Find the distribution of traffic among referers for each group.
// The referers are SOM, Law School, etc. Each group has a different
// distribution because they are seeded based on the group's
// team name (this nickname, like "bright-forrest").
//
// We asked teams to tell us the distribution of their traffic
// as part of their final grade, so we're using this script to
// dump the "true" values, in order to do the grading.
const url = require("url");
const minimist = require("minimist");
const browser = require("./browser.js");

function loadTeamNames(assignmentFile) {
    let assignments;
    try {
        assignments = require(assignmentFile);
    } catch (error) {
        console.error(error);
        console.error("Expected assignment file");
        process.exit(1);
    }
    const teamNames = assignments.map(a => a.team_nickname);
    return teamNames;
}

function hostnameForURL(u) {
    return new url.URL(u).hostname;
}

function determineTrafficSources(teamNames) {
    const sources = new Map();
    const uniqueReferers = new Map();
    teamNames.forEach(teamName => {
        sources.set(teamName, new Map());
        const thisTeamSources = sources.get(teamName);

        const numSamples = 10000;
        for (let iteration = 0; iteration < numSamples; iteration += 1) {
            const profile = browser.getVisitorProfile(teamName);
            const referer = hostnameForURL(profile.referer);
            const currentCount = thisTeamSources.get(referer) || 0;
            thisTeamSources.set(referer, currentCount + 1);
            uniqueReferers.set(referer, true);
        }
        thisTeamSources.forEach((v, k) => {
            thisTeamSources.set(k, v / numSamples);
        });
    });
    return {
        byTeam: sources,
        uniqueReferers: Array.from(uniqueReferers.keys()).sort()
    };
}

/**
 * @param  {} sources A map where keys are team names and values are maps
 * @returns {String} A CSV-formatted output
 */
function formatOutput(sourcesByTeam, uniqueReferers) {
    let csvOutput = `teamName,${uniqueReferers.join(",")}\n`;
    sourcesByTeam.forEach((thisTeamSources, teamName) => {
        csvOutput += `${teamName},`;
        csvOutput += uniqueReferers.map(r => thisTeamSources.get(r)).join(",");
        csvOutput += "\n";
    });
    return csvOutput;
}

(() => {
    const args = minimist(process.argv.slice(2));
    console.log("Running with");
    console.log("input: ", args._[0]);
    const teamNames = loadTeamNames(args._[0]);
    const sources = determineTrafficSources(teamNames);
    const csvOutput = formatOutput(sources.byTeam, sources.uniqueReferers);
    console.log(csvOutput);
})();
