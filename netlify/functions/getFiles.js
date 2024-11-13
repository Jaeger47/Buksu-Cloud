const fs = require("fs");
const path = require("path");

const jsonFilePath = path.join(__dirname, "../../files.json");

exports.handler = async () => {
    const files = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    return { statusCode: 200, body: JSON.stringify(files) };
};
