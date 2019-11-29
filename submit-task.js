const nunjucks = require("nunjucks");
const AWS = require("./aws.js");

// const endpoint = "https://mturk-requester-sandbox.us-east-1.amazonaws.com";
const endpoint = "https://mturk-requester.us-east-1.amazonaws.com";

const mturk = new AWS.MTurk({
    endpoint
});

const designs = [
    {
        nickname: "floral-light",
        image:
            "https://s3.amazonaws.com/files.656.mba/screenshots/656/floral-light.png"
    },
    {
        nickname: "whithered-castle",
        image:
            "https://s3.amazonaws.com/files.656.mba/screenshots/656/withered-castle.png"
    }
];

const myHIT = {
    Title: "Rate website designs of students",
    AutoApprovalDelayInSeconds: 30,
    Keywords: "grading, images, design",
    Description:
        "Our students are designing clones of EventBrite and we hope you will rate them",
    MaxAssignments: 1,
    LifetimeInSeconds: 3600 / 2,
    AssignmentDurationInSeconds: 200,
    Reward: "0.15",
    Question: nunjucks.render("question.xml", {
        designs
    }),

    // The Worker must be either in Canada or the US
    QualificationRequirements: [
        {
            QualificationTypeId: "00000000000000000071",
            Comparator: "In",
            LocaleValues: [
                {
                    Country: "US"
                },
                {
                    Country: "CA"
                }
            ]
        }
    ]
};

mturk.createHIT(myHIT, (err2, data) => {
    if (err2) {
        console.log(err2.message);
    } else {
        console.log(data);
        console.log(
            `HIT published here: https://workersandbox.mturk.com/mturk/preview?groupId=${data.HIT.HITTypeId} with this HITId: ${data.HIT.HITId}`
        );
    }
});
