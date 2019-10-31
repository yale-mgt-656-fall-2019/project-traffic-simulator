'use strict';

const {
    Gamma,
    rng: {
        KnuthTAOCP2002,
        timeseed,
        normal: { AhrensDieter },
    },
} = require('lib-r-math.js');

const sum = (x) => x.reduce((acc, el) => acc + el);
let MODULE_DEBUG = false;

function log(...args) {
    if (MODULE_DEBUG) {
        console.log(args);
    }
}

/**
 * Taken from https://github.com/dirkschumacher/dirichlet-rating/blob/master/index.js
 * and https://www.npmjs.com/package/lib-r-math.js#gamma-distribution.
 * Generates random numbers from a dirichlet distribution
 * Based on this: https://en.wikipedia.org/wiki/Dirichlet_distribution#Random_number_generation
 * @param {any} gamma gamma distribution random generator
 * @param {Array<number>} alpha
 * @return {Array<number>}
 */
function randomDirichlet(gamma, alphas) {
    const randGammas = alphas.map((x) => gamma.rgamma(1, x, 1));
    const gammaSum = sum(randGammas);
    return randGammas.map((x) => x / gammaSum);
}

function seededDirichlet(seed, alpha, numDimensions) {
    // Generate an array of alphas with the specified number of dimensions
    const alphas = [...Array(numDimensions)].map(() => alpha);
    const mt = new KnuthTAOCP2002(seed);
    const customGamma = Gamma(new AhrensDieter(mt));
    return randomDirichlet(customGamma, alphas);
}

function choiceFromDirichlet(cand, dirDist, seed) {
    if (cand.length !== dirDist.length) {
        throw new Error('cand array and dirDist array must have equal length');
    }
    const theSeed = typeof seed === 'number' ? seed : timeseed();
    const mt = new KnuthTAOCP2002(theSeed);
    const x = mt.unif_rand(1);
    let prevSum = 0;
    let nextSum = 0;
    for (let index = 0; index < dirDist.length; index += 1) {
        nextSum += dirDist[index];
        if (x > prevSum && x < nextSum) {
            return cand[index];
        }
        prevSum = nextSum;
    }
    return undefined;
}

function hashStringToInt(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i += 1) {
        const char = str.charCodeAt(i);
        // eslint-disable-next-line no-bitwise
        hash = (hash << 5) - hash + char;
        // eslint-disable-next-line no-bitwise
        hash &= hash; // Convert to 32bit integer
    }
    return hash;
}

// If this is run as the main script
if (require.main === module) {
    MODULE_DEBUG = true;
    const seed = 100;
    const numDimensions = 4;
    for (let alpha = 0.001; alpha < 200; alpha *= 10) {
        const sample = seededDirichlet(seed, alpha, numDimensions);
        log(`seededDirichlet(${seed}, ${alpha}, ${numDimensions}) = ${sample}`);
    }

    const dirDist = seededDirichlet(seed, 1, 5);
    const cand = ['kyle', 'anjani', 'kathryn', 'sharon', 'kerwin'];
    for (let index = 0; index < 10; index += 1) {
        const choice = choiceFromDirichlet(cand, dirDist);
        for (let j = 0; j < dirDist.length; j += 1) {
            const chosen = cand[j] === choice ? '***' : '';
            log(`${dirDist[j]} - ${cand[j]} ${chosen}`);
        }
    }
}

module.exports = {
    choiceFromDirichlet,
    seededDirichlet,
    hashStringToInt,
    sum,
};
