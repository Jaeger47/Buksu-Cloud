const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "../../web-app/uploads");
const jsonFilePath = path.join(__dirname, "../../files.json");

exports.handler = async (event) => {
    const { fileName } = JSON.parse(event.body);
    const filePath = path.join(uploadsDir, fileName);

    try {
        fs.unlinkSync(filePath);
        let files = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
        files = files.filter((file) => file.name !== fileName);
        fs.writeFileSync(jsonFilePath, JSON.stringify(files, null, 2));

        return { statusCode: 200, body: "File deleted successfully." };
    } catch (error) {
        return { statusCode: 500, body: "Failed to delete file." };
    }
};
