/* eslint-env jest */
const {
    choiceFromDirichlet, seededDirichlet, hashStringToInt, sum,
} = require('./stats.js');

test('seedDirichlet returns an array that sums to 1', () => {
    const len = 10;
    const arr = seededDirichlet(1, 1, len);
    expect(arr).toHaveLength(len);
    expect(sum(arr)).toBe(1);
});

test('seedDirichlet returns the same values with the same seed', () => {
    const seed = 1;
    const len = 9;
    const arr1 = seededDirichlet(seed, 1, len);
    const arr2 = seededDirichlet(seed, 1, len);
    expect(arr1).toEqual(arr2);
});

test('hashStringToInt hashes strings to ints deterministically', () => {
    expect(hashStringToInt('hello world')).toEqual(1794106052);
});

test('choiceFromDirichlet choses a member of an array', () => {
    const seed1 = 1;
    const seed2 = 2;
    const alpha = 1;
    const cand = ['kyle', 'kathryn', 'anjani'];
    const dir = seededDirichlet(seed1, alpha, cand.length);
    const choice1 = choiceFromDirichlet(cand, dir, seed2);
    expect(cand).toContain(choice1);
});

test('choiceFromDirichlet is deterministic when seeded', () => {
    const seed1 = 1;
    const seed2 = 2;
    const alpha = 1;
    const cand = ['kyle', 'kathryn', 'anjani'];
    const dir = seededDirichlet(seed1, alpha, cand.length);
    const choice1 = choiceFromDirichlet(cand, dir, seed2);
    const choice2 = choiceFromDirichlet(cand, dir, seed2);
    expect(choice1).toEqual(choice2);
});

test('choiceFromDirichlet throws an error when given invalid input', () => {
    const seed = 1;
    const alpha = 1;
    const cand = ['kyle', 'kathryn', 'anjani'];
    const dir = seededDirichlet(seed, alpha, cand.length + 1);
    expect(() => choiceFromDirichlet(cand, dir, 1)).toThrow();
});
