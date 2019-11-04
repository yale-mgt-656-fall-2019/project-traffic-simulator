const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({ region: 'us-east-1' });
const creds = new AWS.EnvironmentCredentials('AWS');
AWS.config.update({ credentials: creds });
console.log(creds);

const endpoint = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com';
// endpoint = 'https://mturk-requester.us-east-1.amazonaws.com';

const mturk = new AWS.MTurk({ endpoint });

fs.readFile('my_question.xml', 'utf8', (err, myQuestion) => {
    if (err) {
        return console.log(err);
    }

    const myHIT = {
        Title: 'This is a new test question',
        Description: 'Another description',
        MaxAssignments: 1,
        LifetimeInSeconds: 3600,
        AssignmentDurationInSeconds: 600,
        Reward: '0.20',
        Question: myQuestion,

        // The Worker must be either in Canada or the US
        QualificationRequirements: [
            {
                QualificationTypeId: '00000000000000000071',
                Comparator: 'In',
                LocaleValues: [{ Country: 'US' }, { Country: 'CA' }],
            },
        ],
    };

    mturk.createHIT(myHIT, (err2, data) => {
        if (err2) {
            console.log(err2.message);
        } else {
            console.log(data);
            console.log(
                `HIT published here: https://workersandbox.mturk.com/mturk/preview?groupId=${data.HIT.HITTypeId} with this HITId: ${data.HIT.HITId}`,
            );
        }
    });
});
