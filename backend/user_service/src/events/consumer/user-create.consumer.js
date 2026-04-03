const userService = require("../../services/user.service");

async function handleUserCreate(data, msg) {
    try {
        console.log("Received user.create event:", data);
        await userService.createUser(data);
        
    } catch (err) {
        console.error("Error processing user.create event:", err);
        throw err;
    }
}

module.exports = { handleUserCreate };