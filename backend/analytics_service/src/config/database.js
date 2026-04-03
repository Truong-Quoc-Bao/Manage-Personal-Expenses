const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // process.exit(1);

        
        // retry sau 5s (rất cần khi dùng Docker)
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;

// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGODB_URL);

//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error('MongoDB connection error:', error.message);

//         // retry sau 5s (rất cần khi dùng Docker)
//         setTimeout(connectDB, 5000);
//     }
// };

// module.exports = connectDB;