const nunjucks = require('nunjucks');
const AWS = require('./aws.js');

const endpoint = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com';
// endpoint = 'https://mturk-requester.us-east-1.amazonaws.com';

const mturk = new AWS.MTurk({ endpoint });

const designs = [
    {
        nickname: 'foo-bar',
        image:
            'https://multimedia-commons.s3-us-west-2.amazonaws.com/data/images/010/172/010172cbfc6b251a32b61cf7d3f4bc1.jpg',
    },
    {
        nickname: 'baz-bar',
        image:
            'https://multimedia-commons.s3-us-west-2.amazonaws.com/data/images/010/197/010197d8079b056d0dfabdf62ced6c0.jpg',
    },
];

const myHIT = {
    Title: 'Rate website designs of students',
    Description: 'Our students are designing clones of EventBrite and we hope you will rate them',
    MaxAssignments: 1,
    LifetimeInSeconds: 3600 / 2,
    AssignmentDurationInSeconds: 200,
    Reward: '0.05',
    Question: nunjucks.render('question.xml', { designs }),

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
