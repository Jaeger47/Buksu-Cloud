const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");

const credentialsFilePath = path.join(__dirname, "../../web-app/credentials.json");

exports.handler = async (event) => {
    const { userType, password } = JSON.parse(event.body);

    const credentials = JSON.parse(fs.readFileSync(credentialsFilePath, "utf8"));
    const hashedPassword = credentials[userType];

    if (!hashedPassword) {
        return { statusCode: 404, body: "User not found" };
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
        return { statusCode: 401, body: "Invalid password" };
    }

    return { statusCode: 200, body: "Login successful" };
};
