const sqlite3 = require("sqlite3").verbose();
const DB_FILE = "metrics.db";

// Function to create the SQLite database if it doesn't exist
function createDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(`Opened database: ${DB_FILE}`);
            resolve(db);
        });
    });
}

function createRunsDataTable(db) {
    return new Promise((resolve, reject) => {
        const createTableSQL = `
  CREATE TABLE IF NOT EXISTS runs
  (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    task   VARCHAR(20) NOT NULL,
    prNumber   VARCHAR(20) NOT NULL
  );
`;

        db.run(createTableSQL, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log("Created table runs if it doesn't exist.");
            resolve();
        });
    });
}


// Function to create a table if it doesn't exist
function createTable(db, tableName) {
    return new Promise((resolve, reject) => {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName} 
      (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task VARCHAR(20) NOT NULL,
        prNumber VARCHAR(20) NOT NULL,
        cumulative_layout_shift INTEGER,
        cumulative_layout_shift_expected INTEGER,
        first_contentful_paint INTEGER,
        first_contentful_paint_expected INTEGER,
        interactive INTEGER,
        interactive_expected INTEGER,
        largest_contentful_paint INTEGER,
        largest_contentful_paint_expected INTEGER,
        total_blocking_time INTEGER,
        total_blocking_time_expected INTEGER,
        runId INTEGER
      );
    `;

        db.run(createTableSQL, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log("Created table '"+tableName+"' if it doesn't exist.");
            resolve();
        });
    });
}


module.exports = {
    createRunsDataTable,
    createTable,
    createDatabase
}
