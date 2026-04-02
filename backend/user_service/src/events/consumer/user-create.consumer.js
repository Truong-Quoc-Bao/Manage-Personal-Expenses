const userService = require("../../services/user.service");

async function handleUserCreate(data, msg) {
    try {
        console.log("Received user.create event:", data);
        // const { name, email } = data;
        // await userService.createUser({ name, email });
        // console.log("User created successfully");
    } catch (err) {
        console.error("Error processing user.create event:", err);
        throw err;
    }
}

module.exports = { handleUserCreate };