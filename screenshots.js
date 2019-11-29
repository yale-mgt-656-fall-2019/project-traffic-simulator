const puppeteer = require("puppeteer");
const validator = require("validator");
const AWS = require("./aws.js");
const config = require("./config.js");
const { getSubmissions, pingURLs } = require("./util.js");

const s3 = new AWS.S3();

async function uploadScreenshotToS3(page, url, filename, copies) {
    await page.goto(url, {
        timeout: 5000,
        waitUntil: "networkidle2"
    });
    const screenshot = await page.screenshot({
        timeout: 10000
    });
    const bucket = process.env.AWS_S3_BUCKET;
    const acl = "public-read-write";
    const contentType = "image/png";
    const params = {
        Key: filename,
        Body: screenshot,
        Bucket: bucket,
        ACL: acl,
        ContentType: contentType
    };
    await s3.putObject(params).promise();
    const copyObjPromises = copies.map(f =>
        s3
            .copyObject({
                CopySource: `${bucket}/${filename}`,
                Bucket: bucket,
                Key: f,
                ACL: acl,
                ContentType: contentType
            })
            .promise()
    );
    return Promise.all(copyObjPromises);
}

function getTodayDateSuffix() {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, 0);
    const day = `${today.getDate()}`.padStart(2, 0);
    const stringDate = [year, month, day].join("/");
    return stringDate;
}

async function runForSubmissions(page, subs) {
    for (let index = 0; index < subs.length; index += 1) {
        const sub = subs[index];
        console.log(`Recording screenshot for ${sub.teamNickname}`);
        if (validator.isURL(sub.url)) {
            try {
                const ds = getTodayDateSuffix();
                // eslint-disable-next-line no-await-in-loop
                await uploadScreenshotToS3(
                    page,
                    sub.url,
                    `screenshots/${config.classNumber}/${sub.teamNickname}.png`,
                    [
                        `screenshots/${config.classNumber}/${ds}/${sub.teamNickname}.png`
                    ]
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
        await pingURLs(submissions.map(s => s.url));
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
        const browser = await puppeteer.launch({
            timeout: 30000
        });
        const page = await browser.newPage({
            timeout: 10000
        });
        await recordScreenShots(page);
        console.log("weoo");
        process.exit(0);
    })();
}
