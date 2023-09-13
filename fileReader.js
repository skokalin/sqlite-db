const fs = require('fs');

function readJSONFile(filePath) {
    console.log('filePath', filePath);
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}

module.exports = {
    readJSONFile
}
