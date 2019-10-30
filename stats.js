'use strict';

const {
    Gamma,
    rng: {
        KnuthTAOCP2002,
        normal: { AhrensDieter },
    },
} = require('lib-r-math.js');

const sum = (x) => x.reduce((acc, el) => acc + el);


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

// If this is run as the main script
if (require.main === module) {
    const seed = 100;
    const numDimensions = 4;
    for (let alpha = 0.001; alpha < 200; alpha *= 10) {
        const sample = seededDirichlet(seed, alpha, numDimensions);
        console.log(`seededDirichlet(${seed}, ${alpha}, ${numDimensions}) = ${sample}`);
    }
}
