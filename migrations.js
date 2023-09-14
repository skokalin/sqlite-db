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
    task   VARCHAR(50) NOT NULL,
    prNumber   VARCHAR(50) NOT NULL,
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
        task TEXT,
        prNumber TEXT,
        cumulative_layout_shift TEXT,
        cumulative_layout_shift_expected TEXT,
        first_contentful_paint TEXT,
        first_contentful_paint_expected TEXT,
        interactive TEXT,
        interactive_expected TEXT,
        largest_contentful_paint TEXT,
        largest_contentful_paint_expected TEXT,
        total_blocking_time TEXT,
        total_blocking_time_expected TEXT
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
