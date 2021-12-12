const mongoose = require('mongoose');

//connect to mongodb

const connectWithDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("DB Connection issues : ");
        console.log(error);
        process.exit(1);
    }
}


module.exports = connectWithDB;