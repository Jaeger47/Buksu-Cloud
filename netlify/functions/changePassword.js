const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");

const credentialsFilePath = path.join(__dirname, "../../web-app/credentials.json");

exports.handler = async (event) => {
    const { userType, oldPassword, newPassword } = JSON.parse(event.body);
    const credentials = JSON.parse(fs.readFileSync(credentialsFilePath, "utf8"));

    if (!credentials[userType]) {
        return { statusCode: 400, body: "Invalid user type" };
    }

    const isMatch = await bcrypt.compare(oldPassword, credentials[userType]);
    if (!isMatch) {
        return { statusCode: 401, body: "Incorrect old password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    credentials[userType] = hashedPassword;
    fs.writeFileSync(credentialsFilePath, JSON.stringify(credentials, null, 2));

    return { statusCode: 200, body: "Password updated successfully" };
};
