const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://httpbin.org/get', {
        referer: 'http://divinity.yale.edu/',
    });
    console.log(await page.content());
    await browser.close();
})();
