/* eslint indent: [2, 4, {"SwitchCase": 1}] */

'use strict';

const {
    Gamma,
    rng: {
        KnuthTAOCP2002,
        timeseed,
        normal: { AhrensDieter },
    },
} = require('lib-r-math.js');

const sum = x => x.reduce((acc, el) => acc + el);
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
    const randGammas = alphas.map(x => gamma.rgamma(1, x, 1));
    const gammaSum = sum(randGammas);
    return randGammas.map(x => x / gammaSum);
}

function seededDirichlet(alpha, numDimensions, seed) {
    // Generate an array of alphas with the specified number of dimensions
    const alphas = [...Array(numDimensions)].map(() => alpha);
    const mt = new KnuthTAOCP2002(normalizeSeed(seed));
    const customGamma = Gamma(new AhrensDieter(mt));
    return randomDirichlet(customGamma, alphas);
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

function ensureNumber(s) {
    switch (typeof s) {
        case 'number':
            return s;
        case 'string':
            return hashStringToInt(s);
        default:
            throw Error('Invalid type for ensureNumber');
    }
}

function normalizeSeed(seed) {
    return typeof seed === 'undefined' ? timeseed() : ensureNumber(seed);
}

function addSaltToSeed(seed, salt) {
    const theSeed = normalizeSeed(seed);
    if (salt) {
        return theSeed + ensureNumber(salt);
    }
    return theSeed;
}

function choiceFromDirichlet(cand, dirDist, seed) {
    if (cand.length !== dirDist.length) {
        throw new Error('cand array and dirDist array must have equal length');
    }
    const theSeed = normalizeSeed(seed);
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

function printDirichletChoice(cand, dirDist, choice) {
    for (let j = 0; j < dirDist.length; j += 1) {
        const chosen = cand[j] === choice ? '***' : '';
        console.log(`${dirDist[j]} - ${cand[j]} ${chosen}`);
    }
}

/**
 * Returns a choice from an array selected using a draw from
 * a seeded dirichlet. The choice has a random time-based seed.
 * @param {Array<any>} cand
 * @param {number} alpha
 * @param {string} seed
 * @param {string} salt
 * @return {any}
 */
function dChoice(cand, alpha, seed) {
    const dirichletDraw = seededDirichlet(alpha, cand.length, seed);
    const choice = choiceFromDirichlet(cand, dirichletDraw, timeseed());
    // printDirichletChoice(cand, dirichletDraw, choice);
    return choice;
}

function uChoice(arr, seed) {
    // Choice from uniform random, no seed
    const mt = new KnuthTAOCP2002(normalizeSeed(seed));
    const x = mt.unif_rand(1);
    return arr[Math.floor(x * arr.length)];
}

// If this is run as the main script
if (require.main === module) {
    MODULE_DEBUG = true;
    const seed = 100;
    const numDimensions = 4;
    for (let alpha = 0.001; alpha < 200; alpha *= 10) {
        const sample = seededDirichlet(alpha, numDimensions, seed);
        log(`seededDirichlet(${alpha}, ${numDimensions}, ${seed}) = ${sample}`);
    }

    const dirDist = seededDirichlet(1, 5, seed);
    const cand = ['kyle', 'anjani', 'kathryn', 'sharon', 'kerwin'];
    for (let index = 0; index < 10; index += 1) {
        const choice = choiceFromDirichlet(cand, dirDist);
        printDirichletChoice(cand, dirDist, choice);
    }
}

module.exports = {
    choiceFromDirichlet,
    seededDirichlet,
    hashStringToInt,
    sum,
    dChoice,
    uChoice,
    ensureNumber,
    normalizeSeed,
    addSaltToSeed,
    printDirichletChoice,
};
