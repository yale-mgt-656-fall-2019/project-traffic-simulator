const minimist = require("minimist");
const browser = require("./browser.js");

function usage() {
    console.log("node ./visit-site.js TEAM_NICKNAME URL");
}

(() => {
    // Can be run like
    // node ./visit-site.js ./mgt656-project-sprint-2.json -s foo -c 0.05 -d 0.9
    // where c = click through probability
    // and d = donation probability.
    const args = minimist(process.argv.slice(2));
    if (args._.length !== 2) {
        usage();
        process.exit();
    }
    console.log("Running with");
    console.log("team nickname: ", args._[0]);
    console.log("url: ", args._[1]);
    // console.log('salt: ', args.s);
    // console.log('clickThroughProbability: ', args.c);
    // console.log('donationProbability: ', args.d);
    // console.log('screenshots: ', !!args.l);
    // browser.run(args._[0], args.s || '', parseFloat(args.c, 10), parseFloat(args.d, 10), !!args.l);
})();
