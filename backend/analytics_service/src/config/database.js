const mongoose = require('mongoose');


const connectDB = async () => {
        console.log(process.env.MONGODB_URL);

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log("MONGODB_URL:", process.env.MONGODB_URL);
        console.log("DB:", mongoose.connection.name);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection error:");

        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Name:", error.name);
        console.error("Stack:", error.stack);

         console.error("Full error:", error);

         setTimeout(connectDB, 5000);

    }
};

module.exports = connectDB;
 