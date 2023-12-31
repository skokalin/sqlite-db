// main.js

const simpleGit = require('simple-git');
const {readJSONFile} = require('./fileReader');
const {createRunsDataTable, createTable, createDatabase} = require('./migrations');
const {groupBy} = require('./groupBy');
const git = simpleGit(); // Assumes the current directory is your Git repository


function insertRow(db, tableName, data) {
    return new Promise((resolve, reject) => {
        const insertRowSQL = `
      INSERT INTO ${tableName} (
          task,
          prNumber, 
          cumulative_layout_shift,
          cumulative_layout_shift_expected,
          first_contentful_paint, 
          first_contentful_paint_expected, 
          interactive, 
          interactive_expected, 
          largest_contentful_paint, 
          largest_contentful_paint_expected, 
          total_blocking_time,
          total_blocking_time_expected,
          runId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

        db.run(insertRowSQL, [...data], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function insertRun(db, data) {
    return new Promise((resolve, reject) => {
        const insertRowSQL = `
      INSERT INTO runs (
          task, 
          prNumber
      )
      VALUES (?, ?);
    `;

        db.run(insertRowSQL, [...data], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
}

const tableNamesByUrl = {
    '/': 'HP',
    '/eyeglasses-collection': 'CTP_EYE',
    '/prescription-sunglasses': 'CTP_SUN',
    '/tortoisegold-medium/elliot/31-m1863.html': 'PDP_EYE',
    '/black-medium/ray-ban-rb2132-new-wayfarer-/46-p6709.html': 'PDP_SUN',
}

const projectsMap = {
    'm.glassesusa.dev': 'gusa_mobile',
    'glassesusa.dev': 'gusa_desktop',

    'uvp.local': 'uvp_desktop',
    'm.uvp.local': 'uvp_desktop',

    'uhc.local': 'uhc_desktop',
    'm.uhc.local': 'uhc_mobile',
}

function getProject(assertionResults) {
    const project = projectsMap[new URL(assertionResults[0].url).host];
    if(!project) throw new Error('unrecognizable project');
    return project;
}

function getTaskDetails() {
    const gitHubContext = readJSONFile('../gitHubContext.json');
    console.log(gitHubContext.event.head_commit);
    const task = gitHubContext.event.head_commit.message.match(/(GUSA|UVP|UHC|BUG|TA)-\d+/)[0];
    const prNumber = gitHubContext.event.head_commit.message.match(/#\d+/)[0].replace('#', '');
    return {
        prNumber,
        task,
    }
}


// Main function to run the application
async function main() {
    const taskDetails = getTaskDetails();
    let resultsFromLH;
    console.time('step 1, read results');
    try {
        // don't forget to change . to .. in the start of url
        resultsFromLH = readJSONFile('../.lighthouseci/assertion-results.json')
    } catch (e) {
        console.error("Error during the reading results:", e);
    }
    const groupedByUrlResults =  groupBy(resultsFromLH, ({ url }) => url);
    const project = getProject(resultsFromLH);
    console.timeEnd('step 1, read results');
    // console.log('results:', resultsFromLH);
    console.time('step 2, read db and write');
    try {
        const db = await createDatabase();
        await createRunsDataTable(db);
        const runId = await insertRun(db, [taskDetails.task, taskDetails.prNumber]);
        Object.entries(groupedByUrlResults).forEach(async ([url, data]) => {
            const tableName = project + '_' + tableNamesByUrl[new URL(url).pathname];
            const cls = data.find(measurments => measurments.auditId === 'cumulative-layout-shift');
            const fcp = data.find(measurments => measurments.auditId === 'first-contentful-paint');
            const tti = data.find(measurments => measurments.auditId === 'interactive');
            const lcp = data.find(measurments => measurments.auditId === 'largest-contentful-paint');
            const tbt = data.find(measurments => measurments.auditId === 'total-blocking-time');
            await createTable(db, tableName);
            await insertRow(
                db,
                tableName, [
                    taskDetails.task,
                    taskDetails.prNumber,
                    cls.actual,
                    cls.expected,
                    fcp.actual,
                    fcp.expected,
                    tti.actual,
                    tti.expected,
                    lcp.actual,
                    lcp.expected,
                    tbt.actual,
                    tbt.expected,
                    runId
                ]);
        })
        db.close();
        console.timeEnd('step 2, read db and write');
        git.addConfig('user.name', 'LHBot')
            .addConfig('user.email', 'optimax@optimax.dev')


        git.add('metrics.db')
            .then(() => {
                // Commit the changes
                return git.commit('Add metrics.db');
            })
            .then(() => {
                // Push the changes to the remote repository
                return git.push();
            })
            .then(() => {
                console.log('Database file added, committed, and pushed successfully.');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } catch (err) {
        console.error("Error:", err);
    }
}



// Run the application
main();


