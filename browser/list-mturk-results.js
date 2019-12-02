/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
/* eslint-disable consistent-return */
const xml2js = require("xml2js");
const AWS = require("./aws.js");
const db = require("./db.js");
const turkjobs = require("./turkjobs.js");

// const endpoint = "https://mturk-requester-sandbox.us-east-1.amazonaws.com";
const endpoint = "https://mturk-requester.us-east-1.amazonaws.com";

const mturk = new AWS.MTurk({
    endpoint
});

const XMLparser = new xml2js.Parser(/* options */);

async function recordAssignmentResults(assignment) {
    if (assignment.AssignmentStatus !== "Approved") {
        return;
    }
    const topLevelAnswer = await XMLparser.parseStringPromise(
        assignment.Answer
    );
    const answers = topLevelAnswer.QuestionFormAnswers.Answer;

    const doUpsert = async a =>
        turkjobs.upsertGrade(
            db,
            assignment.AssignmentId,
            assignment.WorkerId,
            assignment.HITId,
            a.QuestionIdentifier[0],
            a.SelectionIdentifier[0],
            assignment.SubmitTime,
            assignment.AcceptTime
        );
    await Promise.all(answers.map(doUpsert));
}

function getParams(nextToken) {
    if (typeof nextToken === "undefined") {
        return {};
    }
    return { NextToken: nextToken };
}

async function listAssignments(hit, nextAssignmentToken, f) {
    const params = {
        HITId: hit.HITId,
        ...getParams(nextAssignmentToken)
    };

    const listAssignmentsResult = await mturk
        .listAssignmentsForHIT(params)
        .promise();
    await Promise.all(listAssignmentsResult.Assignments.map(f));
    if (listAssignmentsResult.NumResults !== 0) {
        return listAssignments(hit, listAssignmentsResult.NextToken, f);
    }
}

async function listHITs(nextHITToken) {
    const params = { ...getParams(nextHITToken) };
    console.log(params);
    const listHITsResult = await mturk.listHITs(params).promise();
    listHITsResult.HITs.map(h =>
        listAssignments(h, undefined, recordAssignmentResults)
    );
    if (listHITsResult.NumResults !== 0) {
        return listHITs(listHITsResult.NextToken);
    }
}

(async () => {
    await turkjobs.initdb(db);
    await listHITs(undefined);
})();
