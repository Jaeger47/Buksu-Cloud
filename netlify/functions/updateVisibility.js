const fs = require("fs");
const path = require("path");

const jsonFilePath = path.join(__dirname, "../../files.json");

exports.handler = async (event) => {
    const { fileName, visibility } = JSON.parse(event.body);
    const files = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

    const file = files.find((f) => f.name === fileName);
    if (file) {
        file.visibility = visibility;
        fs.writeFileSync(jsonFilePath, JSON.stringify(files, null, 2));
        return { statusCode: 200, body: "Visibility updated successfully." };
    }

    return { statusCode: 404, body: "File not found." };
};
