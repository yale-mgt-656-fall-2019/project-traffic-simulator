/* eslint-env jest */
const { firstOf, cleanURL, shuffle } = require("./util.js");

test("firstOf returns the first value of an array not null, undefined, or NaN", () => {
    expect(firstOf(null, 1)).toBe(1);
    expect(firstOf(NaN, 1)).toBe(1);
    expect(firstOf(undefined, 1)).toBe(1);
    expect(firstOf(null, 1, 10)).toBe(1);
    expect(firstOf(undefined, null, 1, 10, null)).toBe(1);
    expect(firstOf(undefined, null, "X", 10, null)).toBe("X");
});

test("cleanURL cleans up URLs", () => {
    expect(cleanURL("http://foo.com")).toBe("http://foo.com/");
    expect(cleanURL("  http://foo.com  ")).toBe("http://foo.com/");
    expect(cleanURL("http://foo.com//")).toBe("http://foo.com/");
    expect(cleanURL("http://foo.com//bar")).toBe("http://foo.com/bar");
    expect(cleanURL("http://foo.com//bar?foo=21")).toBe(
        "http://foo.com/bar?foo=21"
    );
    expect(() => {
        cleanURL("http://user:pass@foo.com");
    }).toThrow();
    expect(() => {
        cleanURL("ftp://user:pass@foo.com");
    }).toThrow();
});

test("shuffle returns an array with the same elements", () => {
    expect(shuffle([1, 2, 3])).toEqual(expect.arrayContaining([1, 2, 3]));
});
