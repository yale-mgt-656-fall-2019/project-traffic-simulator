const puppeteer = require("puppeteer");
const validator = require("validator");
const AWS = require("./aws.js");
const config = require("./config.js");
const { getSubmissions } = require("./util.js");

const s3 = new AWS.S3();

async function uploadScreenshotToS3(page, url, filename) {
  await page.goto(url, {
    timeout: 5000,
    waitUntil: "networkidle2"
  });
  const screenshot = await page.screenshot({ timeout: 10000 });
  const params = {
    Key: filename,
    Body: screenshot,
    Bucket: process.env.AWS_S3_BUCKET,
    ACL: "public-read-write",
    ContentType: "image/png"
  };
  console.log("saving...");
  return s3.putObject(params).promise();
}

async function runForSubmissions(page, subs) {
  for (let index = 0; index < subs.length; index += 1) {
    const sub = subs[index];
    console.log(`Recording screenshot for ${sub.teamNickname}`);
    if (validator.isURL(sub.url)) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await uploadScreenshotToS3(
          page,
          sub.url,
          `screenshots/${config.classNumber}/${sub.teamNickname}.png`
        );
        console.log("done");
      } catch (e) {
        console.error(`Caught error ${e}`);
      }
    } else {
      console.log(`Invalid URL: ${sub.url}`);
    }
  }
  console.log("done with runForSubmissions");
  return true;
}

async function recordScreenShots(page) {
  let submissions;
  try {
    submissions = await getSubmissions(config.classURL, config.jwt);
    await runForSubmissions(page, submissions);
  } catch (e) {
    console.error(e);
    console.error("Could not fetch submissions");
    process.exit();
  }
}

module.exports = {
  uploadScreenshotToS3
};

// If this is run as the main script
if (require.main === module) {
  (async () => {
    const browser = await puppeteer.launch({ timeout: 30000 });
    const page = await browser.newPage({ timeout: 10000 });
    await recordScreenShots(page);
    console.log("weoo");
    process.exit(0);
  })();
}
