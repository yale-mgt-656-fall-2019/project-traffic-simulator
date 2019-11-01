const browser = require('./browser.js');
const minimist = require('minimist');

(() => {
    // Can be run like
    // node ./visit-site.js ./mgt656-project-sprint-2.json -s foo -c 0.05 -d 0.9
    // where c = click through probability
    // and d = donation probability.
    const args = minimist(process.argv.slice(2));
    console.log('Running with');
    console.log('input: ', args._[0]);
    console.log('salt: ', args.s);
    console.log('clickThroughProbability: ', args.c);
    console.log('donationProbability: ', args.d);
    console.log('screenshots: ', args.l ? true : false);
    browser.run(args._[0], args.s || '', parseFloat(args.c, 10), parseFloat(args.d, 10), args.l ? true : false);
})();
