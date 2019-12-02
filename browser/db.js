// Loading and initializing the library:
const pgp = require("pg-promise")({
    // Initialization Options
    query: function(e) {
        console.log("QUERY:", e.query);
        if (e.params) {
            console.log("PARAMS:", e.params);
        }
    }
});
const config = require("./config.js");

// Creating a new database instance from the connection details:
const db = pgp(config.databaseURL);

// Exporting the database object for shared use:
module.exports = db;
