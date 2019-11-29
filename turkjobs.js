const createSchema = `
CREATE TABLE IF NOT EXISTS mturk_grades (
    assignment_id TEXT NOT NULL PRIMARY KEY
        CHECK (char_length(assignment_id) > 15 AND char_length(assignment_id) < 50), 
    worker_id TEXT NOT NULL
        CHECK (char_length(worker_id) > 5 AND char_length(worker_id) < 50), 
    hit_id TEXT NOT NULL
        CHECK (char_length(hit_id) > 15 AND char_length(hit_id) < 50), 
    team_nickname TEXT NOT NULL
        CHECK (team_nickname ~ '^[\\w]{2,20}-[\\w]{2,20}$'),
    grade TEXT NOT NULL
        CHECK (grade ~ '^[ABCDF]$'),
    submit_time TIMESTAMP WITH TIME ZONE NOT NULL,
    accept_time TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT valid_times
        CHECK (accept_time < submit_time)
)
`;

async function initdb(db) {
    return db.none(createSchema);
}

const upsertGradeStmt = `
    INSERT INTO mturk_grades (assignment_id, worker_id, hit_id, team_nickname, grade, submit_time, accept_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (assignment_id) DO NOTHING;
`;

async function upsertGrade(
    db,
    assignmentID,
    workerID,
    hitID,
    teamNickname,
    grade,
    submitTime,
    acceptTime
) {
    console.log(`grade = **${grade}**`);
    return db.none(upsertGradeStmt, [
        assignmentID,
        workerID,
        hitID,
        teamNickname,
        grade,
        submitTime,
        acceptTime
    ]);
}

module.exports = {
    initdb,
    upsertGrade
};
