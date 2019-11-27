/* eslint-env jest */
const {
    choiceFromDirichlet,
    seededDirichlet,
    hashStringToInt,
    sum,
    dChoice,
    uChoice,
    ensureNumber,
    normalizeSeed,
    addSaltToSeed
} = require("./stats.js");

test("seedDirichlet returns an array that sums to 1", () => {
    const len = 10;
    const alpha = 1;
    const seed = 1;
    const arr = seededDirichlet(alpha, len, seed);
    expect(arr).toHaveLength(len);
    expect(sum(arr)).toBe(1);
});

test("seedDirichlet returns the same values with the same seed", () => {
    const seed = 1;
    const len = 9;
    const arr1 = seededDirichlet(1, len, seed);
    const arr2 = seededDirichlet(1, len, seed);
    expect(arr1).toEqual(arr2);
});

test("hashStringToInt hashes strings to ints deterministically", () => {
    expect(hashStringToInt("hello world")).toEqual(1794106052);
});

test("choiceFromDirichlet choses a member of an array", () => {
    const seed1 = 1;
    const seed2 = 2;
    const alpha = 1;
    const cand = ["kyle", "kathryn", "anjani"];
    const dir = seededDirichlet(alpha, cand.length, seed1);
    const choice1 = choiceFromDirichlet(cand, dir, seed2);
    expect(cand).toContain(choice1);
});

test("choiceFromDirichlet is deterministic when seeded", () => {
    const seed1 = 1;
    const seed2 = 2;
    const alpha = 1;
    const cand = ["kyle", "kathryn", "anjani"];
    const dir = seededDirichlet(alpha, cand.length, seed1);
    const choice1 = choiceFromDirichlet(cand, dir, seed2);
    const choice2 = choiceFromDirichlet(cand, dir, seed2);
    expect(choice1).toEqual(choice2);
});

test("choiceFromDirichlet throws an error when given invalid input", () => {
    const seed = 1;
    const alpha = 1;
    const cand = ["kyle", "kathryn", "anjani"];
    const dir = seededDirichlet(alpha, cand.length + 1, seed);
    expect(() => choiceFromDirichlet(cand, dir, 1)).toThrow();
});

test("dChoice returns a randomly selected member", () => {
    const seed = 1;
    const alpha = 1;
    const cand = ["kyle", "kathryn", "anjani"];
    const choice = dChoice(cand, alpha, seed);
    expect(cand).toContain(choice);
});

test.skip("dChoice does not always return the same thing", () => {
    const seed = 1;
    const alpha = 1;
    const cand = ["kyle", "kathryn", "anjani"];
    const choices = new Set(
        [...Array(10)].map(() => dChoice(cand, alpha, seed))
    );
    expect(choices.size).toBeGreaterThan(1);
});

test("uChoice returns a randomly selected member", () => {
    const seed = 1;
    const cand = ["kyle", "kathryn", "anjani"];
    const choice = uChoice(cand, seed);
    expect(cand).toContain(choice);

    const choices1 = new Set([...Array(10)].map(() => uChoice(cand, seed)));
    expect(choices1.size).toEqual(1);
    // const choices2 = new Set([...Array(10)].map(() => uChoice(cand)));
    // expect(choices2.size).toBeGreaterThan(1);
});

test("ensureNumber hashes strings but not numbers", () => {
    expect(ensureNumber(5)).toEqual(5);
    expect(ensureNumber("hello world")).toEqual(1794106052);
});

test("ensureNumber throws on input not string or number", () => {
    expect(() => {
        ensureNumber({});
    }).toThrow();
});

test("normalizeSeed always returns an number", () => {
    expect(typeof normalizeSeed("foo")).toBe("number");
    expect(typeof normalizeSeed(1)).toBe("number");
    expect(() => {
        normalizeSeed({});
    }).toThrow();
});

test("addSaltToSeed returns sum of seed and salt as a number", () => {
    expect(addSaltToSeed("hello world")).toEqual(1794106052);
    expect(addSaltToSeed("hello world", "hello world")).toEqual(
        1794106052 + 1794106052
    );
    expect(addSaltToSeed(1, "hello world")).toEqual(1 + 1794106052);
    expect(() => {
        addSaltToSeed({}, "foo");
    }).toThrow();
    expect(addSaltToSeed("hello world", 1)).toEqual(1794106052 + 1);
});
